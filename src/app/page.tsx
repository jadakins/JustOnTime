'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Language, FloodData, TrafficData, WeatherData } from '@/types';
import { DayPlan, WeeklyActivity, RouteDisplayData } from '@/types/life';
import {
  Header,
  MyWeek,
  TodayView,
  HomeLocationEditor,
} from '@/components';
import ActivitySetupModal from '@/components/ActivitySetupModal';
import {
  generateFloodData,
  generateTrafficData,
  generateWeatherData,
} from '@/data/mockData';
import { fetchWeatherData } from '@/services/weatherApi';
import { fetchTrafficData, fetchRouteWithPolyline, getGoogleMapsUrl } from '@/services/googleMapsApi';
import { generateWeeklyPlan, generateComparisonData, getDestinationById } from '@/data/lifeData';
import { officeConfig, homeConfig } from '@/config/locations';
import { CustomLocation } from '@/types/life';

// Dynamic import for map to avoid SSR issues
const LifeMap = dynamic(() => import('@/components/LifeMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl">
      <div className="animate-spin w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full" />
    </div>
  ),
});

// ============================================================================
// LIFE IN JAKARTA - MAIN PAGE
// A lifestyle app that understands you have a rich life beyond commuting
// Designed for presentations to 200+ people (ages 20-75)
// ============================================================================

export default function LifeInJakarta() {
  // Core state
  const [language, setLanguage] = useState<Language>('id');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showComparison, setShowComparison] = useState(false);

  // Data state - start with null, will be set on client mount to avoid hydration mismatch
  const [floodData, setFloodData] = useState<FloodData[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Weekly plan state - now persists user changes!
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);

  // Modal state for activity editing
  const [editingDay, setEditingDay] = useState<DayPlan | null>(null);

  // Route data for map display
  const [routeData, setRouteData] = useState<RouteDisplayData | null>(null);

  // Home location state - editable by user
  const [homeLocation, setHomeLocation] = useState<CustomLocation>({
    id: homeConfig.id,
    name: homeConfig.name,
    address: homeConfig.fullAddress,
    coordinates: homeConfig.coordinates,
  });

  // Initialize on client mount to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    // Set initial mock data on client side only
    setFloodData(generateFloodData());
    setTrafficData(generateTrafficData());
    setWeatherData(generateWeatherData());
  }, []);

  // Initialize weekly plan on mount and when language changes
  useEffect(() => {
    setWeeklyPlan(generateWeeklyPlan('normal', language));
  }, [language]);

  // Get today's plan from the stateful weekly plan
  const todayPlan = useMemo(() => {
    const today = new Date().getDay();
    if (today === 0 || today === 6) return null; // Weekend
    return weeklyPlan.find(p => p.dayOfWeek === today) || null;
  }, [weeklyPlan]);

  // Handler for activity changes from MyWeek
  const handleActivityChange = useCallback((dayOfWeek: number, updates: Partial<WeeklyActivity>) => {
    setWeeklyPlan(prevPlan => {
      return prevPlan.map(day => {
        if (day.dayOfWeek !== dayOfWeek) return day;

        // Determine the new destination
        let newDestination = day.destination;

        // If customLocation is provided, create a destination from it
        if (updates.customLocation) {
          newDestination = {
            id: `custom-${updates.customLocation.id}`,
            name: updates.customLocation.name,
            nameId: updates.customLocation.name,
            shortAddress: updates.customLocation.address.split(',')[0] || updates.customLocation.address,
            fullAddress: updates.customLocation.address,
            coordinates: updates.customLocation.coordinates,
            icon: '📍',
            category: 'other' as const,
          };
        } else if (updates.destinationId) {
          // If destinationId changed, get that destination
          newDestination = getDestinationById(updates.destinationId) || day.destination;
        }

        // Update the activity
        const updatedActivity: WeeklyActivity = {
          ...day.activity!,
          ...updates,
        };

        return {
          ...day,
          activity: updatedActivity,
          destination: newDestination,
        };
      });
    });
  }, []);

  // Comparison data
  const comparison = useMemo(() => {
    return generateComparisonData(language);
  }, [language]);

  // Load data - use real APIs with fallback to mock data
  const loadData = useCallback(async () => {
    // Fetch weather data from WeatherAPI.com
    try {
      const realWeather = await fetchWeatherData();
      setWeatherData(realWeather);
    } catch (error) {
      console.warn('Failed to fetch real weather data, using mock:', error);
      setWeatherData(generateWeatherData());
    }

    // Fetch traffic data from Google Maps
    try {
      const realTraffic = await fetchTrafficData();
      setTrafficData(realTraffic);
    } catch (error) {
      console.warn('Failed to fetch real traffic data, using mock:', error);
      setTrafficData(generateTrafficData());
    }

    // Flood data remains mock for now (no real-time flood API integrated)
    setFloodData(generateFloodData());

    setLastUpdated(new Date());
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Language persistence
  useEffect(() => {
    const savedLang = localStorage.getItem('jakarta-life-language');
    if (savedLang === 'en' || savedLang === 'id') {
      setLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('jakarta-life-language', lang);
  };

  // Handle "Go Home Instead" - changes today's activity to go home
  const handleRerouteHome = useCallback((dayOfWeek: number) => {
    // Find the home activity option
    const homeActivity = {
      activityName: 'Go Home',
      activityNameId: 'Pulang ke Rumah',
      destinationId: 'home',
      scheduledTime: '18:00',
    };

    // Update the activity for the specified day
    handleActivityChange(dayOfWeek, homeActivity);
  }, [handleActivityChange]);

  // Handle opening edit modal
  const handleEditDay = useCallback((day: DayPlan) => {
    setEditingDay(day);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setEditingDay(null);
  }, []);

  // Fetch route data when selected day changes
  useEffect(() => {
    if (selectedDay === null) {
      setRouteData(null);
      return;
    }

    const dayPlan = weeklyPlan.find(p => p.dayOfWeek === selectedDay);
    if (!dayPlan?.destination) {
      setRouteData(null);
      return;
    }

    // Fetch Google route polyline
    const fetchRoute = async () => {
      try {
        const route = await fetchRouteWithPolyline(
          officeConfig.coordinates,
          dayPlan.destination!.coordinates
        );
        setRouteData(route);
      } catch (error) {
        console.warn('Failed to fetch route:', error);
        setRouteData(null);
      }
    };

    fetchRoute();
  }, [selectedDay, weeklyPlan]);

  // Open Google Maps with directions
  const handleOpenInMaps = useCallback(() => {
    const dayPlan = selectedDay !== null
      ? weeklyPlan.find(p => p.dayOfWeek === selectedDay)
      : todayPlan;

    if (dayPlan?.destination) {
      const url = getGoogleMapsUrl(
        officeConfig.coordinates,
        dayPlan.destination.coordinates
      );
      window.open(url, '_blank');
    }
  }, [selectedDay, weeklyPlan, todayPlan]);

  // Loading state - show until client has mounted and data is ready
  if (!isClient || !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-6" />
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {language === 'id' ? 'Memuat kehidupan Jakarta Anda...' : 'Loading your Jakarta life...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        lastUpdated={lastUpdated}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Bar - Office Info + Current Conditions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Office anchor */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">
                {language === 'id' ? 'Dari Kantor' : 'From Office'}
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">
                {officeConfig.shortAddress}
              </p>
            </div>
          </div>

          {/* Current conditions with live time */}
          <LiveConditions weatherData={weatherData} language={language} />
        </div>

        {/* Home Location Editor */}
        <div className="mb-6">
          <HomeLocationEditor
            language={language}
            homeLocation={homeLocation}
            onHomeLocationChange={(location) => {
              if (location) {
                setHomeLocation(location);
              }
            }}
          />
        </div>

        {/* Hero Section - Today's Plan */}
        <div className="mb-6">
          <TodayView
            todayPlan={todayPlan}
            language={language}
            weatherData={weatherData}
            onRerouteHome={handleRerouteHome}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left - My Week Calendar (Hero Feature) */}
          <div className="lg:col-span-5 h-[600px]">
            <MyWeek
              weeklyPlan={weeklyPlan}
              language={language}
              weatherData={weatherData}
              onDaySelect={setSelectedDay}
              selectedDay={selectedDay}
              onActivityChange={handleActivityChange}
              onEditDay={handleEditDay}
            />
          </div>

          {/* Right - Map & Weather */}
          <div className="lg:col-span-7 space-y-6">
            {/* Map */}
            <div className="card h-[380px] overflow-hidden">
              <div className="card-header py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🗺️</span>
                    <h3 className="font-bold text-slate-800 dark:text-white">
                      {language === 'id' ? 'Peta Jakarta Anda' : 'Your Jakarta Map'}
                    </h3>
                  </div>
                  {selectedDay && (
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="text-sm text-violet-600 hover:text-violet-800 dark:text-violet-400"
                    >
                      {language === 'id' ? 'Tampilkan Semua' : 'Show All'}
                    </button>
                  )}
                </div>
              </div>
              <div className="relative h-[calc(100%-60px)]">
                <LifeMap
                  language={language}
                  selectedDay={selectedDay}
                  weeklyPlan={weeklyPlan}
                  routeData={routeData}
                  homeLocation={homeLocation}
                />

                {/* Map Legend - Comprehensive */}
                <MapLegend language={language} />
              </div>
            </div>

            {/* Weather - Compact */}
            <div className="h-[200px]">
              <WeatherCompact weather={weatherData} language={language} />
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <span className="text-2xl">✨</span>
            <span>
              {language === 'id'
                ? 'Lihat Dampak Aplikasi Ini'
                : 'See The Impact'}
            </span>
            <span className={`transition-transform ${showComparison ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showComparison && (
            <ComparisonView comparison={comparison} language={language} />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center pb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-sm">
            <span className="text-2xl">🇮🇩</span>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {language === 'id'
                ? 'Hidup di Jakarta, bukan sekadar bekerja'
                : 'Living in Jakarta, not just commuting'}
            </p>
          </div>
        </footer>
      </main>

      {/* Activity Setup Modal */}
      <ActivitySetupModal
        isOpen={!!editingDay}
        onClose={handleCloseModal}
        day={editingDay}
        language={language}
        onSave={handleActivityChange}
      />
    </div>
  );
}

// ============================================================================
// WEATHER COMPACT - Simplified weather view
// ============================================================================

function WeatherCompact({ weather, language }: { weather: WeatherData; language: Language }) {
  const conditionLabels: Record<string, { en: string; id: string }> = {
    'sunny': { en: 'Sunny', id: 'Cerah' },
    'partly-cloudy': { en: 'Partly Cloudy', id: 'Berawan Sebagian' },
    'cloudy': { en: 'Cloudy', id: 'Berawan' },
    'light-rain': { en: 'Light Rain', id: 'Hujan Ringan' },
    'heavy-rain': { en: 'Heavy Rain', id: 'Hujan Lebat' },
    'thunderstorm': { en: 'Thunderstorm', id: 'Badai Petir' },
  };

  const conditionIcons: Record<string, string> = {
    'sunny': '☀️',
    'partly-cloudy': '⛅',
    'cloudy': '☁️',
    'light-rain': '🌧️',
    'heavy-rain': '⛈️',
    'thunderstorm': '🌩️',
  };

  return (
    <div className="card h-full">
      <div className="p-5 h-full flex items-center">
        <div className="flex items-center gap-6 w-full">
          {/* Current weather */}
          <div className="flex items-center gap-4">
            <span className="text-5xl">{conditionIcons[weather.condition]}</span>
            <div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {Math.round(weather.temperature)}°C
              </p>
              <p className="text-sm text-slate-500">
                {language === 'id' ? conditionLabels[weather.condition].id : conditionLabels[weather.condition].en}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-16 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Hourly forecast - compact */}
          <div className="flex-1 flex gap-4 overflow-x-auto pb-2">
            {weather.forecast.slice(0, 5).map((hour, idx) => (
              <div key={idx} className="flex flex-col items-center flex-shrink-0">
                <span className="text-xs text-slate-500">
                  {new Date(hour.time).getHours()}:00
                </span>
                <span className="text-xl my-1">{conditionIcons[hour.condition]}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {Math.round(hour.temperature)}°
                </span>
                {hour.rainProbability > 50 && (
                  <span className="text-xs text-sky-600">{Math.round(hour.rainProbability)}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPARISON VIEW - Life With vs Without App
// ============================================================================

function ComparisonView({ comparison, language }: {
  comparison: ReturnType<typeof generateComparisonData>;
  language: Language;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
      {/* Without App */}
      <div className="card p-6 border-2 border-slate-200 dark:border-slate-700">
        <div className="text-center mb-4">
          <span className="text-4xl">😰</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-2">
            {language === 'id' ? 'Tanpa Aplikasi' : 'Without App'}
          </h3>
        </div>
        <div className="space-y-3">
          <StatRow
            label={language === 'id' ? 'Rata-rata perjalanan' : 'Avg commute'}
            value={`${comparison.withoutApp.avgCommute} ${language === 'id' ? 'mnt' : 'min'}`}
            bad
          />
          <StatRow
            label={language === 'id' ? 'Waktu hilang/minggu' : 'Time lost/week'}
            value={`${comparison.withoutApp.weeklyTimeLost} ${language === 'id' ? 'jam' : 'hrs'}`}
            bad
          />
          <StatRow
            label={language === 'id' ? 'Tingkat stres' : 'Stress level'}
            value={comparison.withoutApp.stressLevel}
            bad
          />
        </div>
      </div>

      {/* Savings */}
      <div className="card p-6 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
        <div className="text-center mb-4">
          <span className="text-4xl">🎉</span>
          <h3 className="text-lg font-bold mt-2">
            {language === 'id' ? 'Anda Hemat' : 'You Save'}
          </h3>
        </div>
        <div className="space-y-4 text-center">
          <div>
            <p className="text-4xl font-bold">{comparison.savings.timePerMonth}</p>
            <p className="text-sm opacity-80">
              {language === 'id' ? 'jam/bulan' : 'hrs/month'}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold">{comparison.savings.stressReduction}</p>
            <p className="text-sm opacity-80">
              {language === 'id' ? 'stres berkurang' : 'less stress'}
            </p>
          </div>
        </div>
      </div>

      {/* With App */}
      <div className="card p-6 border-2 border-sky-400 bg-sky-50 dark:bg-sky-900/20">
        <div className="text-center mb-4">
          <span className="text-4xl">😎</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-2">
            {language === 'id' ? 'Dengan Aplikasi' : 'With App'}
          </h3>
        </div>
        <div className="space-y-3">
          <StatRow
            label={language === 'id' ? 'Rata-rata perjalanan' : 'Avg commute'}
            value={`${comparison.withApp.avgCommute} ${language === 'id' ? 'mnt' : 'min'}`}
          />
          <StatRow
            label={language === 'id' ? 'Waktu hilang/minggu' : 'Time lost/week'}
            value={`${comparison.withApp.weeklyTimeLost} ${language === 'id' ? 'jam' : 'hrs'}`}
          />
          <StatRow
            label={language === 'id' ? 'Tingkat stres' : 'Stress level'}
            value={comparison.withApp.stressLevel}
          />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`font-semibold ${
        bad ? 'text-purple-600 dark:text-purple-400' : 'text-sky-600 dark:text-sky-400'
      }`}>
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// MAP LEGEND - Comprehensive legend explaining all map icons and colors
// ============================================================================

function MapLegend({ language }: { language: Language }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg z-[1000]">
      {/* Collapsed view */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs">🏢</span>
              <span className="text-slate-600 dark:text-slate-400">{language === 'id' ? 'Kantor' : 'Office'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs">🏠</span>
              <span className="text-slate-600 dark:text-slate-400">{language === 'id' ? 'Rumah' : 'Home'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-xs">📍</span>
              <span className="text-slate-600 dark:text-slate-400">{language === 'id' ? 'Tujuan' : 'Destinations'}</span>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-violet-600 hover:text-violet-800 dark:text-violet-400 font-medium whitespace-nowrap"
          >
            {expanded ? (language === 'id' ? 'Tutup' : 'Close') : (language === 'id' ? 'Info ?' : 'Info ?')}
          </button>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4">
          <h4 className="font-semibold text-sm text-slate-800 dark:text-white">
            {language === 'id' ? 'Apa arti warna-warna ini?' : 'What do these colors mean?'}
          </h4>

          {/* Flood zones */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
              {language === 'id' ? 'Zona Banjir' : 'Flood Zones'}
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 rounded-full bg-sky-500/30 border-2 border-sky-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'id' ? 'Aman - Tidak ada risiko banjir' : 'Safe - No flood risk'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 rounded-full bg-orange-500/30 border-2 border-orange-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'id' ? 'Waspada - Berpotensi banjir ringan' : 'Caution - Potential light flooding'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 rounded-full bg-purple-500/30 border-2 border-purple-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'id' ? 'Hindari - Banjir dilaporkan' : 'Avoid - Flooding reported'}
                </span>
              </div>
            </div>
          </div>

          {/* Traffic levels */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
              {language === 'id' ? 'Lalu Lintas' : 'Traffic Levels'}
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-sky-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'id' ? 'Lancar (< 20 menit)' : 'Light (< 20 min)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-orange-500 rotate-45" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'id' ? 'Sedang (20-40 menit)' : 'Moderate (20-40 min)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'id' ? 'Macet Padat (> 40 menit)' : 'Heavy (> 40 min)'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity icons */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
              {language === 'id' ? 'Jenis Kegiatan' : 'Activity Types'}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-lg" title={language === 'id' ? 'Olahraga' : 'Sports'}>⚽🏸🎾💪</span>
              <span className="text-lg" title={language === 'id' ? 'Makan' : 'Dining'}>🍽️🍜</span>
              <span className="text-lg" title={language === 'id' ? 'Sosial' : 'Social'}>🍸☕</span>
              <span className="text-lg" title={language === 'id' ? 'Keluarga' : 'Family'}>👨‍👩‍👧</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LIVE CONDITIONS - Weather & Traffic with Live Time
// ============================================================================

function LiveConditions({ weatherData, language }: { weatherData: WeatherData; language: Language }) {
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }));
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  // Weather icon mapping
  const weatherIcons: Record<string, string> = {
    'sunny': '☀️',
    'partly-cloudy': '⛅',
    'cloudy': '☁️',
    'light-rain': '🌧️',
    'heavy-rain': '⛈️',
    'thunderstorm': '🌩️',
  };

  // Current traffic based on time of day
  const getTrafficInfo = () => {
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
    const isMidDay = hour >= 11 && hour <= 14;

    if (isRushHour) {
      return { icon: '🔴', label: language === 'id' ? 'Padat' : 'Heavy' };
    } else if (isMidDay) {
      return { icon: '🟡', label: language === 'id' ? 'Sedang' : 'Moderate' };
    }
    return { icon: '🟢', label: language === 'id' ? 'Lancar' : 'Light' };
  };

  const traffic = getTrafficInfo();
  const weatherIcon = weatherIcons[weatherData.condition] || '☀️';

  // Weather condition labels
  const conditionLabels: Record<string, { en: string; id: string }> = {
    'sunny': { en: 'Sunny', id: 'Cerah' },
    'partly-cloudy': { en: 'Partly Cloudy', id: 'Berawan' },
    'cloudy': { en: 'Cloudy', id: 'Mendung' },
    'light-rain': { en: 'Light Rain', id: 'Hujan Ringan' },
    'heavy-rain': { en: 'Heavy Rain', id: 'Hujan Lebat' },
    'thunderstorm': { en: 'Thunderstorm', id: 'Badai Petir' },
  };

  const conditionLabel = conditionLabels[weatherData.condition] || conditionLabels['sunny'];

  return (
    <div className="flex items-center gap-3">
      {/* Time */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm">
        <span className="text-2xl">🕐</span>
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            {currentTime}
          </p>
          <p className="text-xs text-slate-500">
            {language === 'id' ? 'Waktu Lokal' : 'Local Time'}
          </p>
        </div>
      </div>

      {/* Weather */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm">
        <span className="text-2xl">{weatherIcon}</span>
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            {Math.round(weatherData.temperature)}°C
          </p>
          <p className="text-xs text-slate-500">
            {language === 'id' ? conditionLabel.id : conditionLabel.en}
          </p>
        </div>
      </div>

      {/* Traffic */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm">
        <span className="text-2xl">{traffic.icon}</span>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            {traffic.label}
          </p>
          <p className="text-xs text-slate-500">
            {language === 'id' ? 'Lalu Lintas' : 'Traffic'}
          </p>
        </div>
      </div>
    </div>
  );
}
