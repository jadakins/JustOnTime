'use client';

import { useMemo } from 'react';
import { Language, WeatherData } from '@/types';
import { DayPlan } from '@/types/life';
import { getWeatherImpact, getWeatherIcon, formatWeatherImpactBadge, getWeatherDelayText } from '@/services/weatherImpact';

// ============================================================================
// SMART RECOMMENDATION CARD
// Hero component showing departure time, arrival, weather impact, and route
// ============================================================================

interface SmartRecommendationCardProps {
  todayPlan: DayPlan | null;
  language: Language;
  weatherData: WeatherData | null;
  routeDuration?: number; // Real route duration from Google Maps
  onOpenInMaps?: () => void;
}

export default function SmartRecommendationCard({
  todayPlan,
  language,
  weatherData,
  routeDuration,
  onOpenInMaps,
}: SmartRecommendationCardProps) {
  // Weather calculations
  const weatherImpact = useMemo(() => {
    if (!weatherData) return { multiplier: 1.0, severity: 'none' as const };
    return getWeatherImpact(weatherData.condition);
  }, [weatherData]);

  const weatherIcon = weatherData ? getWeatherIcon(weatherData.condition) : '☀️';
  const weatherBadge = weatherData ? formatWeatherImpactBadge(weatherData.condition, language) : null;
  const weatherDelayText = weatherData ? getWeatherDelayText(weatherData.condition, language) : null;

  // Calculate optimal departure
  const recommendation = useMemo(() => {
    if (!todayPlan) return null;

    const { activity, destination, recommendation: baseRec } = todayPlan;
    const baseDuration = routeDuration || baseRec?.duration || 35;

    // Apply weather multiplier
    const adjustedDuration = Math.round(baseDuration * weatherImpact.multiplier);

    // Parse target time
    const targetTime = activity?.scheduledTime || '18:00';
    const [targetHours, targetMins] = targetTime.split(':').map(Number);
    const targetMinutes = targetHours * 60 + targetMins;

    // Calculate departure time
    const departureMinutes = targetMinutes - adjustedDuration;
    const depHours = Math.floor(departureMinutes / 60);
    const depMins = departureMinutes % 60;
    const departureTime = `${depHours.toString().padStart(2, '0')}:${depMins.toString().padStart(2, '0')}`;

    // Calculate arrival time
    const arrivalMinutes = departureMinutes + adjustedDuration;
    const arrHours = Math.floor(arrivalMinutes / 60);
    const arrMins = arrivalMinutes % 60;
    const arrivalTime = `${arrHours.toString().padStart(2, '0')}:${arrMins.toString().padStart(2, '0')}`;

    return {
      departureTime,
      arrivalTime,
      duration: adjustedDuration,
      baseDuration,
      destinationName: language === 'id' ? destination?.nameId : destination?.name,
      destinationAddress: destination?.shortAddress,
      icon: destination?.icon || '🏠',
      routeDescription: language === 'id' ? baseRec?.routeDescriptionId : baseRec?.routeDescription,
    };
  }, [todayPlan, weatherImpact.multiplier, routeDuration, language]);

  // No activity today
  if (!todayPlan || !recommendation) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <span className="text-5xl mb-4 block">🎉</span>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {language === 'id' ? 'Selamat Akhir Pekan!' : 'Happy Weekend!'}
          </h3>
          <p className="text-slate-500">
            {language === 'id' ? 'Nikmati waktu istirahat Anda' : 'Enjoy your time off'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Main recommendation */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl sm:text-2xl flex-shrink-0">✨</span>
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {language === 'id' ? 'Rekomendasi Keberangkatan' : 'Departure Recommendation'}
            </h3>
          </div>
          {weatherBadge && (
            <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${weatherBadge.color}`}>
              <span className="hidden sm:inline">{weatherIcon} {weatherBadge.text}</span>
              <span className="sm:hidden">{weatherIcon}</span>
            </div>
          )}
        </div>

        {/* Departure → Arrival flow */}
        {/* Mobile: Vertical stack */}
        <div className="flex flex-col items-center gap-3 sm:hidden">
          {/* Departure */}
          <div className="text-center">
            <p className="text-xs opacity-80 mb-1">{language === 'id' ? 'Berangkat' : 'Leave'}</p>
            <p className="text-2xl font-bold">{recommendation.departureTime}</p>
          </div>

          {/* Duration indicator - vertical line */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-0.5 h-4 bg-white/40" />
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="text-sm">🚗</span>
              <span className="font-bold text-base">{recommendation.duration}</span>
              <span className="text-xs opacity-80">{language === 'id' ? 'mnt' : 'min'}</span>
            </div>
            <div className="w-0.5 h-4 bg-white/40" />
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-xs opacity-80 mb-1">{language === 'id' ? 'Tiba' : 'Arrive'}</p>
            <p className="text-2xl font-bold">{recommendation.arrivalTime}</p>
          </div>
        </div>

        {/* Desktop: Horizontal flow */}
        <div className="hidden sm:flex items-center justify-between gap-2 min-w-0">
          {/* Departure */}
          <div className="text-center flex-1">
            <p className="text-sm opacity-80 mb-1">{language === 'id' ? 'Berangkat' : 'Leave'}</p>
            <p className="text-3xl md:text-4xl font-bold">{recommendation.departureTime}</p>
          </div>

          {/* Duration indicator - horizontal */}
          <div className="flex flex-col items-center px-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 w-full min-w-0">
              <div className="h-0.5 flex-1 bg-white/40 min-w-[20px]" />
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 flex-shrink-0">
                <span className="text-base">🚗</span>
                <span className="font-bold text-base">{recommendation.duration}</span>
                <span className="text-sm opacity-80">{language === 'id' ? 'mnt' : 'min'}</span>
              </div>
              <div className="h-0.5 flex-1 bg-white/40 min-w-[20px]" />
            </div>
            {weatherDelayText && (
              <p className="text-xs opacity-80 mt-1 text-center truncate max-w-full">{weatherDelayText}</p>
            )}
          </div>

          {/* Arrival */}
          <div className="text-center flex-1">
            <p className="text-sm opacity-80 mb-1">{language === 'id' ? 'Tiba' : 'Arrive'}</p>
            <p className="text-3xl md:text-4xl font-bold">{recommendation.arrivalTime}</p>
          </div>
        </div>
      </div>

      {/* Destination details */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl sm:text-3xl">{recommendation.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white truncate">
              {recommendation.destinationName}
            </h4>
            <p className="text-sm text-slate-500 mb-2 truncate">
              {recommendation.destinationAddress}
            </p>
            {recommendation.routeDescription && (
              <p className="text-sm text-slate-600 dark:text-slate-400 break-words">
                <span className="font-medium">
                  {language === 'id' ? 'Rute: ' : 'Route: '}
                </span>
                {recommendation.routeDescription}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 sm:mt-6 flex gap-3">
          {onOpenInMaps && (
            <button
              onClick={onOpenInMaps}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 min-w-0"
            >
              <span className="flex-shrink-0">🗺️</span>
              <span className="truncate text-sm sm:text-base">{language === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
