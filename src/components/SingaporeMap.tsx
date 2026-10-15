import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Utensils, 
  Navigation, 
  Info,
  Clock,
  Compass
} from 'lucide-react';
import { ActivityStop, FullItinerary } from '../types';
import { MRT_LINES, SINGAPORE_DISTRICTS } from '../data/singaporeData';

interface SingaporeMapProps {
  itinerary: FullItinerary | null;
  activeStopId?: string | null;
  onSelectStop?: (stop: ActivityStop) => void;
  isOfflineMode: boolean;
  onOpenOfflineModal: () => void;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  itinerary,
  activeStopId,
  onSelectStop,
  isOfflineMode,
  onOpenOfflineModal,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showMrtLines, setShowMrtLines] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'food' | 'hidden-gem' | 'sight'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState<ActivityStop | null>(null);

  // Collect all stops from itinerary or default sample
  const allStops: ActivityStop[] = React.useMemo(() => {
    if (!itinerary?.days) return [];
    return itinerary.days.flatMap(d => d.stops);
  }, [itinerary]);

  // Filter stops
  const filteredStops = allStops.filter(stop => {
    const matchesCat = categoryFilter === 'all' || stop.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      stop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stop.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stop.mrtStation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Convert lat/lng to Singapore SVG coordinate canvas (width 1000, height 580)
  // Singapore bounds approx: Lat 1.22 to 1.47, Lng 103.60 to 104.04
  const mapCoords = (lat: number, lng: number) => {
    const minLat = 1.23;
    const maxLat = 1.44;
    const minLng = 103.65;
    const maxLng = 104.02;

    const x = ((lng - minLng) / (maxLng - minLng)) * 880 + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 460 + 60;
    return { x, y };
  };

  const handlePinClick = (stop: ActivityStop) => {
    setSelectedPin(stop);
    if (onSelectStop) onSelectStop(stop);
  };

  return (
    <div className="space-y-4">
      {/* Map Control Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stop, district or MRT..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Stops
            </button>
            <button
              onClick={() => setCategoryFilter('food')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                categoryFilter === 'food'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hawkers & Food
            </button>
            <button
              onClick={() => setCategoryFilter('hidden-gem')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                categoryFilter === 'hidden-gem'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hidden Gems
            </button>
            <button
              onClick={() => setCategoryFilter('sight')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                categoryFilter === 'sight'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sights & Icons
            </button>
          </div>
        </div>

        {/* Right: Layers, Zoom & Offline Pack */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMrtLines(!showMrtLines)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showMrtLines
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>MRT Lines {showMrtLines ? 'On' : 'Off'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.25))}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenOfflineModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Offline Pack</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Vector Map Canvas */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl min-h-[520px]">
        {/* Ambient Map Header Info */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 text-white text-xs">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Singapore Transit & District Map</span>
          </div>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 font-mono-numbers">{filteredStops.length} Pins Loaded</span>
          {isOfflineMode && (
            <>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-medium">Offline Vector Cache</span>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-4 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 text-[11px] text-slate-300">
          <span className="font-semibold text-white">MRT Lines:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d42e12]" /> NSL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#009640]" /> EWL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fa9e0d]" /> CCL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005ec4]" /> DTL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9d5b25]" /> TEL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8f4199]" /> NEL
          </span>
        </div>

        {/* SVG Map Container with scale */}
        <div className="w-full h-full overflow-hidden flex items-center justify-center p-4">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="w-full max-w-5xl"
          >
            <svg
              viewBox="0 0 1000 580"
              className="w-full h-auto select-none"
              style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
            >
              {/* Water Backdrop grid */}
              <defs>
                <pattern id="seaGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="islandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="districtHover" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>

              <rect width="1000" height="580" fill="url(#seaGrid)" />

              {/* Singapore Mainland Realistic Simplified Vector Polygon */}
              <path
                d="M 120 220 
                   Q 160 170, 240 160 
                   Q 350 140, 480 150 
                   Q 560 145, 650 175 
                   Q 720 190, 810 210 
                   Q 890 230, 930 260 
                   Q 950 280, 920 310 
                   Q 860 340, 780 345 
                   Q 700 355, 620 370 
                   Q 540 380, 480 395 
                   Q 430 405, 380 400 
                   Q 330 390, 260 375 
                   Q 200 360, 150 330 
                   Q 110 300, 105 260 
                   Z"
                fill="url(#islandGradient)"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Sentosa Island */}
              <path
                d="M 390 435 Q 430 430, 460 445 Q 440 460, 400 455 Z"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <text x="425" y="448" fill="#94a3b8" fontSize="8" textAnchor="middle">Sentosa</text>

              {/* Pulau Ubin Island */}
              <path
                d="M 750 160 Q 800 150, 830 165 Q 810 180, 760 175 Z"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <text x="790" y="170" fill="#94a3b8" fontSize="8" textAnchor="middle">Pulau Ubin</text>

              {/* District Labels */}
              <g className="opacity-40">
                <text x="500" y="240" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle">CENTRAL RESERVOIRS</text>
                <text x="490" y="375" fill="#f8fafc" fontSize="13" fontWeight="700" textAnchor="middle">MARINA BAY / CBD</text>
                <text x="410" y="360" fill="#94a3b8" fontSize="10" textAnchor="middle">Chinatown & Keong Saik</text>
                <text x="560" y="340" fill="#94a3b8" fontSize="10" textAnchor="middle">Kampong Glam</text>
                <text x="680" y="335" fill="#94a3b8" fontSize="10" textAnchor="middle">Joo Chiat / Katong</text>
                <text x="350" y="365" fill="#94a3b8" fontSize="10" textAnchor="middle">Tiong Bahru</text>
                <text x="880" y="275" fill="#94a3b8" fontSize="10" textAnchor="middle">Changi Airport</text>
                <text x="210" y="280" fill="#94a3b8" fontSize="10" textAnchor="middle">Jurong Lake</text>
                <text x="300" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle">Sungei Buloh Wetlands</text>
              </g>

              {/* Vector MRT Lines Layer */}
              {showMrtLines && (
                <g className="mrt-network transition-opacity duration-300">
                  {/* East-West Line (Green) */}
                  <path
                    d="M 130 250 L 210 270 L 340 365 L 430 380 L 485 375 L 540 345 L 680 325 L 820 280 L 880 275"
                    fill="none"
                    stroke="#009640"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                  />
                  {/* North-South Line (Red) */}
                  <path
                    d="M 210 270 L 250 200 L 400 165 L 490 220 L 485 320 L 475 365 L 485 385"
                    fill="none"
                    stroke="#d42e12"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                  />
                  {/* Downtown Line (Blue) */}
                  <path
                    d="M 330 220 L 420 280 L 470 340 L 490 365 L 530 355 L 555 330 L 720 300 L 840 285"
                    fill="none"
                    stroke="#005ec4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                  />
                  {/* Circle Line (Orange) */}
                  <path
                    d="M 475 350 Q 550 360, 520 310 Q 480 240, 360 300 Q 300 360, 370 415 L 420 420"
                    fill="none"
                    stroke="#fa9e0d"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                    strokeOpacity="0.85"
                  />
                  {/* Thomson-East Coast Line (Brown) */}
                  <path
                    d="M 390 160 L 450 230 L 460 320 L 440 375 L 485 390 L 580 365 L 720 335 L 770 325"
                    fill="none"
                    stroke="#9d5b25"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeOpacity="0.85"
                  />
                  {/* North East Line (Purple) */}
                  <path
                    d="M 410 420 L 440 375 L 480 330 L 530 260 L 610 200"
                    fill="none"
                    stroke="#8f4199"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                  />
                </g>
              )}

              {/* Major MRT Interchange Stations */}
              {showMrtLines && (
                <g className="mrt-stations">
                  {/* City Hall / Raffles Place */}
                  <circle cx="485" cy="375" r="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                  {/* Marina Bay / Bayfront */}
                  <circle cx="505" cy="385" r="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                  {/* Chinatown / Outram Park */}
                  <circle cx="435" cy="375" r="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                  {/* Bugis */}
                  <circle cx="530" cy="345" r="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                  {/* Dhoby Ghaut */}
                  <circle cx="475" cy="345" r="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                  {/* Changi Airport */}
                  <circle cx="880" cy="275" r="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                </g>
              )}

              {/* Activity Stop Markers */}
              {filteredStops.map((stop, idx) => {
                const { x, y } = mapCoords(stop.lat, stop.lng);
                const isSelected = selectedPin?.id === stop.id || activeStopId === stop.id;

                let pinColor = '#3b82f6'; // default blue
                if (stop.category === 'food') pinColor = '#f59e0b'; // amber
                if (stop.category === 'hidden-gem') pinColor = '#10b981'; // emerald
                if (stop.category === 'sight') pinColor = '#ec4899'; // pink
                if (stop.category === 'nature-green') pinColor = '#14b8a6'; // teal

                return (
                  <g
                    key={stop.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => handlePinClick(stop)}
                  >
                    {/* Pulsing ring if active */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="none"
                        stroke={pinColor}
                        strokeWidth="2"
                        className="animate-ping opacity-60"
                      />
                    )}

                    {/* Outer Pin Body */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? '9' : '6.5'}
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Inner Center Dot */}
                    <circle cx={x} cy={y} r="2" fill="#ffffff" />

                    {/* Stop Number Index */}
                    <text
                      x={x + 10}
                      y={y + 3}
                      fill="#f8fafc"
                      fontSize="9"
                      fontWeight="600"
                      className="pointer-events-none drop-shadow"
                    >
                      {stop.title.length > 20 ? stop.title.substring(0, 18) + '...' : stop.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Pin Floating Card */}
        {selectedPin && (
          <div className="absolute bottom-4 right-4 z-20 max-w-sm w-full bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedPin.category === 'food' ? '🍜' : selectedPin.category === 'hidden-gem' ? '💎' : '📍'}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{selectedPin.title}</h4>
                  <p className="text-[11px] text-slate-500">{selectedPin.district}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
              {selectedPin.description}
            </p>

            {/* Quick Metadata */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                {selectedPin.mrtStation}
              </span>
              <span className="font-bold text-slate-900 font-mono-numbers">
                {selectedPin.costSgd === 0 ? 'Free Entry' : `S$ ${selectedPin.costSgd}`}
              </span>
            </div>

            {selectedPin.localTip && (
              <div className="mt-2.5 bg-amber-50 p-2 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{selectedPin.localTip}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* District Explorer Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SINGAPORE_DISTRICTS.map(d => (
          <div
            key={d.id}
            className="p-3 bg-white rounded-xl border border-slate-200 text-left hover:border-slate-300 transition-colors"
          >
            <div className="text-xs font-bold text-slate-900 truncate">{d.name}</div>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{d.topHawker}</p>
            <div className="text-[10px] text-amber-700 font-medium mt-1 truncate">
              {d.hiddenSecret}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
