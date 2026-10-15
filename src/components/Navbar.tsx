import React from 'react';
import { Wifi, WifiOff, Download, Sparkles, Share2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'itinerary' | 'map' | 'transit' | 'budget' | 'collaborate';
  setActiveTab: (tab: 'itinerary' | 'map' | 'transit' | 'budget' | 'collaborate') => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (val: boolean) => void;
  onOpenGenerator: () => void;
  onOpenOfflineModal: () => void;
  onOpenCollabModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOfflineMode,
  setIsOfflineMode,
  onOpenGenerator,
  onOpenOfflineModal,
  onOpenCollabModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('itinerary')}
              className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap text-left hover:opacity-90 transition-opacity"
            >
              LionCity<span className="text-amber-600 font-extrabold ml-1">Route</span>
            </button>
            
            {/* Status toggle for offline readiness */}
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              title={isOfflineMode ? "Running in Offline Mode (Cached tiles & data)" : "Connected to Live Network"}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                isOfflineMode 
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Offline Active</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Online</span>
                </>
              )}
            </button>
          </div>

          {/* Zone 2: 4–5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'itinerary' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Itinerary
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'map' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Offline Map
            </button>
            <button
              onClick={() => setActiveTab('transit')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'transit' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Transit Live
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'budget' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Budget & Expenses
            </button>
            <button
              onClick={() => setActiveTab('collaborate')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'collaborate' ? 'text-slate-950 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Collaborate
            </button>
          </nav>

          {/* Zone 3: Primary action + quick tools */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenOfflineModal}
              title="Download Offline Pocket Guide & Vector Map Pack"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenCollabModal}
              title="Share Trip / Invite Co-Travelers"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenGenerator}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Plan Trip</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
