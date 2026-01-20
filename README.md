# Jakarta Flood & Traffic Dashboard

Real-time flood and traffic monitoring dashboard for Jakarta with smart departure planning. Built for leadership presentations demonstrating technology solutions to Jakarta's biggest problems: flooding and traffic.

![Dashboard Preview](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Jakarta+Flood+%26+Traffic+Dashboard)

## Features

- **Real-time Flood Warnings**: Color-coded severity levels with predictions for 1, 3, and 6 hours ahead
- **Traffic Conditions**: Live traffic data integrated with flood impact for all Jakarta regions
- **Departure Calculator**: Smart recommendations for optimal departure times based on traffic + flood risk
- **Weather Forecast**: 12-hour forecast with rain probability - crucial for flood prediction
- **Interactive Map**: Visual overview of all regions with combined flood/traffic status
- **Bilingual Support**: Full Indonesian and English language support

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository (or navigate to the project folder)
cd jakarta-flood-traffic-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind + custom styles
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main dashboard page
├── components/
│   ├── Header.tsx           # App header with language toggle
│   ├── FloodWarningPanel.tsx    # Flood warnings by region
│   ├── TrafficPanel.tsx         # Traffic conditions
│   ├── DepartureCalculator.tsx  # Optimal departure calculator
│   ├── WeatherPanel.tsx         # Weather forecast
│   ├── MapView.tsx              # Map wrapper component
│   └── LeafletMap.tsx           # Leaflet map implementation
├── data/
│   ├── regions.ts       # Jakarta region definitions
│   └── mockData.ts      # Mock data generators
├── i18n/
│   └── translations.ts  # Indonesian/English translations
└── types/
    └── index.ts         # TypeScript type definitions
```

## Customizing Data Sources

### Replacing Mock Data with Real APIs

The dashboard uses mock data generators in `src/data/mockData.ts`. To integrate real APIs:

1. **Flood Data**: Replace `generateFloodData()` with calls to:
   - BMKG (Indonesian Meteorology Agency) API
   - Jakarta Smart City flood sensors
   - BPBD Jakarta emergency data

```typescript
// Example: src/data/mockData.ts
export async function fetchFloodData(): Promise<FloodData[]> {
  const response = await fetch('YOUR_FLOOD_API_ENDPOINT');
  const data = await response.json();
  // Transform to FloodData[] format
  return transformFloodData(data);
}
```

2. **Traffic Data**: Replace `generateTrafficData()` with:
   - Google Maps Traffic API
   - HERE Traffic API
   - Jakarta CCTV/sensor data

3. **Weather Data**: Replace `generateWeatherData()` with:
   - BMKG weather API
   - OpenWeatherMap API
   - AccuWeather API

### Adding New Regions

Edit `src/data/regions.ts`:

```typescript
export const jakartaRegions: Region[] = [
  // ... existing regions
  {
    id: 'new-region-id',
    name: 'New Region Name',
    nameId: 'Nama Wilayah Baru',
    coordinates: [latitude, longitude],
    floodZones: ['Zone 1', 'Zone 2'],
  },
];
```

## Adding New Features

### Adding a New Dashboard Panel

1. Create component in `src/components/NewPanel.tsx`
2. Export from `src/components/index.ts`
3. Add to main page in `src/app/page.tsx`
4. Add translations to `src/i18n/translations.ts`

### Adding New Language Support

1. Add new language key to `Language` type in `src/types/index.ts`
2. Add translations object in `src/i18n/translations.ts`
3. Add language toggle button in `src/components/Header.tsx`

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t jakarta-dashboard .
docker run -p 3000:3000 jakarta-dashboard
```

### Static Export

```bash
# Add to next.config.js: output: 'export'
npm run build
# Deploy the 'out' folder to any static host
```

## API Integration Reference

### Expected API Response Formats

**Flood API**:
```json
{
  "regionId": "jakarta-utara",
  "level": "high",
  "waterLevel": 85,
  "prediction": {
    "nextHour": "high",
    "next3Hours": "high",
    "next6Hours": "medium"
  },
  "affectedAreas": ["Penjaringan", "Pademangan"]
}
```

**Traffic API**:
```json
{
  "regionId": "jakarta-pusat",
  "level": "medium",
  "averageSpeed": 25,
  "estimatedDelay": 20,
  "congestionPoints": ["Jl. Sudirman", "Bundaran HI"]
}
```

**Weather API**:
```json
{
  "temperature": 29,
  "humidity": 85,
  "condition": "heavy-rain",
  "rainfall": 25,
  "forecast": [...]
}
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet / React-Leaflet
- **Charts**: Recharts (optional, for future analytics)
- **Date Handling**: date-fns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check for issues
5. Submit a pull request

## License

MIT License - feel free to use this for any purpose.

---

**Built with technology to solve real problems in Jakarta** 🇮🇩
