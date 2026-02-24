// Shared constants used across the app

export const REGIONS = [
  { slug: 'georgetown', name: 'Georgetown' },
  { slug: 'east-coast-demerara', name: 'East Coast Demerara' },
  { slug: 'west-coast-demerara', name: 'West Coast Demerara' },
  { slug: 'east-bank-demerara', name: 'East Bank Demerara' },
  { slug: 'west-bank-demerara', name: 'West Bank Demerara' },
  { slug: 'berbice', name: 'Berbice' },
  { slug: 'linden', name: 'Linden' },
  { slug: 'essequibo', name: 'Essequibo' },
  { slug: 'bartica', name: 'Bartica' },
  { slug: 'anna-regina', name: 'Anna Regina' },
] as const;

export const REGIONS_WITH_ALL = [
  { slug: 'all', name: 'All Guyana' },
  ...REGIONS,
] as const;

export const MARKET_CATEGORIES = [
  { slug: 'buy-sell', name: 'Buy & Sell' },
  { slug: 'services', name: 'Services' },
  { slug: 'vehicles', name: 'Vehicles' },
] as const;
