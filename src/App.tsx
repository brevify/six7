import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Train, 
  DollarSign, 
  Users, 
  Sparkles, 
  WifiOff, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ItineraryView } from './components/ItineraryView';
import { SingaporeMap } from './components/SingaporeMap';
import { TransitDashboard } from './components/TransitDashboard';
import { BudgetTracker } from './components/BudgetTracker';
import { ItineraryGeneratorModal } from './components/ItineraryGeneratorModal';
import { CollaborationModal } from './components/CollaborationModal';
import { OfflineDownloadModal } from './components/OfflineDownloadModal';
import { FullItinerary, ExpenseItem, ActivityStop, TripPreferences } from './types';
import { offlineStorage } from './utils/offlineStorage';
import { CURATED_LOCATIONS } from './data/singaporeData';

// Initial pristine 3-day Singapore Itinerary highlighting hidden gems, hawker feasts & transit routes
const DEFAULT_ITINERARY: FullItinerary = {
  id: 'itinerary-default-sg',
  title: '3-Day Singapore Hawker Feasts & Hidden Enclaves',
  createdAt: new Date().toISOString(),
  preferences: {
    tripName: 'Singapore Hawker & Heritage Journey',
    durationDays: 3,
    travelStyle: 'hidden-gems',
    budgetTier: 'moderate',
    dailyBudgetSgd: 90,
    pace: 'moderate',
    companion: 'friends',
    interests: ['Hawker Food', 'Hidden Gems', 'Peranakan Heritage', 'Street Photography'],
    dietaryRestrictions: ['No Pork or Lard Option']
  },
  totalBudgetSgd: 270,
  projectedCostSgd: 148,
  collaborators: [
    { id: 'u1', name: 'You (Organizer)', avatarColor: '#0284c7', role: 'owner' },
    { id: 'u2', name: 'Marcus (Foodie)', avatarColor: '#ea580c', role: 'editor' },
    { id: 'u3', name: 'Aisha (Photographer)', avatarColor: '#16a34a', role: 'editor' },
  ],
  shareCode: 'LION-SG92',
  days: [
    {
      dayNumber: 1,
      theme: 'Chinatown, Secret Art Deco Enclaves & Waterfront Twilight',
      districtFocus: 'Chinatown & Marina Bay',
      summary: 'Kick off with Michelin-rated chicken rice, quiet Blair Road ceramic facades, and free twilight Supertree lights.',
      totalEstimatedCostSgd: 49,
      totalWalkingKm: 3.8,
      stops: [
        CURATED_LOCATIONS[0], // Maxwell
        CURATED_LOCATIONS[1], // Keong Saik & Everton
        CURATED_LOCATIONS[2], // National Gallery
        CURATED_LOCATIONS[3], // Supertree & Cloud Forest
        CURATED_LOCATIONS[4], // Lau Pa Sat Satay Street
      ],
      transitLegs: [
        {
          fromStopId: CURATED_LOCATIONS[0].id,
          toStopId: CURATED_LOCATIONS[1].id,
          mode: 'walk',
          routeDescription: 'Walk 7 mins through Tanjong Pagar shophouse alleys into Everton Park',
          durationMinutes: 7,
          estimatedCostSgd: 0
        },
        {
          fromStopId: CURATED_LOCATIONS[1].id,
          toStopId: CURATED_LOCATIONS[2].id,
          mode: 'mrt',
          routeDescription: 'Board East-West Line at Outram Park (EW16) 2 stops to City Hall (EW13)',
          durationMinutes: 12,
          estimatedCostSgd: 1.35,
          transitLine: 'East-West Line'
        },
        {
          fromStopId: CURATED_LOCATIONS[2].id,
          toStopId: CURATED_LOCATIONS[3].id,
          mode: 'mrt',
          routeDescription: 'Walk 5 mins to Promenade (DT15) and ride Downtown Line to Bayfront (DT16)',
          durationMinutes: 10,
          estimatedCostSgd: 1.19,
          transitLine: 'Downtown Line'
        },
        {
          fromStopId: CURATED_LOCATIONS[3].id,
          toStopId: CURATED_LOCATIONS[4].id,
          mode: 'mrt',
          routeDescription: 'Ride Downtown Line 1 stop from Bayfront (DT16) to Telok Ayer (DT18), walk 3 mins to Lau Pa Sat',
          durationMinutes: 9,
          estimatedCostSgd: 1.19,
          transitLine: 'Downtown Line'
        }
      ]
    },
    {
      dayNumber: 2,
      theme: 'Peranakan Pastel Heritage & Coastal Flavors',
      districtFocus: 'Joo Chiat, Katong & Kampong Glam',
      summary: 'Taste century-old Hainanese kaya toast, photograph Koon Seng pastel tiles, and explore the golden Sultan Mosque.',
      totalEstimatedCostSgd: 42,
      totalWalkingKm: 4.1,
      stops: [
        CURATED_LOCATIONS[5], // Joo Chiat Koon Seng Rd & Laksa
        CURATED_LOCATIONS[6], // Kampong Glam & Sultan Mosque
        CURATED_LOCATIONS[9], // Jewel Changi
      ],
      transitLegs: [
        {
          fromStopId: CURATED_LOCATIONS[5].id,
          toStopId: CURATED_LOCATIONS[6].id,
          mode: 'mrt',
          routeDescription: 'Ride Thomson-East Coast Line from Marine Parade (TE26) to Bugis (DT14)',
          durationMinutes: 18,
          estimatedCostSgd: 1.65,
          transitLine: 'TE Line / Downtown'
        },
        {
          fromStopId: CURATED_LOCATIONS[6].id,
          toStopId: CURATED_LOCATIONS[9].id,
          mode: 'mrt',
          routeDescription: 'Board East-West Line from Bugis (EW12) directly to Changi Airport (CG2)',
          durationMinutes: 32,
          estimatedCostSgd: 2.18,
          transitLine: 'East-West Line'
        }
      ]
    },
    {
      dayNumber: 3,
      theme: 'Canopy Walks, Colonial Black-and-Whites & Food Hall of Fame',
      districtFocus: 'Southern Ridges & Old Airport Road',
      summary: 'Trek across the wave-shaped jungle bridge, uncover 1940s colonial artist bungalows, and dine at Singapore\'s top hawker center.',
      totalEstimatedCostSgd: 38,
      totalWalkingKm: 5.2,
      stops: [
        CURATED_LOCATIONS[8], // Wessex Estate & Colbar
        CURATED_LOCATIONS[7], // Henderson Waves
      ],
      transitLegs: [
        {
          fromStopId: CURATED_LOCATIONS[8].id,
          toStopId: CURATED_LOCATIONS[7].id,
          mode: 'mrt',
          routeDescription: 'Ride Circle Line from one-north (CC23) 3 stops to Telok Blangah (CC28)',
          durationMinutes: 14,
          estimatedCostSgd: 1.45,
          transitLine: 'Circle Line'
        }
      ]
    }
  ]
};

const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    dayNumber: 1,
    title: 'Tian Tian Chicken Rice + Lime Sugarcane',
    category: 'hawker',
    amountSgd: 7.00,
    timestamp: new Date().toISOString(),
    paidBy: 'You',
    splitWith: ['You'],
    receiptNote: 'Maxwell Food Centre stall 10'
  },
  {
    id: 'exp-2',
    dayNumber: 1,
    title: 'MRT SimplyGo Contactless Tap (Outram to City Hall)',
    category: 'mrt-transit',
    amountSgd: 1.35,
    timestamp: new Date().toISOString(),
    paidBy: 'You',
    splitWith: ['You'],
    receiptNote: 'Direct phone tap'
  },
  {
    id: 'exp-3',
    dayNumber: 1,
    title: 'Lau Pa Sat Mixed Satay Set (20 Skewers)',
    category: 'hawker',
    amountSgd: 18.00,
    timestamp: new Date().toISOString(),
    paidBy: 'Marcus',
    splitWith: ['You', 'Marcus', 'Aisha'],
    receiptNote: 'Boon Tat St stall 7'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'transit' | 'budget' | 'collaborate'>('itinerary');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => offlineStorage.isSimulatedOffline());
  const [itinerary, setItinerary] = useState<FullItinerary>(() => offlineStorage.getItinerary() || DEFAULT_ITINERARY);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = offlineStorage.getExpenses();
    return saved.length > 0 ? saved : INITIAL_EXPENSES;
  });

  // Selected stop for jumping to map
  const [activeStopIdForMap, setActiveStopIdForMap] = useState<string | null>(null);

  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state to offline storage
  useEffect(() => {
    offlineStorage.saveItinerary(itinerary);
  }, [itinerary]);

  useEffect(() => {
    offlineStorage.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    offlineStorage.setSimulatedOffline(isOfflineMode);
  }, [isOfflineMode]);

  // Monitor real-world browser offline event
  useEffect(() => {
    const handleOnline = () => {
      if (!offlineStorage.isSimulatedOffline()) setIsOfflineMode(false);
    };
    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Itinerary Generation
  const handleGenerateItinerary = async (prefs: TripPreferences) => {
    setIsGenerating(true);
    try {
      if (isOfflineMode) {
        // Generate locally from offline database
        const dummyDayCount = prefs.durationDays;
        const newDays = [];
        for (let i = 0; i < dummyDayCount; i++) {
          const sampleStops = CURATED_LOCATIONS.slice(i * 2, (i * 2) + 3);
          newDays.push({
            dayNumber: i + 1,
            theme: `Day ${i + 1}: Singapore Curated Journey`,
            districtFocus: sampleStops[0]?.district || 'Central',
            summary: 'Personalized route optimized for your daily budget constraint.',
            stops: sampleStops.map(s => ({ ...s, id: `offline-${i}-${s.id}` })),
            transitLegs: [],
            totalEstimatedCostSgd: sampleStops.reduce((sum, s) => sum + s.costSgd, 0) + 4,
            totalWalkingKm: 3.5,
          });
        }

        const newTrip: FullItinerary = {
          id: 'itin-' + Date.now(),
          title: prefs.tripName,
          createdAt: new Date().toISOString(),
          preferences: prefs,
          days: newDays,
          totalBudgetSgd: prefs.dailyBudgetSgd * prefs.durationDays,
          projectedCostSgd: newDays.reduce((acc, d) => acc + d.totalEstimatedCostSgd, 0),
          collaborators: itinerary.collaborators,
          shareCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        };

        setItinerary(newTrip);
        setIsGeneratorOpen(false);
        setActiveTab('itinerary');
        return;
      }

      // Online: call server-side Gemini 3.8 Flash API
      const res = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.itinerary) {
          setItinerary(data.itinerary);
          setIsGeneratorOpen(false);
          setActiveTab('itinerary');
        }
      }
    } catch (e) {
      console.error('Generation error, keeping local fallback', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Upvote / Vote on Stop
  const handleVoteStop = async (stopId: string) => {
    setItinerary(prev => {
      const updatedDays = prev.days.map(d => ({
        ...d,
        stops: d.stops.map(s => s.id === stopId ? { ...s, upvotes: (s.upvotes || 0) + 1 } : s)
      }));
      return { ...prev, days: updatedDays };
    });

    if (!isOfflineMode) {
      try {
        await fetch('/api/collaborate/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shareCode: itinerary.shareCode, stopId, direction: 'up' })
        });
      } catch (e) {
        // silent fail in offline
      }
    }
  };

  // Add Co-Traveler Note to Stop
  const handleAddNote = async (stopId: string, text: string) => {
    const author = 'You';
    setItinerary(prev => {
      const updatedDays = prev.days.map(d => ({
        ...d,
        stops: d.stops.map(s => {
          if (s.id === stopId) {
            return { ...s, notes: [...(s.notes || []), `${author}: ${text}`] };
          }
          return s;
        })
      }));
      return { ...prev, days: updatedDays };
    });

    if (!isOfflineMode) {
      try {
        await fetch('/api/collaborate/note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shareCode: itinerary.shareCode, stopId, noteText: text, author })
        });
      } catch (e) {
        // silent offline fallback
      }
    }
  };

  // Toggle Visited
  const handleToggleVisited = (stopId: string) => {
    setItinerary(prev => ({
      ...prev,
      days: prev.days.map(d => ({
        ...d,
        stops: d.stops.map(s => s.id === stopId ? { ...s, visited: !s.visited } : s)
      }))
    }));
  };

  // Select Stop to show on Singapore Map
  const handleSelectMapStop = (stop: ActivityStop) => {
    setActiveStopIdForMap(stop.id);
    setActiveTab('map');
  };

  // Quick log expense from an itinerary activity
  const handleQuickLogExpense = (stop: ActivityStop) => {
    const newExp: ExpenseItem = {
      id: 'exp-' + Date.now(),
      dayNumber: 1,
      title: stop.foodRecommendation ? `${stop.title} (${stop.foodRecommendation})` : stop.title,
      category: stop.category === 'food' ? 'hawker' : 'attraction',
      amountSgd: stop.costSgd || 6,
      timestamp: new Date().toISOString(),
      paidBy: 'You',
      splitWith: ['You'],
      receiptNote: `${stop.locationName} · ${stop.mrtStation}`
    };
    setExpenses(prev => [newExp, ...prev]);
    setActiveTab('budget');
  };

  // Manual Add Expense
  const handleAddExpense = (expense: Omit<ExpenseItem, 'id' | 'timestamp'>) => {
    const newExp: ExpenseItem = {
      ...expense,
      id: 'exp-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Add Collaborator
  const handleAddCollaborator = (name: string) => {
    const colors = ['#0284c7', '#ea580c', '#16a34a', '#9333ea', '#e11d48'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newCollab = {
      id: 'collab-' + Date.now(),
      name,
      avatarColor: randomColor,
      role: 'editor' as const
    };
    setItinerary(prev => ({
      ...prev,
      collaborators: [...prev.collaborators, newCollab]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-8">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOfflineMode={isOfflineMode}
        setIsOfflineMode={setIsOfflineMode}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onOpenCollabModal={() => setIsCollabOpen(true)}
      />

      {/* Offline Mode Alert Bar (if simulated or real offline) */}
      {isOfflineMode && (
        <div className="bg-amber-600 text-amber-50 px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>
            Offline Mode is Active. Displaying cached Singapore vector maps, timetables, and itinerary data without using cellular roaming.
          </span>
          <button
            onClick={() => setIsOfflineMode(false)}
            className="underline hover:text-white font-bold ml-2"
          >
            Re-enable Online
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'itinerary' && (
          <ItineraryView
            itinerary={itinerary}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onSelectMapStop={handleSelectMapStop}
            onVoteStop={handleVoteStop}
            onAddNote={handleAddNote}
            onToggleVisited={handleToggleVisited}
            onQuickLogExpense={handleQuickLogExpense}
            onOpenCollab={() => setIsCollabOpen(true)}
          />
        )}

        {activeTab === 'map' && (
          <SingaporeMap
            itinerary={itinerary}
            activeStopId={activeStopIdForMap}
            onSelectStop={(stop) => setActiveStopIdForMap(stop.id)}
            isOfflineMode={isOfflineMode}
            onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
          />
        )}

        {activeTab === 'transit' && (
          <TransitDashboard isOfflineMode={isOfflineMode} />
        )}

        {activeTab === 'budget' && (
          <BudgetTracker
            itinerary={itinerary}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'collaborate' && (
          <div className="max-w-2xl mx-auto">
            <CollaborationModal
              isOpen={true}
              onClose={() => setActiveTab('itinerary')}
              itinerary={itinerary}
              onAddCollaborator={handleAddCollaborator}
            />
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Tab Bar (Pattern 1 from Mobile Touch Guidelines) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'itinerary' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Itinerary</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'map' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Map</span>
          </button>

          <button
            onClick={() => setActiveTab('transit')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'transit' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Train className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Transit</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'budget' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Budget</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <ItineraryGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerate={handleGenerateItinerary}
        isLoading={isGenerating}
      />

      <CollaborationModal
        isOpen={isCollabOpen}
        onClose={() => setIsCollabOpen(false)}
        itinerary={itinerary}
        onAddCollaborator={handleAddCollaborator}
      />

      <OfflineDownloadModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        itinerary={itinerary}
        isOfflineMode={isOfflineMode}
        setIsOfflineMode={setIsOfflineMode}
      />
    </div>
  );
}
