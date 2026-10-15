export type TravelStyle = 
  | 'hidden-gems' 
  | 'hawker-foodie' 
  | 'culture-heritage' 
  | 'nature-green' 
  | 'architecture-photo' 
  | 'balanced';

export type BudgetTier = 'budget' | 'moderate' | 'luxury';

export type Pace = 'relaxed' | 'moderate' | 'packed';

export type CompanionType = 'solo' | 'couple' | 'friends' | 'family';

export interface TripPreferences {
  tripName: string;
  durationDays: number;
  travelStyle: TravelStyle;
  budgetTier: BudgetTier;
  dailyBudgetSgd: number;
  pace: Pace;
  companion: CompanionType;
  interests: string[];
  dietaryRestrictions: string[];
}

export interface ActivityStop {
  id: string;
  title: string;
  category: 'sight' | 'food' | 'hidden-gem' | 'transit' | 'relaxation' | 'nature-green';
  district: string;
  description: string;
  locationName: string;
  address?: string;
  lat: number;
  lng: number;
  mrtStation: string;
  mrtLineCode: 'NS' | 'EW' | 'CC' | 'DT' | 'TE' | 'NE';
  timeSlot: string; // e.g. "09:00 - 10:30"
  durationMinutes: number;
  costSgd: number;
  highlightTag?: string; // e.g. "Local Favorite", "No Tourist Crowds", "Michelin Bib Gourmand"
  localTip: string;
  foodRecommendation?: string;
  visited?: boolean;
  upvotes?: number;
  notes?: string[];
  photoUrl?: string;
}

export interface RouteTransitLeg {
  fromStopId: string;
  toStopId: string;
  mode: 'mrt' | 'bus' | 'walk';
  routeDescription: string;
  durationMinutes: number;
  estimatedCostSgd: number;
  transitLine?: string;
}

export interface DayItinerary {
  dayNumber: number;
  theme: string;
  districtFocus: string;
  summary: string;
  stops: ActivityStop[];
  transitLegs: RouteTransitLeg[];
  totalEstimatedCostSgd: number;
  totalWalkingKm: number;
}

export interface FullItinerary {
  id: string;
  title: string;
  createdAt: string;
  preferences: TripPreferences;
  days: DayItinerary[];
  totalBudgetSgd: number;
  projectedCostSgd: number;
  collaborators: Collaborator[];
  shareCode: string;
  offlineCachedAt?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  avatarColor: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface ExpenseItem {
  id: string;
  dayNumber: number;
  title: string;
  category: 'hawker' | 'dining' | 'mrt-transit' | 'grab-taxi' | 'attraction' | 'shopping' | 'misc';
  amountSgd: number;
  timestamp: string;
  paidBy: string;
  splitWith: string[];
  receiptNote?: string;
}

export interface TransitLineStatus {
  lineCode: 'NS' | 'EW' | 'CC' | 'DT' | 'TE' | 'NE';
  lineName: string;
  colorHex: string;
  status: 'normal' | 'minor-delay' | 'crowded' | 'maintenance';
  statusMessage: string;
  frequencyPeakMinutes: string;
  frequencyOffPeakMinutes: string;
  crowdLevel: 'Low' | 'Moderate' | 'Heavy';
  lastUpdated: string;
}

export interface SingaporeDistrict {
  id: string;
  name: string;
  vibe: string;
  bestFor: string;
  topHawker: string;
  hiddenSecret: string;
  centerCoordinates: { lat: number; lng: number };
}
