// ============================================================================
// LIFE IN JAKARTA - TYPE DEFINITIONS
// Types for destinations, activities, and weekly patterns
// ============================================================================

import { SeverityLevel } from './index';

// ============================================================================
// ACTIVITY TYPES - All common Jakarta after-work activities
// ============================================================================

export type ActivityType =
  | 'home'
  | 'futsal'
  | 'badminton'
  | 'tennis'
  | 'padel'
  | 'gym'
  | 'swimming'
  | 'golf'
  | 'dinner'
  | 'drinks'
  | 'coffee'
  | 'shopping'
  | 'movies'
  | 'family'
  | 'religious'
  | 'other';

export interface ActivityOption {
  type: ActivityType;
  name: string;
  nameId: string;
  icon: string;
  category: DestinationCategory;
  destinationId: string; // Preset location for this activity
  locationName: string;  // Display name for the location
  locationNameId: string;
}

// Activity options with preset locations
export const ACTIVITY_OPTIONS: ActivityOption[] = [
  { type: 'home', name: 'Home', nameId: 'Pulang ke Rumah', icon: '🏠', category: 'home', destinationId: 'home', locationName: 'Pondok Indah', locationNameId: 'Pondok Indah' },
  { type: 'futsal', name: 'Futsal', nameId: 'Futsal', icon: '⚽', category: 'sports', destinationId: 'futsal-kemang', locationName: 'Kemang Futsal Arena', locationNameId: 'Arena Futsal Kemang' },
  { type: 'badminton', name: 'Badminton', nameId: 'Badminton', icon: '🏸', category: 'sports', destinationId: 'badminton-pi', locationName: 'Pondok Indah Sports Club', locationNameId: 'Pondok Indah Sports Club' },
  { type: 'tennis', name: 'Tennis', nameId: 'Tenis', icon: '🎾', category: 'sports', destinationId: 'padel-senopati', locationName: 'Senopati Club', locationNameId: 'Senopati Club' },
  { type: 'padel', name: 'Padel', nameId: 'Padel', icon: '🏓', category: 'sports', destinationId: 'padel-senopati', locationName: 'Padel Club Senopati', locationNameId: 'Padel Club Senopati' },
  { type: 'gym', name: 'Gym/Fitness', nameId: 'Gym/Fitness', icon: '💪', category: 'sports', destinationId: 'gym-scbd', locationName: 'Fitness First SCBD', locationNameId: 'Fitness First SCBD' },
  { type: 'swimming', name: 'Swimming', nameId: 'Berenang', icon: '🏊', category: 'sports', destinationId: 'badminton-pi', locationName: 'Pondok Indah Sports Club', locationNameId: 'Pondok Indah Sports Club' },
  { type: 'golf', name: 'Golf/Driving Range', nameId: 'Golf/Driving Range', icon: '⛳', category: 'sports', destinationId: 'golf-senayan', locationName: 'Senayan Golf Course', locationNameId: 'Lapangan Golf Senayan' },
  { type: 'dinner', name: 'Dinner', nameId: 'Makan Malam', icon: '🍽️', category: 'dining', destinationId: 'dinner-scbd', locationName: 'Social House SCBD', locationNameId: 'Social House SCBD' },
  { type: 'drinks', name: 'Drinks/Bar', nameId: 'Minuman/Bar', icon: '🍸', category: 'social', destinationId: 'drinks-sudirman', locationName: 'Cloud Lounge Sudirman', locationNameId: 'Cloud Lounge Sudirman' },
  { type: 'coffee', name: 'Coffee Meetup', nameId: 'Ngopi', icon: '☕', category: 'social', destinationId: 'coffee-menteng', locationName: 'Tanamera Coffee Menteng', locationNameId: 'Tanamera Coffee Menteng' },
  { type: 'shopping', name: 'Shopping', nameId: 'Belanja', icon: '🛍️', category: 'other', destinationId: 'mall-gi', locationName: 'Grand Indonesia', locationNameId: 'Grand Indonesia' },
  { type: 'movies', name: 'Movies', nameId: 'Bioskop', icon: '🎬', category: 'other', destinationId: 'movies-pi', locationName: 'Pondok Indah Mall XXI', locationNameId: 'Pondok Indah Mall XXI' },
  { type: 'family', name: 'Family Visit', nameId: 'Kunjungan Keluarga', icon: '👨‍👩‍👧', category: 'family', destinationId: 'parents-house', locationName: "Parents' House Menteng", locationNameId: 'Rumah Orang Tua Menteng' },
  { type: 'religious', name: 'Religious', nameId: 'Keagamaan', icon: '🕌', category: 'other', destinationId: 'mosque-istiqlal', locationName: 'Istiqlal Mosque', locationNameId: 'Masjid Istiqlal' },
  { type: 'other', name: 'Other', nameId: 'Lainnya', icon: '📍', category: 'other', destinationId: 'home', locationName: 'Custom Location', locationNameId: 'Lokasi Lainnya' },
];

// ============================================================================
// LOCATION TYPES
// ============================================================================

export type DestinationCategory = 'home' | 'sports' | 'dining' | 'social' | 'family' | 'other';

export interface Destination {
  id: string;
  name: string;
  nameId: string;
  shortAddress: string;
  fullAddress: string;
  coordinates: [number, number]; // [lat, lng]
  icon: string; // Emoji
  category: DestinationCategory;
}

export interface OfficeConfig {
  name: string;
  nameId: string;
  fullAddress: string;
  shortAddress: string;
  coordinates: [number, number];
  companyName: string;
  icon: string;
}

// ============================================================================
// CUSTOM LOCATION TYPE (for user-defined locations via Google Places)
// ============================================================================

export interface CustomLocation {
  id: string;           // Google Place ID
  name: string;         // Place name
  address: string;      // Full address
  coordinates: [number, number]; // [lat, lng]
}

// ============================================================================
// ROUTE DISPLAY DATA (for map polylines)
// ============================================================================

export interface RouteDisplayData {
  encodedPolyline: string;      // Google's encoded polyline string
  decodedPath: [number, number][]; // Decoded lat/lng array
  duration: number;             // Duration in minutes
  distance: number;             // Distance in km
  trafficSegments?: TrafficSegment[];
}

export interface TrafficSegment {
  startIndex: number;
  endIndex: number;
  color: 'green' | 'yellow' | 'red';
  speedKmh: number;
}

// ============================================================================
// WEEKLY ACTIVITY TYPES
// ============================================================================

export interface WeeklyActivity {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  destinationId: string;
  activityName: string;
  activityNameId: string;
  scheduledTime: string; // HH:mm format
  notes?: string;
  notesId?: string;
  customLocation?: CustomLocation; // Optional custom location override
}

export interface DayPlan {
  dayOfWeek: number;
  dayName: string;
  dayNameId: string;
  activity: WeeklyActivity | null;
  destination: Destination | null;
  recommendation: DepartureRecommendation;
  alternativeRecommendations: DepartureRecommendation[];
}

// ============================================================================
// DEPARTURE RECOMMENDATION (Enhanced)
// ============================================================================

export interface DepartureRecommendation {
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // minutes
  floodRisk: SeverityLevel;
  trafficLevel: SeverityLevel;
  score: number; // 0-100
  routeDescription: string;
  routeDescriptionId: string;
  motivationalMessage: string;
  motivationalMessageId: string;
  warnings: RouteWarning[];
  comparison?: TimeComparison;
}

export interface RouteWarning {
  type: 'flood' | 'traffic' | 'construction';
  message: string;
  messageId: string;
  severity: SeverityLevel;
}

export interface TimeComparison {
  leaveNowDuration: number;
  optimalDuration: number;
  timeSaved: number;
}

// ============================================================================
// SCENARIO TYPES
// ============================================================================

export type ScenarioId = 'normal' | 'heavy-rain';

export interface Scenario {
  id: ScenarioId;
  name: string;
  nameId: string;
  icon: string;
  description: string;
  descriptionId: string;
  floodMultiplier: number;
  trafficMultiplier: number;
}

// ============================================================================
// APP STATE
// ============================================================================

export interface LifeAppState {
  selectedScenario: ScenarioId;
  currentDayOfWeek: number;
  showComparison: boolean;
  editingDestination: string | null;
}

// ============================================================================
// DAY NAMES
// ============================================================================

export const dayNames = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
};

export const shortDayNames = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  id: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
};
