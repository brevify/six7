import { FullItinerary, ExpenseItem } from '../types';

const STORAGE_KEYS = {
  CURRENT_ITINERARY: 'lioncity_current_itinerary',
  OFFLINE_PACK: 'lioncity_offline_pack_v1',
  EXPENSES: 'lioncity_expenses',
  OFFLINE_MODE_SIMULATOR: 'lioncity_simulate_offline',
  CURRENCY: 'lioncity_pref_currency',
};

export interface OfflinePackData {
  downloadedAt: string;
  version: string;
  sizeKb: number;
  itinerary: FullItinerary | null;
  emergencyHotlines: { name: string; number: string; note: string }[];
  essentialPhrases: { term: string; meaning: string; usage: string }[];
  mrtStationList: { code: string; name: string; line: string }[];
}

export const offlineStorage = {
  saveItinerary(itinerary: FullItinerary): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ITINERARY, JSON.stringify(itinerary));
    } catch (e) {
      console.error('Failed to save itinerary to localStorage', e);
    }
  },

  getItinerary(): FullItinerary | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ITINERARY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveExpenses(expenses: ExpenseItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses', e);
    }
  },

  getExpenses(): ExpenseItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isSimulatedOffline(): boolean {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE_SIMULATOR) === 'true';
  },

  setSimulatedOffline(status: boolean): void {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE_SIMULATOR, status ? 'true' : 'false');
  },

  saveOfflinePack(pack: OfflinePackData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_PACK, JSON.stringify(pack));
    } catch (e) {
      console.error('Failed to save offline pack', e);
    }
  },

  getOfflinePack(): OfflinePackData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_PACK);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  getPreferredCurrency(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'SGD';
  },

  setPreferredCurrency(currency: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }
};
