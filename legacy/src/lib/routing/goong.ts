import 'server-only';
import type { RouteEstimate, TransportMode } from '@/lib/itinerary/engine';

type GoongResponse = {
  routes?: Array<{
    legs?: Array<{ distance?: { value?: number }; duration?: { value?: number } }>;
    overview_polyline?: { points?: string };
  }>;
};

const VEHICLES: Record<TransportMode, string> = {
  car: 'car',
  bike: 'bike',
  walk: 'walk',
};

export async function getGoongRoute(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  mode: TransportMode,
): Promise<RouteEstimate | null> {
  const apiKey = process.env.GOONG_API_KEY;
  if (!apiKey) return null;

  const timeout = Math.max(1_000, Math.min(8_000, Number(process.env.ROUTING_TIMEOUT_MS) || 5_000));
  const endpoint = process.env.GOONG_DIRECTIONS_URL || 'https://rsapi.goong.io/v2/direction';
  const url = new URL(endpoint);
  url.searchParams.set('origin', `${from.latitude},${from.longitude}`);
  url.searchParams.set('destination', `${to.latitude},${to.longitude}`);
  url.searchParams.set('vehicle', VEHICLES[mode]);
  url.searchParams.set('api_key', apiKey);

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const body = await response.json() as GoongResponse;
    const route = body.routes?.[0];
    const leg = route?.legs?.[0];
    const meters = leg?.distance?.value;
    const seconds = leg?.duration?.value;
    const encodedPolyline = route?.overview_polyline?.points;
    if (!Number.isFinite(meters) || !Number.isFinite(seconds)
        || (meters ?? 0) < 0 || (seconds ?? 0) < 0
        || typeof encodedPolyline !== 'string' || !encodedPolyline || encodedPolyline.length > 100_000) return null;

    return {
      provider: 'Goong Directions',
      distanceMeters: meters!,
      durationMinutes: Math.max(1, Math.ceil(seconds! / 60)),
      encodedPolyline,
      isRealtime: false,
    };
  } catch {
    return null;
  }
}
