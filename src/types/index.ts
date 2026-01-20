// ============================================================================
// CORE DATA TYPES
// ============================================================================

export type Language = 'id' | 'en';

// Re-export life types
export * from './life';

export type SeverityLevel = 'low' | 'medium' | 'high';

export type TripDirection = 'home-to-office' | 'office-to-home';

// ============================================================================
// REGION & LOCATION TYPES
// ============================================================================

export interface Region {
  id: string;
  name: string;
  nameId: string; // Indonesian name
  coordinates: [number, number]; // [lat, lng]
  // Flood-prone areas within the region
  floodZones: string[];
}

export interface UserLocation {
  home: string; // Region ID
  office: string; // Region ID
}

// ============================================================================
// FLOOD DATA TYPES
// ============================================================================

export interface FloodData {
  regionId: string;
  level: SeverityLevel;
  waterLevel: number; // in cm
  prediction: FloodPrediction;
  lastUpdated: Date;
  affectedAreas: string[];
}

export interface FloodPrediction {
  nextHour: SeverityLevel;
  next3Hours: SeverityLevel;
  next6Hours: SeverityLevel;
  peakTime?: Date;
  peakLevel?: SeverityLevel;
}

// ============================================================================
// TRAFFIC DATA TYPES
// ============================================================================

export interface TrafficData {
  regionId: string;
  level: SeverityLevel;
  averageSpeed: number; // km/h
  congestionPoints: string[];
  estimatedDelay: number; // minutes
  lastUpdated: Date;
}

export interface RouteData {
  from: string;
  to: string;
  distance: number; // km
  normalDuration: number; // minutes
  currentDuration: number; // minutes with traffic
  floodAffected: boolean;
  alternateRoutes: AlternateRoute[];
}

export interface AlternateRoute {
  name: string;
  duration: number;
  floodRisk: SeverityLevel;
  trafficLevel: SeverityLevel;
}

// ============================================================================
// WEATHER DATA TYPES
// ============================================================================

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: WeatherCondition;
  rainfall: number; // mm
  windSpeed: number; // km/h
  forecast: WeatherForecast[];
  lastUpdated: Date;
}

export type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'light-rain'
  | 'heavy-rain'
  | 'thunderstorm';

export interface WeatherForecast {
  time: Date;
  condition: WeatherCondition;
  temperature: number;
  rainProbability: number;
  rainfall: number;
}

// ============================================================================
// DEPARTURE CALCULATOR TYPES
// ============================================================================

export interface DepartureRecommendation {
  recommendedTime: Date;
  arrivalTime: Date;
  duration: number; // minutes
  floodRisk: SeverityLevel;
  trafficLevel: SeverityLevel;
  score: number; // 0-100, higher is better
  reasoning: string;
  reasoningId: string; // Indonesian version
}

export interface DepartureWindow {
  time: Date;
  score: number;
  floodRisk: SeverityLevel;
  trafficLevel: SeverityLevel;
}

// ============================================================================
// DASHBOARD STATE TYPES
// ============================================================================

export interface DashboardState {
  language: Language;
  selectedRegion: string | null;
  userLocation: UserLocation;
  earliestDeparture: Date;
  tripDirection: TripDirection;
}

// ============================================================================
// API RESPONSE TYPES
// To be used when integrating with real APIs
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: Date;
  source: 'mock' | 'live';
}
