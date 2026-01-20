import { TrafficData, RouteData, SeverityLevel, Language } from '@/types';
import { RouteDisplayData, TrafficSegment } from '@/types/life';
import { jakartaRegions, getRegionById } from '@/data/regions';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// ============================================================================
// GOOGLE PLACES API - Location Search
// ============================================================================

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  coordinates: [number, number];
}

interface PlacesTextSearchResponse {
  status: string;
  results: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: { lat: number; lng: number };
    };
  }[];
}

/**
 * Search for places using Google Places Text Search API (via API route)
 */
export async function searchPlaces(
  query: string,
  language: Language = 'id'
): Promise<PlaceResult[]> {
  try {
    // Use our API route to avoid CORS issues
    const url = `/api/places?query=${encodeURIComponent(query)}&language=${language}`;

    const response = await fetch(url);
    const data: PlacesTextSearchResponse = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn('Places search failed:', data.status);
      return [];
    }

    return (data.results || []).slice(0, 5).map((place) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      coordinates: [place.geometry.location.lat, place.geometry.location.lng] as [number, number],
    }));
  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
}

interface DirectionsRoute {
  legs: {
    duration: { value: number; text: string };
    duration_in_traffic?: { value: number; text: string };
    distance: { value: number; text: string };
    steps: {
      html_instructions: string;
      duration: { value: number };
    }[];
  }[];
  summary: string;
}

interface DirectionsResponse {
  status: string;
  routes: DirectionsRoute[];
}

// Fetch traffic data for all regions using Distance Matrix API
export async function fetchTrafficData(): Promise<TrafficData[]> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_key_here') {
    throw new Error('Google Maps API key not configured');
  }

  const now = new Date();
  const trafficData: TrafficData[] = [];

  // For each region, get traffic conditions by checking routes to/from city center
  const cityCenter = '-6.2088,106.8456'; // Jakarta city center (Monas area)

  for (const region of jakartaRegions) {
    const origin = `${region.coordinates[0]},${region.coordinates[1]}`;

    try {
      // Get directions from region to city center with traffic (via API route to avoid CORS)
      const url = `/api/directions?origin=${origin}&destination=${cityCenter}`;

      const response = await fetch(url);
      const data: DirectionsResponse = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0].legs[0];
        const normalDuration = route.duration.value; // seconds
        const trafficDuration = route.duration_in_traffic?.value || normalDuration;

        // Calculate delay ratio
        const delayRatio = trafficDuration / normalDuration;

        // Determine severity based on delay
        let level: SeverityLevel;
        if (delayRatio > 1.5) {
          level = 'high';
        } else if (delayRatio > 1.2) {
          level = 'medium';
        } else {
          level = 'low';
        }

        // Calculate average speed (distance in meters, duration in seconds)
        const distanceKm = route.distance.value / 1000;
        const durationHours = trafficDuration / 3600;
        const avgSpeed = Math.round(distanceKm / durationHours);

        // Estimate delay in minutes
        const delayMinutes = Math.round((trafficDuration - normalDuration) / 60);

        trafficData.push({
          regionId: region.id,
          level,
          averageSpeed: avgSpeed,
          congestionPoints: getCongestionPointsFromRoute(data.routes[0]),
          estimatedDelay: Math.max(0, delayMinutes),
          lastUpdated: now,
        });
      } else {
        // Fallback if API fails for this region
        trafficData.push(getDefaultTrafficData(region.id, now));
      }
    } catch (error) {
      console.error(`Error fetching traffic for ${region.id}:`, error);
      trafficData.push(getDefaultTrafficData(region.id, now));
    }
  }

  return trafficData;
}

// Extract congestion points from route steps
function getCongestionPointsFromRoute(route: DirectionsRoute): string[] {
  const points: string[] = [];
  const steps = route.legs[0]?.steps || [];

  // Extract major road names from directions
  for (const step of steps.slice(0, 5)) {
    const instruction = step.html_instructions;
    // Extract road names (basic parsing)
    const roadMatch = instruction.match(/(?:Jl\.|Jalan|Tol|onto|via)\s+([^<]+)/i);
    if (roadMatch && roadMatch[1]) {
      const roadName = roadMatch[1].trim().replace(/<[^>]*>/g, '');
      if (roadName && !points.includes(roadName)) {
        points.push(roadName);
      }
    }
  }

  return points.slice(0, 3); // Return max 3 congestion points
}

// Fallback default traffic data
function getDefaultTrafficData(regionId: string, now: Date): TrafficData {
  return {
    regionId,
    level: 'medium',
    averageSpeed: 25,
    congestionPoints: [],
    estimatedDelay: 15,
    lastUpdated: now,
  };
}

// Fetch route data between two regions
export async function fetchRouteData(fromRegionId: string, toRegionId: string): Promise<RouteData> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_key_here') {
    throw new Error('Google Maps API key not configured');
  }

  const fromRegion = getRegionById(fromRegionId);
  const toRegion = getRegionById(toRegionId);

  if (!fromRegion || !toRegion) {
    throw new Error('Invalid region ID');
  }

  const origin = `${fromRegion.coordinates[0]},${fromRegion.coordinates[1]}`;
  const destination = `${toRegion.coordinates[0]},${toRegion.coordinates[1]}`;

  // Fetch with alternatives to get multiple route options (via API route to avoid CORS)
  const url = `/api/directions?origin=${origin}&destination=${destination}&alternatives=true`;

  const response = await fetch(url);
  const data: DirectionsResponse = await response.json();

  if (data.status !== 'OK' || data.routes.length === 0) {
    throw new Error('Failed to fetch route data');
  }

  const mainRoute = data.routes[0].legs[0];
  const distanceKm = Math.round(mainRoute.distance.value / 1000);
  const normalDuration = Math.round(mainRoute.duration.value / 60);
  const currentDuration = Math.round((mainRoute.duration_in_traffic?.value || mainRoute.duration.value) / 60);

  // Check if route passes through flood-affected areas (simplified check)
  const floodAffected = currentDuration > normalDuration * 1.3;

  // Build alternate routes from API response
  const alternateRoutes = data.routes.slice(1, 3).map((route, index) => {
    const leg = route.legs[0];
    const duration = Math.round((leg.duration_in_traffic?.value || leg.duration.value) / 60);
    const delayRatio = duration / normalDuration;

    return {
      name: route.summary || `Alternate Route ${index + 1}`,
      duration,
      floodRisk: (delayRatio > 1.3 ? 'medium' : 'low') as SeverityLevel,
      trafficLevel: (delayRatio > 1.5 ? 'high' : delayRatio > 1.2 ? 'medium' : 'low') as SeverityLevel,
    };
  });

  return {
    from: fromRegionId,
    to: toRegionId,
    distance: distanceKm,
    normalDuration,
    currentDuration,
    floodAffected,
    alternateRoutes,
  };
}

// Get traffic conditions for a specific route at a future time
export async function fetchFutureTrafficEstimate(
  fromRegionId: string,
  toRegionId: string,
  departureTime: Date
): Promise<{ duration: number; trafficLevel: SeverityLevel }> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_key_here') {
    throw new Error('Google Maps API key not configured');
  }

  const fromRegion = getRegionById(fromRegionId);
  const toRegion = getRegionById(toRegionId);

  if (!fromRegion || !toRegion) {
    throw new Error('Invalid region ID');
  }

  const origin = `${fromRegion.coordinates[0]},${fromRegion.coordinates[1]}`;
  const destination = `${toRegion.coordinates[0]},${toRegion.coordinates[1]}`;
  const departureTimestamp = Math.floor(departureTime.getTime() / 1000);

  // Use API route to avoid CORS
  const url = `/api/directions?origin=${origin}&destination=${destination}&departure_time=${departureTimestamp}`;

  const response = await fetch(url);
  const data: DirectionsResponse = await response.json();

  if (data.status !== 'OK' || data.routes.length === 0) {
    return { duration: 45, trafficLevel: 'medium' };
  }

  const route = data.routes[0].legs[0];
  const normalDuration = route.duration.value;
  const trafficDuration = route.duration_in_traffic?.value || normalDuration;
  const duration = Math.round(trafficDuration / 60);

  const delayRatio = trafficDuration / normalDuration;
  let trafficLevel: SeverityLevel;
  if (delayRatio > 1.5) {
    trafficLevel = 'high';
  } else if (delayRatio > 1.2) {
    trafficLevel = 'medium';
  } else {
    trafficLevel = 'low';
  }

  return { duration, trafficLevel };
}

// ============================================================================
// ROUTE WITH POLYLINE - For displaying actual Google route on map
// ============================================================================

interface DirectionsWithPolylineResponse {
  status: string;
  routes: {
    overview_polyline: { points: string };
    legs: {
      duration: { value: number; text: string };
      duration_in_traffic?: { value: number; text: string };
      distance: { value: number; text: string };
    }[];
    summary: string;
  }[];
}

/**
 * Fetch route with encoded polyline for map display
 */
export async function fetchRouteWithPolyline(
  origin: [number, number],
  destination: [number, number]
): Promise<RouteDisplayData | null> {
  try {
    const originStr = `${origin[0]},${origin[1]}`;
    const destStr = `${destination[0]},${destination[1]}`;

    // Use our API route to avoid CORS issues
    const url = `/api/directions?origin=${originStr}&destination=${destStr}`;

    const response = await fetch(url);
    const data: DirectionsWithPolylineResponse = await response.json();

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      console.warn('No route found, will use fallback');
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];
    const encodedPolyline = route.overview_polyline.points;

    // Decode the polyline
    const decodedPath = decodePolyline(encodedPolyline);

    // Calculate duration and distance
    const duration = Math.round((leg.duration_in_traffic?.value || leg.duration.value) / 60);
    const distance = Math.round(leg.distance.value / 1000 * 10) / 10; // Round to 1 decimal

    // Generate traffic segments (simplified - in real app would use Traffic API)
    const trafficSegments = generateTrafficSegments(decodedPath.length, leg);

    return {
      encodedPolyline,
      decodedPath,
      duration,
      distance,
      trafficSegments,
    };
  } catch (error) {
    console.error('Route fetch error:', error);
    return null;
  }
}

/**
 * Decode Google's encoded polyline format
 * Based on Google's Polyline Algorithm
 */
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    // Decode latitude
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    // Decode longitude
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/**
 * Generate traffic segments based on route data
 * In a real app, this would use Google's Traffic layer or Roads API
 */
function generateTrafficSegments(
  pathLength: number,
  leg: { duration: { value: number }; duration_in_traffic?: { value: number } }
): TrafficSegment[] {
  const segments: TrafficSegment[] = [];
  const normalDuration = leg.duration.value;
  const trafficDuration = leg.duration_in_traffic?.value || normalDuration;
  const delayRatio = trafficDuration / normalDuration;

  // Determine overall traffic level
  let color: 'green' | 'yellow' | 'red';
  if (delayRatio > 1.5) {
    color = 'red';
  } else if (delayRatio > 1.2) {
    color = 'yellow';
  } else {
    color = 'green';
  }

  // For simplicity, create one segment for the entire route
  // In production, this would be multiple segments with varying traffic
  segments.push({
    startIndex: 0,
    endIndex: pathLength - 1,
    color,
    speedKmh: Math.round(10 / (delayRatio * 0.6)), // Rough speed estimate
  });

  return segments;
}

/**
 * Generate Google Maps URL for opening directions
 */
export function getGoogleMapsUrl(
  origin: [number, number],
  destination: [number, number]
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&travelmode=driving`;
}
