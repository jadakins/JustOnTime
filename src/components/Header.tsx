'use client';

import { Language } from '@/types';
import { format } from 'date-fns';

// ============================================================================
// HEADER COMPONENT
// Life in Jakarta branding with language toggle
// Clean, modern design for all ages (20-75)
// ============================================================================

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  lastUpdated: Date;
}

export default function Header({ language, onLanguageChange, lastUpdated }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-5">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            {/* App icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-3xl">🌆</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {language === 'id' ? 'Hidup di Jakarta' : 'Life in Jakarta'}
              </h1>
              <p className="text-violet-200 text-sm hidden sm:block">
                {language === 'id'
                  ? 'Lebih dari sekadar perjalanan'
                  : 'More than just a commute'}
              </p>
            </div>
          </div>

          {/* Right side: Language toggle and timestamp */}
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            {/* Last updated - subtle */}
            <div className="text-violet-200 text-xs sm:text-sm">
              <span className="hidden sm:inline">
                {language === 'id' ? 'Diperbarui' : 'Updated'}:{' '}
              </span>
              {format(lastUpdated, 'HH:mm')}
            </div>

            {/* Language toggle - prominent */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1">
              <button
                onClick={() => onLanguageChange('id')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  language === 'id'
                    ? 'bg-white text-violet-700 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🇮🇩 ID
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-white text-violet-700 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
