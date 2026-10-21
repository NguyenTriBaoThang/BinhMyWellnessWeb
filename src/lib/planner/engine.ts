import type { Experience, Place, PriceRule, RouteEdge, RouteMatrix, Source, TimeWindow } from '@/lib/data/types';

export type PlannerTransport = 'car' | 'bike' | 'walk' | 'boat';
export type BudgetBasis = 'group' | 'person';
export type TripPace = 'relaxed' | 'balanced' | 'active';

export interface TripRequest {
  date: string;
  startTime: string;
  endTime: string;
  adults: number;
  children: number;
  childAges: number[];
  budgetVnd: number | null;
  childBudgetVnd: number | null;
  budgetBasis: BudgetBasis;
  includeMealCost: boolean;
  mealCostVnd: number | null;
  includeTransportCost: boolean;
  transportCostVnd: number | null;
  transportMode: PlannerTransport;
  originPlaceId: string | null;
  destinationPlaceId: string | null;
  interestCategoryIds: string[];
  requiredExperienceIds: string[];
  pace: TripPace;
  maxStops: number;
  /** User entered estimate for the whole group, keyed by experience id. */
  groupCostEstimatesVnd: Record<string, number>;
}

export interface ItineraryStop {
  experienceId: string;
  placeId: string;
  name: string;
  categoryId: string;
  activities: string[];
  bookingRequirement: string;
  arrivalTime: string;
  departureTime: string;
  travelMinutesFromPrevious: number;
  costVnd: number | null;
  costSource: 'verified' | 'user_estimate' | 'unknown';
  geometryFromPrevious: string | null;
  explanation: string;
}

export interface ItineraryOption {
  id: string;
  label: 'Tiết kiệm' | 'Cân bằng' | 'Nhiều trải nghiệm';
  stops: ItineraryStop[];
  totalCostVnd: number | null;
  knownCostVnd: number;
  hasUnknownCosts: boolean;
  totalTravelMinutes: number;
  totalDurationMinutes: number;
  geometryRefs: string[];
  warnings: string[];
}

export interface PlannerResult {
  options: ItineraryOption[];
  blockingReasons: string[];
  consideredExperienceIds: string[];
  visitedSearchNodes: number;
}

export interface PlannerCatalog {
  places: Place[];
  experiences: Experience[];
  sources: Source[];
  matrix: RouteMatrix;
}

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MIN_STOPS = 2;
const MAX_SEARCH_NODES = 25_000;
const TRANSIT_BUFFER = 10;
const PACE_BUFFER: Record<TripPace, number> = { relaxed: 15, balanced: 8, active: 4 };
const LUNCH_BREAK_START = 12 * 60;
const LUNCH_BREAK_END = 13 * 60;

function timeToMinutes(value: string): number | null {
  if (!TIME_RE.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function validDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function todayHcm(): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((item) => [item.type, item.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function priceFor(experience: Experience, request: TripRequest, groupSize: number): { amount: number | null; source: ItineraryStop['costSource'] } {
  const estimate = request.groupCostEstimatesVnd[experience.id];
  const validEstimate = Number.isSafeInteger(estimate) && estimate >= 0 ? estimate : null;
  const verified = experience.priceRules?.filter((rule) => rule.status === 'verified') ?? [];
  if (!verified.length) return validEstimate === null ? { amount: null, source: 'unknown' } : { amount: validEstimate, source: 'user_estimate' };
  const fitsGroup = (rule: PriceRule) => (rule.minGroup === null || groupSize >= rule.minGroup)
    && (rule.capacity === null || groupSize <= rule.capacity);
  const groupRules = verified.filter((rule) => rule.basis === 'per_group' && fitsGroup(rule));
  const personRules = verified.filter((rule) => rule.basis !== 'per_group');
  if (groupRules.length === 1 && !personRules.length) return { amount: groupRules[0].amountVnd, source: 'verified' };
  if (!groupRules.length && personRules.length) {
    const pick = (basis: 'per_adult' | 'per_child', age: number | null) => {
      const matching = personRules.filter((rule) => rule.basis === basis && fitsGroup(rule)
        && (age === null || ((rule.ageMinimum === null || age >= rule.ageMinimum) && (rule.ageMaximum === null || age <= rule.ageMaximum))));
      return matching.length === 1 ? matching[0] : null;
    };
    const adultRates = Array.from({ length: request.adults }, () => pick('per_adult', null));
    const childRates = request.childAges.map((age) => pick('per_child', age));
    if (adultRates.every(Boolean) && childRates.every(Boolean)) {
      return { amount: [...adultRates, ...childRates].reduce((sum, rule) => sum + rule!.amountVnd, 0), source: 'verified' };
    }
  }
  return validEstimate === null ? { amount: null, source: 'unknown' } : { amount: validEstimate, source: 'user_estimate' };
}

function supportsGroup(experience: Experience, groupSize: number): boolean {
  const verified = experience.priceRules?.filter((rule) => rule.status === 'verified') ?? [];
  const limits = verified.map((rule) => rule.capacity).filter((capacity): capacity is number => capacity !== null);
  return !limits.length || limits.some((capacity) => groupSize <= capacity);
}

function childrenFit(experience: Experience, request: TripRequest): boolean {
  if (!request.children) return true;
  const suitability = experience.suitability;
  return suitability.status === 'verified' && request.childAges.every((age) => (suitability.ageMinimum === null || age >= suitability.ageMinimum)
    && (suitability.ageMaximum === null || age <= suitability.ageMaximum));
}

function windowsFor(experience: Experience, date: string): TimeWindow[] | null {
  const exception = experience.dateExceptions.find((item) => item.date === date);
  if (exception) return exception.closed ? [] : exception.windows ?? null;
  if (experience.seasonAvailability?.status !== 'verified' || !experience.seasonAvailability.checkedAt || !experience.seasonAvailability.sourceIds.length) return null;
  if (!experience.seasonAvailability.dates.length && !experience.seasonAvailability.yearRound) return null;
  if (experience.seasonAvailability.dates.length && !experience.seasonAvailability.dates.includes(date)) return [];
  if (!experience.weeklyHours) return null;
  const day = String(new Date(`${date}T00:00:00.000Z`).getUTCDay()) as '0' | '1' | '2' | '3' | '4' | '5' | '6';
  return experience.weeklyHours[day] ?? [];
}

function hasVerifiedLocation(place: Place | undefined): place is Place & { coordinates: NonNullable<Place['coordinates']> } {
  return Boolean(place?.coordinates && place.coordinateStatus === 'verified' && place.verification.coordinates.status === 'verified');
}

function edgeFor(matrix: RouteMatrix, from: string, to: string, mode: PlannerTransport): RouteEdge | undefined {
  if (from === to) return undefined;
  return matrix.edges.find((edge) => edge.fromPlaceId === from && edge.toPlaceId === to && edge.mode === mode && edge.status === 'verified');
}

function fitWindow(windows: TimeWindow[], earliest: number, duration: number): { arrival: number; departure: number } | null {
  for (const window of windows) {
    const start = timeToMinutes(window.start);
    const end = timeToMinutes(window.end);
    if (start === null || end === null) continue;
    let arrival = Math.max(earliest, start);
    if (arrival < LUNCH_BREAK_END && arrival + duration > LUNCH_BREAK_START) arrival = Math.max(arrival, LUNCH_BREAK_END);
    if (arrival + duration <= end) return { arrival, departure: arrival + duration };
  }
  return null;
}

function reasonText(reason: string): string {
  const messages: Record<string, string> = {
    INVALID_DATE: 'Ngày đi không hợp lệ hoặc đã qua theo múi giờ Việt Nam.',
    INVALID_PARTY: 'Số người hoặc tuổi trẻ em chưa hợp lệ.',
    INVALID_TIME: 'Giờ bắt đầu và kết thúc chưa hợp lệ.',
    INVALID_BUDGET: 'Ngân sách cần là số VND nguyên không âm.',
    ADDITIONAL_COST_REQUIRED: 'Bạn đã đưa ăn uống hoặc di chuyển vào ngân sách; hãy nhập mức dự trù cho các khoản đã chọn.',
    GROUP_CAPACITY: 'Số khách vượt sức chứa đã được ghi nhận cho các trải nghiệm phù hợp.',
    NOT_ENOUGH_STOPS: 'Cần ít nhất hai trải nghiệm có dữ liệu xác minh để lập hành trình.',
    CHILD_BUDGET_REQUIRED: 'Bạn đã chọn ngân sách mỗi người và có trẻ em; hãy nhập mức dự trù riêng cho mỗi trẻ hoặc đổi sang ngân sách cả nhóm.',
    ORIGIN_REQUIRED: 'Chưa có điểm xuất phát đã xác minh trong dữ liệu tuyến.',
    DESTINATION_REQUIRED: 'Chưa có điểm kết thúc đã xác minh trong dữ liệu tuyến.',
    NO_VERIFIED_EXPERIENCE: 'Chưa có trải nghiệm đủ tọa độ, thời lượng, giờ mở và trạng thái vận hành đã xác minh.',
    ROUTE_EDGE_MISSING: 'Thiếu chặng đường có hướng đã xác minh cho phương tiện đã chọn.',
    HOURS_UNKNOWN: 'Có trải nghiệm chưa có khung giờ hoạt động xác minh.',
    CLOSED_ON_DATE: 'Không có khung giờ được xác minh cho ngày đã chọn.',
    DURATION_UNKNOWN: 'Có trải nghiệm chưa có thời lượng tham quan xác minh.',
    AGE_UNKNOWN: 'Chưa đủ dữ liệu xác minh độ tuổi phù hợp với trẻ em trong đoàn.',
    PRICE_UNKNOWN_FOR_BUDGET: 'Không thể xác nhận ngân sách vì có khoản giá chưa biết; nhập mức dự trù hoặc bỏ giới hạn ngân sách.',
    OVER_BUDGET: 'Các tuyến khả thi vượt ngân sách đã chọn.',
    OUTSIDE_TIME_WINDOW: 'Không thể xếp đủ thời lượng trong khung giờ chuyến đi.',
    REQUIRED_STOP_UNAVAILABLE: 'Một điểm bắt buộc chưa đủ dữ liệu hoặc không thể ghép vào tuyến.',
    SEARCH_LIMIT_REACHED: 'Đã chạm giới hạn tìm kiếm; hãy giảm số điểm bắt buộc hoặc số điểm tối đa.',
  };
  return messages[reason] ?? reason;
}

function score(plan: ItineraryOption, request: TripRequest): number {
  const interestMatches = plan.stops.filter((stop) => request.interestCategoryIds.includes(stop.categoryId)).length;
  const diversity = new Set(plan.stops.map((stop) => stop.categoryId)).size;
  return interestMatches * 8 + diversity * 3 + plan.stops.length * 2 - plan.totalTravelMinutes * 0.08;
}

export function generateItineraryOptions(request: TripRequest, catalog: PlannerCatalog): PlannerResult {
  const reasons = new Set<string>();
  const start = timeToMinutes(request.startTime);
  const end = timeToMinutes(request.endTime);
  const groupSize = request.adults + request.children;
  if (!validDate(request.date) || request.date < todayHcm()) reasons.add('INVALID_DATE');
  if (start === null || end === null || start >= end) reasons.add('INVALID_TIME');
  if (!Number.isInteger(request.adults) || request.adults < 0 || !Number.isInteger(request.children) || request.children < 0 || groupSize < 1 || groupSize > 50 || (request.children > 0 && request.adults < 1) || request.childAges.length !== request.children || request.childAges.some((age) => !Number.isInteger(age) || age < 0 || age > 17)) reasons.add('INVALID_PARTY');
  if (request.budgetVnd !== null && (!Number.isSafeInteger(request.budgetVnd) || request.budgetVnd < 0)) reasons.add('INVALID_BUDGET');
  if (request.childBudgetVnd !== null && (!Number.isSafeInteger(request.childBudgetVnd) || request.childBudgetVnd < 0)) reasons.add('INVALID_BUDGET');
  if (request.mealCostVnd !== null && (!Number.isSafeInteger(request.mealCostVnd) || request.mealCostVnd < 0)) reasons.add('INVALID_BUDGET');
  if (request.transportCostVnd !== null && (!Number.isSafeInteger(request.transportCostVnd) || request.transportCostVnd < 0)) reasons.add('INVALID_BUDGET');
  if (request.budgetVnd !== null && ((request.includeMealCost && request.mealCostVnd === null) || (request.includeTransportCost && request.transportCostVnd === null))) reasons.add('ADDITIONAL_COST_REQUIRED');
  if (request.budgetBasis === 'person' && request.budgetVnd !== null && request.children > 0 && request.childBudgetVnd === null) reasons.add('CHILD_BUDGET_REQUIRED');
  const maxStops = Math.max(MIN_STOPS, Math.min(6, Math.floor(request.maxStops || 4)));
  if (reasons.size) return { options: [], blockingReasons: [...reasons].map(reasonText), consideredExperienceIds: [], visitedSearchNodes: 0 };
  if (!request.originPlaceId) reasons.add('ORIGIN_REQUIRED');
  if (!request.destinationPlaceId) reasons.add('DESTINATION_REQUIRED');
  if (reasons.size) return { options: [], blockingReasons: [...reasons].map(reasonText), consideredExperienceIds: [], visitedSearchNodes: 0 };

  const placesById = new Map(catalog.places.map((place) => [place.id, place]));
  const candidates = catalog.experiences.filter((experience) => {
    const place = placesById.get(experience.placeId ?? '');
    return experience.routeEligible
      && experience.evidence.status === 'verified'
      && Boolean(experience.durationMinutes)
      && Boolean(experience.weeklyHours)
      && experience.seasonAvailability?.status === 'verified'
      && Boolean(place && place.areaCode === 'BINH_MY' && place.verification.area.status === 'verified'
        && hasVerifiedLocation(place) && place.verification.hours.status === 'verified' && place.verification.operations.status === 'verified')
      && supportsGroup(experience, groupSize)
      && childrenFit(experience, request);
  });
  if (!candidates.length) {
    if (catalog.experiences.some((experience) => experience.routeEligible && !supportsGroup(experience, groupSize))) reasons.add('GROUP_CAPACITY');
    if (catalog.experiences.some((experience) => experience.placeId && request.children && experience.suitability.status !== 'verified')) reasons.add('AGE_UNKNOWN');
    if (catalog.experiences.some((experience) => experience.routeEligible && !experience.durationMinutes)) reasons.add('DURATION_UNKNOWN');
    if (catalog.experiences.some((experience) => experience.routeEligible && !experience.weeklyHours)) reasons.add('HOURS_UNKNOWN');
    if (catalog.experiences.some((experience) => experience.routeEligible && request.budgetVnd !== null && priceFor(experience, request, groupSize).amount === null)) reasons.add('PRICE_UNKNOWN_FOR_BUDGET');
    reasons.add('NO_VERIFIED_EXPERIENCE');
    return { options: [], blockingReasons: [...reasons].map(reasonText), consideredExperienceIds: [], visitedSearchNodes: 0 };
  }

  const origin = placesById.get(request.originPlaceId!);
  const destination = placesById.get(request.destinationPlaceId!);
  if (!hasVerifiedLocation(origin)) reasons.add('ORIGIN_REQUIRED');
  if (!hasVerifiedLocation(destination)) reasons.add('DESTINATION_REQUIRED');
  if (reasons.size) return { options: [], blockingReasons: [...reasons].map(reasonText), consideredExperienceIds: candidates.map((item) => item.id), visitedSearchNodes: 0 };

  const required = new Set(request.requiredExperienceIds);
  const feasible: Array<{ plan: ItineraryOption; path: string[] }> = [];
  const used = new Set<string>();
  const path: string[] = [];
  const stops: ItineraryStop[] = [];
  const budgetLimit = request.budgetVnd === null
    ? Number.POSITIVE_INFINITY
    : request.budgetBasis === 'person'
      ? request.budgetVnd * request.adults + (request.childBudgetVnd ?? 0) * request.children
      : request.budgetVnd;
  const sharedCostVnd = (request.includeMealCost ? request.mealCostVnd ?? 0 : 0)
    + (request.includeTransportCost ? request.transportCostVnd ?? 0 : 0);
  const sharedCostUnknown = (request.includeMealCost && request.mealCostVnd === null)
    || (request.includeTransportCost && request.transportCostVnd === null);
  let visited = 0;
  let sawMissingEdge = false;
  let sawHours = false;
  let sawClosed = false;
  let sawTime = false;
  let sawOverBudget = false;
  let sawUnknownPrice = false;

  const search = (currentPlaceId: string, currentTime: number, travelMinutes: number, knownCost: number, hasUnknownCost: boolean, geometryRefs: string[]): void => {
    if (++visited > MAX_SEARCH_NODES) return;
    if (path.length >= MIN_STOPS && Array.from(required).every((id) => used.has(id))) {
      const returnEdge = currentPlaceId === request.destinationPlaceId ? undefined : edgeFor(catalog.matrix, currentPlaceId, request.destinationPlaceId!, request.transportMode);
      if (currentPlaceId !== request.destinationPlaceId && !returnEdge) sawMissingEdge = true;
      else {
        const returnMinutes = returnEdge ? Math.ceil(returnEdge.durationSeconds / 60) : 0;
        const finish = currentTime + (returnEdge ? TRANSIT_BUFFER + returnMinutes : 0);
        if (finish > end!) sawTime = true;
        else {
          const totalCostVnd = hasUnknownCost ? null : knownCost;
          const warnings = [
            ...(hasUnknownCost ? ['Có điểm chưa công bố giá; tổng chi phí chưa xác định.'] : []),
            ...(Object.values(request.groupCostEstimatesVnd).some((value) => Number.isSafeInteger(value)) ? ['Một số chi phí là dự trù do bạn nhập; cần xác nhận với điểm đến.'] : []),
            ...(request.includeMealCost && request.mealCostVnd !== null ? ['Dự trù ăn uống do bạn nhập được tính cho cả nhóm.'] : []),
            ...(request.includeTransportCost && request.transportCostVnd !== null ? ['Dự trù di chuyển do bạn nhập được tính cho cả nhóm.'] : []),
            ...(!request.includeMealCost ? ['Ăn uống chưa được tính vào ngân sách.'] : []),
            ...(!request.includeTransportCost ? ['Di chuyển chưa được tính vào ngân sách.'] : []),
          ];
          feasible.push({
            path: [...path],
            plan: {
              id: path.join('>'), label: 'Cân bằng', stops: [...stops], totalCostVnd, knownCostVnd: knownCost, hasUnknownCosts: hasUnknownCost,
              totalTravelMinutes: travelMinutes + returnMinutes,
              totalDurationMinutes: finish - start!,
              geometryRefs: [...geometryRefs, ...(returnEdge ? [returnEdge.geometryRef] : [])],
              warnings: Array.from(new Set(warnings)),
            },
          });
        }
      }
    }
    if (path.length >= maxStops) return;

    for (const experience of candidates) {
      if (used.has(experience.id)) continue;
      const placeId = experience.placeId!;
      const place = placesById.get(placeId)!;
      const fromId = path.length ? stops[stops.length - 1].placeId : request.originPlaceId!;
      const edge = fromId === placeId ? undefined : edgeFor(catalog.matrix, fromId, placeId, request.transportMode);
      if (fromId !== placeId && !edge) { sawMissingEdge = true; continue; }
      const legMinutes = edge ? Math.ceil(edge.durationSeconds / 60) : 0;
      const earliest = currentTime + (edge ? TRANSIT_BUFFER + legMinutes : 0);
      const windows = windowsFor(experience, request.date);
      if (windows === null) { sawHours = true; continue; }
      if (!windows.length) { sawClosed = true; continue; }
      const duration = experience.durationMinutes! + PACE_BUFFER[request.pace];
      const slot = fitWindow(windows, earliest, duration);
      if (!slot || slot.departure > end!) { sawTime = true; continue; }
      if (request.children > 0 && experience.suitability.status !== 'verified') continue;
      const costs = priceFor(experience, request, groupSize);
      if (request.budgetVnd !== null && costs.amount === null) { sawUnknownPrice = true; continue; }
      const nextCost = knownCost + (costs.amount ?? 0);
      if (nextCost > budgetLimit) { sawOverBudget = true; continue; }
      const interestNote = request.interestCategoryIds.includes(experience.categoryId) ? 'Phù hợp nhóm sở thích bạn chọn.' : 'Bổ sung một góc trải nghiệm khác.';
      const sourceNote = costs.source === 'user_estimate' ? ' Chi phí là dự trù bạn nhập.' : costs.source === 'unknown' ? ' Giá cần liên hệ xác nhận.' : '';
      const stop: ItineraryStop = {
        experienceId: experience.id, placeId, name: experience.name, categoryId: experience.categoryId,
        activities: [...experience.activities], bookingRequirement: experience.bookingRequirement,
        arrivalTime: minutesToTime(slot.arrival), departureTime: minutesToTime(slot.departure),
        travelMinutesFromPrevious: legMinutes, costVnd: costs.amount, costSource: costs.source,
        geometryFromPrevious: edge?.geometryRef ?? null, explanation: `${interestNote}${sourceNote}`,
      };
      used.add(experience.id); path.push(experience.id); stops.push(stop);
      search(placeId, slot.departure, travelMinutes + legMinutes, nextCost, hasUnknownCost || costs.amount === null, [...geometryRefs, ...(edge ? [edge.geometryRef] : [])]);
      stops.pop(); path.pop(); used.delete(experience.id);
      if (visited > MAX_SEARCH_NODES) return;
    }
  };

  search(request.originPlaceId!, start!, 0, sharedCostVnd, sharedCostUnknown, []);
  if (visited > MAX_SEARCH_NODES) reasons.add('SEARCH_LIMIT_REACHED');
  if (sawMissingEdge) reasons.add('ROUTE_EDGE_MISSING');
  if (sawHours) reasons.add('HOURS_UNKNOWN');
  if (sawClosed) reasons.add('CLOSED_ON_DATE');
  if (sawTime) reasons.add('OUTSIDE_TIME_WINDOW');
  if (sawOverBudget) reasons.add('OVER_BUDGET');
  if (sawUnknownPrice) reasons.add('PRICE_UNKNOWN_FOR_BUDGET');
  if (!feasible.length && candidates.length < MIN_STOPS && request.requiredExperienceIds.length === 0) reasons.add('NOT_ENOUGH_STOPS');
  if (!feasible.length && required.size) reasons.add('REQUIRED_STOP_UNAVAILABLE');

  const unique = new Map<string, ItineraryOption>();
  for (const item of feasible) if (!unique.has(item.path.join('|'))) unique.set(item.path.join('|'), item.plan);
  const plans = [...unique.values()];
  const chosen: ItineraryOption[] = [];
  const add = (plan: ItineraryOption | undefined, label: ItineraryOption['label']) => {
    if (!plan || chosen.some((item) => item.id === plan.id)) return;
    chosen.push({ ...plan, label });
  };
  if (request.budgetVnd !== null) {
    const cheapest = plans.filter((item) => item.totalCostVnd !== null).sort((a, b) => a.totalCostVnd! - b.totalCostVnd! || a.totalTravelMinutes - b.totalTravelMinutes)[0];
    add(cheapest, 'Tiết kiệm');
  }
  add([...plans].sort((a, b) => score(b, request) - score(a, request))[0], 'Cân bằng');
  add([...plans].sort((a, b) => b.stops.length - a.stops.length || a.totalTravelMinutes - b.totalTravelMinutes)[0], 'Nhiều trải nghiệm');

  return { options: chosen.slice(0, 3), blockingReasons: [...reasons].map(reasonText), consideredExperienceIds: candidates.map((item) => item.id), visitedSearchNodes: visited };
}

export function recalculateItinerary(request: TripRequest, orderedExperienceIds: string[], catalog: PlannerCatalog, label: ItineraryOption['label'] = 'Cân bằng'): ItineraryOption | null {
  if (orderedExperienceIds.length < MIN_STOPS || orderedExperienceIds.length > 6 || new Set(orderedExperienceIds).size !== orderedExperienceIds.length) return null;
  if (!request.requiredExperienceIds.every((id) => orderedExperienceIds.includes(id))) return null;
  const start = timeToMinutes(request.startTime);
  const end = timeToMinutes(request.endTime);
  const groupSize = request.adults + request.children;
  if (start === null || end === null || start >= end || !validDate(request.date) || request.date < todayHcm() || groupSize < 1 || groupSize > 50) return null;
  if (request.budgetBasis === 'person' && request.budgetVnd !== null && request.children > 0 && request.childBudgetVnd === null) return null;
  if (request.budgetVnd !== null && ((request.includeMealCost && request.mealCostVnd === null) || (request.includeTransportCost && request.transportCostVnd === null))) return null;
  const placesById = new Map(catalog.places.map((place) => [place.id, place]));
  const experiencesById = new Map(catalog.experiences.map((experience) => [experience.id, experience]));
  const origin = placesById.get(request.originPlaceId ?? '');
  const destination = placesById.get(request.destinationPlaceId ?? '');
  if (!hasVerifiedLocation(origin) || !hasVerifiedLocation(destination)) return null;
  let currentPlaceId = request.originPlaceId!;
  let currentTime = start;
  let travelMinutes = 0;
  let knownCost = (request.includeMealCost ? request.mealCostVnd ?? 0 : 0) + (request.includeTransportCost ? request.transportCostVnd ?? 0 : 0);
  let unknown = (request.includeMealCost && request.mealCostVnd === null) || (request.includeTransportCost && request.transportCostVnd === null);
  const stops: ItineraryStop[] = [];
  const geometries: string[] = [];
  const groupBudget = request.budgetVnd === null ? Number.POSITIVE_INFINITY : request.budgetBasis === 'group'
    ? request.budgetVnd
    : request.adults * request.budgetVnd + request.children * (request.childBudgetVnd ?? Number.POSITIVE_INFINITY);

  for (const id of orderedExperienceIds) {
    const experience = experiencesById.get(id);
    const place = experience?.placeId ? placesById.get(experience.placeId) : undefined;
    if (!experience || !place || !experience.routeEligible || experience.evidence.status !== 'verified' || place.areaCode !== 'BINH_MY' || place.verification.area.status !== 'verified' || place.verification.hours.status !== 'verified' || place.verification.operations.status !== 'verified' || !hasVerifiedLocation(place) || !experience.durationMinutes || !experience.weeklyHours || experience.seasonAvailability?.status !== 'verified') return null;
    if (!supportsGroup(experience, groupSize) || !childrenFit(experience, request)) return null;
    const edge = currentPlaceId === place.id ? undefined : edgeFor(catalog.matrix, currentPlaceId, place.id, request.transportMode);
    if (currentPlaceId !== place.id && !edge) return null;
    const legMinutes = edge ? Math.ceil(edge.durationSeconds / 60) : 0;
    const earliest = currentTime + (edge ? TRANSIT_BUFFER + legMinutes : 0);
    const windows = windowsFor(experience, request.date);
    if (!windows?.length) return null;
    const slot = fitWindow(windows, earliest, experience.durationMinutes + PACE_BUFFER[request.pace]);
    if (!slot || slot.departure > end) return null;
    const cost = priceFor(experience, request, groupSize);
    if (request.budgetVnd !== null && cost.amount === null) return null;
    knownCost += cost.amount ?? 0;
    if (knownCost > groupBudget) return null;
    unknown ||= cost.amount === null;
    stops.push({
      experienceId: experience.id,
      placeId: place.id,
      name: experience.name,
      categoryId: experience.categoryId,
      activities: [...experience.activities],
      bookingRequirement: experience.bookingRequirement,
      arrivalTime: minutesToTime(slot.arrival),
      departureTime: minutesToTime(slot.departure),
      travelMinutesFromPrevious: legMinutes,
      costVnd: cost.amount,
      costSource: cost.source,
      geometryFromPrevious: edge?.geometryRef ?? null,
      explanation: request.interestCategoryIds.includes(experience.categoryId) ? 'Phù hợp nhóm sở thích bạn chọn.' : 'Bổ sung một góc trải nghiệm khác.',
    });
    if (edge) geometries.push(edge.geometryRef);
    travelMinutes += legMinutes;
    currentPlaceId = place.id;
    currentTime = slot.departure;
  }
  const returnEdge = currentPlaceId === request.destinationPlaceId ? undefined : edgeFor(catalog.matrix, currentPlaceId, request.destinationPlaceId!, request.transportMode);
  if (currentPlaceId !== request.destinationPlaceId && !returnEdge) return null;
  const returnMinutes = returnEdge ? Math.ceil(returnEdge.durationSeconds / 60) : 0;
  const finish = currentTime + (returnEdge ? TRANSIT_BUFFER + returnMinutes : 0);
  if (finish > end) return null;
  if (returnEdge) geometries.push(returnEdge.geometryRef);
  const warnings = [
    ...(unknown ? ['Có điểm chưa công bố giá; tổng chi phí chưa xác định.'] : []),
    ...(Object.keys(request.groupCostEstimatesVnd).length ? ['Một số chi phí là dự trù do bạn nhập; cần xác nhận với điểm đến.'] : []),
    ...(request.includeMealCost && request.mealCostVnd !== null ? ['Dự trù ăn uống do bạn nhập được tính cho cả nhóm.'] : []),
    ...(request.includeTransportCost && request.transportCostVnd !== null ? ['Dự trù di chuyển do bạn nhập được tính cho cả nhóm.'] : []),
    ...(!request.includeMealCost ? ['Ăn uống chưa được tính vào ngân sách.'] : []),
    ...(!request.includeTransportCost ? ['Di chuyển chưa được tính vào ngân sách.'] : []),
  ];
  return {
    id: orderedExperienceIds.join('>'), label, stops,
    totalCostVnd: unknown ? null : knownCost,
    knownCostVnd: knownCost,
    hasUnknownCosts: unknown,
    totalTravelMinutes: travelMinutes + returnMinutes,
    totalDurationMinutes: finish - start,
    geometryRefs: geometries,
    warnings,
  };
}
