// ============================================================================
// COMPONENT EXPORTS
// Central export file for all dashboard components
// ============================================================================

// Core dashboard components
export { default as Header } from './Header';
export { default as FloodWarningPanel } from './FloodWarningPanel';
export { default as TrafficPanel } from './TrafficPanel';
export { default as DepartureCalculator } from './DepartureCalculator';
export { default as WeatherPanel } from './WeatherPanel';
export { default as MapView } from './MapView';

// Life in Jakarta components
export { default as MyWeek } from './MyWeek';
export { default as TodayView } from './TodayView';
export { default as TimeSlider, TimeComparisonCards } from './TimeSlider';
// NOTE: LifeMap is NOT exported here to avoid SSR issues with Leaflet
// Import it directly with dynamic() in your page: import('@/components/LifeMap')
