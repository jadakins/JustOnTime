'use client';

import { WeatherData, WeatherCondition, Language } from '@/types';
import { useTranslations } from '@/i18n/translations';
import { format } from 'date-fns';

// ============================================================================
// WEATHER PANEL
// Displays current weather and hourly forecast with rain probability
// Crucial for flood prediction awareness
// ============================================================================

interface WeatherPanelProps {
  weather: WeatherData;
  language: Language;
}

export default function WeatherPanel({ weather, language }: WeatherPanelProps) {
  const { t } = useTranslations(language);

  const getWeatherIcon = (condition: WeatherCondition) => {
    switch (condition) {
      case 'sunny':
        return (
          <svg className="w-16 h-16 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        );
      case 'partly-cloudy':
        return (
          <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            <circle cx="17" cy="7" r="3" fill="currentColor" className="text-yellow-500" />
          </svg>
        );
      case 'cloudy':
        return (
          <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          </svg>
        );
      case 'light-rain':
        return (
          <svg className="w-16 h-16 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 19v2M12 19v2M16 19v2" />
          </svg>
        );
      case 'heavy-rain':
        return (
          <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 19v3M10 19v3M14 19v3M18 19v3" />
          </svg>
        );
      case 'thunderstorm':
        return (
          <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 11l-2 4h3l-2 4" fill="currentColor" className="text-yellow-500" />
          </svg>
        );
    }
  };

  const getConditionText = (condition: WeatherCondition): string => {
    return t(condition);
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            {t('weatherForecast')}
          </h2>
        </div>
      </div>

      <div className="card-body flex-1">
        {/* Current weather */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="text-4xl font-bold text-slate-800 dark:text-white">
                {Math.round(weather.temperature)}°C
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                {getConditionText(weather.condition)}
              </div>
            </div>
          </div>

          {/* Current stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-center">
              <div className="text-sky-600 font-semibold">{weather.humidity}%</div>
              <div className="text-xs text-slate-500">{t('humidity')}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-center">
              <div className="text-blue-600 font-semibold">{weather.rainfall} {t('mm')}</div>
              <div className="text-xs text-slate-500">{t('rainfall')}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-center col-span-2">
              <div className="text-slate-600 font-semibold">{weather.windSpeed} {t('kmh')}</div>
              <div className="text-xs text-slate-500">{t('windSpeed')}</div>
            </div>
          </div>
        </div>

        {/* Hourly forecast */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            {t('hourlyForecast')}
          </h3>
          <div className="flex overflow-x-auto pb-2 space-x-3 -mx-4 px-4">
            {weather.forecast.slice(0, 8).map((hour, index) => (
              <ForecastHour key={index} forecast={hour} language={language} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FORECAST HOUR - Individual hour in the forecast
// ============================================================================

interface ForecastHourProps {
  forecast: {
    time: Date;
    condition: WeatherCondition;
    temperature: number;
    rainProbability: number;
    rainfall: number;
  };
  language: Language;
}

function ForecastHour({ forecast, language }: ForecastHourProps) {
  const { t } = useTranslations(language);

  const getSmallIcon = (condition: WeatherCondition) => {
    const iconClass = "w-6 h-6";
    switch (condition) {
      case 'sunny':
        return <span className={iconClass}>☀️</span>;
      case 'partly-cloudy':
        return <span className={iconClass}>⛅</span>;
      case 'cloudy':
        return <span className={iconClass}>☁️</span>;
      case 'light-rain':
        return <span className={iconClass}>🌧️</span>;
      case 'heavy-rain':
        return <span className={iconClass}>⛈️</span>;
      case 'thunderstorm':
        return <span className={iconClass}>🌩️</span>;
    }
  };

  const getRainColor = (probability: number) => {
    if (probability >= 70) return 'bg-red-500';
    if (probability >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex-shrink-0 w-16 bg-slate-50 dark:bg-slate-700 rounded-lg p-2 text-center">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {format(forecast.time, 'HH:mm')}
      </div>
      <div className="my-1 text-2xl">
        {getSmallIcon(forecast.condition)}
      </div>
      <div className="text-sm font-semibold text-slate-800 dark:text-white">
        {Math.round(forecast.temperature)}°
      </div>
      {/* Rain probability bar */}
      <div className="mt-1">
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
          <div
            className={`h-full ${getRainColor(forecast.rainProbability)}`}
            style={{ width: `${forecast.rainProbability}%` }}
          />
        </div>
        <div className="text-xs text-sky-600 mt-0.5">{Math.round(forecast.rainProbability)}%</div>
      </div>
    </div>
  );
}
