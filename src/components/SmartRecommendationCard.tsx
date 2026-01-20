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
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h3 className="font-semibold">
              {language === 'id' ? 'Rekomendasi Keberangkatan' : 'Departure Recommendation'}
            </h3>
          </div>
          {weatherBadge && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${weatherBadge.color}`}>
              {weatherIcon} {weatherBadge.text}
            </div>
          )}
        </div>

        {/* Departure → Arrival flow */}
        <div className="flex items-center justify-between">
          {/* Departure */}
          <div className="text-center">
            <p className="text-sm opacity-80 mb-1">
              {language === 'id' ? 'Berangkat' : 'Leave'}
            </p>
            <p className="text-4xl font-bold">{recommendation.departureTime}</p>
          </div>

          {/* Duration indicator */}
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="flex items-center gap-2 w-full">
              <div className="h-0.5 flex-1 bg-white/40" />
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                <span>🚗</span>
                <span className="font-bold">{recommendation.duration}</span>
                <span className="text-sm opacity-80">{language === 'id' ? 'mnt' : 'min'}</span>
              </div>
              <div className="h-0.5 flex-1 bg-white/40" />
            </div>
            {weatherDelayText && (
              <p className="text-xs opacity-80 mt-1">{weatherDelayText}</p>
            )}
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-sm opacity-80 mb-1">
              {language === 'id' ? 'Tiba' : 'Arrive'}
            </p>
            <p className="text-4xl font-bold">{recommendation.arrivalTime}</p>
          </div>
        </div>
      </div>

      {/* Destination details */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">{recommendation.icon}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg text-slate-800 dark:text-white">
              {recommendation.destinationName}
            </h4>
            <p className="text-sm text-slate-500 mb-2">
              {recommendation.destinationAddress}
            </p>
            {recommendation.routeDescription && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">
                  {language === 'id' ? 'Rute: ' : 'Route: '}
                </span>
                {recommendation.routeDescription}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {onOpenInMaps && (
            <button
              onClick={onOpenInMaps}
              className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>🗺️</span>
              <span>{language === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
