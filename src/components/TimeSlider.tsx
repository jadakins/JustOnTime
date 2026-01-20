'use client';

import { useState, useMemo, useCallback } from 'react';
import { Language } from '@/types';

// ============================================================================
// TIME SLIDER - INTERACTIVE DEPARTURE TIME SELECTOR
// The key feature: "What time can I leave office today?"
// ============================================================================

interface TimeSliderProps {
  earliestTime: string; // HH:mm
  latestTime: string; // HH:mm
  selectedTime: string; // HH:mm
  onTimeChange: (time: string) => void;
  language: Language;
}

export default function TimeSlider({
  earliestTime,
  latestTime,
  selectedTime,
  onTimeChange,
  language,
}: TimeSliderProps) {
  // Convert time string to minutes from midnight
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const minMinutes = timeToMinutes(earliestTime);
  const maxMinutes = timeToMinutes(latestTime);
  const currentMinutes = timeToMinutes(selectedTime);

  // Calculate percentage for styling
  const percentage = ((currentMinutes - minMinutes) / (maxMinutes - minMinutes)) * 100;

  // Generate time marks for the slider
  const timeMarks = useMemo(() => {
    const marks: { time: string; position: number }[] = [];
    const step = 30; // Every 30 minutes
    for (let m = minMinutes; m <= maxMinutes; m += step) {
      marks.push({
        time: minutesToTime(m),
        position: ((m - minMinutes) / (maxMinutes - minMinutes)) * 100,
      });
    }
    return marks;
  }, [minMinutes, maxMinutes]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value);
    // Round to nearest 5 minutes
    const rounded = Math.round(minutes / 5) * 5;
    onTimeChange(minutesToTime(rounded));
  }, [onTimeChange]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {language === 'id' ? 'Jam berapa bisa pulang?' : 'What time can you leave?'}
        </label>
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-1.5 rounded-xl font-bold text-lg">
          {selectedTime}
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative pt-2 pb-6">
        {/* Track background */}
        <div className="absolute top-2 left-0 right-0 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />

        {/* Active track */}
        <div
          className="absolute top-2 left-0 h-3 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />

        {/* Time markers */}
        <div className="absolute top-7 left-0 right-0 flex justify-between px-0">
          {timeMarks.map((mark, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center"
              style={{ position: 'absolute', left: `${mark.position}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600" />
              <span className="text-xs text-slate-500 mt-1">{mark.time}</span>
            </div>
          ))}
        </div>

        {/* Range input */}
        <input
          type="range"
          min={minMinutes}
          max={maxMinutes}
          value={currentMinutes}
          onChange={handleChange}
          className="absolute top-0 left-0 right-0 w-full h-7 opacity-0 cursor-pointer z-10"
          step={5}
        />

        {/* Custom thumb */}
        <div
          className="absolute top-0 w-7 h-7 bg-white border-4 border-violet-500 rounded-full shadow-lg pointer-events-none transition-transform hover:scale-110"
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// TIME COMPARISON CARDS - Shows journey time at different departure times
// ============================================================================

interface TimeComparisonData {
  departureTime: string;
  duration: number;
  isRecommended: boolean;
  trafficLevel: 'light' | 'moderate' | 'heavy';
}

interface TimeComparisonCardsProps {
  comparisons: TimeComparisonData[];
  language: Language;
  onSelectTime: (time: string) => void;
}

export function TimeComparisonCards({
  comparisons,
  language,
  onSelectTime,
}: TimeComparisonCardsProps) {
  const trafficLabels = {
    light: { en: 'Light traffic', id: 'Lalu lintas lancar', color: 'text-sky-600' },
    moderate: { en: 'Moderate traffic', id: 'Lalu lintas sedang', color: 'text-orange-500' },
    heavy: { en: 'Heavy traffic (peak)', id: 'Macet padat (jam sibuk)', color: 'text-purple-600' },
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
        {language === 'id' ? 'Perbandingan Waktu Perjalanan:' : 'Journey Time Comparison:'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {comparisons.map((comp, idx) => (
          <button
            key={idx}
            onClick={() => onSelectTime(comp.departureTime)}
            className={`
              relative p-4 rounded-xl border-2 transition-all text-left
              ${comp.isRecommended
                ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20 ring-2 ring-sky-400 shadow-lg'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300'
              }
            `}
          >
            {comp.isRecommended && (
              <div className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {language === 'id' ? 'Terbaik' : 'Best'}
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-slate-800 dark:text-white">
                {comp.departureTime}
              </span>
              <span className={`text-2xl font-bold ${
                comp.isRecommended ? 'text-sky-600' : 'text-slate-600 dark:text-slate-300'
              }`}>
                {comp.duration}
                <span className="text-sm font-normal ml-1">
                  {language === 'id' ? 'mnt' : 'min'}
                </span>
              </span>
            </div>

            <div className={`text-xs font-medium ${trafficLabels[comp.trafficLevel].color}`}>
              {language === 'id'
                ? trafficLabels[comp.trafficLevel].id
                : trafficLabels[comp.trafficLevel].en
              }
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
