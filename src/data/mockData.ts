import { FloodData, TrafficData, WeatherData, RouteData, SeverityLevel, WeatherCondition } from '@/types';
import { jakartaRegions } from './regions';

// ============================================================================
// MOCK DATA GENERATORS
// These functions generate realistic demo data for Jakarta conditions
// Replace these with real API calls when integrating with live data sources
// ============================================================================

// Current time for simulations
const now = new Date();

// Helper to add hours to a date
function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

// Helper to add minutes to a date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

// ============================================================================
// FLOOD DATA
// Simulates realistic flood conditions based on Jakarta's flood patterns
// ============================================================================

// Predefined flood scenarios - rotate based on time to simulate changes
const floodScenarios: Record<string, { level: SeverityLevel; waterLevel: number }> = {
  'jakarta-utara': { level: 'high', waterLevel: 85 },      // North Jakarta - most flood-prone
  'jakarta-barat': { level: 'medium', waterLevel: 45 },    // West Jakarta - moderate risk
  'jakarta-pusat': { level: 'low', waterLevel: 15 },       // Central - better drainage
  'jakarta-selatan': { level: 'medium', waterLevel: 35 },  // South - moderate due to rivers
  'jakarta-timur': { level: 'low', waterLevel: 20 },       // East - relatively safer
  'bekasi': { level: 'medium', waterLevel: 40 },           // Bekasi - moderate risk
  'tangerang': { level: 'low', waterLevel: 10 },           // Tangerang - relatively safer
  'depok': { level: 'low', waterLevel: 25 },               // Depok - moderate elevation
};

export function generateFloodData(): FloodData[] {
  return jakartaRegions.map(region => {
    const scenario = floodScenarios[region.id] || { level: 'low', waterLevel: 10 };

    // Generate prediction based on current level
    const prediction = generateFloodPrediction(scenario.level);

    return {
      regionId: region.id,
      level: scenario.level,
      waterLevel: scenario.waterLevel,
      prediction,
      lastUpdated: now,
      affectedAreas: scenario.level === 'low'
        ? []
        : region.floodZones.slice(0, scenario.level === 'high' ? 3 : 1),
    };
  });
}

function generateFloodPrediction(currentLevel: SeverityLevel) {
  // Simulate flood progression - tends to worsen then improve
  const levelProgression: Record<SeverityLevel, SeverityLevel[]> = {
    'low': ['low', 'low', 'low'],
    'medium': ['medium', 'high', 'medium'],
    'high': ['high', 'high', 'medium'],
  };

  const progression = levelProgression[currentLevel];

  return {
    nextHour: progression[0],
    next3Hours: progression[1],
    next6Hours: progression[2],
    peakTime: currentLevel !== 'low' ? addHours(now, 2) : undefined,
    peakLevel: currentLevel !== 'low' ? 'high' as SeverityLevel : undefined,
  };
}

// ============================================================================
// TRAFFIC DATA
// Simulates realistic Jakarta traffic conditions
// ============================================================================

const trafficScenarios: Record<string, { level: SeverityLevel; avgSpeed: number; delay: number }> = {
  'jakarta-utara': { level: 'high', avgSpeed: 12, delay: 45 },
  'jakarta-barat': { level: 'medium', avgSpeed: 25, delay: 20 },
  'jakarta-pusat': { level: 'high', avgSpeed: 15, delay: 35 },
  'jakarta-selatan': { level: 'medium', avgSpeed: 22, delay: 25 },
  'jakarta-timur': { level: 'medium', avgSpeed: 28, delay: 15 },
  'bekasi': { level: 'high', avgSpeed: 18, delay: 40 },
  'tangerang': { level: 'medium', avgSpeed: 30, delay: 20 },
  'depok': { level: 'low', avgSpeed: 35, delay: 10 },
};

export function generateTrafficData(): TrafficData[] {
  return jakartaRegions.map(region => {
    const scenario = trafficScenarios[region.id] || { level: 'medium', avgSpeed: 25, delay: 20 };

    return {
      regionId: region.id,
      level: scenario.level,
      averageSpeed: scenario.avgSpeed,
      congestionPoints: getCongestionPoints(region.id),
      estimatedDelay: scenario.delay,
      lastUpdated: now,
    };
  });
}

function getCongestionPoints(regionId: string): string[] {
  const congestionMap: Record<string, string[]> = {
    'jakarta-pusat': ['Jl. Sudirman', 'Jl. Thamrin', 'Bundaran HI'],
    'jakarta-utara': ['Jl. Pluit', 'Tol Bandara', 'Pelabuhan Priok'],
    'jakarta-barat': ['Jl. S. Parman', 'Tol Jakarta-Tangerang', 'Kebon Jeruk'],
    'jakarta-selatan': ['Jl. TB Simatupang', 'Pondok Indah', 'Fatmawati'],
    'jakarta-timur': ['Jl. Bekasi Raya', 'Kalimalang', 'Cawang'],
    'bekasi': ['Tol Jakarta-Cikampek', 'Jl. Ahmad Yani', 'Summarecon'],
    'tangerang': ['Tol Jakarta-Merak', 'BSD', 'Alam Sutera'],
    'depok': ['Jl. Margonda', 'UI', 'Depok Lama'],
  };

  return congestionMap[regionId] || [];
}

// ============================================================================
// WEATHER DATA
// Simulates Jakarta tropical weather conditions
// ============================================================================

export function generateWeatherData(): WeatherData {
  // Simulate rainy season conditions (realistic for Jakarta)
  const conditions: WeatherCondition[] = ['heavy-rain', 'light-rain', 'cloudy', 'partly-cloudy'];
  const currentCondition = conditions[Math.floor(Date.now() / 3600000) % conditions.length];

  const forecast: WeatherData['forecast'] = [];

  // Generate 12-hour forecast
  for (let i = 1; i <= 12; i++) {
    const forecastCondition = conditions[(Math.floor(Date.now() / 3600000) + i) % conditions.length];
    forecast.push({
      time: addHours(now, i),
      condition: forecastCondition,
      temperature: 28 + Math.sin(i / 3) * 4, // Varies between 24-32
      rainProbability: forecastCondition.includes('rain') ? 70 + Math.random() * 25 : 20 + Math.random() * 30,
      rainfall: forecastCondition === 'heavy-rain' ? 15 + Math.random() * 20 :
                forecastCondition === 'light-rain' ? 5 + Math.random() * 10 : 0,
    });
  }

  return {
    temperature: 29,
    humidity: 85,
    condition: currentCondition,
    rainfall: currentCondition === 'heavy-rain' ? 25 : currentCondition === 'light-rain' ? 8 : 0,
    windSpeed: 12,
    forecast,
    lastUpdated: now,
  };
}

// ============================================================================
// ROUTE DATA
// Simulates route calculations between regions
// ============================================================================

export function generateRouteData(fromRegion: string, toRegion: string): RouteData {
  // Simplified distance/duration matrix (in reality, use Google Maps API)
  const baseDistance = 15; // Base 15km
  const baseDuration = 30; // Base 30 minutes

  // COMMENTED OUT: Adjust based on traffic and flood conditions
  // const floodData = generateFloodData();
  // const trafficData = generateTrafficData();

  // Placeholder for commented out mock data
  const floodData: FloodData[] = [];
  const trafficData: TrafficData[] = [];

  const fromFlood = floodData.find(f => f.regionId === fromRegion);
  const toFlood = floodData.find(f => f.regionId === toRegion);
  const fromTraffic = trafficData.find(t => t.regionId === fromRegion);
  const toTraffic = trafficData.find(t => t.regionId === toRegion);

  const floodAffected = fromFlood?.level === 'high' || toFlood?.level === 'high';
  const trafficMultiplier =
    (fromTraffic?.level === 'high' || toTraffic?.level === 'high') ? 2.5 :
    (fromTraffic?.level === 'medium' || toTraffic?.level === 'medium') ? 1.5 : 1;

  const currentDuration = Math.round(baseDuration * trafficMultiplier * (floodAffected ? 1.5 : 1));

  return {
    from: fromRegion,
    to: toRegion,
    distance: baseDistance,
    normalDuration: baseDuration,
    currentDuration,
    floodAffected,
    alternateRoutes: [
      {
        name: 'Via Toll Road',
        duration: Math.round(currentDuration * 0.8),
        floodRisk: 'low',
        trafficLevel: 'medium',
      },
      {
        name: 'Via Inner Ring',
        duration: Math.round(currentDuration * 1.1),
        floodRisk: floodAffected ? 'medium' : 'low',
        trafficLevel: 'low',
      },
    ],
  };
}

// ============================================================================
// DEPARTURE RECOMMENDATIONS
// Calculates optimal departure times
// ============================================================================

export function generateDepartureRecommendations(
  earliestTime: Date,
  fromRegion: string,
  toRegion: string,
  count: number = 5
) {
  const recommendations = [];
  // COMMENTED OUT: Mock data generators - using real APIs instead
  // const floodData = generateFloodData();
  // const trafficData = generateTrafficData();

  for (let i = 0; i < count; i++) {
    const departureTime = addMinutes(earliestTime, i * 30);
    const hour = departureTime.getHours();

    // Simulate traffic patterns (worse during rush hours)
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const trafficLevel: SeverityLevel = isRushHour ? 'high' : (hour >= 10 && hour <= 16) ? 'low' : 'medium';

    // Flood risk varies (tends to be worse in afternoon during rainy season)
    const floodRisk: SeverityLevel = (hour >= 14 && hour <= 18) ? 'high' :
                                     (hour >= 12 && hour <= 20) ? 'medium' : 'low';

    // Calculate score (higher is better)
    const trafficScore = trafficLevel === 'low' ? 40 : trafficLevel === 'medium' ? 25 : 10;
    const floodScore = floodRisk === 'low' ? 40 : floodRisk === 'medium' ? 25 : 10;
    const timeScore = i === 0 ? 20 : Math.max(0, 20 - i * 4); // Prefer earlier times
    const score = trafficScore + floodScore + timeScore;

    const baseDuration = 45;
    const trafficMultiplier = trafficLevel === 'high' ? 2 : trafficLevel === 'medium' ? 1.4 : 1;
    const duration = Math.round(baseDuration * trafficMultiplier);

    recommendations.push({
      recommendedTime: departureTime,
      arrivalTime: addMinutes(departureTime, duration),
      duration,
      floodRisk,
      trafficLevel,
      score,
      reasoning: generateReasoning(trafficLevel, floodRisk, hour),
      reasoningId: generateReasoningId(trafficLevel, floodRisk, hour),
    });
  }

  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score);
}

function generateReasoning(traffic: SeverityLevel, flood: SeverityLevel, hour: number): string {
  if (traffic === 'low' && flood === 'low') {
    return 'Optimal conditions - light traffic and low flood risk';
  }
  if (traffic === 'high') {
    return `Rush hour traffic expected (${hour}:00). Consider alternate routes.`;
  }
  if (flood === 'high') {
    return 'High flood risk during this time. Monitor conditions closely.';
  }
  return 'Moderate conditions - some delays possible';
}

function generateReasoningId(traffic: SeverityLevel, flood: SeverityLevel, hour: number): string {
  if (traffic === 'low' && flood === 'low') {
    return 'Kondisi optimal - lalu lintas lancar dan risiko banjir rendah';
  }
  if (traffic === 'high') {
    return `Lalu lintas jam sibuk diperkirakan (${hour}:00). Pertimbangkan rute alternatif.`;
  }
  if (flood === 'high') {
    return 'Risiko banjir tinggi pada waktu ini. Pantau kondisi dengan cermat.';
  }
  return 'Kondisi sedang - kemungkinan ada penundaan';
}
