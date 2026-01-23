'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { DayPlan, RouteDisplayData } from '@/types/life';
import { Language, WeatherData } from '@/types';
import TimeSlider, { TimeComparisonCards } from './TimeSlider';
import { getWeatherImpact, isRainyCondition, getWeatherIcon, formatWeatherImpactBadge } from '@/services/weatherImpact';

// ============================================================================
// TODAY VIEW - HERO COMPONENT WITH INTERACTIVE TIME SLIDER
// The main feature: "When should I leave the office today?"
// ============================================================================

interface TodayViewProps {
  todayPlan: DayPlan | null;
  language: Language;
  weatherData: WeatherData | null;
  onRerouteHome: (dayOfWeek: number) => void; // Changed to switch activity to home
  routeData?: RouteDisplayData | null; // Real route duration from Google Maps API
}

// Calculate arrival status based on scheduled vs estimated arrival time
function getArrivalStatus(
  arrivalTime: string,
  scheduledTime: string,
  language: Language
): { status: 'early' | 'on-time' | 'late' | 'very-late'; message: string; color: string; icon: string } {
  const [arrHours, arrMins] = arrivalTime.split(':').map(Number);
  const [schedHours, schedMins] = scheduledTime.split(':').map(Number);

  const arrivalMinutes = arrHours * 60 + arrMins;
  const scheduledMinutes = schedHours * 60 + schedMins;
  const difference = scheduledMinutes - arrivalMinutes; // Positive = early, negative = late

  if (difference >= 15) {
    return {
      status: 'early',
      message: language === 'id'
        ? `Tiba ${difference} menit lebih awal - sempat santai!`
        : `Arriving ${difference} min early - time to relax!`,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      icon: '😎',
    };
  } else if (difference >= 0) {
    return {
      status: 'on-time',
      message: language === 'id'
        ? 'Tepat waktu - bagus!'
        : 'Right on time - perfect!',
      color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
      icon: '👍',
    };
  } else if (difference >= -15) {
    return {
      status: 'late',
      message: language === 'id'
        ? `Terlambat ${Math.abs(difference)} menit - berangkat lebih awal!`
        : `${Math.abs(difference)} min late - leave earlier!`,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      icon: '⚠️',
    };
  } else {
    return {
      status: 'very-late',
      message: language === 'id'
        ? `Sangat terlambat ${Math.abs(difference)} menit - segera berangkat!`
        : `Very late by ${Math.abs(difference)} min - leave now!`,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      icon: '🚨',
    };
  }
}

export default function TodayView({
  todayPlan,
  language,
  weatherData,
  onRerouteHome,
  routeData,
}: TodayViewProps) {
  // Extract values from todayPlan (may be null)
  const activity = todayPlan?.activity;
  const destination = todayPlan?.destination;
  const rec = todayPlan?.recommendation;
  const scheduledTime = activity?.scheduledTime || '18:00';

  // Parse scheduled time to calculate dynamic time ranges
  const [schedHours, schedMins] = scheduledTime.split(':').map(Number);
  const scheduledMinutes = schedHours * 60 + schedMins;
  // Use actual Google Maps duration if available, otherwise fall back to recommendation or default
  const baseDuration = routeData?.duration || rec?.duration || 35;

  // Calculate optimal departure time (scheduled time - base duration - buffer)
  const optimalDepartureMinutes = scheduledMinutes - baseDuration - 15; // 15 min buffer
  const optimalDepartureTime = `${Math.floor(optimalDepartureMinutes / 60).toString().padStart(2, '0')}:${(optimalDepartureMinutes % 60).toString().padStart(2, '0')}`;

  // User's selected departure time - default to optimal time
  const [selectedTime, setSelectedTime] = useState(optimalDepartureTime);

  // Update selected time when activity changes
  useEffect(() => {
    setSelectedTime(optimalDepartureTime);
  }, [optimalDepartureTime]);

  // Get weather impact - must be called before any early returns
  const weatherImpact = useMemo(() => {
    if (!weatherData) return { multiplier: 1.0 };
    return getWeatherImpact(weatherData.condition);
  }, [weatherData]);

  const isRainy = weatherData ? isRainyCondition(weatherData.condition) : false;
  const weatherIcon = weatherData ? getWeatherIcon(weatherData.condition) : '☀️';
  const weatherBadge = weatherData ? formatWeatherImpactBadge(weatherData.condition, language) : null;

  // Dynamic comparison times based on scheduled activity time - must be called before any early returns
  const timeComparisons = useMemo(() => {
    const weatherMultiplier = weatherImpact.multiplier;

    // Calculate dynamic time slots relative to scheduled time
    const earlyDepartureMinutes = scheduledMinutes - baseDuration - 30; // 30 min early
    const optimalDepartureMinutes = scheduledMinutes - baseDuration - 15; // 15 min buffer
    const lateDepartureMinutes = scheduledMinutes - baseDuration; // Exactly on time (no buffer)

    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const dynamicTimes = [
      { time: formatTime(earlyDepartureMinutes), trafficLevel: 'light' as const, isPeak: false, label: 'early' },
      { time: formatTime(optimalDepartureMinutes), trafficLevel: 'moderate' as const, isPeak: false, label: 'optimal' },
      { time: formatTime(lateDepartureMinutes), trafficLevel: 'heavy' as const, isPeak: true, label: 'late' },
    ];

    // Optimal time - leave earlier if bad weather
    const optimalTime = isRainy ? dynamicTimes[0].time : dynamicTimes[1].time;

    return dynamicTimes.map((slot) => {
      // Apply both traffic and weather multipliers
      const trafficMultiplier = slot.isPeak ? 1.6 : (slot.label === 'early' ? 0.8 : 0.9);
      const duration = Math.round(baseDuration * trafficMultiplier * weatherMultiplier);

      return {
        departureTime: slot.time,
        duration,
        isRecommended: slot.time === optimalTime,
        trafficLevel: slot.trafficLevel,
      };
    });
  }, [weatherImpact.multiplier, baseDuration, scheduledMinutes, isRainy]);

  // Get recommendation for the currently selected time - must be called before any early returns
  const selectedTimeRecommendation = useMemo(() => {
    const [hours] = selectedTime.split(':').map(Number);
    // Use actual Google Maps duration if available, otherwise fall back to recommendation or default
    const baseDuration = routeData?.duration || rec?.duration || 35;
    const weatherMultiplier = weatherImpact.multiplier;

    // Peak hours: 17:00-19:00
    const isPeak = hours >= 17 && hours < 19;

    // Apply both traffic and weather multipliers
    const trafficMultiplier = isPeak ? 1.6 : 0.9;
    const duration = Math.round(baseDuration * trafficMultiplier * weatherMultiplier);

    return {
      departureTime: selectedTime,
      duration,
      trafficLevel: isPeak ? 'heavy' : 'light' as 'heavy' | 'light' | 'moderate',
    };
  }, [selectedTime, weatherImpact.multiplier, rec?.duration, routeData?.duration]);

  // Use the selected time recommendation as the best option
  const bestOption = selectedTimeRecommendation;

  // Calculate arrival time - must be called before any early returns
  const calculateArrival = useCallback((departureTime: string, duration: number) => {
    const [hours, mins] = departureTime.split(':').map(Number);
    const totalMins = hours * 60 + mins + duration;
    return `${Math.floor(totalMins / 60).toString().padStart(2, '0')}:${(totalMins % 60).toString().padStart(2, '0')}`;
  }, []);

  // Handle "Go Home Instead" - changes activity to home - must be called before any early returns
  const handleGoHome = useCallback(() => {
    if (todayPlan) {
      onRerouteHome(todayPlan.dayOfWeek);
    }
  }, [todayPlan, onRerouteHome]);

  // Get arrival time and status for current selection
  const arrivalTime = calculateArrival(bestOption.departureTime, bestOption.duration);
  const arrivalStatus = getArrivalStatus(arrivalTime, scheduledTime, language);

  // Weekend message - now AFTER all hooks
  if (!todayPlan) {
    return (
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎉</span>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'id' ? 'Selamat Akhir Pekan!' : 'Happy Weekend!'}
              </h2>
              <p className="text-violet-100 mt-1">
                {language === 'id'
                  ? 'Nikmati waktu istirahat Anda'
                  : 'Enjoy your time off'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Hero header with gradient based on live weather */}
      <div className={`
        p-6 text-white
        ${isRainy
          ? 'bg-gradient-to-r from-purple-600 to-violet-700'
          : 'bg-gradient-to-r from-sky-500 to-blue-600'
        }
      `}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Activity info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-16 h-16 flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-4xl">{destination?.icon || '🏠'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm opacity-80 mb-1">
                {language === 'id' ? 'Kegiatan Hari Ini' : "Today's Activity"}
              </p>
              <h2 className="text-2xl font-bold truncate">
                {language === 'id'
                  ? activity?.activityNameId || 'Pulang ke Rumah'
                  : activity?.activityName || 'Go Home'
                }
              </h2>
              <p className="text-sm opacity-90 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate max-w-[200px]">{destination?.shortAddress || 'Home'}</span>
                </span>
                <span className="opacity-60">•</span>
                <span className="whitespace-nowrap">⏰ {activity?.scheduledTime || '18:00'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive departure time selector */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-2xl mx-auto">
          <TimeSlider
            earliestTime={(() => {
              // Calculate earliest time: 90 minutes before scheduled time
              const earliestMinutes = scheduledMinutes - baseDuration - 60;
              return `${Math.floor(earliestMinutes / 60).toString().padStart(2, '0')}:${(earliestMinutes % 60).toString().padStart(2, '0')}`;
            })()}
            latestTime={scheduledTime}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
            language={language}
          />
        </div>
      </div>

      {/* Time comparison cards */}
      <div className="p-6">
        <TimeComparisonCards
          comparisons={timeComparisons}
          language={language}
          onSelectTime={(time) => setSelectedTime(time)}
        />
      </div>

      {/* Best recommendation highlight */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl p-5 border-2 border-sky-400">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✨</span>
            <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">
              {language === 'id' ? 'Rekomendasi Terbaik' : 'Best Recommendation'}
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            {/* Departure */}
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">
                {language === 'id' ? 'Berangkat' : 'Leave'}
              </p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {bestOption.departureTime}
              </p>
            </div>

            {/* Arrow with duration */}
            <div className="flex-1 flex flex-col items-center px-4">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {bestOption.duration}
                  </span>
                  <span className="text-sm text-slate-500">
                    {language === 'id' ? 'mnt' : 'min'}
                  </span>
                </div>
                <div className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
              </div>
              <p className="hidden sm:block text-xs text-slate-400 mt-1">
                {rec?.routeDescription || 'Direct route via Jl. Sudirman'}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">
                {language === 'id' ? 'Tiba' : 'Arrive'}
              </p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {arrivalTime}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'id' ? 'Jadwal:' : 'Scheduled:'} {scheduledTime}
              </p>
            </div>
          </div>

          {/* Arrival Status Badge - THE KEY FEEDBACK */}
          <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${arrivalStatus.color}`}>
            <span className="text-2xl">{arrivalStatus.icon}</span>
            <p className="font-medium">{arrivalStatus.message}</p>
          </div>

          {/* Weather impact badge if applicable */}
          {weatherBadge && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 ${weatherBadge.color}`}>
              <span>{weatherIcon}</span>
              <span>{weatherBadge.text}</span>
            </div>
          )}

          {/* Reasoning */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {language === 'id' ? (
                <>
                  <span className="font-semibold">Mengapa waktu ini?</span> Berangkat pukul {bestOption.departureTime}
                  {' '}untuk tiba di {destination?.shortAddress} pukul {arrivalTime}
                  {isRainy ? ', menghindari daerah rawan banjir' : ''}.
                </>
              ) : (
                <>
                  <span className="font-semibold">Why this time?</span> Leave at {bestOption.departureTime}
                  {' '}to arrive at {destination?.shortAddress} by {arrivalTime}
                  {isRainy ? ', avoiding flood-prone areas' : ''}.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Warnings */}
        {rec?.warnings && rec.warnings.length > 0 && (
          <div className="mt-4 space-y-2">
            {rec.warnings.map((warning, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  warning.severity === 'high'
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                }`}
              >
                <span className="text-xl">{warning.type === 'flood' ? '🌊' : '🚗'}</span>
                <p className="text-sm font-medium">
                  {language === 'id' ? warning.messageId : warning.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions - Only show if not already going home */}
        {destination?.id !== 'home' && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleGoHome}
              className="flex-1 py-3 px-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center justify-center gap-2"
            >
              <span>🏠</span>
              <span>{language === 'id' ? 'Langsung Pulang' : 'Go Home Instead'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
