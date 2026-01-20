'use client';

import { DayPlan, shortDayNames, WeeklyActivity } from '@/types/life';
import { Language, SeverityLevel, WeatherData } from '@/types';
import { format } from 'date-fns';
import { isRainyCondition, getWeatherIcon } from '@/services/weatherImpact';

// ============================================================================
// MY WEEK - EDITABLE WEEKLY CALENDAR
// Shows Mon-Fri with each day's after-work plan
// Opens modal for editing activities
// ============================================================================

interface MyWeekProps {
  weeklyPlan: DayPlan[];
  language: Language;
  weatherData: WeatherData | null;
  onDaySelect: (dayOfWeek: number) => void;
  selectedDay: number | null;
  onActivityChange?: (dayOfWeek: number, activity: Partial<WeeklyActivity>) => void;
  onEditDay?: (day: DayPlan) => void; // New: Opens the edit modal
}

export default function MyWeek({
  weeklyPlan,
  language,
  weatherData,
  onDaySelect,
  selectedDay,
  onActivityChange,
  onEditDay,
}: MyWeekProps) {
  const today = new Date().getDay();

  const handleEdit = (day: DayPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    // Open modal instead of inline edit
    if (onEditDay) {
      onEditDay(day);
    }
  };

  // Determine weather state from real weather data
  const isRainy = weatherData ? isRainyCondition(weatherData.condition) : false;
  const weatherIcon = weatherData ? getWeatherIcon(weatherData.condition) : '☀️';

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {language === 'id' ? 'Minggu Saya' : 'My Week'}
              </h2>
              <p className="text-sm text-slate-500">
                {language === 'id' ? 'Ketuk untuk edit' : 'Tap to edit'}
              </p>
            </div>
          </div>

          {/* Live weather indicator */}
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
            isRainy
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
              : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
          }`}>
            <span>{weatherIcon}</span>
            <span>{weatherData ? `${Math.round(weatherData.temperature)}°C` : '--'}</span>
          </div>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="card-body flex-1 overflow-auto">
        <div className="space-y-3">
          {weeklyPlan.map((day) => (
            <DayCard
              key={day.dayOfWeek}
              day={day}
              language={language}
              isToday={day.dayOfWeek === today}
              isSelected={day.dayOfWeek === selectedDay}
              onClick={() => onDaySelect(day.dayOfWeek)}
              onEditClick={(e) => handleEdit(day, e)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
        <Legend language={language} />
      </div>
    </div>
  );
}

// ============================================================================
// DAY CARD - Individual day with edit button (opens modal)
// ============================================================================

interface DayCardProps {
  day: DayPlan;
  language: Language;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
  onEditClick: (e: React.MouseEvent) => void;
}

function DayCard({
  day,
  language,
  isToday,
  isSelected,
  onClick,
  onEditClick,
}: DayCardProps) {
  const shortDay = shortDayNames[language][day.dayOfWeek];
  const activity = day.activity;
  const destination = day.destination;
  const rec = day.recommendation;

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl p-4 cursor-pointer transition-all duration-300
        ${isSelected
          ? 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 ring-2 ring-violet-500 shadow-lg'
          : isToday
            ? 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 ring-2 ring-sky-400'
            : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
        }
      `}
    >
      {/* Today badge */}
      {isToday && (
        <div className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
          {language === 'id' ? 'Hari Ini' : 'Today'}
        </div>
      )}

      {/* Edit button */}
      <button
        onClick={onEditClick}
        className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow flex items-center justify-center hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
      >
        <span className="text-sm">✏️</span>
      </button>

      {/* Day content */}
      <div className="flex items-start gap-4 pr-10">
        {/* Day indicator */}
        <div className={`
          w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0
          ${isToday
            ? 'bg-sky-500 text-white'
            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
          }
          shadow-sm
        `}>
          <span className="text-xs font-medium uppercase">{shortDay}</span>
          <span className="text-lg font-bold">{activity?.scheduledTime?.split(':')[0] || '18'}</span>
        </div>

        {/* Activity details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{destination?.icon || '🏠'}</span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
              {language === 'id'
                ? activity?.activityNameId || 'Pulang'
                : activity?.activityName || 'Go Home'
              }
            </h3>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {activity?.customLocation?.address || destination?.shortAddress || 'Home'}
          </p>

          {/* Recommendation summary */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Departure time */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg shadow-sm">
              <span className="text-xs">🚗</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {format(rec.departureTime, 'HH:mm')}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg shadow-sm">
              <span className="text-xs">⏱️</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {rec.duration} {language === 'id' ? 'mnt' : 'min'}
              </span>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-1">
              <StatusIndicator level={rec.trafficLevel} type="traffic" />
              <StatusIndicator level={rec.floodRisk} type="flood" />
            </div>
          </div>

          {/* Time savings */}
          {rec.comparison && rec.comparison.timeSaved > 0 && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {language === 'id' ? 'Hemat' : 'Save'}{' '}
              <span className="text-sky-600 dark:text-sky-400 font-semibold">
                {rec.comparison.timeSaved} {language === 'id' ? 'menit' : 'min'}
              </span>
              {' '}{language === 'id' ? 'vs jam sibuk' : 'vs rush hour'}
            </div>
          )}
        </div>

        {/* Score */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
          ${rec.score >= 70
            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
            : rec.score >= 40
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
          }
        `}>
          {rec.score}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STATUS INDICATOR - Traffic/Flood status with shapes
// ============================================================================

function StatusIndicator({ level, type }: { level: SeverityLevel; type: 'traffic' | 'flood' }) {
  const getStyles = () => {
    switch (level) {
      case 'low':
        return {
          bg: 'bg-sky-500',
          shape: 'rounded-full',
          icon: '✓',
        };
      case 'medium':
        return {
          bg: 'bg-orange-500',
          shape: 'rounded-sm rotate-45',
          icon: '!',
        };
      case 'high':
        return {
          bg: 'bg-purple-500',
          shape: '',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          icon: '⚠',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`w-4 h-4 flex items-center justify-center text-white text-[10px] ${styles.bg} ${styles.shape}`}
      style={level === 'high' ? { clipPath: styles.clipPath } : undefined}
      title={`${type}: ${level}`}
    >
      {level !== 'high' && <span className={level === 'medium' ? '-rotate-45' : ''}>{styles.icon}</span>}
    </div>
  );
}

// ============================================================================
// LEGEND - Explains all icons and colors
// ============================================================================

function Legend({ language }: { language: Language }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
        {language === 'id' ? 'Keterangan' : 'Legend'}
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {/* Traffic levels */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-sky-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {language === 'id' ? 'Lancar' : 'Clear'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-orange-500 rotate-45" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {language === 'id' ? 'Sedang' : 'Moderate'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {language === 'id' ? 'Macet/Banjir' : 'Heavy/Flood'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">🚗</span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {language === 'id' ? 'Waktu berangkat' : 'Departure time'}
          </span>
        </div>
      </div>
    </div>
  );
}
