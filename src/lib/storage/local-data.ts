import type { ItineraryOption, TripRequest } from '@/lib/planner/engine';

export const LOCAL_SCHEMA_VERSION = 1 as const;
const STORAGE_KEY = 'binh-my-du-ky:local:v1';
const CONTENT_DRAFT_KEY = 'binh-my-du-ky:content-draft:v1';
const MAX_STORAGE_BYTES = 1_000_000;

export interface SavedItinerary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  request: TripRequest;
  options: ItineraryOption[];
}

export interface LocalData {
  schemaVersion: typeof LOCAL_SCHEMA_VERSION;
  favoritePlaceIds: string[];
  visitedPlaceIds: string[];
  itineraries: SavedItinerary[];
}

export interface LocalDataResult {
  data: LocalData;
  warning: string | null;
  available: boolean;
}

export const emptyLocalData = (): LocalData => ({
  schemaVersion: LOCAL_SCHEMA_VERSION,
  favoritePlaceIds: [],
  visitedPlaceIds: [],
  itineraries: [],
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 500 || value.some((item) => typeof item !== 'string' || item.length > 120)) return null;
  return Array.from(new Set(value));
}

function isNullableSafeInteger(value: unknown): boolean {
  return value === null || (Number.isSafeInteger(value) && Number(value) >= 0);
}

function validateRequest(value: unknown): value is TripRequest {
  if (!isRecord(value)) return false;
  if (typeof value.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)
    || typeof value.startTime !== 'string' || !/^\d{2}:\d{2}$/.test(value.startTime)
    || typeof value.endTime !== 'string' || !/^\d{2}:\d{2}$/.test(value.endTime)) return false;
  if (!Number.isInteger(value.adults) || Number(value.adults) < 0 || !Number.isInteger(value.children) || Number(value.children) < 0
    || !Array.isArray(value.childAges) || value.childAges.length !== value.children
    || value.childAges.some((age) => !Number.isInteger(age) || Number(age) < 0 || Number(age) > 17)) return false;
  if (!isNullableSafeInteger(value.budgetVnd) || !isNullableSafeInteger(value.childBudgetVnd)
    || !isNullableSafeInteger(value.mealCostVnd) || !isNullableSafeInteger(value.transportCostVnd)) return false;
  if (!['group', 'person'].includes(String(value.budgetBasis)) || !['car', 'bike', 'walk', 'boat'].includes(String(value.transportMode))
    || !['relaxed', 'balanced', 'active'].includes(String(value.pace)) || !Number.isInteger(value.maxStops) || Number(value.maxStops) < 2 || Number(value.maxStops) > 6) return false;
  if (typeof value.includeMealCost !== 'boolean' || typeof value.includeTransportCost !== 'boolean'
    || (value.originPlaceId !== null && typeof value.originPlaceId !== 'string') || (value.destinationPlaceId !== null && typeof value.destinationPlaceId !== 'string')) return false;
  if (!Array.isArray(value.interestCategoryIds) || value.interestCategoryIds.length > 4 || value.interestCategoryIds.some((id) => typeof id !== 'string')
    || !Array.isArray(value.requiredExperienceIds) || value.requiredExperienceIds.length > 6 || value.requiredExperienceIds.some((id) => typeof id !== 'string')) return false;
  if (!isRecord(value.groupCostEstimatesVnd) || Object.keys(value.groupCostEstimatesVnd).length > 100
    || Object.values(value.groupCostEstimatesVnd).some((amount) => !Number.isSafeInteger(amount) || Number(amount) < 0)) return false;
  return true;
}

function validateOption(value: unknown): value is ItineraryOption {
  if (!isRecord(value) || typeof value.id !== 'string' || !['Tiết kiệm', 'Cân bằng', 'Nhiều trải nghiệm'].includes(String(value.label))) return false;
  if (!Array.isArray(value.stops) || value.stops.length < 2 || value.stops.length > 6
    || !Array.isArray(value.warnings) || value.warnings.length > 30 || value.warnings.some((item) => typeof item !== 'string' || item.length > 500)) return false;
  return value.stops.every((stop) => isRecord(stop) && typeof stop.experienceId === 'string' && typeof stop.placeId === 'string'
    && typeof stop.name === 'string' && typeof stop.categoryId === 'string' && Array.isArray(stop.activities)
    && stop.activities.every((activity) => typeof activity === 'string') && typeof stop.bookingRequirement === 'string'
    && typeof stop.arrivalTime === 'string' && /^\d{2}:\d{2}$/.test(stop.arrivalTime)
    && typeof stop.departureTime === 'string' && /^\d{2}:\d{2}$/.test(stop.departureTime)
    && Number.isSafeInteger(stop.travelMinutesFromPrevious) && Number(stop.travelMinutesFromPrevious) >= 0
    && isNullableSafeInteger(stop.costVnd) && ['verified', 'user_estimate', 'unknown'].includes(String(stop.costSource))
    && (stop.geometryFromPrevious === null || typeof stop.geometryFromPrevious === 'string') && typeof stop.explanation === 'string');
}

function validateSavedItinerary(value: unknown): value is SavedItinerary {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string' || typeof value.createdAt !== 'string' || typeof value.updatedAt !== 'string') return false;
  if (value.id.length > 120 || value.title.length > 120 || !validateRequest(value.request) || !Array.isArray(value.options) || value.options.length > 3 || !value.options.every(validateOption)) return false;
  return true;
}

export function parseLocalDataJson(raw: string): { data: LocalData | null; error: string | null } {
  if (new Blob([raw]).size > MAX_STORAGE_BYTES) return { data: null, error: 'Tệp vượt giới hạn 1 MB.' };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== LOCAL_SCHEMA_VERSION) return { data: null, error: 'Phiên bản JSON không tương thích.' };
    const favorites = stringIds(parsed.favoritePlaceIds);
    const visited = stringIds(parsed.visitedPlaceIds);
    if (!favorites || !visited || !Array.isArray(parsed.itineraries) || parsed.itineraries.length > 25 || !parsed.itineraries.every(validateSavedItinerary)) {
      return { data: null, error: 'Danh sách yêu thích, dấu đã trải nghiệm hoặc hành trình chưa hợp lệ.' };
    }
    return { data: { schemaVersion: LOCAL_SCHEMA_VERSION, favoritePlaceIds: favorites, visitedPlaceIds: visited, itineraries: parsed.itineraries as SavedItinerary[] }, error: null };
  } catch {
    return { data: null, error: 'Không đọc được JSON.' };
  }
}

export function readLocalData(): LocalDataResult {
  if (typeof window === 'undefined') return { data: emptyLocalData(), warning: null, available: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: emptyLocalData(), warning: null, available: true };
    if (new Blob([raw]).size > MAX_STORAGE_BYTES) return { data: emptyLocalData(), warning: 'Dữ liệu trên thiết bị quá lớn hoặc không hợp lệ; hãy xuất bản sao trước khi xóa bộ nhớ trình duyệt.', available: true };
    const parsed = parseLocalDataJson(raw);
    if (!parsed.data) return { data: emptyLocalData(), warning: `${parsed.error} Dữ liệu hiện có không bị xóa.`, available: true };
    return { data: parsed.data, warning: null, available: true };
  } catch {
    return { data: emptyLocalData(), warning: 'Bộ nhớ trình duyệt đang bị tắt hoặc không đọc được; các tính năng lưu cục bộ hiện không khả dụng.', available: false };
  }
}

export function writeLocalData(data: LocalData): { ok: boolean; message: string } {
  if (typeof window === 'undefined') return { ok: false, message: 'Chỉ lưu được trên trình duyệt hiện tại.' };
  const value: LocalData = {
    schemaVersion: LOCAL_SCHEMA_VERSION,
    favoritePlaceIds: Array.from(new Set(data.favoritePlaceIds)).slice(0, 500),
    visitedPlaceIds: Array.from(new Set(data.visitedPlaceIds)).slice(0, 500),
    itineraries: data.itineraries.slice(0, 25),
  };
  try {
    const serialized = JSON.stringify(value);
    if (new Blob([serialized]).size > MAX_STORAGE_BYTES) return { ok: false, message: 'Dữ liệu vượt giới hạn lưu của trang. Hãy xuất JSON và xóa bớt hành trình cũ.' };
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return { ok: true, message: 'Đã lưu trên thiết bị này.' };
  } catch {
    return { ok: false, message: 'Trình duyệt không cho phép lưu hoặc đã hết dung lượng. Hãy xuất JSON để giữ bản sao.' };
  }
}

export function readContentDraft(): string | null {
  try { return typeof window === 'undefined' ? null : window.localStorage.getItem(CONTENT_DRAFT_KEY); }
  catch { return null; }
}

export function writeContentDraft(value: string): { ok: boolean; message: string } {
  if (value.length > MAX_STORAGE_BYTES) return { ok: false, message: 'Bản nháp vượt giới hạn lưu của trình duyệt.' };
  try {
    if (typeof window === 'undefined') return { ok: false, message: 'Chỉ lưu được trên trình duyệt hiện tại.' };
    window.localStorage.setItem(CONTENT_DRAFT_KEY, value);
    return { ok: true, message: 'Bản nháp được lưu trên thiết bị này; chưa đăng lên website.' };
  } catch {
    return { ok: false, message: 'Không thể lưu bản nháp trong trình duyệt này.' };
  }
}

export function clearContentDraft(): { ok: boolean; message: string } {
  try {
    if (typeof window === 'undefined') return { ok: false, message: 'Chỉ xóa được trên trình duyệt hiện tại.' };
    window.localStorage.removeItem(CONTENT_DRAFT_KEY);
    return { ok: true, message: 'Đã xóa bản nháp trên thiết bị này.' };
  } catch {
    return { ok: false, message: 'Không thể xóa bản nháp trong trình duyệt này.' };
  }
}

export function downloadJson(fileName: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function newLocalId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
