'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Language } from '@/types';
import { CustomLocation } from '@/types/life';
import { searchPlaces, PlaceResult } from '@/services/googleMapsApi';

// ============================================================================
// LOCATION SEARCH INPUT
// Searchable dropdown with preset Jakarta locations + custom entry
// ============================================================================

// Preset popular Jakarta locations for quick selection
const PRESET_LOCATIONS: CustomLocation[] = [
  { id: 'gi', name: 'Grand Indonesia', address: 'Jl. M.H. Thamrin No.1, Jakarta Pusat', coordinates: [-6.1954, 106.8214] },
  { id: 'pi-mall', name: 'Pondok Indah Mall', address: 'Jl. Metro Pondok Indah, Jakarta Selatan', coordinates: [-6.2656, 106.7837] },
  { id: 'scbd', name: 'SCBD', address: 'Sudirman Central Business District, Jakarta Selatan', coordinates: [-6.2272, 106.8082] },
  { id: 'senayan', name: 'Senayan City', address: 'Jl. Asia Afrika No.19, Jakarta Pusat', coordinates: [-6.2271, 106.7972] },
  { id: 'kemang', name: 'Kemang', address: 'Jl. Kemang Raya, Jakarta Selatan', coordinates: [-6.2607, 106.8137] },
  { id: 'menteng', name: 'Menteng', address: 'Menteng, Jakarta Pusat', coordinates: [-6.1944, 106.8456] },
  { id: 'kuningan', name: 'Kuningan', address: 'Kuningan, Jakarta Selatan', coordinates: [-6.2297, 106.8295] },
  { id: 'kelapa-gading', name: 'Kelapa Gading', address: 'Kelapa Gading, Jakarta Utara', coordinates: [-6.1589, 106.9057] },
  { id: 'plaza-indonesia', name: 'Plaza Indonesia', address: 'Jl. M.H. Thamrin No.28-30, Jakarta Pusat', coordinates: [-6.1930, 106.8230] },
  { id: 'pacific-place', name: 'Pacific Place', address: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan', coordinates: [-6.2241, 106.8097] },
  { id: 'central-park', name: 'Central Park Mall', address: 'Jl. Letjen S. Parman Kav. 28, Jakarta Barat', coordinates: [-6.1766, 106.7907] },
  { id: 'pik', name: 'Pantai Indah Kapuk (PIK)', address: 'Pantai Indah Kapuk, Jakarta Utara', coordinates: [-6.1089, 106.7419] },
  { id: 'ancol', name: 'Ancol', address: 'Taman Impian Jaya Ancol, Jakarta Utara', coordinates: [-6.1267, 106.8310] },
  { id: 'monas', name: 'Monas', address: 'Monumen Nasional, Jakarta Pusat', coordinates: [-6.1754, 106.8272] },
  { id: 'blok-m', name: 'Blok M', address: 'Blok M, Kebayoran Baru, Jakarta Selatan', coordinates: [-6.2436, 106.7981] },
  { id: 'tebet', name: 'Tebet', address: 'Tebet, Jakarta Selatan', coordinates: [-6.2269, 106.8516] },
  { id: 'citos', name: 'Cilandak Town Square', address: 'Jl. TB Simatupang Kav. 17, Jakarta Selatan', coordinates: [-6.2911, 106.7983] },
  { id: 'pondok-indah', name: 'Pondok Indah', address: 'Pondok Indah, Jakarta Selatan', coordinates: [-6.2639, 106.7847] },
];

interface LocationSearchInputProps {
  language: Language;
  value?: CustomLocation | null;
  onChange: (location: CustomLocation | null) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSearchInput({
  language,
  value,
  onChange,
  placeholder,
  className = '',
}: LocationSearchInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [googlePlaces, setGooglePlaces] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set initial query from value
  useEffect(() => {
    if (value) {
      setQuery(value.name);
    }
  }, [value]);

  // Search Google Places when query changes (with debounce)
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setGooglePlaces([]);
      setSearchError(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(false);
      try {
        const results = await searchPlaces(query, language);
        setGooglePlaces(results);
        if (results.length === 0) {
          setSearchError(true);
        }
      } catch (error) {
        console.error('Google Places search failed:', error);
        setSearchError(true);
        setGooglePlaces([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimeout);
  }, [query, language]);

  // Filter preset locations based on query (fallback)
  const filteredLocations = useMemo(() => {
    if (!query.trim()) return PRESET_LOCATIONS.slice(0, 8); // Show first 8 when empty

    const searchTerm = query.toLowerCase();
    return PRESET_LOCATIONS.filter(
      loc =>
        loc.name.toLowerCase().includes(searchTerm) ||
        loc.address.toLowerCase().includes(searchTerm)
    ).slice(0, 8);
  }, [query]);

  // Combine Google Places and preset locations
  const allLocations = useMemo(() => {
    // If Google Places returned results, prioritize them
    if (googlePlaces.length > 0) {
      const googleAsCustom: CustomLocation[] = googlePlaces.map(place => ({
        id: place.placeId,
        name: place.name,
        address: place.address,
        coordinates: place.coordinates,
      }));
      return googleAsCustom;
    }
    // Otherwise show preset locations
    return filteredLocations;
  }, [googlePlaces, filteredLocations]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setShowCustomInput(false);
  };

  // Handle place selection
  const handleSelectPlace = (location: CustomLocation) => {
    setQuery(location.name);
    setIsOpen(false);
    onChange(location);
  };

  // Handle custom address save
  const handleSaveCustom = () => {
    if (!customAddress.trim()) return;

    const customLocation: CustomLocation = {
      id: `custom-${Date.now()}`,
      name: customAddress.split(',')[0].trim(),
      address: customAddress,
      coordinates: [-6.2088, 106.8456], // Default to Jakarta center
    };

    setQuery(customLocation.name);
    setIsOpen(false);
    setShowCustomInput(false);
    onChange(customLocation);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setCustomAddress('');
    onChange(null);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open Google Maps
  const openInGoogleMaps = () => {
    if (value?.coordinates) {
      const [lat, lng] = value.coordinates;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        '_blank'
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-400">📍</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || (language === 'id' ? 'Cari lokasi di Jakarta...' : 'Search Jakarta location...')}
          className="w-full pl-10 pr-20 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
              title={language === 'id' ? 'Hapus' : 'Clear'}
            >
              <span className="text-slate-400 text-sm">✕</span>
            </button>
          )}
          {value?.coordinates && (
            <button
              onClick={openInGoogleMaps}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
              title={language === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}
            >
              <span className="text-sm">🗺️</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-[2100] w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-72 overflow-y-auto"
        >
          {/* Loading indicator */}
          {isSearching && (
            <div className="px-4 py-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {language === 'id' ? 'Mencari lokasi...' : 'Searching locations...'}
              </p>
            </div>
          )}

          {/* Results */}
          {!isSearching && allLocations.length > 0 && !showCustomInput && (
            <>
              <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">
                {googlePlaces.length > 0
                  ? (language === 'id' ? 'Hasil dari Google Maps' : 'Results from Google Maps')
                  : (language === 'id' ? 'Lokasi Populer' : 'Popular Locations')}
              </div>
              {allLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelectPlace(location)}
                  className="w-full px-4 py-3 text-left hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-violet-500 mt-0.5">📍</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-white">
                        {location.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {location.address}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* No results message */}
          {!isSearching && allLocations.length === 0 && query.length >= 3 && !showCustomInput && (
            <div className="px-4 py-4 text-center text-slate-500">
              <p className="text-sm mb-2">
                {language === 'id' ? 'Lokasi tidak ditemukan' : 'Location not found'}
              </p>
              <button
                onClick={() => setShowCustomInput(true)}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                {language === 'id' ? '+ Masukkan alamat manual' : '+ Enter address manually'}
              </button>
            </div>
          )}

          {/* Custom address entry option */}
          {!isSearching && !showCustomInput && allLocations.length > 0 && (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-200 dark:border-slate-600"
            >
              <div className="flex items-center gap-3 text-violet-600 dark:text-violet-400">
                <span>✏️</span>
                <span className="text-sm font-medium">
                  {language === 'id' ? 'Masukkan alamat lain...' : 'Enter custom address...'}
                </span>
              </div>
            </button>
          )}

          {/* Custom address input form */}
          {showCustomInput && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>✏️</span>
                <span>{language === 'id' ? 'Masukkan alamat lengkap' : 'Enter full address'}</span>
              </div>
              <textarea
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Jl. Sudirman No. 123, Jakarta Selatan' : 'Example: Jl. Sudirman No. 123, South Jakarta'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 py-2 px-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveCustom}
                  disabled={!customAddress.trim()}
                  className="flex-1 py-2 px-3 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'id' ? 'Simpan' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected location display */}
      {value && !isOpen && (
        <div className="mt-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg flex items-center gap-2">
          <span className="text-violet-500">✓</span>
          <span className="text-sm text-violet-700 dark:text-violet-300 truncate">
            {value.address}
          </span>
        </div>
      )}
    </div>
  );
}
