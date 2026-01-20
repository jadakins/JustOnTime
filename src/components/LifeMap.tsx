'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Language } from '@/types';
import { Destination, DayPlan, RouteDisplayData, CustomLocation } from '@/types/life';

// ============================================================================
// LIFE MAP - SIMPLIFIED MAP VIEW
// Shows only Office, Home, and the current/selected day's destination
// Clean and focused - no clutter
// ============================================================================

interface LifeMapProps {
  language: Language;
  selectedDay: number | null;
  weeklyPlan: DayPlan[];
  routeData?: RouteDisplayData | null;
  homeLocation: CustomLocation;
  officeLocation: CustomLocation;
}

// Marker colors
const COLORS = {
  office: '#1e40af',
  home: '#059669',
  destination: '#7c3aed',
};

// Traffic colors for route segments
const TRAFFIC_COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

export default function LifeMap({
  language,
  selectedDay,
  weeklyPlan,
  routeData,
  homeLocation,
  officeLocation,
}: LifeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const routeSegmentsRef = useRef<L.Polyline[]>([]);

  // Initialize map centered on office
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: officeLocation.coordinates,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Clean map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18,
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Get today's day of week
  const today = new Date().getDay();

  // Determine which destination to show (selected day or today)
  const activeDayPlan = selectedDay !== null
    ? weeklyPlan.find(p => p.dayOfWeek === selectedDay)
    : weeklyPlan.find(p => p.dayOfWeek === today);

  // Update markers - SIMPLIFIED: Only show Office, Home, and active destination
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing routes
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    routeSegmentsRef.current.forEach(segment => segment.remove());
    routeSegmentsRef.current = [];

    // Convert homeLocation (CustomLocation) to Destination format
    const homeDestination: Destination = {
      id: homeLocation.id,
      name: homeLocation.name,
      nameId: homeLocation.name,
      shortAddress: homeLocation.address.split(',')[0] || homeLocation.address,
      fullAddress: homeLocation.address,
      coordinates: homeLocation.coordinates,
      icon: '🏠',
      category: 'home',
    };

    // 1. Add Office marker (always visible, prominent)
    const officeIcon = createOfficeIcon();
    const officeMarker = L.marker(officeLocation.coordinates, { icon: officeIcon })
      .addTo(mapRef.current)
      .bindPopup(createOfficePopup(officeLocation, language));
    markersRef.current.push(officeMarker);

    // 2. Add Home marker (always visible)
    const homeIcon = createDestinationIcon(homeDestination, activeDayPlan?.destination?.id === 'home');
    const homeMarker = L.marker(homeDestination.coordinates, { icon: homeIcon })
      .addTo(mapRef.current)
      .bindPopup(createDestinationPopup(homeDestination, language));
    markersRef.current.push(homeMarker);

    // 3. Add active destination marker (only if not home and exists)
    if (activeDayPlan?.destination && activeDayPlan.destination.id !== 'home') {
      const destIcon = createDestinationIcon(activeDayPlan.destination, true);
      const destMarker = L.marker(activeDayPlan.destination.coordinates, { icon: destIcon })
        .addTo(mapRef.current)
        .bindPopup(createDestinationPopup(activeDayPlan.destination, language));
      markersRef.current.push(destMarker);
    }

    // 4. Draw route from Office to destination
    if (activeDayPlan?.destination) {
      // Use Google route polyline if available
      if (routeData?.decodedPath && routeData.decodedPath.length > 0) {
        const path: L.LatLngExpression[] = routeData.decodedPath.map(
          ([lat, lng]) => [lat, lng] as L.LatLngExpression
        );

        // Draw route with traffic color
        if (routeData.trafficSegments && routeData.trafficSegments.length > 0) {
          routeData.trafficSegments.forEach(segment => {
            const segmentPath = path.slice(segment.startIndex, segment.endIndex + 1);
            const segmentLine = L.polyline(segmentPath, {
              color: TRAFFIC_COLORS[segment.color],
              weight: 6,
              opacity: 0.9,
            }).addTo(mapRef.current!);
            routeSegmentsRef.current.push(segmentLine);
          });
        } else {
          routeLayerRef.current = L.polyline(path, {
            color: '#7c3aed',
            weight: 5,
            opacity: 0.8,
          }).addTo(mapRef.current);
        }

        // Fit bounds to show route
        const bounds = L.latLngBounds(path);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      } else {
        // Fallback: Draw dashed line between points
        const routeCoords: L.LatLngExpression[] = [
          officeLocation.coordinates,
          activeDayPlan.destination.coordinates,
        ];

        routeLayerRef.current = L.polyline(routeCoords, {
          color: '#7c3aed',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
        }).addTo(mapRef.current);

        // Fit bounds to show route
        const bounds = L.latLngBounds(routeCoords);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      // No destination - just show office and home
      const bounds = L.latLngBounds([officeLocation.coordinates, homeLocation.coordinates]);
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [language, selectedDay, weeklyPlan, routeData, activeDayPlan, today, homeLocation, officeLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 rounded-xl z-0"
      style={{ minHeight: '300px' }}
    />
  );
}

// ============================================================================
// MARKER CREATORS
// ============================================================================

function createOfficeIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 20px rgba(30, 64, 175, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      ">
        🏢
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
  });
}

function createDestinationIcon(dest: Destination, isActive: boolean): L.DivIcon {
  const size = isActive ? 48 : 40;
  const bgColor = dest.id === 'home' ? COLORS.home : COLORS.destination;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${bgColor};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isActive ? '20px' : '16px'};
        ${isActive ? 'animation: pulse 2s infinite;' : ''}
      ">
        ${dest.icon}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createOfficePopup(officeLocation: CustomLocation, language: Language): string {
  return `
    <div style="padding: 12px; font-family: -apple-system, sans-serif; min-width: 200px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="font-size: 28px;">🏢</span>
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1e40af;">
            ${officeLocation.name}
          </h3>
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            ${language === 'id' ? 'Kantor' : 'Office'}
          </p>
        </div>
      </div>
      <p style="margin: 0; font-size: 12px; color: #64748b;">
        ${officeLocation.address}
      </p>
    </div>
  `;
}

function createDestinationPopup(dest: Destination, language: Language): string {
  const categoryLabels: Record<string, { en: string; id: string }> = {
    home: { en: 'Home', id: 'Rumah' },
    sports: { en: 'Sports', id: 'Olahraga' },
    dining: { en: 'Dining', id: 'Makan' },
    social: { en: 'Social', id: 'Sosial' },
    family: { en: 'Family', id: 'Keluarga' },
    other: { en: 'Other', id: 'Lainnya' },
  };

  const category = categoryLabels[dest.category] || categoryLabels.other;

  return `
    <div style="padding: 12px; font-family: -apple-system, sans-serif; min-width: 180px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="font-size: 28px;">${dest.icon}</span>
        <div>
          <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #1e293b;">
            ${language === 'id' ? dest.nameId : dest.name}
          </h3>
          <p style="margin: 0; font-size: 11px; color: #7c3aed; font-weight: 500;">
            ${language === 'id' ? category.id : category.en}
          </p>
        </div>
      </div>
      <p style="margin: 0; font-size: 12px; color: #64748b;">
        ${dest.shortAddress}
      </p>
    </div>
  `;
}
