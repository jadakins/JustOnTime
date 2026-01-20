import { WeatherData, WeatherCondition, WeatherForecast } from '@/types';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const JAKARTA_COORDS = '-6.2088,106.8456'; // Jakarta city center

interface WeatherApiCurrent {
  temp_c: number;
  humidity: number;
  wind_kph: number;
  precip_mm: number;
  condition: {
    text: string;
    code: number;
  };
}

interface WeatherApiForecastHour {
  time: string;
  temp_c: number;
  condition: {
    text: string;
    code: number;
  };
  chance_of_rain: number;
  precip_mm: number;
}

interface WeatherApiForecastDay {
  hour: WeatherApiForecastHour[];
}

interface WeatherApiResponse {
  current: WeatherApiCurrent;
  forecast: {
    forecastday: WeatherApiForecastDay[];
  };
}

// Map WeatherAPI condition codes to our condition types
function mapCondition(code: number, text: string): WeatherCondition {
  // WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
  // Thunderstorm codes
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
    return 'thunderstorm';
  }
  // Heavy rain codes
  if ([1192, 1195, 1243, 1246, 1252].includes(code)) {
    return 'heavy-rain';
  }
  // Light rain / drizzle codes
  if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1198, 1201, 1240].includes(code)) {
    return 'light-rain';
  }
  // Cloudy codes
  if ([1006, 1009].includes(code)) {
    return 'cloudy';
  }
  // Partly cloudy
  if ([1003].includes(code)) {
    return 'partly-cloudy';
  }
  // Sunny/Clear
  if ([1000].includes(code)) {
    return 'sunny';
  }
  // Default based on text content
  const lowerText = text.toLowerCase();
  if (lowerText.includes('thunder')) return 'thunderstorm';
  if (lowerText.includes('heavy') && lowerText.includes('rain')) return 'heavy-rain';
  if (lowerText.includes('rain') || lowerText.includes('drizzle')) return 'light-rain';
  if (lowerText.includes('cloud') || lowerText.includes('overcast')) return 'cloudy';
  if (lowerText.includes('partly')) return 'partly-cloudy';
  return 'sunny';
}

export async function fetchWeatherData(): Promise<WeatherData> {
  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_key_here') {
    throw new Error('Weather API key not configured');
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${JAKARTA_COORDS}&days=2&aqi=no&alerts=no`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data: WeatherApiResponse = await response.json();
  const now = new Date();

  // Build 12-hour forecast from the API response
  const forecast: WeatherForecast[] = [];
  const currentHour = now.getHours();

  // Get all forecast hours from today and tomorrow
  const allHours: WeatherApiForecastHour[] = [];
  data.forecast.forecastday.forEach(day => {
    allHours.push(...day.hour);
  });

  // Find hours starting from now + 1 hour
  let hoursAdded = 0;
  for (const hourData of allHours) {
    const hourTime = new Date(hourData.time);
    if (hourTime > now && hoursAdded < 12) {
      forecast.push({
        time: hourTime,
        condition: mapCondition(hourData.condition.code, hourData.condition.text),
        temperature: hourData.temp_c,
        rainProbability: hourData.chance_of_rain,
        rainfall: hourData.precip_mm,
      });
      hoursAdded++;
    }
  }

  return {
    temperature: data.current.temp_c,
    humidity: data.current.humidity,
    condition: mapCondition(data.current.condition.code, data.current.condition.text),
    rainfall: data.current.precip_mm,
    windSpeed: data.current.wind_kph,
    forecast,
    lastUpdated: now,
  };
}

// Fetch historical weather data for a specific date
export async function fetchHistoricalWeather(date: Date): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    throw new Error('Weather API key not configured');
  }

  const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const url = `https://api.weatherapi.com/v1/history.json?key=${WEATHER_API_KEY}&q=${JAKARTA_COORDS}&dt=${dateStr}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  const dayData = data.forecast.forecastday[0];
  const avgHour = dayData.hour[12]; // Use noon as representative

  const forecast: WeatherForecast[] = dayData.hour.slice(0, 12).map((hour: WeatherApiForecastHour) => ({
    time: new Date(hour.time),
    condition: mapCondition(hour.condition.code, hour.condition.text),
    temperature: hour.temp_c,
    rainProbability: hour.chance_of_rain,
    rainfall: hour.precip_mm,
  }));

  return {
    temperature: avgHour.temp_c,
    humidity: avgHour.humidity || 80,
    condition: mapCondition(avgHour.condition.code, avgHour.condition.text),
    rainfall: avgHour.precip_mm,
    windSpeed: avgHour.wind_kph || 10,
    forecast,
    lastUpdated: date,
  };
}
