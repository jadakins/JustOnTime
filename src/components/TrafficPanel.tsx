'use client';

import { TrafficData, FloodData, Language, SeverityLevel } from '@/types';
import { useTranslations } from '@/i18n/translations';
import { jakartaRegions, getRegionName } from '@/data/regions';

// ============================================================================
// TRAFFIC PANEL - COLORBLIND FRIENDLY
// Uses blue/orange/purple color scheme with shape indicators
// Circle = clear, Diamond = moderate, Triangle = heavy
// ============================================================================

interface TrafficPanelProps {
  trafficData: TrafficData[];
  floodData: FloodData[];
  language: Language;
  selectedRegion: string | null;
}

export default function TrafficPanel({
  trafficData,
  floodData,
  language,
  selectedRegion,
}: TrafficPanelProps) {
  const { t } = useTranslations(language);

  // Sort by severity (worst first)
  const sortedTrafficData = [...trafficData].sort((a, b) => {
    const severityOrder: Record<SeverityLevel, number> = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.level] - severityOrder[b.level];
  });

  // Filter if region selected
  const displayData = selectedRegion
    ? sortedTrafficData.filter(d => d.regionId === selectedRegion)
    : sortedTrafficData;

  // Calculate overall stats
  const avgDelay = Math.round(
    trafficData.reduce((sum, d) => sum + d.estimatedDelay, 0) / trafficData.length
  );
  const avgSpeed = Math.round(
    trafficData.reduce((sum, d) => sum + d.averageSpeed, 0) / trafficData.length
  );

  return (
    <div className="card h-full flex flex-col">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {t('trafficConditions')}
          </h2>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{avgSpeed}</div>
            <div className="text-xs text-slate-500 mt-0.5">{t('kmh')} {language === 'id' ? 'rata-rata' : 'avg'}</div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">+{avgDelay}</div>
            <div className="text-xs text-slate-500 mt-0.5">{t('minutes')} {language === 'id' ? 'tunda' : 'delay'}</div>
          </div>
        </div>
      </div>

      <div className="card-body flex-1 overflow-auto">
        <div className="space-y-3">
          {displayData.map(traffic => {
            const region = jakartaRegions.find(r => r.id === traffic.regionId);
            const flood = floodData.find(f => f.regionId === traffic.regionId);
            if (!region) return null;

            return (
              <TrafficCard
                key={traffic.regionId}
                traffic={traffic}
                flood={flood}
                regionName={getRegionName(region, language)}
                language={language}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TRAFFIC CARD - Individual region traffic status
// ============================================================================

interface TrafficCardProps {
  traffic: TrafficData;
  flood?: FloodData;
  regionName: string;
  language: Language;
}

function TrafficCard({ traffic, flood, regionName, language }: TrafficCardProps) {
  const { t } = useTranslations(language);

  const getSeverityStyles = (level: SeverityLevel) => {
    switch (level) {
      case 'low':
        return {
          border: 'border-l-sky-500',
          bg: 'bg-white dark:bg-slate-800',
          icon: <span className="w-4 h-4 rounded-full bg-sky-500" />,
          label: language === 'id' ? 'Lancar' : 'Clear',
          progressBg: 'bg-sky-500',
        };
      case 'medium':
        return {
          border: 'border-l-orange-500',
          bg: 'bg-white dark:bg-slate-800',
          icon: <span className="w-4 h-4 rotate-45 rounded-sm bg-orange-500" />,
          label: language === 'id' ? 'Sedang' : 'Moderate',
          progressBg: 'bg-orange-500',
        };
      case 'high':
        return {
          border: 'border-l-purple-500',
          bg: 'bg-white dark:bg-slate-800',
          icon: <span className="w-4 h-4 bg-purple-500" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />,
          label: language === 'id' ? 'Padat' : 'Heavy',
          progressBg: 'bg-purple-500',
        };
    }
  };

  const styles = getSeverityStyles(traffic.level);

  const getProgressWidth = (level: SeverityLevel) => {
    switch (level) {
      case 'low': return '33%';
      case 'medium': return '66%';
      case 'high': return '100%';
    }
  };

  return (
    <div className={`rounded-xl border-l-4 p-4 shadow-sm ${styles.border} ${styles.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {styles.icon}
            <h3 className="font-semibold text-slate-800 dark:text-white">{regionName}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 ml-6">
            {styles.label}
          </p>
        </div>

        {/* Speed indicator */}
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {traffic.averageSpeed}
            <span className="text-sm font-normal ml-1 text-slate-500">{t('kmh')}</span>
          </div>
          <div className="text-xs text-orange-600 font-medium">+{traffic.estimatedDelay} {t('minutes')}</div>
        </div>
      </div>

      {/* Traffic level bar */}
      <div className="mt-3">
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${styles.progressBg}`}
            style={{ width: getProgressWidth(traffic.level) }}
          />
        </div>
      </div>

      {/* Flood impact warning */}
      {flood && flood.level !== 'low' && (
        <div className="mt-3 p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {language === 'id' ? 'Terpengaruh banjir' : 'Flood affected'} ({flood.waterLevel}cm)
          </span>
        </div>
      )}

      {/* Congestion points */}
      {traffic.congestionPoints.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1.5">{t('congestionPoints')}:</p>
          <div className="flex flex-wrap gap-1.5">
            {traffic.congestionPoints.slice(0, 3).map(point => (
              <span key={point} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                {point}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
