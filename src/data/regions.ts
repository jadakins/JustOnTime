import { Region } from '@/types';

// ============================================================================
// JAKARTA REGIONS DATA
// Based on actual Jakarta administrative regions and flood-prone areas
// ============================================================================

export const jakartaRegions: Region[] = [
  {
    id: 'jakarta-pusat',
    name: 'Central Jakarta',
    nameId: 'Jakarta Pusat',
    coordinates: [-6.1864, 106.8347],
    floodZones: ['Tanah Abang', 'Gambir', 'Menteng', 'Kemayoran'],
  },
  {
    id: 'jakarta-utara',
    name: 'North Jakarta',
    nameId: 'Jakarta Utara',
    coordinates: [-6.1219, 106.9042],
    floodZones: ['Penjaringan', 'Pademangan', 'Tanjung Priok', 'Koja', 'Cilincing'],
  },
  {
    id: 'jakarta-barat',
    name: 'West Jakarta',
    nameId: 'Jakarta Barat',
    coordinates: [-6.1681, 106.7636],
    floodZones: ['Cengkareng', 'Grogol Petamburan', 'Kalideres', 'Kebon Jeruk'],
  },
  {
    id: 'jakarta-selatan',
    name: 'South Jakarta',
    nameId: 'Jakarta Selatan',
    coordinates: [-6.2615, 106.8106],
    floodZones: ['Kebayoran Lama', 'Pesanggrahan', 'Cilandak', 'Pasar Minggu', 'Jagakarsa'],
  },
  {
    id: 'jakarta-timur',
    name: 'East Jakarta',
    nameId: 'Jakarta Timur',
    coordinates: [-6.2250, 106.9004],
    floodZones: ['Cakung', 'Jatinegara', 'Duren Sawit', 'Matraman', 'Pulo Gadung'],
  },
  {
    id: 'bekasi',
    name: 'Bekasi',
    nameId: 'Bekasi',
    coordinates: [-6.2348, 106.9945],
    floodZones: ['Bekasi Utara', 'Bekasi Timur', 'Rawalumbu'],
  },
  {
    id: 'tangerang',
    name: 'Tangerang',
    nameId: 'Tangerang',
    coordinates: [-6.1783, 106.6319],
    floodZones: ['Cipondoh', 'Karawaci', 'Cibodas'],
  },
  {
    id: 'depok',
    name: 'Depok',
    nameId: 'Depok',
    coordinates: [-6.4025, 106.7942],
    floodZones: ['Cimanggis', 'Sukmajaya', 'Beji'],
  },
];

// Helper function to get region by ID
export function getRegionById(id: string): Region | undefined {
  return jakartaRegions.find(region => region.id === id);
}

// Helper function to get region name based on language
export function getRegionName(region: Region, language: 'id' | 'en'): string {
  return language === 'id' ? region.nameId : region.name;
}
