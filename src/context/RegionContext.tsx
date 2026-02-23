'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface RegionContextValue {
  selectedRegion: string; // slug, 'all' means no filter
  setSelectedRegion: (slug: string) => void;
  regionName: string;
}

const RegionContext = createContext<RegionContextValue | null>(null);

const REGION_NAMES: Record<string, string> = {
  all: 'All Guyana',
  georgetown: 'Georgetown',
  'east-coast-demerara': 'East Coast Demerara',
  'west-coast-demerara': 'West Coast Demerara',
  'east-bank-demerara': 'East Bank Demerara',
  'west-bank-demerara': 'West Bank Demerara',
  berbice: 'Berbice',
  linden: 'Linden',
  essequibo: 'Essequibo',
  bartica: 'Bartica',
  'anna-regina': 'Anna Regina',
};

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegion] = useState('all');

  return (
    <RegionContext.Provider
      value={{
        selectedRegion,
        setSelectedRegion,
        regionName: REGION_NAMES[selectedRegion] || 'All Guyana',
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
}
