'use client';

import { useEffect, useState } from 'react';
import { FloodData, TrafficData, Language, SeverityLevel } from '@/types';
import { useTranslations } from '@/i18n/translations';

// ============================================================================
// MAP VIEW COMPONENT - COLORBLIND FRIENDLY
// Interactive map with shape-based legend
// Circle = safe, Diamond = caution, Triangle = danger
// ============================================================================

interface MapViewProps {
  floodData: FloodData[];
  trafficData: TrafficData[];
  language: Language;
  onRegionSelect: (regionId: string | null) => void;
  selectedRegion: string | null;
}

export default function MapView({
  floodData,
  trafficData,
  language,
  onRegionSelect,
  selectedRegion,
}: MapViewProps) {
  const { t } = useTranslations(language);
  const [showFlood, setShowFlood] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  // Dynamically import Leaflet components (client-side only)
  useEffect(() => {
    import('./LeafletMap').then(mod => {
      setMapComponent(() => mod.default);
    });
  }, []);

  return (
    <div className="card h-full flex flex-col">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {t('mapView')}
            </h2>
          </div>

          {/* Toggle buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFlood(!showFlood)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                showFlood
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              💧 {language === 'id' ? 'Banjir' : 'Flood'}
            </button>
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                showTraffic
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              🚗 {language === 'id' ? 'Lalu Lintas' : 'Traffic'}
            </button>
          </div>
        </div>
      </div>

      <div className="card-body flex-1 relative min-h-[300px]">
        {MapComponent ? (
          <MapComponent
            floodData={showFlood ? floodData : []}
            trafficData={showTraffic ? trafficData : []}
            language={language}
            onRegionSelect={onRegionSelect}
            selectedRegion={selectedRegion}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-slate-500">{t('loading')}</p>
            </div>
          </div>
        )}

        {/* Legend with shapes */}
        <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg p-4 z-[1000]">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
            {t('legend')}
          </h4>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs">✓</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {language === 'id' ? 'Aman / Lancar' : 'Safe / Clear'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rotate-45 rounded-sm bg-orange-500 flex items-center justify-center text-white text-xs">
                <span className="-rotate-45">!</span>
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {language === 'id' ? 'Waspada / Sedang' : 'Caution / Moderate'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="w-5 h-5 bg-purple-500 flex items-center justify-center text-white text-xs"
                style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}
              >
                <span className="mt-1">⚠</span>
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {language === 'id' ? 'Bahaya / Padat' : 'Danger / Heavy'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
