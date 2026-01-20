'use client';

import { FloodData, Language, SeverityLevel } from '@/types';
import { useTranslations } from '@/i18n/translations';
import { jakartaRegions, getRegionName } from '@/data/regions';
import { format } from 'date-fns';

// ============================================================================
// FLOOD WARNING PANEL - COLORBLIND FRIENDLY
// Uses blue/orange/purple color scheme with shape indicators
// Circle = safe, Diamond = warning, Triangle = danger
// ============================================================================

interface FloodWarningPanelProps {
  floodData: FloodData[];
  language: Language;
  selectedRegion: string | null;
  onRegionSelect: (regionId: string | null) => void;
}

export default function FloodWarningPanel({
  floodData,
  language,
  selectedRegion,
  onRegionSelect,
}: FloodWarningPanelProps) {
  const { t } = useTranslations(language);

  // Sort by severity (high first)
  const sortedFloodData = [...floodData].sort((a, b) => {
    const severityOrder: Record<SeverityLevel, number> = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.level] - severityOrder[b.level];
  });

  // Filter if region is selected
  const displayData = selectedRegion
    ? sortedFloodData.filter(d => d.regionId === selectedRegion)
    : sortedFloodData;

  // Count warnings by severity
  const highCount = floodData.filter(d => d.level === 'high').length;
  const mediumCount = floodData.filter(d => d.level === 'medium').length;
  const lowCount = floodData.filter(d => d.level === 'low').length;

  return (
    <div className="card h-full flex flex-col">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {t('floodWarnings')}
            </h2>
          </div>
        </div>

        {/* Summary badges with shapes */}
        <div className="flex gap-2 mt-3">
          {highCount > 0 && (
            <span className="badge badge-high flex items-center gap-1.5">
              <span className="w-2.5 h-2.5" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: 'currentColor'}} />
              {highCount} {language === 'id' ? 'Bahaya' : 'Danger'}
            </span>
          )}
          {mediumCount > 0 && (
            <span className="badge badge-medium flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rotate-45 rounded-sm" style={{background: 'currentColor'}} />
              {mediumCount} {language === 'id' ? 'Waspada' : 'Caution'}
            </span>
          )}
          <span className="badge badge-low flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{background: 'currentColor'}} />
            {lowCount} {language === 'id' ? 'Aman' : 'Safe'}
          </span>
        </div>
      </div>

      <div className="card-body flex-1 overflow-auto">
        {/* Region filter */}
        <div className="mb-4">
          <select
            className="select text-sm"
            value={selectedRegion || ''}
            onChange={(e) => onRegionSelect(e.target.value || null)}
          >
            <option value="">{t('allRegions')}</option>
            {jakartaRegions.map(region => (
              <option key={region.id} value={region.id}>
                {getRegionName(region, language)}
              </option>
            ))}
          </select>
        </div>

        {/* Flood data list */}
        <div className="space-y-3">
          {displayData.map(flood => {
            const region = jakartaRegions.find(r => r.id === flood.regionId);
            if (!region) return null;

            return (
              <FloodCard
                key={flood.regionId}
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
// FLOOD CARD - Individual region flood status
// ============================================================================

interface FloodCardProps {
  flood: FloodData;
  regionName: string;
  language: Language;
}

function FloodCard({ flood, regionName, language }: FloodCardProps) {
  const { t } = useTranslations(language);

  const getSeverityStyles = (level: SeverityLevel) => {
    switch (level) {
      case 'low':
        return {
          border: 'border-l-sky-500',
          bg: 'bg-gradient-to-r from-sky-50 to-white dark:from-sky-900/20 dark:to-slate-800',
          icon: <span className="w-4 h-4 rounded-full bg-sky-500" />,
          label: language === 'id' ? 'Aman' : 'Safe',
        };
      case 'medium':
        return {
          border: 'border-l-orange-500',
          bg: 'bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-800',
          icon: <span className="w-4 h-4 rotate-45 rounded-sm bg-orange-500" />,
          label: language === 'id' ? 'Waspada' : 'Caution',
        };
      case 'high':
        return {
          border: 'border-l-purple-500',
          bg: 'bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-800',
          icon: <span className="w-4 h-4 bg-purple-500" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />,
          label: language === 'id' ? 'Bahaya' : 'Danger',
        };
    }
  };

  const styles = getSeverityStyles(flood.level);

  return (
    <div className={`rounded-xl border-l-4 p-4 ${styles.border} ${styles.bg} shadow-sm`}>
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

        {/* Water level indicator */}
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {flood.waterLevel}
            <span className="text-sm font-normal ml-1 text-slate-500">{t('cm')}</span>
          </div>
          <div className="text-xs text-slate-500">{t('waterLevel')}</div>
        </div>
      </div>

      {/* Affected areas */}
      {flood.affectedAreas.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1.5">{t('affectedAreas')}:</p>
          <div className="flex flex-wrap gap-1.5">
            {flood.affectedAreas.map(area => (
              <span key={area} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Prediction timeline with shapes */}
      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
        <p className="text-xs text-slate-500 mb-2">{t('prediction')}:</p>
        <div className="flex justify-between">
          <PredictionItem label={t('nextHour')} level={flood.prediction.nextHour} />
          <PredictionItem label={t('next3Hours')} level={flood.prediction.next3Hours} />
          <PredictionItem label={t('next6Hours')} level={flood.prediction.next6Hours} />
        </div>
      </div>

      {/* Peak warning */}
      {flood.prediction.peakTime && (
        <div className="mt-3 p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <span className="w-3 h-3 bg-purple-500" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />
          <span>
            <strong>{t('peakExpected')}:</strong> {format(flood.prediction.peakTime, 'HH:mm')}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PREDICTION ITEM - Shows predicted severity with shape indicator
// ============================================================================

interface PredictionItemProps {
  label: string;
  level: SeverityLevel;
}

function PredictionItem({ label, level }: PredictionItemProps) {
  const getIndicator = () => {
    switch (level) {
      case 'low':
        return <span className="w-4 h-4 rounded-full bg-sky-500" />;
      case 'medium':
        return <span className="w-4 h-4 rotate-45 rounded-sm bg-orange-500" />;
      case 'high':
        return <span className="w-4 h-4 bg-purple-500 animate-pulse" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      {getIndicator()}
      <span className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 text-center">{label}</span>
    </div>
  );
}
