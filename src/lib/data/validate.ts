import type { Category, Experience, ImageRecord, Place, RouteGeometryCollection, RouteMatrix, Source, TimeWindow } from './types';

const EXPECTED_CATEGORY_NAMES = ['Sông nước & Ký ức', 'Vườn trái cây', 'Trải nghiệm làm nghề', 'Trang trại'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function fail(message: string): never {
  throw new Error(`Invalid repository data: ${message}`);
}

function uniqueIds(items: Array<{ id: string }>, label: string): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id || ids.has(item.id)) fail(`${label} has a missing or duplicate id "${item.id}"`);
    ids.add(item.id);
  }
  return ids;
}

function checkDate(value: string | null, label: string): void {
  if (value === null) return;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!DATE_RE.test(value) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) fail(`${label} has invalid date ${value}`);
}

function checkWindow(window: TimeWindow, label: string): void {
  if (!TIME_RE.test(window.start) || !TIME_RE.test(window.end) || window.start >= window.end) fail(`${label} has invalid opening hours`);
}

export function validateCatalog(input: {
  categories: Category[];
  places: Place[];
  experiences: Experience[];
  sources: Source[];
  images: ImageRecord[];
  matrix: RouteMatrix;
  routes: RouteGeometryCollection;
}): void {
  const categoryIds = uniqueIds(input.categories, 'categories');
  if (input.categories.length !== EXPECTED_CATEGORY_NAMES.length || input.categories.some((item, index) => item.name !== EXPECTED_CATEGORY_NAMES[index])) {
    fail('categories must use the four requested names and order');
  }
  const placeIds = uniqueIds(input.places, 'places');
  const experienceIds = uniqueIds(input.experiences, 'experiences');
  const sourceIds = uniqueIds(input.sources, 'sources');
  const imageIds = uniqueIds(input.images, 'images');
  const geometryIds = new Set(input.routes.features.map((feature) => feature.id));
  if (geometryIds.size !== input.routes.features.length) fail('routes.geojson has duplicate feature ids');

  for (const source of input.sources) {
    checkDate(source.publishedAt, `source ${source.id}.publishedAt`);
    checkDate(source.checkedAt, `source ${source.id}.checkedAt`);
    let url: URL;
    try { url = new URL(source.sourceUrl); } catch { fail(`source ${source.id} has invalid URL`); }
    if (url.protocol !== 'https:') fail(`source ${source.id} must use HTTPS`);
  }

  for (const category of input.categories) {
    if (!/^#[0-9a-f]{6}$/i.test(category.accent)) fail(`category ${category.id} has invalid color`);
  }

  for (const place of input.places) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(place.slug)) fail(`place ${place.id} has invalid slug`);
    if (!categoryIds.has(place.primaryCategory) || place.secondaryCategories.some((id) => !categoryIds.has(id))) fail(`place ${place.id} references an unknown category`);
    if (place.areaCode !== null && typeof place.areaCode !== 'string') fail(`place ${place.id} has an invalid area code`);
    if (place.sourceIds.some((id) => !sourceIds.has(id)) || place.imageIds.some((id) => !imageIds.has(id))) fail(`place ${place.id} has an orphan source/image reference`);
    checkDate(place.updatedAt, `place ${place.id}.updatedAt`);
    if (place.coordinates) {
      const { latitude, longitude } = place.coordinates;
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) fail(`place ${place.id} has out-of-range coordinates`);
      if (place.coordinateStatus !== 'verified' || place.verification.coordinates.status !== 'verified') fail(`place ${place.id} has coordinates without verified status`);
      if (place.areaCode !== 'BINH_MY' || place.verification.area.status !== 'verified') fail(`place ${place.id} has coordinates outside the verified Bình Mỹ area`);
    } else if (place.coordinateStatus === 'verified' || place.verification.coordinates.status === 'verified') {
      fail(`place ${place.id} marks missing coordinates as verified`);
    }
    for (const fact of Object.values(place.verification)) {
      checkDate(fact.checkedAt, `place ${place.id} verification date`);
      if (fact.sourceIds.some((id) => !sourceIds.has(id))) fail(`place ${place.id} verification has an orphan source`);
      if (fact.status === 'verified' && (!fact.checkedAt || fact.sourceIds.length === 0)) fail(`place ${place.id} marks a fact verified without a dated source`);
    }
    if (place.contacts && Object.values(place.contacts).some((value) => typeof value !== 'string' || !value.trim())) fail(`place ${place.id} has an empty contact field`);
  }

  for (const image of input.images) {
    if (!categoryIds.has(image.categoryId) || (image.placeId !== null && !placeIds.has(image.placeId))) fail(`image ${image.id} references an unknown place/category`);
    if (image.researchPath && (!image.researchPath.startsWith('research-assets/') || image.researchPath.includes('..') || image.researchPath.includes('\\'))) fail(`image ${image.id} has an unsafe research path`);
    if (image.publishedPath && (!image.publishedPath.startsWith('/images/places/') || image.publishedPath.includes('..') || image.publishedPath.includes('\\'))) fail(`image ${image.id} has an unsafe published path`);
    if (image.publishAllowed && (!['licensed', 'owner_granted', 'self_owned'].includes(image.rightsStatus) || !image.publishedPath)) fail(`image ${image.id} cannot be published without rights and a local public image`);
    if (!image.publishAllowed && image.publishedPath) fail(`image ${image.id} has a public path without publication rights`);
  }

  for (const experience of input.experiences) {
    if (!categoryIds.has(experience.categoryId) || (experience.placeId !== null && !placeIds.has(experience.placeId))) fail(`experience ${experience.id} references an unknown place/category`);
    if (experience.evidence.sourceIds.some((id) => !sourceIds.has(id))) fail(`experience ${experience.id} has an orphan source`);
    checkDate(experience.evidence.checkedAt, `experience ${experience.id}.checkedAt`);
    if (experience.durationMinutes !== null && (!Number.isSafeInteger(experience.durationMinutes) || experience.durationMinutes <= 0)) fail(`experience ${experience.id} has invalid duration`);
    if (experience.weeklyHours) for (const [day, windows] of Object.entries(experience.weeklyHours)) {
      if (!/^[0-6]$/.test(day)) fail(`experience ${experience.id} has invalid weekday`);
      windows?.forEach((window) => checkWindow(window, `experience ${experience.id}`));
    }
    experience.dateExceptions.forEach((exception) => {
      checkDate(exception.date, `experience ${experience.id} date exception`);
      exception.windows?.forEach((window) => checkWindow(window, `experience ${experience.id} date exception`));
    });
    if (experience.seasonAvailability) {
      experience.seasonAvailability.dates.forEach((date) => checkDate(date, `experience ${experience.id} seasonal date`));
      checkDate(experience.seasonAvailability.checkedAt, `experience ${experience.id} season checkedAt`);
      if (experience.seasonAvailability.sourceIds.some((id) => !sourceIds.has(id))) fail(`experience ${experience.id} has an orphan seasonal source`);
      if (experience.seasonAvailability.status === 'verified' && (!experience.seasonAvailability.checkedAt || !experience.seasonAvailability.sourceIds.length)) fail(`experience ${experience.id} has verified season without a dated source`);
      if (experience.seasonAvailability.status === 'verified' && !experience.seasonAvailability.yearRound && !experience.seasonAvailability.dates.length) fail(`experience ${experience.id} marks a blank season as verified`);
      if (experience.seasonAvailability.yearRound && experience.seasonAvailability.dates.length) fail(`experience ${experience.id} has conflicting year-round and seasonal dates`);
    }
    experience.priceRules?.forEach((rule) => {
      if (!Number.isSafeInteger(rule.amountVnd) || rule.amountVnd < 0) fail(`experience ${experience.id} has invalid VND price`);
      if (rule.status === 'verified' && (!rule.sourceId || !sourceIds.has(rule.sourceId) || !rule.checkedAt)) fail(`experience ${experience.id} has a verified price without a dated source`);
      checkDate(rule.checkedAt, `experience ${experience.id} price date`);
    });
    if (experience.routeEligible) {
      const place = input.places.find((item) => item.id === experience.placeId);
      if (!place?.coordinates || place.coordinateStatus !== 'verified' || place.verification.coordinates.status !== 'verified' || place.areaCode !== 'BINH_MY' || place.verification.area.status !== 'verified' || place.verification.hours.status !== 'verified' || place.verification.operations.status !== 'verified' || !experience.durationMinutes || !experience.weeklyHours || experience.seasonAvailability?.status !== 'verified' || !experience.seasonAvailability.checkedAt || !experience.seasonAvailability.sourceIds.length) fail(`experience ${experience.id} is route eligible without verified area, location, hours, season and operations`);
    }
  }

  if (!Number.isSafeInteger(input.matrix.version) || input.matrix.version < 1) fail('routing matrix has invalid version');
  checkDate(input.matrix.generatedAt, 'routing matrix generatedAt');
  const edgeKeys = new Set<string>();
  for (const edge of input.matrix.edges) {
    if (!placeIds.has(edge.fromPlaceId) || !placeIds.has(edge.toPlaceId) || edge.fromPlaceId === edge.toPlaceId) fail('routing edge references an invalid or repeated place');
    if (!sourceIds.has(edge.sourceId) || !geometryIds.has(edge.geometryRef)) fail('routing edge has an orphan source or geometry');
    if (!Number.isFinite(edge.distanceMeters) || edge.distanceMeters <= 0 || !Number.isFinite(edge.durationSeconds) || edge.durationSeconds <= 0) fail('routing edge has invalid distance or duration');
    checkDate(edge.generatedAt, 'routing edge generatedAt');
    const key = `${edge.fromPlaceId}|${edge.toPlaceId}|${edge.mode}`;
    if (edgeKeys.has(key)) fail(`routing matrix has duplicate directed edge ${key}`);
    edgeKeys.add(key);
  }
  for (const feature of input.routes.features) {
    if (feature.geometry.type !== 'LineString' || feature.geometry.coordinates.length < 2) fail(`geometry ${feature.id} is not a usable LineString`);
    for (const [longitude, latitude] of feature.geometry.coordinates) {
      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180 || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) fail(`geometry ${feature.id} has invalid GeoJSON [lng,lat] coordinates`);
    }
  }
  void experienceIds;
}
