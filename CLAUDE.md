# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jakarta Flood & Traffic Dashboard - A Next.js application providing real-time flood warnings, traffic conditions, and smart departure planning for Jakarta residents. Designed for a leadership presentation to 200 people demonstrating technology solutions to Jakarta's flooding and traffic problems.

## Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture

### Data Flow
Real APIs are used for all data fetching. The main page (`src/app/page.tsx`) fetches data from Google Maps API, WeatherAPI.com, and other real-time sources on mount and refreshes every 30 seconds. Data flows down to components via props. **Do not use mock data** - all data must come from real APIs.

### Component Structure
- `Header` - Language toggle (ID/EN), timestamp display
- `FloodWarningPanel` - Region-based flood alerts with severity prediction
- `TrafficPanel` - Traffic conditions integrated with flood data
- `DepartureCalculator` - Optimal departure time recommendations (user inputs: earliest time, home/office locations, direction)
- `WeatherPanel` - Current conditions + 12-hour forecast
- `MapView` / `LeafletMap` - Interactive map with region markers (dynamically loaded to avoid SSR issues)

### State Management
React useState at page level, no external state library. Language preference persisted to localStorage.

### Internationalization
`src/i18n/translations.ts` contains all strings in Indonesian (`id`) and English (`en`). Use `useTranslations(language)` hook to get `t()` function.

### Type Definitions
All types in `src/types/index.ts`. Key types: `FloodData`, `TrafficData`, `WeatherData`, `DepartureRecommendation`, `SeverityLevel` ('low' | 'medium' | 'high').

## Key Implementation Details

### ⚠️ No Mock Data Rule
**Never use mock data generators.** All data must come from real APIs:
- **Weather**: Use `fetchWeatherData()` from `src/services/weatherApi.ts` (WeatherAPI.com)
- **Traffic**: Use `fetchTrafficData()` from `src/services/googleMapsApi.ts` (Google Maps API)
- **Routes**: Use `fetchRouteWithPolyline()` from `src/services/googleMapsApi.ts` (Google Maps API)
- **Flood Data**: Will be integrated with real-time flood sensors (TBD)

Do not import or call functions from `src/data/mockData.ts`. If API calls fail, return empty/null data rather than falling back to mock data.

### Adding Regions
Edit `src/data/regions.ts` - add new entry to `jakartaRegions` array with coordinates and flood zones.

### Severity Colors
Defined in `tailwind.config.js` and CSS classes: `badge-low`/`badge-medium`/`badge-high`, `status-dot-low`/`status-dot-medium`/`status-dot-high`.

### Map Implementation
Leaflet loaded dynamically in `MapView.tsx` to avoid Next.js SSR hydration issues. Markers created with custom `L.divIcon` for consistent styling.
