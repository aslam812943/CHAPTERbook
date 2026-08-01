// Store dispatch point - Mall of Travancore, Eanchakkal, Thiruvananthapuram.
// Geocoded once via OpenStreetMap Nominatim; fixed here rather than looked up
// per-request since the shop doesn't move.
export const STORE_COORDINATES = { lat: 8.4876556, lng: 76.9260458 };

export interface Coordinates {
  lat: number;
  lng: number;
}

// Nominatim's usage policy requires a real identifying User-Agent (not a
// browser UA) and caps free usage at ~1 request/second - both easily
// satisfied by a single lookup per checkout submission.
const NOMINATIM_USER_AGENT = "ChapterBookStore/1.0 (chapterbookstoretvm@gmail.com)";

export async function geocodeAddress(addressQuery: string): Promise<Coordinates | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressQuery)}`;

  try {
    const res = await fetch(url, { headers: { "User-Agent": NOMINATIM_USER_AGENT } });
    if (!res.ok) return null;

    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (results.length === 0) return null;

    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

// Haversine formula - straight-line ("as the crow flies") distance in km
// between two lat/lng points. Not real driving distance, but a reasonable
// and free proxy for a same-city delivery-zone check.
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Free within 5km, then tiered flat fees the farther out the address is.
// Distances beyond 20km still get delivered, just at the top tier rate,
// rather than blocking checkout entirely.
export function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= 5) return 0;
  if (distanceKm <= 10) return 30;
  if (distanceKm <= 20) return 60;
  return 100;
}

export interface DeliveryEstimate {
  distanceKm: number;
  deliveryFee: number;
}

// Used both for the live checkout-page preview and as the authoritative
// calculation when the order is actually created - same code path so the
// two can never disagree. Falls back to the 5-10km tier fee (not free, not
// the harshest tier either) if the address can't be geocoded, rather than
// blocking checkout over an external service hiccup.
export async function estimateDelivery(addressQuery: string): Promise<DeliveryEstimate> {
  const coords = await geocodeAddress(addressQuery);
  if (!coords) {
    return { distanceKm: -1, deliveryFee: 30 };
  }

  const distanceKm = haversineDistanceKm(STORE_COORDINATES, coords);
  return { distanceKm: Math.round(distanceKm * 10) / 10, deliveryFee: calculateDeliveryFee(distanceKm) };
}
