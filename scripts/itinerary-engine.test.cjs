const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { generateItineraryOptions, recalculateItinerary } = require(path.join(os.tmpdir(), 'binh-my-du-ky-test-build/engine.js'));

const DATE = '2099-04-12';
const VERIFIED = { status: 'verified', sourceIds: ['source'], checkedAt: '2099-01-01' };

function place(id, index = 0, overrides = {}) {
  const fact = () => ({ ...VERIFIED, sourceIds: ['source'] });
  return {
    id, slug: id, name: `Place ${id}`, aliases: [], primaryCategory: 'song-nuoc-ky-uc', secondaryCategories: [],
    shortDescription: 'Test-only fixture', locality: 'Bình Mỹ', areaCode: 'BINH_MY',
    address: `Test access ${id}`, coordinates: { latitude: 10.9 + index / 1000, longitude: 106.6 + index / 1000 },
    coordinateStatus: 'verified', contacts: null, imageIds: [], sourceIds: ['source'], updatedAt: '2099-01-01',
    verification: { identity: fact(), area: fact(), address: fact(), coordinates: fact(), hours: fact(), pricing: fact(), operations: fact() },
    ...overrides,
  };
}

function priceRule(basis, amount, overrides = {}) {
  return { amountVnd: amount, basis, status: 'verified', sourceId: 'source', checkedAt: '2099-01-01', ageMinimum: null, ageMaximum: null, minGroup: null, capacity: 8, included: [], excluded: [], ...overrides };
}

function experience(id, placeId, overrides = {}) {
  const week = Object.fromEntries(['0', '1', '2', '3', '4', '5', '6'].map((day) => [day, [{ start: '08:00', end: '18:00' }]]));
  return {
    id, placeId, categoryId: 'song-nuoc-ky-uc', name: `Experience ${id}`, activities: ['Guided activity'],
    durationMinutes: 60, weeklyHours: week, dateExceptions: [], seasonAvailability: { status: 'verified', dates: [], yearRound: true, sourceIds: ['source'], checkedAt: '2099-01-01' },
    bookingRequirement: 'Confirm directly before visiting', suitability: { status: 'verified', ageMinimum: 0, ageMaximum: 17, notes: null },
    priceRules: [priceRule('per_adult', 10_000), priceRule('per_child', 5_000)],
    evidence: { status: 'verified', sourceIds: ['source'], checkedAt: '2099-01-01' }, routeEligible: true, bookingAllowed: false,
    ...overrides,
  };
}

function edge(fromPlaceId, toPlaceId, overrides = {}) {
  return { fromPlaceId, toPlaceId, mode: 'car', distanceMeters: 2_000, durationSeconds: 600, geometryRef: `${fromPlaceId}-${toPlaceId}`, sourceId: 'source', generatedAt: DATE, status: 'verified', ...overrides };
}

function catalog(options = {}) {
  const places = [place('origin', 0), place('a', 1), place('b', 2), place('c', 3), place('destination', 4)];
  const experiences = options.experiences ?? [experience('exp-a', 'a'), experience('exp-b', 'b'), experience('exp-c', 'c')];
  const ids = places.map((item) => item.id);
  const edges = options.edges ?? ids.flatMap((from) => ids.filter((to) => to !== from).map((to) => edge(from, to)));
  return { places: options.places ?? places, experiences, sources: [], matrix: { version: 1, generatedAt: DATE, edges } };
}

function request(overrides = {}) {
  return {
    date: DATE, startTime: '08:00', endTime: '17:00', adults: 2, children: 0, childAges: [],
    budgetVnd: null, childBudgetVnd: null, budgetBasis: 'group', includeMealCost: false, mealCostVnd: null,
    includeTransportCost: false, transportCostVnd: null, transportMode: 'car', originPlaceId: 'origin', destinationPlaceId: 'destination',
    interestCategoryIds: [], requiredExperienceIds: [], pace: 'balanced', maxStops: 3, groupCostEstimatesVnd: {},
    ...overrides,
  };
}

test('uses only verified Bình Mỹ places and experiences', () => {
  const base = catalog();
  const unverified = experience('not-verified', 'a', { evidence: { status: 'reported', sourceIds: ['source'], checkedAt: DATE } });
  const wrongAreaPlaces = base.places.map((item) => item.id === 'b' ? { ...item, areaCode: 'OTHER' } : item);
  const result = generateItineraryOptions(request(), { ...base, experiences: [unverified, experience('wrong-area', 'b')], places: wrongAreaPlaces });
  assert.deepEqual(result.options, []);
  assert.ok(result.blockingReasons.some((reason) => reason.includes('xác minh')));
});

test('generates different options from verified directed edges and never duplicates a plan', () => {
  const result = generateItineraryOptions(request(), catalog());
  assert.ok(result.options.length > 0 && result.options.length <= 3);
  assert.equal(new Set(result.options.map((option) => option.id)).size, result.options.length);
  assert.ok(result.options.every((option) => option.stops.length >= 2));
  assert.ok(result.options.every((option) => option.stops.every((stop) => stop.activities.length > 0 && stop.bookingRequirement.length > 0)));
});

test('enforces the group budget at its exact boundary, including selected shared costs', () => {
  const trip = catalog({ experiences: [experience('exp-a', 'a'), experience('exp-b', 'b')] });
  const exact = generateItineraryOptions(request({ budgetVnd: 55_000, includeMealCost: true, mealCostVnd: 15_000 }), trip);
  assert.ok(exact.options.length > 0);
  assert.equal(exact.options[0].totalCostVnd, 55_000);
  const over = generateItineraryOptions(request({ budgetVnd: 54_999, includeMealCost: true, mealCostVnd: 15_000 }), trip);
  assert.deepEqual(over.options, []);
  assert.ok(over.blockingReasons.some((reason) => reason.includes('vượt ngân sách')));
});

test('requires each child price and does not substitute the adult price', () => {
  const noChildPrice = (id, placeId) => experience(id, placeId, { priceRules: [priceRule('per_adult', 10_000)] });
  const trip = catalog({ experiences: [noChildPrice('exp-a', 'a'), noChildPrice('exp-b', 'b')] });
  const requestWithChild = request({ adults: 1, children: 1, childAges: [7] });
  const uncapped = generateItineraryOptions(requestWithChild, trip);
  assert.ok(uncapped.options.length > 0);
  assert.equal(uncapped.options[0].totalCostVnd, null);
  assert.ok(uncapped.options[0].stops.every((stop) => stop.costVnd === null));
  const capped = generateItineraryOptions({ ...requestWithChild, budgetVnd: 100_000 }, trip);
  assert.deepEqual(capped.options, []);
  assert.ok(capped.blockingReasons.some((reason) => reason.includes('chưa biết')));
});

test('applies per-group fees once and rejects groups beyond recorded capacity', () => {
  const groupPrices = [experience('exp-a', 'a', { priceRules: [priceRule('per_group', 30_000)] }), experience('exp-b', 'b', { priceRules: [priceRule('per_group', 30_000)] })];
  const exactGroup = generateItineraryOptions(request({ budgetVnd: 60_000 }), catalog({ experiences: groupPrices }));
  assert.equal(exactGroup.options[0]?.totalCostVnd, 60_000);
  const limited = groupPrices.map((item) => ({ ...item, priceRules: [priceRule('per_group', 30_000, { capacity: 2 })] }));
  const tooMany = generateItineraryOptions(request({ adults: 2, children: 1, childAges: [8] }), catalog({ experiences: limited }));
  assert.deepEqual(tooMany.options, []);
  assert.ok(tooMany.blockingReasons.some((reason) => reason.includes('sức chứa')));
});

test('respects weekly closing hours and keeps lunch as a real pause', () => {
  const closed = catalog({ experiences: [experience('exp-a', 'a', { weeklyHours: { '0': [] } }), experience('exp-b', 'b')] });
  const closedResult = generateItineraryOptions(request(), closed);
  assert.ok(closedResult.blockingReasons.some((reason) => reason.includes('khung giờ')));
  const lunch = generateItineraryOptions(request({ startTime: '12:30', endTime: '17:00', maxStops: 2 }), catalog({ experiences: [experience('exp-a', 'a'), experience('exp-b', 'b')] }));
  assert.ok(lunch.options.length > 0);
  assert.equal(lunch.options[0].stops[0].arrivalTime, '13:00');
});

test('does not invent a route when directed edges are missing or reversed', () => {
  const onlyForward = [edge('origin', 'a'), edge('a', 'b'), edge('b', 'destination')];
  const trip = catalog({ experiences: [experience('exp-a', 'a'), experience('exp-b', 'b')], edges: onlyForward });
  const result = generateItineraryOptions(request({ maxStops: 2 }), trip);
  assert.ok(result.options.length > 0);
  assert.equal(recalculateItinerary(request(), ['exp-b', 'exp-a'], trip), null);
  const missing = generateItineraryOptions(request(), catalog({ experiences: [experience('exp-a', 'a'), experience('exp-b', 'b')], edges: [] }));
  assert.deepEqual(missing.options, []);
  assert.ok(missing.blockingReasons.some((reason) => reason.includes('có hướng')));
});

test('requires selected mandatory points and rejects repeated/removed stops during edits', () => {
  const trip = catalog({ experiences: [experience('exp-a', 'a'), experience('exp-b', 'b'), experience('exp-c', 'c')] });
  const required = request({ requiredExperienceIds: ['exp-a'] });
  const result = generateItineraryOptions(required, trip);
  assert.ok(result.options.length > 0);
  assert.ok(result.options.every((option) => option.stops.some((stop) => stop.experienceId === 'exp-a')));
  assert.equal(recalculateItinerary(required, ['exp-b', 'exp-c'], trip), null);
  assert.equal(recalculateItinerary(request(), ['exp-a', 'exp-a'], trip), null);
});

test('reports missing routing, unknown meal costs and malformed dates without claiming feasibility', () => {
  const noRoute = generateItineraryOptions(request(), catalog({ experiences: [experience('exp-a', 'a'), experience('exp-b', 'b')], edges: [] }));
  assert.deepEqual(noRoute.options, []);
  const missingMeal = generateItineraryOptions(request({ budgetVnd: 50_000, includeMealCost: true }), catalog());
  assert.deepEqual(missingMeal.options, []);
  assert.ok(missingMeal.blockingReasons.some((reason) => reason.includes('nhập mức dự trù')));
  const invalidDate = generateItineraryOptions(request({ date: '2099-02-30' }), catalog());
  assert.deepEqual(invalidDate.options, []);
});
