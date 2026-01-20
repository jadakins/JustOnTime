'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { CustomLocation } from '@/types/life';
import LocationSearchInput from './LocationSearchInput';

// ============================================================================
// OFFICE LOCATION EDITOR
// Allows user to edit their office location
// ============================================================================

interface OfficeLocationEditorProps {
  language: Language;
  officeLocation: CustomLocation;
  onOfficeLocationChange: (location: CustomLocation | null) => void;
}

export default function OfficeLocationEditor({
  language,
  officeLocation,
  onOfficeLocationChange,
}: OfficeLocationEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏢</span>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              {language === 'id' ? 'Lokasi Kantor' : 'Office Location'}
            </h3>
            {!isEditing && (
              <p className="text-xs text-slate-500 truncate max-w-[300px]">
                {officeLocation.address}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
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
            value={officeLocation}
            onChange={(location) => {
              if (location) {
                onOfficeLocationChange(location);
                setIsEditing(false);
              }
            }}
            placeholder={language === 'id' ? 'Cari lokasi kantor baru...' : 'Search for office location...'}
          />
        </div>
      )}
    </div>
  );
}
