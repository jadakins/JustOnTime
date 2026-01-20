import {
  Destination,
  WeeklyActivity,
  DayPlan,
  DepartureRecommendation,
  ScenarioId,
  RouteWarning,
  dayNames,
} from '@/types/life';
import { SeverityLevel, Language } from '@/types';
import {
  officeConfig,
  homeConfig,
  savedDestinations,
  defaultWeeklyPattern,
  scenarios,
  motivationalMessages,
} from '@/config/locations';

// ============================================================================
// LIFE DATA GENERATORS
// Generates weekly plans, recommendations, and route data
// ============================================================================

// Helper to add minutes to a date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

// Helper to set time on a date
function setTime(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

// Get destination by ID
export function getDestinationById(id: string): Destination | null {
  if (id === 'home') return homeConfig;
  return savedDestinations.find(d => d.id === id) || null;
}

// Get all destinations including home
export function getAllDestinations(): Destination[] {
  return [homeConfig, ...savedDestinations];
}

// ============================================================================
// WEEKLY PLAN GENERATOR
// ============================================================================

export function generateWeeklyPlan(
  scenario: ScenarioId = 'normal',
  language: Language = 'id'
): DayPlan[] {
  const today = new Date();
  const plans: DayPlan[] = [];

  // Generate Mon-Fri (days 1-5)
  for (let day = 1; day <= 5; day++) {
    const activity = defaultWeeklyPattern.find(a => a.dayOfWeek === day) || null;
    const destination = activity ? getDestinationById(activity.destinationId) : null;

    // Calculate date for this day
    const dayDate = new Date(today);
    const currentDay = today.getDay();
    const daysUntil = (day - currentDay + 7) % 7 || 7;
    dayDate.setDate(today.getDate() + (day >= currentDay ? day - currentDay : daysUntil));

    // Generate recommendations
    const recommendations = generateDepartureRecommendations(
      activity,
      destination,
      dayDate,
      scenario,
      language
    );

    plans.push({
      dayOfWeek: day,
      dayName: dayNames.en[day],
      dayNameId: dayNames.id[day],
      activity,
      destination,
      recommendation: recommendations[0],
      alternativeRecommendations: recommendations.slice(1),
    });
  }

  return plans;
}

// ============================================================================
// DEPARTURE RECOMMENDATION GENERATOR
// Enhanced with personality and context
// ============================================================================

function generateDepartureRecommendations(
  activity: WeeklyActivity | null,
  destination: Destination | null,
  date: Date,
  scenario: ScenarioId,
  language: Language
): DepartureRecommendation[] {
  const scenarioConfig = scenarios[scenario];
  const recommendations: DepartureRecommendation[] = [];

  // Default to home if no activity
  const targetDest = destination || homeConfig;
  const scheduledTime = activity?.scheduledTime || '18:00';

  // Base travel time from office to destination
  const baseDistance = calculateDistance(officeConfig.coordinates, targetDest.coordinates);
  const baseDuration = Math.round(baseDistance * 3); // ~3 min per km in normal conditions

  // Generate 3 recommendation windows
  const windows = [
    { offset: -45, label: 'early' },
    { offset: -15, label: 'optimal' },
    { offset: 30, label: 'late' },
  ];

  windows.forEach((window, index) => {
    const targetTime = setTime(date, scheduledTime);
    const departureTime = addMinutes(targetTime, window.offset - baseDuration);
    const hour = departureTime.getHours();

    // Calculate conditions based on time and scenario
    const isRushHour = (hour >= 17 && hour <= 19) || (hour >= 7 && hour <= 9);
    const trafficMultiplier = isRushHour ? 1.8 : 1;
    const effectiveDuration = Math.round(baseDuration * trafficMultiplier * scenarioConfig.trafficMultiplier);

    // Determine severity levels
    const trafficLevel: SeverityLevel =
      effectiveDuration > baseDuration * 2 ? 'high' :
      effectiveDuration > baseDuration * 1.3 ? 'medium' : 'low';

    const floodRisk: SeverityLevel =
      scenario === 'heavy-rain' && (hour >= 14 && hour <= 19) ? 'high' :
      scenario === 'heavy-rain' ? 'medium' : 'low';

    // Calculate score
    const trafficScore = trafficLevel === 'low' ? 40 : trafficLevel === 'medium' ? 25 : 10;
    const floodScore = floodRisk === 'low' ? 40 : floodRisk === 'medium' ? 25 : 10;
    const timeScore = window.label === 'optimal' ? 20 : window.label === 'early' ? 15 : 5;
    const score = trafficScore + floodScore + timeScore;

    // Generate warnings
    const warnings: RouteWarning[] = [];
    if (floodRisk !== 'low') {
      warnings.push({
        type: 'flood',
        message: 'Flooding reported on Jl. Sudirman',
        messageId: 'Banjir dilaporkan di Jl. Sudirman',
        severity: floodRisk,
      });
    }
    if (trafficLevel === 'high') {
      warnings.push({
        type: 'traffic',
        message: 'Heavy traffic on main routes',
        messageId: 'Lalu lintas padat di rute utama',
        severity: 'high',
      });
    }

    // Generate motivational message
    const messageCategory = getMessageCategory(activity, targetDest, departureTime.getDay());
    const messages = motivationalMessages[language][messageCategory];
    const motivationalMessage = messages[index % messages.length];

    // Route description
    const routeDesc = floodRisk !== 'low'
      ? 'Via toll road (avoiding flooded areas)'
      : 'Direct route via Jl. Sudirman';
    const routeDescId = floodRisk !== 'low'
      ? 'Via jalan tol (menghindari daerah banjir)'
      : 'Rute langsung via Jl. Sudirman';

    recommendations.push({
      departureTime,
      arrivalTime: addMinutes(departureTime, effectiveDuration),
      duration: effectiveDuration,
      floodRisk,
      trafficLevel,
      score,
      routeDescription: routeDesc,
      routeDescriptionId: routeDescId,
      motivationalMessage,
      motivationalMessageId: motivationalMessages[language === 'en' ? 'id' : 'en'][messageCategory][index % messages.length],
      warnings,
      comparison: {
        leaveNowDuration: Math.round(baseDuration * 2),
        optimalDuration: effectiveDuration,
        timeSaved: Math.round(baseDuration * 2) - effectiveDuration,
      },
    });
  });

  // Sort by score
  return recommendations.sort((a, b) => b.score - a.score);
}

function getMessageCategory(
  activity: WeeklyActivity | null,
  destination: Destination,
  dayOfWeek: number
): keyof typeof motivationalMessages.en {
  if (dayOfWeek === 5) return 'weekendVibes';
  if (destination.category === 'sports') return 'sportsTime';
  return 'optimalTime';
}

// Simple distance calculation (Haversine approximation)
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ============================================================================
// TODAY'S PLAN
// ============================================================================

export function getTodaysPlan(scenario: ScenarioId, language: Language): DayPlan | null {
  const today = new Date().getDay();
  if (today === 0 || today === 6) return null; // Weekend

  const plans = generateWeeklyPlan(scenario, language);
  return plans.find(p => p.dayOfWeek === today) || null;
}

// ============================================================================
// COMPARISON DATA
// ============================================================================

export function generateComparisonData(language: Language) {
  return {
    withoutApp: {
      avgCommute: 65,
      weeklyTimeLost: 12,
      stressLevel: language === 'id' ? 'Tinggi' : 'High',
      missedActivities: 3,
      fuelWasted: '15L',
    },
    withApp: {
      avgCommute: 35,
      weeklyTimeLost: 5,
      stressLevel: language === 'id' ? 'Rendah' : 'Low',
      missedActivities: 0,
      fuelWasted: '8L',
    },
    savings: {
      timePerWeek: 7,
      timePerMonth: 28,
      fuelPerMonth: '28L',
      stressReduction: '60%',
    },
  };
}
