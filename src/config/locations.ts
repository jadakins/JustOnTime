// ============================================================================
// JAKARTA LIFE CONFIG
// Edit this file to customize office, destinations, and weekly patterns
// All coordinates are [latitude, longitude]
// ============================================================================

import { Destination, WeeklyActivity, OfficeConfig } from '@/types/life';

// ============================================================================
// OFFICE CONFIGURATION
// The anchor point for all calculations
// ============================================================================

export const officeConfig: OfficeConfig = {
  name: 'Sinarmas MSIG',
  nameId: 'Sinarmas MSIG',
  fullAddress: 'Sinarmas MSIG Jl. Jenderal Sudirman No.21 Lt.7 Kav, RT.10/RW.1, Kuningan, Karet, Kecamatan Setiabudi, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12920, Indonesia',
  shortAddress: 'Sinarmas MSIG, Sudirman',
  coordinates: [-6.210336881136443, 106.82226110946749],
  // Branding - customize for your company
  companyName: 'Sinarmas MSIG',
  icon: '🏢',
};

// ============================================================================
// HOME LOCATION
// Primary residence
// ============================================================================

export const homeConfig: Destination = {
  id: 'home',
  name: 'Home',
  nameId: 'Rumah',
  shortAddress: 'Pondok Indah, South Jakarta',
  fullAddress: 'Pondok Indah, Kebayoran Lama, South Jakarta',
  coordinates: [-6.2673, 106.7831],
  icon: '🏠',
  category: 'home',
};

// ============================================================================
// SAVED DESTINATIONS
// Regular places you visit - sports, dining, social
// ============================================================================

export const savedDestinations: Destination[] = [
  // Sports Venues
  {
    id: 'futsal-kemang',
    name: 'Kemang Futsal Arena',
    nameId: 'Arena Futsal Kemang',
    shortAddress: 'Kemang, South Jakarta',
    fullAddress: 'Jl. Kemang Raya No. 45, Mampang Prapatan',
    coordinates: [-6.2600, 106.8150],
    icon: '⚽',
    category: 'sports',
  },
  {
    id: 'badminton-pi',
    name: 'Pondok Indah Sports Club',
    nameId: 'Pondok Indah Sports Club',
    shortAddress: 'Pondok Indah, South Jakarta',
    fullAddress: 'Jl. Metro Pondok Indah Kav. IV',
    coordinates: [-6.2690, 106.7850],
    icon: '🏸',
    category: 'sports',
  },
  {
    id: 'padel-senopati',
    name: 'Padel Club Senopati',
    nameId: 'Padel Club Senopati',
    shortAddress: 'Senopati, South Jakarta',
    fullAddress: 'Jl. Senopati No. 88, Kebayoran Baru',
    coordinates: [-6.2290, 106.8050],
    icon: '🎾',
    category: 'sports',
  },
  {
    id: 'gym-scbd',
    name: 'Fitness First SCBD',
    nameId: 'Fitness First SCBD',
    shortAddress: 'SCBD, South Jakarta',
    fullAddress: 'Pacific Place Mall, SCBD Lot 3-5',
    coordinates: [-6.2241, 106.8094],
    icon: '💪',
    category: 'sports',
  },
  {
    id: 'golf-senayan',
    name: 'Senayan Golf Course',
    nameId: 'Lapangan Golf Senayan',
    shortAddress: 'Senayan, Central Jakarta',
    fullAddress: 'Jl. Asia Afrika, Senayan',
    coordinates: [-6.2191, 106.8028],
    icon: '⛳',
    category: 'sports',
  },
  // Dining
  {
    id: 'dinner-scbd',
    name: 'Social House SCBD',
    nameId: 'Social House SCBD',
    shortAddress: 'SCBD, South Jakarta',
    fullAddress: 'Pacific Place Mall, SCBD',
    coordinates: [-6.2180, 106.8210],
    icon: '🍽️',
    category: 'dining',
  },
  {
    id: 'dinner-pik',
    name: 'PIK Avenue',
    nameId: 'PIK Avenue',
    shortAddress: 'PIK, North Jakarta',
    fullAddress: 'Pantai Indah Kapuk, Penjaringan',
    coordinates: [-6.1090, 106.7450],
    icon: '🍜',
    category: 'dining',
  },
  {
    id: 'dinner-menteng',
    name: 'Plataran Menteng',
    nameId: 'Plataran Menteng',
    shortAddress: 'Menteng, Central Jakarta',
    fullAddress: 'Jl. HOS Cokroaminoto No. 42, Menteng',
    coordinates: [-6.1920, 106.8320],
    icon: '🍽️',
    category: 'dining',
  },
  // Social
  {
    id: 'drinks-sudirman',
    name: 'Cloud Lounge & Living Room',
    nameId: 'Cloud Lounge',
    shortAddress: 'Sudirman, Central Jakarta',
    fullAddress: 'The Plaza Office Tower, Jl. MH Thamrin',
    coordinates: [-6.1950, 106.8230],
    icon: '🍸',
    category: 'social',
  },
  {
    id: 'coffee-menteng',
    name: 'Tanamera Coffee',
    nameId: 'Tanamera Coffee',
    shortAddress: 'Menteng, Central Jakarta',
    fullAddress: 'Jl. Cikini Raya No. 60, Menteng',
    coordinates: [-6.1920, 106.8420],
    icon: '☕',
    category: 'social',
  },
  {
    id: 'bar-senopati',
    name: 'Cork & Screw',
    nameId: 'Cork & Screw',
    shortAddress: 'Senopati, South Jakarta',
    fullAddress: 'Jl. Senopati No. 39, Kebayoran Baru',
    coordinates: [-6.2275, 106.8065],
    icon: '🍷',
    category: 'social',
  },
  // Shopping & Entertainment
  {
    id: 'mall-gi',
    name: 'Grand Indonesia',
    nameId: 'Grand Indonesia',
    shortAddress: 'Thamrin, Central Jakarta',
    fullAddress: 'Jl. MH Thamrin No.1',
    coordinates: [-6.1954, 106.8203],
    icon: '🛍️',
    category: 'other',
  },
  {
    id: 'movies-pi',
    name: 'Pondok Indah Mall XXI',
    nameId: 'Pondok Indah Mall XXI',
    shortAddress: 'Pondok Indah, South Jakarta',
    fullAddress: 'Pondok Indah Mall 2',
    coordinates: [-6.2650, 106.7830],
    icon: '🎬',
    category: 'other',
  },
  // Family
  {
    id: 'parents-house',
    name: "Parents' House",
    nameId: 'Rumah Orang Tua',
    shortAddress: 'Menteng, Central Jakarta',
    fullAddress: 'Jl. Teuku Cik Ditiro, Menteng',
    coordinates: [-6.1980, 106.8350],
    icon: '👨‍👩‍👧',
    category: 'family',
  },
  // Religious
  {
    id: 'mosque-istiqlal',
    name: 'Istiqlal Mosque',
    nameId: 'Masjid Istiqlal',
    shortAddress: 'Central Jakarta',
    fullAddress: 'Jl. Taman Wijaya Kusuma, Pasar Baru',
    coordinates: [-6.1702, 106.8311],
    icon: '🕌',
    category: 'other',
  },
];

// ============================================================================
// WEEKLY ACTIVITY PATTERN
// Default weekly schedule - customize for your lifestyle
// Times are in 24-hour format
// ============================================================================

export const defaultWeeklyPattern: WeeklyActivity[] = [
  {
    id: 'monday-padel',
    dayOfWeek: 1, // Monday
    destinationId: 'padel-senopati',
    activityName: 'Padel',
    activityNameId: 'Padel',
    scheduledTime: '19:00',
    notes: 'Weekly game with colleagues at Senopati',
    notesId: 'Permainan mingguan dengan rekan kerja di Senopati',
  },
  {
    id: 'tuesday-dinner',
    dayOfWeek: 2, // Tuesday
    destinationId: 'dinner-scbd',
    activityName: 'Dinner at SCBD',
    activityNameId: 'Makan Malam di SCBD',
    scheduledTime: '19:30',
    notes: 'Dinner with friends at Social House',
    notesId: 'Makan malam dengan teman di Social House',
  },
  {
    id: 'wednesday-home',
    dayOfWeek: 3, // Wednesday
    destinationId: 'home',
    activityName: 'Straight Home',
    activityNameId: 'Langsung Pulang',
    scheduledTime: '18:00',
    notes: 'Early home for family time',
    notesId: 'Pulang awal untuk waktu keluarga',
  },
  {
    id: 'thursday-badminton',
    dayOfWeek: 4, // Thursday
    destinationId: 'badminton-pi',
    activityName: 'Badminton',
    activityNameId: 'Badminton',
    scheduledTime: '18:30',
    notes: 'Weekly doubles at Pondok Indah Sports Club',
    notesId: 'Permainan ganda mingguan di Pondok Indah Sports Club',
  },
  {
    id: 'friday-drinks',
    dayOfWeek: 5, // Friday
    destinationId: 'drinks-sudirman',
    activityName: 'Friday Drinks',
    activityNameId: 'Hangout Jumat',
    scheduledTime: '20:00',
    notes: 'End of week drinks at Cloud Lounge',
    notesId: 'Minuman akhir pekan di Cloud Lounge',
  },
];

// ============================================================================
// SCENARIO CONFIGURATIONS
// Different weather/traffic scenarios for demo
// ============================================================================

export const scenarios: Record<string, { id: string; name: string; nameId: string; icon: string; description: string; descriptionId: string; floodMultiplier: number; trafficMultiplier: number }> = {
  'normal': {
    id: 'normal',
    name: 'Normal Day',
    nameId: 'Hari Normal',
    icon: '☀️',
    description: 'Typical Jakarta conditions',
    descriptionId: 'Kondisi Jakarta biasa',
    floodMultiplier: 1,
    trafficMultiplier: 1,
  },
  'heavy-rain': {
    id: 'heavy-rain',
    name: 'Heavy Rain Day',
    nameId: 'Hari Hujan Lebat',
    icon: '🌧️',
    description: 'Flooding in low-lying areas, traffic delays',
    descriptionId: 'Banjir di daerah rendah, penundaan lalu lintas',
    floodMultiplier: 2.5,
    trafficMultiplier: 1.8,
  },
};

// ============================================================================
// MOTIVATIONAL MESSAGES
// Personality for the app - make it feel human
// ============================================================================

export const motivationalMessages = {
  en: {
    earlyDeparture: [
      "Beat the rush! Leave now and arrive stress-free 🏃",
      "Smart move - you'll thank yourself later ✨",
      "Early bird gets the parking spot! 🅿️",
    ],
    optimalTime: [
      "Perfect timing! Roads are clearing up 🛣️",
      "This is your window - traffic is light 🟢",
      "Ideal departure - smooth sailing ahead ⛵",
    ],
    floodWarning: [
      "Heads up! Flooding reported on your route 🌊",
      "Take the alternate route to stay dry 🚗",
      "Water on the roads - we've got a safer path 🗺️",
    ],
    weekendVibes: [
      "Friday calls! Time to celebrate the week 🎉",
      "You've earned this - enjoy your evening! 🌟",
      "Weekend mode: activated 🎊",
    ],
    sportsTime: [
      "Game time! Get there fresh, not stressed 🎾",
      "Your court is waiting - leave now! 🏸",
      "Champions arrive on time ⏰",
    ],
  },
  id: {
    earlyDeparture: [
      "Hindari macet! Berangkat sekarang dan tiba tanpa stres 🏃",
      "Langkah cerdas - Anda akan berterima kasih nanti ✨",
      "Yang awal dapat tempat parkir! 🅿️",
    ],
    optimalTime: [
      "Waktu sempurna! Jalanan mulai lengang 🛣️",
      "Ini kesempatan Anda - lalu lintas lancar 🟢",
      "Keberangkatan ideal - perjalanan mulus ⛵",
    ],
    floodWarning: [
      "Perhatian! Banjir dilaporkan di rute Anda 🌊",
      "Ambil rute alternatif agar tetap kering 🚗",
      "Air di jalan - kami punya jalur yang lebih aman 🗺️",
    ],
    weekendVibes: [
      "Jumat memanggil! Saatnya merayakan minggu ini 🎉",
      "Anda pantas mendapatkan ini - nikmati malam Anda! 🌟",
      "Mode akhir pekan: diaktifkan 🎊",
    ],
    sportsTime: [
      "Waktunya main! Tiba dengan segar, bukan stres 🎾",
      "Lapangan Anda menunggu - berangkat sekarang! 🏸",
      "Juara tiba tepat waktu ⏰",
    ],
  },
};

// ============================================================================
// TIME COMPARISON DATA
// For "Life With vs Without" comparison
// ============================================================================

export const comparisonData = {
  withoutApp: {
    avgCommuteTime: 65, // minutes
    timeLostToTraffic: 12, // hours per week
    stressLevel: 'High',
    stressLevelId: 'Tinggi',
    missedActivities: 3, // per month
  },
  withApp: {
    avgCommuteTime: 35, // minutes
    timeLostToTraffic: 5, // hours per week
    stressLevel: 'Low',
    stressLevelId: 'Rendah',
    missedActivities: 0,
  },
};
