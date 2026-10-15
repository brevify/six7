import React, { useState, useEffect } from 'react';
import { 
  Train, 
  Activity, 
  Clock, 
  Users, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Compass,
  DollarSign
} from 'lucide-react';
import { TransitLineStatus } from '../types';
import { ALL_MRT_STATIONS, calculateMrtFare } from '../utils/transitCalculator';

interface TransitDashboardProps {
  isOfflineMode: boolean;
}

export const TransitDashboard: React.FC<TransitDashboardProps> = ({ isOfflineMode }) => {
  const [lines, setLines] = useState<TransitLineStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [isPeak, setIsPeak] = useState<boolean>(false);
  const [singaporeTime, setSingaporeTime] = useState<string>('');

  // Fare Calculator State
  const [originStation, setOriginStation] = useState<string>('City Hall');
  const [destStation, setDestStation] = useState<string>('Changi Airport');

  const fareResult = React.useMemo(() => {
    return calculateMrtFare(originStation, destStation);
  }, [originStation, destStation]);

  const fetchTransitStatus = async () => {
    if (isOfflineMode) {
      setLastRefreshed('Cached offline timetable');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/transit/live');
      if (res.ok) {
        const data = await res.json();
        setLines(data.lines || []);
        setIsPeak(data.isPeakHour);
        setSingaporeTime(data.singaporeTime);
        setLastRefreshed(new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore' }));
      }
    } catch (e) {
      console.warn('Transit fetch failed, using local offline schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransitStatus();
    const interval = setInterval(fetchTransitStatus, 30000); // 30s live refresh
    return () => clearInterval(interval);
  }, [isOfflineMode]);

  return (
    <div className="space-y-6">
      {/* Header Stat Strip */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Singapore MRT & Transit Live Radar</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Lines Operational
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time headway intervals, train frequency, crowd density & fare calculator
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-500">Singapore Time (SGT)</div>
            <div className="text-sm font-bold text-slate-900 font-mono-numbers">
              {singaporeTime || new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore' })}
            </div>
          </div>
          <button
            onClick={fetchTransitStatus}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Refresh Live Headways"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">SimplyGo Contactless Tap-In</h4>
            <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
              No paper tickets needed! Tap any Mastercard, Visa, Apple Pay, or Google Wallet directly at the MRT gantry or bus reader. Same standard adult fare (S$1.19 – S$2.37) as local resident cards.
            </p>
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-900">
              {isPeak ? 'Current Status: Peak Hour Transit Flow' : 'Current Status: Off-Peak Smooth Flow'}
            </h4>
            <p className="text-xs text-blue-800/90 mt-1 leading-relaxed">
              Peak hours: 07:30–09:30 & 17:30–19:30 on weekdays. Trains arrive every 2–3 minutes on North-South and East-West trunk lines.
            </p>
          </div>
        </div>
      </div>

      {/* 6 MRT Lines Live Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">MRT Network Line Headways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {lines.map(line => {
            return (
              <div
                key={line.lineCode}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: line.colorHex }}
                    />
                    <span className="text-xs font-bold text-slate-900">{line.lineName}</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Normal Service
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {line.statusMessage}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Headway</span>
                    <span className="font-semibold text-slate-800 font-mono-numbers">
                      {isPeak ? line.frequencyPeakMinutes : line.frequencyOffPeakMinutes}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Crowd Density</span>
                    <span className={`font-semibold ${
                      line.crowdLevel === 'Heavy' ? 'text-amber-600' : 'text-slate-700'
                    }`}>
                      {line.crowdLevel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SimplyGo Fare & Travel Time Calculator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">Interactive MRT Fare & Route Calculator</h3>
        </div>
        <p className="text-xs text-slate-500">
          Calculate distance-based adult SimplyGo fares between any Singapore MRT stations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Origin Station</label>
            <select
              value={originStation}
              onChange={e => setOriginStation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {ALL_MRT_STATIONS.map(s => (
                <option key={s.code + '-orig'} value={s.name}>
                  {s.name} ({s.code} - {s.line} Line)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Destination Station</label>
            <select
              value={destStation}
              onChange={e => setDestStation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {ALL_MRT_STATIONS.map(s => (
                <option key={s.code + '-dest'} value={s.name}>
                  {s.name} ({s.code} - {s.line} Line)
                </option>
              ))}
            </select>
          </div>

          {/* Result Card */}
          <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400">Adult SimplyGo Fare</div>
              <div className="text-lg font-bold text-amber-300 font-mono-numbers">
                S$ {fareResult.fareSgd.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Est. Travel Time</div>
              <div className="text-sm font-semibold font-mono-numbers">
                ~{fareResult.travelTimeMinutes} mins
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transit Rules & Etiquette Guide */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2.5">
        <h4 className="font-bold text-slate-900 text-sm">Singapore Transit Etiquette & Fines</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">🚫 No Food or Drink</span>
            Eating or sipping water/chewing gum on MRT trains carries a fine of up to S$500. Keep drinks sealed inside bags.
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">🚶 Stand on the Left</span>
            On all escalators in MRT stations, stand strictly on the left to leave the right side clear for commuters rushing to catch trains.
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">🚪 Let Passengers Alight First</span>
            Queue behind the yellow painted lines at MRT platform doors and wait for arriving passengers to step out before boarding.
          </div>
        </div>
      </div>
    </div>
  );
};
