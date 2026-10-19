export type TransportMode = 'car' | 'bike' | 'walk';
export type BudgetBasis = 'GROUP' | 'PER_PERSON';

export interface ItineraryRequest {
  date: string;
  startTime: string;
  endTime: string;
  adults: number;
  children: number;
  budgetVnd?: number;
  budgetBasis: BudgetBasis;
  transportMode: TransportMode;
  interests: string[];
  maxStops: number;
  origin?: { latitude: number; longitude: number; label?: string };
  returnTo?: { latitude: number; longitude: number; label?: string };
}

export interface RouteEstimate {
  provider: string;
  distanceMeters: number;
  durationMinutes: number;
  encodedPolyline: string;
  isRealtime: boolean;
}

export interface VerifiedServiceSlot {
  date: string;
  slot: string;
  verifiedAt: string | null;
  availablePlaces: number;
}

export interface ItineraryCandidate {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  priceBasis?: 'PER_PERSON' | 'PER_GROUP' | 'CONTACT';
  childPrice?: number | null;
  duration: number;
  capacity: number;
  bookingUnit?: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  testOnly: boolean;
  areaCode: string | null;
  serviceVerifiedAt: string | null;
  locationVerifiedAt: string | null;
  provider: { id: string; name: string; address: string; active: boolean };
  slots: VerifiedServiceSlot[];
}

export interface ItineraryStop {
  serviceId: string;
  providerId: string;
  name: string;
  providerName: string;
  address: string;
  category: string;
  date: string;
  arrivalTime: string;
  departureTime: string;
  durationMinutes: number;
  slot: string;
  costVnd: number | null;
  knownCostVnd: number;
  availablePlaces: number | null;
  latitude: number;
  longitude: number;
  routeFromPrevious: RouteEstimate | null;
}

export interface ItineraryPlan {
  date: string;
  groupSize: number;
  adults: number;
  children: number;
  transportMode: TransportMode;
  stops: ItineraryStop[];
  totalCostVnd: number | null;
  knownCostVnd: number;
  hasUnknownCosts: boolean;
  totalTravelMinutes: number | null;
  returnRoute: RouteEstimate | null;
  feasibility: 'FEASIBLE' | 'PARTIAL' | 'NO_FEASIBLE_PLAN';
  fallbackMode: 'RULE_BASED';
  warnings: string[];
  rejectedReasons: string[];
}

export type RouteLookup = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  mode: TransportMode,
) => Promise<RouteEstimate | null>;

function timeToMinutes(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function isCoordinate(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function todayInVietnam(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function normalized(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('vi-VN');
}

function stopCost(service: ItineraryCandidate, request: ItineraryRequest): { known: number; unknown: boolean } {
  const basis = service.priceBasis ?? 'PER_PERSON';
  if (basis === 'CONTACT' || service.price <= 0) return { known: 0, unknown: true };
  if (basis === 'PER_GROUP') return { known: service.price, unknown: false };
  if (request.children > 0 && (service.childPrice == null || service.childPrice < 0)) {
    return { known: request.adults * service.price, unknown: true };
  }
  return {
    known: request.adults * service.price + request.children * (service.childPrice ?? service.price),
    unknown: false,
  };
}

function matchesHardRequirements(service: ItineraryCandidate, date: string): boolean {
  return service.status === 'PUBLISHED'
    && !service.testOnly
    && service.provider.active
    && service.areaCode === 'BINH_MY'
    && Boolean(service.serviceVerifiedAt)
    && Boolean(service.locationVerifiedAt)
    && isCoordinate(service.latitude)
    && isCoordinate(service.longitude)
    && service.latitude >= -90 && service.latitude <= 90
    && service.longitude >= -180 && service.longitude <= 180
    && service.slots.some((slot) => slot.date === date && Boolean(slot.verifiedAt) && slot.availablePlaces > 0);
}

export async function buildItinerary(
  request: ItineraryRequest,
  services: ItineraryCandidate[],
  routeLookup?: RouteLookup,
): Promise<ItineraryPlan> {
  const rejected = new Set<string>();
  const warnings = new Set<string>();
  const start = timeToMinutes(request.startTime);
  const end = timeToMinutes(request.endTime);
  const groupSize = request.adults + request.children;
  const maxStops = Math.max(1, Math.min(6, request.maxStops || 4));

  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(request.date)
    ? new Date(`${request.date}T00:00:00.000Z`) : null;
  if (!parsedDate || Number.isNaN(parsedDate.getTime())
      || parsedDate.toISOString().slice(0, 10) !== request.date
      || request.date < todayInVietnam()) rejected.add('INVALID_OR_PAST_DATE');
  if (start == null || end == null || start >= end) rejected.add('INVALID_TIME_WINDOW');
  if (!Number.isInteger(request.adults) || request.adults < 0
      || !Number.isInteger(request.children) || request.children < 0
      || groupSize < 1 || groupSize > 50) rejected.add('INVALID_GROUP_SIZE');
  if (request.budgetVnd != null && (!Number.isSafeInteger(request.budgetVnd) || request.budgetVnd < 0)) {
    rejected.add('INVALID_BUDGET');
  }

  const validRequest = start != null && end != null && start < end
    && groupSize >= 1 && groupSize <= 50
    && !rejected.has('INVALID_OR_PAST_DATE') && !rejected.has('INVALID_BUDGET');
  if (!validRequest) {
    return {
      date: request.date,
      groupSize,
      adults: request.adults,
      children: request.children,
      transportMode: request.transportMode,
      stops: [],
      totalCostVnd: 0,
      knownCostVnd: 0,
      hasUnknownCosts: false,
      totalTravelMinutes: routeLookup ? 0 : null,
      returnRoute: null,
      feasibility: 'NO_FEASIBLE_PLAN',
      fallbackMode: 'RULE_BASED',
      warnings: [],
      rejectedReasons: Array.from(rejected),
    };
  }

  const eligible = services.filter((service) => matchesHardRequirements(service, request.date));
  if (eligible.length === 0) rejected.add('NO_VERIFIED_AVAILABLE_SERVICES');

  const routeCache = new Map<string, Promise<RouteEstimate | null>>();
  let routeLookups = 0;
  const lookupRoute = async (
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number },
  ): Promise<RouteEstimate | null> => {
    if (!routeLookup) return null;
    const key = `${from.latitude},${from.longitude}|${to.latitude},${to.longitude}|${request.transportMode}`;
    const cached = routeCache.get(key);
    if (cached) return cached;
    if (routeLookups >= 32) {
      warnings.add('ROUTING_LOOKUP_LIMIT_REACHED');
      return null;
    }
    routeLookups += 1;
    const pending = routeLookup(from, to, request.transportMode).catch(() => null);
    routeCache.set(key, pending);
    return pending;
  };

  const maxBudget = request.budgetVnd == null
    ? Number.POSITIVE_INFINITY
    : request.budgetBasis === 'PER_PERSON' ? request.budgetVnd * groupSize : request.budgetVnd;
  const selected: ItineraryStop[] = [];
  const selectedIds = new Set<string>();
  let cursor = start!;
  let knownCost = 0;
  let unknownCosts = false;
  let totalTravel: number | null = routeLookup && request.origin ? 0 : null;
  let previous: { latitude: number; longitude: number } | undefined = request.origin;

  while (selected.length < maxStops) {
    const options: Array<{
      service: ItineraryCandidate;
      slot: VerifiedServiceSlot;
      arrival: number;
      departure: number;
      route: RouteEstimate | null;
      cost: { known: number; unknown: boolean };
      score: number;
    }> = [];

    for (const service of eligible) {
      if (selectedIds.has(service.id)) continue;
      const cost = stopCost(service, request);
      if (knownCost + cost.known > maxBudget) {
        rejected.add('OVER_BUDGET');
        continue;
      }
      if (cost.unknown && request.budgetVnd != null) {
        rejected.add('PRICE_UNKNOWN_FOR_BUDGET');
        continue;
      }
      if (service.slots.some((slot) => slot.date === request.date && slot.availablePlaces < groupSize)) {
        rejected.add('INSUFFICIENT_CAPACITY');
      }
      for (const slot of service.slots) {
        if (slot.date !== request.date || !slot.verifiedAt || slot.availablePlaces < groupSize) continue;
        const slotStart = timeToMinutes(slot.slot);
        if (slotStart == null) continue;
        let route: RouteEstimate | null = null;
        let travel = 0;
        if (previous && routeLookup) {
          route = await lookupRoute(previous, { latitude: service.latitude!, longitude: service.longitude! });
          if (!route) {
            rejected.add('ROUTE_UNAVAILABLE');
            continue;
          }
          travel = route.durationMinutes;
        } else if (selected.length > 0 && !routeLookup) {
          rejected.add('ROUTE_PROVIDER_NOT_CONFIGURED');
          continue;
        }
        const arrival = Math.max(slotStart, cursor + travel);
        if (arrival !== slotStart) {
          rejected.add('ARRIVAL_AFTER_AVAILABLE_SLOT');
          continue;
        }
        const departure = arrival + service.duration;
        if (departure > end!) {
          rejected.add('OUTSIDE_TIME_WINDOW');
          continue;
        }
        const preferenceText = normalized(`${service.category} ${service.name} ${service.description}`);
        const matches = request.interests.filter((interest) => normalized(interest).trim().length > 0
          && preferenceText.includes(normalized(interest).trim())).length;
        const score = matches * 100 - travel * 0.25 - service.duration * 0.03 - cost.known / 100_000;
        options.push({ service, slot, arrival, departure, route, cost, score });
      }
    }

    if (options.length === 0) break;
    options.sort((a, b) => b.score - a.score || a.arrival - b.arrival || a.service.id.localeCompare(b.service.id));
    const chosen = options[0];
    const service = chosen.service;
    selected.push({
      serviceId: service.id,
      providerId: service.provider.id,
      name: service.name,
      providerName: service.provider.name,
      address: service.provider.address,
      category: service.category,
      date: request.date,
      arrivalTime: minutesToTime(chosen.arrival),
      departureTime: minutesToTime(chosen.departure),
      durationMinutes: service.duration,
      slot: chosen.slot.slot,
      costVnd: chosen.cost.unknown ? null : chosen.cost.known,
      knownCostVnd: chosen.cost.known,
      availablePlaces: chosen.slot.availablePlaces,
      latitude: service.latitude!,
      longitude: service.longitude!,
      routeFromPrevious: chosen.route,
    });
    selectedIds.add(service.id);
    knownCost += chosen.cost.known;
    unknownCosts ||= chosen.cost.unknown;
    cursor = chosen.departure + 15;
    previous = { latitude: service.latitude!, longitude: service.longitude! };
    if (totalTravel != null && chosen.route) totalTravel += chosen.route.durationMinutes;
  }

  if (!routeLookup) warnings.add('ROUTING_NOT_CONFIGURED');
  if (unknownCosts) warnings.add('SOME_PRICES_NOT_CONFIRMED');
  if (selected.length > 0 && selected.some((stop) => stop.routeFromPrevious == null) && request.origin) {
    warnings.add('ORIGIN_ROUTE_UNAVAILABLE');
  }
  let returnRoute: RouteEstimate | null = null;
  if (request.returnTo && selected.length > 0) {
    if (!routeLookup) {
      warnings.add('RETURN_ROUTE_UNAVAILABLE');
      selected.length = 0;
    } else {
      while (selected.length > 0) {
        const last = selected[selected.length - 1];
        const candidateReturn = await lookupRoute(
          { latitude: last.latitude, longitude: last.longitude },
          request.returnTo,
        );
        const departure = timeToMinutes(last.departureTime);
        if (candidateReturn && departure != null && departure + candidateReturn.durationMinutes <= end!) {
          returnRoute = candidateReturn;
          break;
        }
        rejected.add(candidateReturn ? 'RETURN_TOO_LATE' : 'RETURN_ROUTE_UNAVAILABLE');
        selected.pop();
      }
      if (selected.length === 0) warnings.add('NO_FEASIBLE_RETURN');
    }
  }
  knownCost = selected.reduce((sum, stop) => sum + stop.knownCostVnd, 0);
  unknownCosts = selected.some((stop) => stop.costVnd == null);
  totalTravel = routeLookup && request.origin
    ? selected.reduce((sum, stop) => sum + (stop.routeFromPrevious?.durationMinutes ?? 0), 0)
      + (returnRoute?.durationMinutes ?? 0)
    : null;
  if (request.children > 0 && selected.some((stop) => stop.costVnd == null)) {
    warnings.add('CHILD_PRICE_NOT_CONFIRMED');
  }
  if (selected.length === 0) warnings.add('NO_FEASIBLE_STOPS');

  return {
    date: request.date,
    groupSize,
    adults: request.adults,
    children: request.children,
    transportMode: request.transportMode,
    stops: selected,
    totalCostVnd: unknownCosts ? null : knownCost,
    knownCostVnd: knownCost,
    hasUnknownCosts: unknownCosts,
    totalTravelMinutes: totalTravel,
    returnRoute,
    feasibility: selected.length === 0 ? 'NO_FEASIBLE_PLAN' : warnings.size ? 'PARTIAL' : 'FEASIBLE',
    fallbackMode: 'RULE_BASED',
    warnings: Array.from(warnings),
    rejectedReasons: Array.from(rejected),
  };
}
