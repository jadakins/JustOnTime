// ============================================================================
// WEATHER IMPACT SERVICE
// Calculate travel time adjustments based on weather conditions
// ============================================================================

import { WeatherData, WeatherCondition } from '@/types';

export interface WeatherImpact {
  multiplier: number;      // Travel time multiplier (e.g., 1.3 = 30% longer)
  severity: 'none' | 'light' | 'moderate' | 'severe';
  description: string;
  descriptionId: string;
  icon: string;
}

// Weather condition to icon mapping
const WEATHER_ICONS: Record<WeatherCondition, string> = {
  'sunny': '☀️',
  'partly-cloudy': '⛅',
  'cloudy': '☁️',
  'light-rain': '🌧️',
  'heavy-rain': '⛈️',
  'thunderstorm': '🌩️',
};

// Weather impact configurations
const WEATHER_IMPACTS: Record<WeatherCondition, WeatherImpact> = {
  'sunny': {
    multiplier: 1.0,
    severity: 'none',
    description: 'Clear weather - normal travel time',
    descriptionId: 'Cuaca cerah - waktu perjalanan normal',
    icon: '☀️',
  },
  'partly-cloudy': {
    multiplier: 1.0,
    severity: 'none',
    description: 'Partly cloudy - normal travel time',
    descriptionId: 'Berawan sebagian - waktu perjalanan normal',
    icon: '⛅',
  },
  'cloudy': {
    multiplier: 1.05,
    severity: 'light',
    description: 'Cloudy - slightly reduced visibility',
    descriptionId: 'Berawan - visibilitas sedikit berkurang',
    icon: '☁️',
  },
  'light-rain': {
    multiplier: 1.15,
    severity: 'light',
    description: 'Light rain - expect 10-15% longer travel',
    descriptionId: 'Hujan ringan - perkiraan waktu 10-15% lebih lama',
    icon: '🌧️',
  },
  'heavy-rain': {
    multiplier: 1.35,
    severity: 'moderate',
    description: 'Heavy rain - expect 25-40% longer travel, possible flooding',
    descriptionId: 'Hujan lebat - perkiraan 25-40% lebih lama, kemungkinan banjir',
    icon: '⛈️',
  },
  'thunderstorm': {
    multiplier: 1.5,
    severity: 'severe',
    description: 'Thunderstorm - expect 40-60% longer travel, avoid if possible',
    descriptionId: 'Badai petir - perkiraan 40-60% lebih lama, hindari jika memungkinkan',
    icon: '🌩️',
  },
};

/**
 * Get weather impact data for a given weather condition
 */
export function getWeatherImpact(condition: WeatherCondition): WeatherImpact {
  return WEATHER_IMPACTS[condition] || WEATHER_IMPACTS['sunny'];
}

/**
 * Get weather icon for a condition
 */
export function getWeatherIcon(condition: WeatherCondition): string {
  return WEATHER_ICONS[condition] || '☀️';
}

/**
 * Check if condition is rainy
 */
export function isRainyCondition(condition: WeatherCondition): boolean {
  return ['light-rain', 'heavy-rain', 'thunderstorm'].includes(condition);
}

/**
 * Calculate adjusted travel time based on weather
 */
export function calculateAdjustedDuration(
  baseDuration: number,
  condition: WeatherCondition
): number {
  const impact = getWeatherImpact(condition);
  return Math.round(baseDuration * impact.multiplier);
}

/**
 * Get weather-adjusted departure recommendation
 */
export function getWeatherAdjustedRecommendation(
  baseDuration: number,
  targetArrivalTime: string,
  weather: WeatherData
): {
  departureTime: string;
  adjustedDuration: number;
  impact: WeatherImpact;
} {
  const impact = getWeatherImpact(weather.condition);
  const adjustedDuration = calculateAdjustedDuration(baseDuration, weather.condition);

  // Parse target arrival time
  const [hours, mins] = targetArrivalTime.split(':').map(Number);
  const arrivalMinutes = hours * 60 + mins;

  // Calculate departure time
  const departureMinutes = arrivalMinutes - adjustedDuration;
  const depHours = Math.floor(departureMinutes / 60);
  const depMins = departureMinutes % 60;

  return {
    departureTime: `${depHours.toString().padStart(2, '0')}:${depMins.toString().padStart(2, '0')}`,
    adjustedDuration,
    impact,
  };
}

/**
 * Format weather impact for display
 */
export function formatWeatherImpactBadge(
  condition: WeatherCondition,
  language: 'en' | 'id'
): { text: string; color: string } | null {
  const impact = getWeatherImpact(condition);

  if (impact.severity === 'none') return null;

  const colors = {
    light: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    moderate: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    severe: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  const texts = {
    light: { en: 'Light Rain Impact', id: 'Dampak Hujan Ringan' },
    moderate: { en: 'Weather Delay', id: 'Penundaan Cuaca' },
    severe: { en: 'Severe Weather', id: 'Cuaca Buruk' },
  };

  return {
    text: texts[impact.severity][language],
    color: colors[impact.severity],
  };
}

/**
 * Get percentage increase text
 */
export function getWeatherDelayText(
  condition: WeatherCondition,
  language: 'en' | 'id'
): string | null {
  const impact = getWeatherImpact(condition);

  if (impact.multiplier <= 1.0) return null;

  const percentage = Math.round((impact.multiplier - 1) * 100);

  return language === 'id'
    ? `+${percentage}% waktu karena cuaca`
    : `+${percentage}% travel time due to weather`;
}
