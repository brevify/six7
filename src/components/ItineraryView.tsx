import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  ThumbsUp, 
  MessageSquare, 
  Check, 
  Share2, 
  Navigation, 
  Sparkles, 
  Plus, 
  Train, 
  Footprints,
  Info,
  ExternalLink,
  Utensils
} from 'lucide-react';
import { ActivityStop, FullItinerary, DayItinerary } from '../types';

interface ItineraryViewProps {
  itinerary: FullItinerary | null;
  onOpenGenerator: () => void;
  onSelectMapStop: (stop: ActivityStop) => void;
  onVoteStop: (stopId: string) => void;
  onAddNote: (stopId: string, text: string) => void;
  onToggleVisited: (stopId: string) => void;
  onQuickLogExpense: (stop: ActivityStop) => void;
  onOpenCollab: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onOpenGenerator,
  onSelectMapStop,
  onVoteStop,
  onAddNote,
  onToggleVisited,
  onQuickLogExpense,
  onOpenCollab,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeNoteStopId, setActiveNoteStopId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-sm max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Ready to Explore Singapore?</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Generate an intelligent, transit-optimized itinerary tailored to your budget constraints, hidden gem preferences, and hawker cravings.
        </p>
        <button
          onClick={onOpenGenerator}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md active:scale-98"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate Custom Itinerary</span>
        </button>
      </div>
    );
  }

  const currentDay: DayItinerary = itinerary.days[selectedDayIndex] || itinerary.days[0];

  const handleNoteSubmit = (stopId: string) => {
    if (!noteInput.trim()) return;
    onAddNote(stopId, noteInput.trim());
    setNoteInput('');
    setActiveNoteStopId(null);
  };

  return (
    <div className="space-y-6">
      {/* Itinerary Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                {itinerary.preferences?.travelStyle === 'hawker-foodie' ? 'Hawker & Culinary Focus' : 'Hidden Gems & Local Culture'}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">Budget: S${itinerary.preferences?.dailyBudgetSgd}/day</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {itinerary.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Curated for {itinerary.preferences?.companion} pace with route-optimized MRT connections, authentic hawker feasts, and local secret enclaves.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCollab}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Share & Collaborate</span>
            </button>
            <button
              onClick={onOpenGenerator}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Day Selector Segmented Tabs */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1">
          {itinerary.days.map((day, idx) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all text-left border ${
                selectedDayIndex === idx
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div>Day {day.dayNumber}</div>
              <div className={`text-[10px] font-normal ${selectedDayIndex === idx ? 'text-slate-300' : 'text-slate-400'}`}>
                {day.districtFocus}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Overview */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-amber-900">{currentDay.theme}</span>
          <p className="text-xs text-amber-800/80 mt-0.5">{currentDay.summary}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-amber-950 font-mono-numbers">
          <span>Est. Spend: S$ {currentDay.totalEstimatedCostSgd}</span>
          <span>·</span>
          <span>Walking: ~{currentDay.totalWalkingKm} km</span>
        </div>
      </div>

      {/* Day Timeline */}
      <div className="space-y-4">
        {currentDay.stops.map((stop, sIdx) => {
          const transitLeg = currentDay.transitLegs?.[sIdx];
          const isNoteOpen = activeNoteStopId === stop.id;

          return (
            <div key={stop.id} className="space-y-4">
              {/* Activity Card */}
              <div
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                  stop.visited ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200/90 hover:border-slate-300'
                } shadow-xs`}
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Photo or Fallback Graphic */}
                  <div className="sm:w-56 h-40 sm:h-auto rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative group">
                    {stop.photoUrl ? (
                      <img
                        src={stop.photoUrl}
                        alt={stop.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-amber-800 p-3 text-center">
                        <MapPin className="w-8 h-8 opacity-70 mb-1" />
                        <span className="text-[11px] font-bold">{stop.district}</span>
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-900/85 text-white backdrop-blur-xs">
                      {stop.timeSlot}
                    </span>
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                            {stop.category === 'food' ? 'Hawker & Food Spot' : stop.category === 'hidden-gem' ? 'Hidden Enclave' : 'Sight & Culture'}
                          </span>
                          {stop.highlightTag && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs font-semibold text-slate-700">{stop.highlightTag}</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">{stop.title}</h3>
                        <p className="text-xs text-slate-500">{stop.locationName} · {stop.district}</p>
                      </div>

                      {/* Visited Checkbox */}
                      <button
                        onClick={() => onToggleVisited(stop.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                          stop.visited
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{stop.visited ? 'Visited' : 'Mark Visited'}</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {stop.description}
                    </p>

                    {/* Insider Tips Box */}
                    {stop.localTip && (
                      <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Local Pro Tip: </span>
                          <span>{stop.localTip}</span>
                        </div>
                      </div>
                    )}

                    {/* Food Recommendation if any */}
                    {stop.foodRecommendation && (
                      <div className="bg-orange-50/70 border border-orange-200/60 p-3 rounded-xl text-xs text-orange-950 flex items-start gap-2">
                        <Utensils className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">What to Order: </span>
                          <span>{stop.foodRecommendation}</span>
                        </div>
                      </div>
                    )}

                    {/* Stop Footer Strip */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-amber-600" />
                          {stop.mrtStation}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-slate-900 font-mono-numbers">
                          {stop.costSgd === 0 ? 'Free Entry' : `Est. S$ ${stop.costSgd}`}
                        </span>
                      </div>

                      {/* Collaborative & Action Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onVoteStop(stop.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Vote / Upvote this stop"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono-numbers">{stop.upvotes || 0}</span>
                        </button>

                        <button
                          onClick={() => setActiveNoteStopId(isNoteOpen ? null : stop.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Traveler notes & tips"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                          <span>{stop.notes?.length || 0}</span>
                        </button>

                        <button
                          onClick={() => onSelectMapStop(stop)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>View on Map</span>
                        </button>

                        <button
                          onClick={() => onQuickLogExpense(stop)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium transition-colors"
                          title="Record as expense in Budget"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                          <span>Log Expense</span>
                        </button>
                      </div>
                    </div>

                    {/* Collaborative Notes Dropdown */}
                    {isNoteOpen && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <h4 className="text-xs font-bold text-slate-800">Co-Traveler Notes & Tips</h4>
                        {stop.notes && stop.notes.length > 0 ? (
                          <div className="space-y-1.5">
                            {stop.notes.map((n, idx) => (
                              <div key={idx} className="bg-slate-50 p-2 rounded-lg text-xs text-slate-700">
                                {n}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No notes left by travel buddies yet.</p>
                        )}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add a travel note or reminder..."
                            value={noteInput}
                            onChange={e => setNoteInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleNoteSubmit(stop.id)}
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                          />
                          <button
                            onClick={() => handleNoteSubmit(stop.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                          >
                            Post Note
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transit Leg Connection Between Stops */}
              {transitLeg && (
                <div className="pl-6 sm:pl-10 relative">
                  <div className="absolute left-6 sm:left-10 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />
                  <div className="relative inline-flex items-center gap-2 bg-slate-100/90 px-3.5 py-2 rounded-xl text-xs text-slate-700 border border-slate-200/60 my-1">
                    {transitLeg.mode === 'mrt' ? (
                      <Train className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span className="font-semibold text-slate-900">{transitLeg.routeDescription}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono-numbers">~{transitLeg.durationMinutes} mins</span>
                    {transitLeg.estimatedCostSgd > 0 && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="font-bold text-amber-700 font-mono-numbers">
                          S$ {transitLeg.estimatedCostSgd.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
