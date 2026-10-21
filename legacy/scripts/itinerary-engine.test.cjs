const assert = require('node:assert/strict');
const test = require('node:test');
const { buildItinerary } = require('../.test-build/engine.js');

const date = '2099-04-12';
const route = async () => ({
  provider: 'test-routing',
  distanceMeters: 5_000,
  durationMinutes: 20,
  encodedPolyline: 'test-polyline',
  isRealtime: false,
});

function service(id, slot, overrides = {}) {
  return {
    id,
    name: `Experience ${id}`,
    category: 'Nature',
    description: 'Outdoor garden activity',
    price: 30_000,
    priceBasis: 'PER_PERSON',
    childPrice: 20_000,
    duration: 60,
    capacity: 10,
    latitude: 10.96,
    longitude: 106.64,
    status: 'PUBLISHED',
    testOnly: false,
    areaCode: 'BINH_MY',
    serviceVerifiedAt: '2099-01-01T00:00:00.000Z',
    locationVerifiedAt: '2099-01-01T00:00:00.000Z',
    provider: { id: `provider-${id}`, name: `Provider ${id}`, address: 'Verified address', active: true },
    slots: [{ date, slot, verifiedAt: '2099-01-01T00:00:00.000Z', availablePlaces: 10 }],
    ...overrides,
  };
}

function request(overrides = {}) {
  return {
    date,
    startTime: '08:00',
    endTime: '17:00',
    adults: 2,
    children: 0,
    budgetBasis: 'GROUP',
    transportMode: 'car',
    interests: [],
    maxStops: 4,
    ...overrides,
  };
}

test('uses verified availability, route ETA, and non-overlapping time slots', async () => {
  const plan = await buildItinerary(request(), [
    service('a', '08:00'),
    service('b', '10:00', { latitude: 10.97 }),
  ], route);

  assert.equal(plan.stops.length, 2);
  assert.equal(plan.stops[0].arrivalTime, '08:00');
  assert.equal(plan.stops[0].departureTime, '09:00');
  assert.equal(plan.stops[1].arrivalTime, '10:00');
  assert.equal(plan.stops[1].routeFromPrevious.provider, 'test-routing');
  assert.equal(plan.totalTravelMinutes, null, 'origin travel is unknown unless the traveler provides a consented origin');
});

test('excludes unverified, outside-area, test-only, inactive, and unverified-slot records', async () => {
  const invalid = [
    service('unverified-location', '08:00', { locationVerifiedAt: null }),
    service('wrong-area', '08:00', { areaCode: 'OTHER' }),
    service('test', '08:00', { testOnly: true }),
    service('inactive-provider', '08:00', { provider: { id: 'p', name: 'P', address: 'A', active: false } }),
    service('unverified-slot', '08:00', { slots: [{ date, slot: '08:00', verifiedAt: null, availablePlaces: 10 }] }),
  ];
  const plan = await buildItinerary(request(), invalid, route);
  assert.equal(plan.feasibility, 'NO_FEASIBLE_PLAN');
  assert.deepEqual(plan.stops, []);
  assert.ok(plan.rejectedReasons.includes('NO_VERIFIED_AVAILABLE_SERVICES'));
});

test('does not exceed group or per-person budgets', async () => {
  const plan = await buildItinerary(request({ budgetVnd: 25_000, budgetBasis: 'PER_PERSON' }), [
    service('over-budget', '08:00'),
  ], route);
  assert.equal(plan.stops.length, 0);
  assert.ok(plan.rejectedReasons.includes('OVER_BUDGET'));
});

test('reports child price as unknown instead of assuming adult price', async () => {
  const plan = await buildItinerary(request({ children: 1 }), [
    service('child-price-missing', '08:00', { childPrice: null }),
  ], route);
  assert.equal(plan.stops[0].costVnd, null);
  assert.equal(plan.totalCostVnd, null);
  assert.ok(plan.warnings.includes('CHILD_PRICE_NOT_CONFIRMED'));
});

test('does not invent travel time or a multi-stop route when routing is unavailable', async () => {
  const plan = await buildItinerary(request(), [service('a', '08:00'), service('b', '10:00')]);
  assert.equal(plan.stops.length, 1);
  assert.equal(plan.stops[0].routeFromPrevious, null);
  assert.equal(plan.totalTravelMinutes, null);
  assert.ok(plan.warnings.includes('ROUTING_NOT_CONFIGURED'));
});

test('caches repeated route lookups and caps external route requests', async () => {
  let calls = 0;
  const countedRoute = async () => { calls += 1; return route(); };
  const sameServiceSlots = service('repeat', '08:00', {
    slots: [
      { date, slot: '08:00', verifiedAt: '2099-01-01T00:00:00.000Z', availablePlaces: 10 },
      { date, slot: '08:30', verifiedAt: '2099-01-01T00:00:00.000Z', availablePlaces: 10 },
    ],
  });
  await buildItinerary(request({ origin: { latitude: 10.95, longitude: 106.63 } }), [sameServiceSlots], countedRoute);
  assert.equal(calls, 1, 'same coordinates and transport mode should be cached across time slots');

  calls = 0;
  const many = Array.from({ length: 40 }, (_, index) => service(`candidate-${index}`, '08:00', { longitude: 106.6 + index / 100_000 }));
  const plan = await buildItinerary(request({ origin: { latitude: 10.95, longitude: 106.63 } }), many, countedRoute);
  assert.equal(calls, 32, 'external routing calls must stay within the per-plan cap');
  assert.ok(plan.warnings.includes('ROUTING_LOOKUP_LIMIT_REACHED'));
});

test('requires return travel to fit before the requested end time', async () => {
  const slowRoute = async () => ({
    provider: 'test-routing', distanceMeters: 100_000, durationMinutes: 300,
    encodedPolyline: 'test-polyline', isRealtime: false,
  });
  const plan = await buildItinerary(request({ endTime: '12:00', returnTo: { latitude: 10.9, longitude: 106.5 } }), [
    service('late-return', '09:00'),
  ], slowRoute);
  assert.equal(plan.feasibility, 'NO_FEASIBLE_PLAN');
  assert.deepEqual(plan.stops, []);
  assert.ok(plan.rejectedReasons.includes('RETURN_TOO_LATE'));
});

test('rejects impossible dates and malformed time windows', async () => {
  const invalidDate = await buildItinerary(request({ date: '2099-02-30' }), [service('a', '08:00')], route);
  const invalidTime = await buildItinerary(request({ startTime: '17:00', endTime: '08:00' }), [service('a', '08:00')], route);
  assert.equal(invalidDate.feasibility, 'NO_FEASIBLE_PLAN');
  assert.ok(invalidDate.rejectedReasons.includes('INVALID_OR_PAST_DATE'));
  assert.equal(invalidTime.feasibility, 'NO_FEASIBLE_PLAN');
  assert.ok(invalidTime.rejectedReasons.includes('INVALID_TIME_WINDOW'));
});
