'use client';

import { useState, useMemo, useEffect } from 'react';
import { Language, TripDirection, DepartureRecommendation, SeverityLevel } from '@/types';
import { useTranslations } from '@/i18n/translations';
import { jakartaRegions, getRegionName } from '@/data/regions';
// COMMENTED OUT: Mock data import - using real APIs instead
// import { generateDepartureRecommendations } from '@/data/mockData';
import { format, setHours, setMinutes } from 'date-fns';

// ============================================================================
// DEPARTURE CALCULATOR - REDESIGNED
// Intuitive time slider at top, auto-calculates recommendations
// Colorblind-friendly with icons and patterns
// ============================================================================

interface DepartureCalculatorProps {
  language: Language;
}

export default function DepartureCalculator({ language }: DepartureCalculatorProps) {
  const { t } = useTranslations(language);

  // Time as minutes from midnight (0-1439)
  const [timeMinutes, setTimeMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  const [homeRegion, setHomeRegion] = useState('jakarta-selatan');
  const [officeRegion, setOfficeRegion] = useState('jakarta-pusat');
  const [tripDirection, setTripDirection] = useState<TripDirection>('home-to-office');

  // Convert minutes to Date
  const parseMinutesToDate = (mins: number): Date => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const date = new Date();
    return setMinutes(setHours(date, hours), minutes);
  };

  // Format minutes to time string
  const formatTime = (mins: number): string => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get time period label
  const getTimePeriod = (mins: number): { label: string; labelId: string; icon: string } => {
    const hours = Math.floor(mins / 60);
    if (hours >= 5 && hours < 9) return { label: 'Morning Rush', labelId: 'Jam Sibuk Pagi', icon: '🌅' };
    if (hours >= 9 && hours < 12) return { label: 'Mid Morning', labelId: 'Menjelang Siang', icon: '☀️' };
    if (hours >= 12 && hours < 14) return { label: 'Lunch Time', labelId: 'Jam Makan Siang', icon: '🍽️' };
    if (hours >= 14 && hours < 17) return { label: 'Afternoon', labelId: 'Sore Hari', icon: '🌤️' };
    if (hours >= 17 && hours < 20) return { label: 'Evening Rush', labelId: 'Jam Sibuk Sore', icon: '🌆' };
    if (hours >= 20 && hours < 23) return { label: 'Night', labelId: 'Malam', icon: '🌙' };
    return { label: 'Late Night', labelId: 'Larut Malam', icon: '🌃' };
  };

  // Auto-generate recommendations when inputs change
  // COMMENTED OUT: Mock data - using real APIs instead
  const recommendations = useMemo(() => {
    const fromRegion = tripDirection === 'home-to-office' ? homeRegion : officeRegion;
    const toRegion = tripDirection === 'home-to-office' ? officeRegion : homeRegion;
    // return generateDepartureRecommendations(parseMinutesToDate(timeMinutes), fromRegion, toRegion, 4);
    return [];
  }, [timeMinutes, homeRegion, officeRegion, tripDirection]);

  const timePeriod = getTimePeriod(timeMinutes);
  const bestRecommendation = recommendations[0];

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {t('departureCalculator')}
            </h2>
            <p className="text-sm text-slate-500">
              {language === 'id' ? 'Geser untuk memilih waktu keberangkatan' : 'Slide to select departure time'}
            </p>
          </div>
        </div>
      </div>

      <div className="card-body flex-1 overflow-auto space-y-5">
        {/* TIME SLIDER - PROMINENT AT TOP */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-5">
          {/* Current time display */}
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">
              {formatTime(timeMinutes)}
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="text-xl">{timePeriod.icon}</span>
              <span>{language === 'id' ? timePeriod.labelId : timePeriod.label}</span>
            </div>
          </div>

          {/* Visual time slider */}
          <div className="relative">
            {/* Time markers */}
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>05:00</span>
              <span>09:00</span>
              <span>13:00</span>
              <span>17:00</span>
              <span>21:00</span>
            </div>

            {/* Slider track with gradient showing traffic conditions */}
            <div className="relative h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-600">
              {/* Traffic condition visualization */}
              <div className="absolute inset-0 flex">
                {/* Morning rush - high traffic */}
                <div className="flex-1 bg-gradient-to-r from-sky-400 via-orange-400 to-orange-500" style={{flex: '4'}} />
                {/* Mid-day - low traffic */}
                <div className="flex-1 bg-gradient-to-r from-orange-500 via-sky-400 to-sky-400" style={{flex: '3'}} />
                {/* Afternoon - building */}
                <div className="flex-1 bg-gradient-to-r from-sky-400 via-orange-400 to-purple-500" style={{flex: '3'}} />
                {/* Evening rush - high */}
                <div className="flex-1 bg-gradient-to-r from-purple-500 via-orange-400 to-sky-400" style={{flex: '4'}} />
                {/* Night - low */}
                <div className="flex-1 bg-sky-400" style={{flex: '2'}} />
              </div>

              {/* Slider input */}
              <input
                type="range"
                min={300}
                max={1380}
                step={15}
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {/* Custom thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-4 border-sky-600 pointer-events-none transition-all duration-75"
                style={{ left: `calc(${((timeMinutes - 300) / 1080) * 100}% - 16px)` }}
              >
                <div className="absolute inset-0 rounded-full bg-sky-600 scale-50" />
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="text-slate-600 dark:text-slate-400">{language === 'id' ? 'Lancar' : 'Clear'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm rotate-45 bg-orange-500" />
                <span className="text-slate-600 dark:text-slate-400">{language === 'id' ? 'Sedang' : 'Moderate'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-purple-500" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />
                <span className="text-slate-600 dark:text-slate-400">{language === 'id' ? 'Padat' : 'Heavy'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Selection - Compact */}
        <div className="grid grid-cols-2 gap-3">
          {/* Home */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              🏠 {language === 'id' ? 'Rumah' : 'Home'}
            </label>
            <select
              className="select text-sm"
              value={homeRegion}
              onChange={(e) => setHomeRegion(e.target.value)}
            >
              {jakartaRegions.map(region => (
                <option key={region.id} value={region.id}>
                  {getRegionName(region, language)}
                </option>
              ))}
            </select>
          </div>

          {/* Office */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              🏢 {language === 'id' ? 'Kantor' : 'Office'}
            </label>
            <select
              className="select text-sm"
              value={officeRegion}
              onChange={(e) => setOfficeRegion(e.target.value)}
            >
              {jakartaRegions.map(region => (
                <option key={region.id} value={region.id}>
                  {getRegionName(region, language)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Direction Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              tripDirection === 'home-to-office'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300'
            }`}
            onClick={() => setTripDirection('home-to-office')}
          >
            <span>🏠</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span>🏢</span>
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              tripDirection === 'office-to-home'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300'
            }`}
            onClick={() => setTripDirection('office-to-home')}
          >
            <span>🏢</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span>🏠</span>
          </button>
        </div>

        {/* Best Recommendation - Highlighted */}
        {bestRecommendation && (
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-2xl p-4 border-2 border-sky-500">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                  {t('bestChoice')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ScoreIndicator score={bestRecommendation.score} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {format(bestRecommendation.recommendedTime, 'HH:mm')}
                </div>
                <div className="text-xs text-slate-500">{t('departAt')}</div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                    {bestRecommendation.duration} {language === 'id' ? 'mnt' : 'min'}
                  </div>
                  <div className="text-xs text-slate-500">{t('duration')}</div>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {format(bestRecommendation.arrivalTime, 'HH:mm')}
                </div>
                <div className="text-xs text-slate-500">{t('arriveAt')}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-sky-200 dark:border-sky-700">
              <StatusBadge type="traffic" level={bestRecommendation.trafficLevel} language={language} />
              <StatusBadge type="flood" level={bestRecommendation.floodRisk} language={language} />
            </div>
          </div>
        )}

        {/* Other Recommendations */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {language === 'id' ? 'Alternatif Lainnya' : 'Other Options'}
          </h4>
          {recommendations.slice(1).map((rec, index) => (
            <CompactRecommendation key={index} recommendation={rec} language={language} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function ScoreIndicator({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 70) return 'text-sky-600 bg-sky-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-purple-600 bg-purple-100';
  };

  return (
    <div className={`px-3 py-1 rounded-full text-lg font-bold ${getColor()}`}>
      {score}
    </div>
  );
}

function StatusBadge({
  type,
  level,
  language
}: {
  type: 'traffic' | 'flood';
  level: SeverityLevel;
  language: Language;
}) {
  const getConfig = () => {
    const configs = {
      low: {
        bg: 'bg-sky-100 dark:bg-sky-900/30',
        text: 'text-sky-700 dark:text-sky-300',
        shape: 'rounded-full',
        label: type === 'traffic'
          ? (language === 'id' ? 'Lancar' : 'Clear')
          : (language === 'id' ? 'Aman' : 'Safe'),
      },
      medium: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-300',
        shape: 'rounded-sm rotate-45',
        label: type === 'traffic'
          ? (language === 'id' ? 'Sedang' : 'Moderate')
          : (language === 'id' ? 'Waspada' : 'Caution'),
      },
      high: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
        shape: '',
        label: type === 'traffic'
          ? (language === 'id' ? 'Padat' : 'Heavy')
          : (language === 'id' ? 'Bahaya' : 'Danger'),
      },
    };
    return configs[level];
  };

  const config = getConfig();
  const icon = type === 'traffic' ? '🚗' : '💧';

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span>{icon}</span>
      <span className={`w-2 h-2 ${level === 'high' ? '' : config.shape}`}
            style={level === 'high' ? {
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              background: 'currentColor',
              width: '8px',
              height: '8px'
            } : {
              background: 'currentColor'
            }} />
      <span>{config.label}</span>
    </div>
  );
}

function CompactRecommendation({
  recommendation,
  language
}: {
  recommendation: DepartureRecommendation;
  language: Language;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          {format(recommendation.recommendedTime, 'HH:mm')}
        </div>
        <div className="flex items-center gap-2">
          <StatusDot level={recommendation.trafficLevel} />
          <StatusDot level={recommendation.floodRisk} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">
          {recommendation.duration} {language === 'id' ? 'mnt' : 'min'}
        </span>
        <ScoreIndicator score={recommendation.score} />
      </div>
    </div>
  );
}

function StatusDot({ level }: { level: SeverityLevel }) {
  if (level === 'low') {
    return <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />;
  }
  if (level === 'medium') {
    return <span className="w-2.5 h-2.5 rounded-sm rotate-45 bg-orange-500" />;
  }
  return (
    <span
      className="w-2.5 h-2.5 bg-purple-500"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
    />
  );
}
