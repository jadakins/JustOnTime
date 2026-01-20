'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FloodData, TrafficData, Language, SeverityLevel } from '@/types';
import { jakartaRegions, getRegionName } from '@/data/regions';

// ============================================================================
// LEAFLET MAP COMPONENT - COLORBLIND FRIENDLY
// Uses blue/orange/purple color scheme with shape-based markers
// Circle = safe, Diamond = warning, Triangle = danger
// ============================================================================

interface LeafletMapProps {
  floodData: FloodData[];
  trafficData: TrafficData[];
  language: Language;
  onRegionSelect: (regionId: string | null) => void;
  selectedRegion: string | null;
}

// Colorblind-friendly colors
const COLORS = {
  low: '#0284c7',      // Sky blue
  medium: '#ea580c',   // Orange
  high: '#9333ea',     // Purple
};

export default function LeafletMap({
  floodData,
  trafficData,
  language,
  onRegionSelect,
  selectedRegion,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Jakarta center coordinates
    const jakartaCenter: L.LatLngExpression = [-6.2088, 106.8456];

    mapRef.current = L.map(mapContainerRef.current, {
      center: jakartaCenter,
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles with a cleaner style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 18,
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each region
    jakartaRegions.forEach(region => {
      const flood = floodData.find(f => f.regionId === region.id);
      const traffic = trafficData.find(t => t.regionId === region.id);

      // Determine overall severity (worst of flood or traffic)
      const floodLevel = flood?.level || 'low';
      const trafficLevel = traffic?.level || 'low';
      const overallLevel = getSeverityPriority(floodLevel) > getSeverityPriority(trafficLevel)
        ? floodLevel
        : trafficLevel;

      // Create custom icon with shape
      const icon = createCustomIcon(overallLevel, region.id === selectedRegion);

      // Create marker
      const marker = L.marker(region.coordinates, { icon })
        .addTo(mapRef.current!);

      // Create popup content
      const popupContent = createPopupContent(region, flood, traffic, language);
      marker.bindPopup(popupContent, {
        className: 'custom-popup',
        maxWidth: 280,
      });

      // Handle click
      marker.on('click', () => {
        onRegionSelect(region.id);
      });

      markersRef.current.push(marker);
    });

    // Handle selected region
    if (selectedRegion) {
      const region = jakartaRegions.find(r => r.id === selectedRegion);
      if (region && mapRef.current) {
        mapRef.current.setView(region.coordinates, 13, { animate: true });
      }
    }
  }, [floodData, trafficData, language, selectedRegion, onRegionSelect]);

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 rounded-xl z-0"
      style={{ minHeight: '300px' }}
    />
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSeverityPriority(level: SeverityLevel): number {
  switch (level) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
  }
}

function createCustomIcon(level: SeverityLevel, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 44 : 36;
  const color = COLORS[level];

  // Different shapes for different levels
  let shapeStyle = '';
  let innerContent = '';

  switch (level) {
    case 'low':
      // Circle
      shapeStyle = `
        border-radius: 50%;
        background: ${color};
      `;
      innerContent = '✓';
      break;
    case 'medium':
      // Diamond (rotated square)
      shapeStyle = `
        transform: rotate(45deg);
        border-radius: 4px;
        background: ${color};
      `;
      innerContent = `<span style="transform: rotate(-45deg); display: block;">!</span>`;
      break;
    case 'high':
      // Triangle
      shapeStyle = `
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        background: ${color};
      `;
      innerContent = '⚠';
      break;
  }

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        ${shapeStyle}
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        font-weight: bold;
        ${isSelected ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        ${level === 'medium' ? innerContent : `<span style="margin-top: ${level === 'high' ? '8px' : '0'}">${innerContent}</span>`}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createPopupContent(
  region: typeof jakartaRegions[0],
  flood: FloodData | undefined,
  traffic: TrafficData | undefined,
  language: Language
): string {
  const name = getRegionName(region, language);
  const floodStatus = flood?.level || 'low';
  const trafficStatus = traffic?.level || 'low';

  const getStatusConfig = (level: SeverityLevel, type: 'flood' | 'traffic') => {
    const configs = {
      low: {
        label: type === 'flood'
          ? (language === 'id' ? 'Aman' : 'Safe')
          : (language === 'id' ? 'Lancar' : 'Clear'),
        bg: '#e0f2fe',
        color: '#0c4a6e',
        shape: 'border-radius: 50%;',
      },
      medium: {
        label: type === 'flood'
          ? (language === 'id' ? 'Waspada' : 'Caution')
          : (language === 'id' ? 'Sedang' : 'Moderate'),
        bg: '#ffedd5',
        color: '#9a3412',
        shape: 'transform: rotate(45deg); border-radius: 2px;',
      },
      high: {
        label: type === 'flood'
          ? (language === 'id' ? 'Bahaya' : 'Danger')
          : (language === 'id' ? 'Padat' : 'Heavy'),
        bg: '#f3e8ff',
        color: '#581c87',
        shape: 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%);',
      },
    };
    return configs[level];
  };

  const floodConfig = getStatusConfig(floodStatus, 'flood');
  const trafficConfig = getStatusConfig(trafficStatus, 'traffic');

  const floodLabel = language === 'id' ? 'Banjir' : 'Flood';
  const trafficLabel = language === 'id' ? 'Lalu Lintas' : 'Traffic';
  const waterLevelLabel = language === 'id' ? 'Ketinggian Air' : 'Water Level';
  const delayLabel = language === 'id' ? 'Keterlambatan' : 'Delay';

  return `
    <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1e293b;">${name}</h3>

      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <div style="flex: 1; padding: 10px; background: ${floodConfig.bg}; border-radius: 10px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 4px;">
            <span style="width: 10px; height: 10px; background: ${COLORS[floodStatus]}; ${floodConfig.shape}"></span>
            <span style="font-size: 11px; color: #64748b;">💧 ${floodLabel}</span>
          </div>
          <div style="font-size: 13px; font-weight: 600; color: ${floodConfig.color};">${floodConfig.label}</div>
        </div>
        <div style="flex: 1; padding: 10px; background: ${trafficConfig.bg}; border-radius: 10px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 4px;">
            <span style="width: 10px; height: 10px; background: ${COLORS[trafficStatus]}; ${trafficConfig.shape}"></span>
            <span style="font-size: 11px; color: #64748b;">🚗 ${trafficLabel}</span>
          </div>
          <div style="font-size: 13px; font-weight: 600; color: ${trafficConfig.color};">${trafficConfig.label}</div>
        </div>
      </div>

      <div style="font-size: 12px; color: #64748b; display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e2e8f0;">
        ${flood ? `<span>${waterLevelLabel}: <strong>${flood.waterLevel}cm</strong></span>` : '<span></span>'}
        ${traffic ? `<span>${delayLabel}: <strong>+${traffic.estimatedDelay}min</strong></span>` : ''}
      </div>
    </div>
  `;
}
