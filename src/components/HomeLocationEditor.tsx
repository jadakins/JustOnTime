'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { CustomLocation } from '@/types/life';
import LocationSearchInput from './LocationSearchInput';

// ============================================================================
// HOME LOCATION EDITOR
// Allows user to edit their home location
// ============================================================================

interface HomeLocationEditorProps {
  language: Language;
  homeLocation: CustomLocation;
  onHomeLocationChange: (location: CustomLocation | null) => void;
}

export default function HomeLocationEditor({
  language,
  homeLocation,
  onHomeLocationChange,
}: HomeLocationEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏠</span>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              {language === 'id' ? 'Lokasi Rumah' : 'Home Location'}
            </h3>
            {!isEditing && (
              <p className="text-xs text-slate-500 truncate max-w-[300px]">
                {homeLocation.address}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium px-3 py-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          {isEditing
            ? (language === 'id' ? 'Batal' : 'Cancel')
            : (language === 'id' ? 'Ubah' : 'Edit')}
        </button>
      </div>

      {isEditing && (
        <div className="mt-3">
          <LocationSearchInput
            language={language}
            value={homeLocation}
            onChange={(location) => {
              if (location) {
                onHomeLocationChange(location);
                setIsEditing(false);
              }
            }}
            placeholder={language === 'id' ? 'Cari lokasi rumah baru...' : 'Search for home location...'}
          />
        </div>
      )}
    </div>
  );
}
