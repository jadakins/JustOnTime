'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { DayPlan, ACTIVITY_OPTIONS, ActivityType, WeeklyActivity, CustomLocation } from '@/types/life';
import LocationSearchInput from './LocationSearchInput';

// ============================================================================
// ACTIVITY SETUP MODAL
// Slide-up modal for editing activities with location search
// ============================================================================

interface ActivitySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayPlan | null;
  language: Language;
  onSave: (dayOfWeek: number, activity: Partial<WeeklyActivity>) => void;
}

export default function ActivitySetupModal({
  isOpen,
  onClose,
  day,
  language,
  onSave,
}: ActivitySetupModalProps) {
  // Local state for form
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('home');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [customLocation, setCustomLocation] = useState<CustomLocation | null>(null);
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  // Initialize form when day changes
  useEffect(() => {
    if (day?.activity) {
      // Find activity type from destination
      const activityOption = ACTIVITY_OPTIONS.find(a => a.destinationId === day.destination?.id);
      setSelectedActivity(activityOption?.type || 'home');
      setSelectedTime(day.activity.scheduledTime || '18:00');
      setCustomLocation(day.activity.customLocation || null);
      setUseCustomLocation(!!day.activity.customLocation);
    } else {
      // Reset to defaults
      setSelectedActivity('home');
      setSelectedTime('18:00');
      setCustomLocation(null);
      setUseCustomLocation(false);
    }
  }, [day]);

  // Get selected activity option
  const activityOption = ACTIVITY_OPTIONS.find(a => a.type === selectedActivity);

  // Handle save
  const handleSave = () => {
    if (!day || !activityOption) return;

    onSave(day.dayOfWeek, {
      activityName: activityOption.name,
      activityNameId: activityOption.nameId,
      destinationId: activityOption.destinationId,
      scheduledTime: selectedTime,
      customLocation: useCustomLocation ? customLocation || undefined : undefined,
    });

    onClose();
  };

  // Handle activity change
  const handleActivityChange = (type: ActivityType) => {
    setSelectedActivity(type);
    // Reset custom location when changing activity (unless it's "other")
    if (type !== 'other') {
      setUseCustomLocation(false);
      setCustomLocation(null);
    }
  };

  if (!isOpen || !day) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[2000] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-[2001] animate-slide-up">
        <div className="bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {language === 'id' ? 'Edit Kegiatan' : 'Edit Activity'}
                </h2>
                <p className="text-sm text-slate-500">
                  {language === 'id' ? day.dayNameId : day.dayName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Activity Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {language === 'id' ? 'Jenis Kegiatan' : 'Activity Type'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {ACTIVITY_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleActivityChange(option.type)}
                    className={`
                      flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                      ${selectedActivity === option.type
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }
                    `}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-xs text-center text-slate-700 dark:text-slate-300 line-clamp-1">
                      {language === 'id' ? option.nameId : option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location - Either preset or custom */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {language === 'id' ? 'Lokasi' : 'Location'}
                </label>
                {selectedActivity !== 'home' && (
                  <button
                    onClick={() => setUseCustomLocation(!useCustomLocation)}
                    className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400"
                  >
                    {useCustomLocation
                      ? (language === 'id' ? 'Gunakan default' : 'Use default')
                      : (language === 'id' ? 'Lokasi lain' : 'Custom location')
                    }
                  </button>
                )}
              </div>

              {useCustomLocation || selectedActivity === 'other' ? (
                <LocationSearchInput
                  language={language}
                  value={customLocation}
                  onChange={setCustomLocation}
                  placeholder={language === 'id' ? 'Cari lokasi di Jakarta...' : 'Search location in Jakarta...'}
                />
              ) : (
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center gap-3">
                  <span className="text-slate-400">📍</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {activityOption && (language === 'id' ? activityOption.locationNameId : activityOption.locationName)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {language === 'id' ? 'Lokasi default' : 'Default location'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {language === 'id' ? 'Waktu Tiba' : 'Arrival Time'}
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-lg font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-slate-500">
                {language === 'id'
                  ? 'Waktu yang Anda inginkan untuk tiba di lokasi'
                  : 'The time you want to arrive at the location'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>{language === 'id' ? 'Simpan' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
