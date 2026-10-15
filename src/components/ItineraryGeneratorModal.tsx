import React, { useState } from 'react';
import { X, Sparkles, MapPin, DollarSign, Clock, Users, Utensils, Compass } from 'lucide-react';
import { TripPreferences, TravelStyle, BudgetTier, Pace, CompanionType } from '../types';

interface ItineraryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prefs: TripPreferences) => Promise<void>;
  isLoading: boolean;
}

export const ItineraryGeneratorModal: React.FC<ItineraryGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
}) => {
  const [tripName, setTripName] = useState('My Singapore Expedition');
  const [durationDays, setDurationDays] = useState(3);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('hidden-gems');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [dailyBudgetSgd, setDailyBudgetSgd] = useState(90);
  const [pace, setPace] = useState<Pace>('moderate');
  const [companion, setCompanion] = useState<CompanionType>('solo');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Hawker Food',
    'Hidden Gems',
    'Peranakan Heritage',
  ]);
  const [selectedDiet, setSelectedDiet] = useState<string[]>([]);

  if (!isOpen) return null;

  const styleOptions: { id: TravelStyle; title: string; desc: string; icon: string }[] = [
    {
      id: 'hidden-gems',
      title: 'Hidden Gems Hunter',
      desc: 'Off-the-beaten-path colonial estates, quiet ceramic alleys, secret rooftops',
      icon: '💎'
    },
    {
      id: 'hawker-foodie',
      title: 'Hawker & Culinary Devotee',
      desc: 'Michelin Bib Gourmands, century-old kopitiams, satay streets & laksa spots',
      icon: '🍜'
    },
    {
      id: 'culture-heritage',
      title: 'Culture & Heritage',
      desc: 'Chinatown shophouses, Kampong Glam spice routes, Little India shrines',
      icon: '🏛️'
    },
    {
      id: 'nature-green',
      title: 'Nature & Tropical Lush',
      desc: 'Botanic Gardens, Southern Ridges canopy walks, mangrove boardwalks',
      icon: '🌿'
    },
    {
      id: 'architecture-photo',
      title: 'Architecture & Visuals',
      desc: 'Futuristic Marina Bay biodomes, brutalist complexes, pastel facades',
      icon: '📸'
    },
  ];

  const interestTags = [
    'Hawker Food',
    'Hidden Gems',
    'Peranakan Heritage',
    'Street Photography',
    'Sunset & Skyline',
    'Coffee Roasters',
    'Craft Beer & Cocktails',
    'Canopy Treks',
    'Late Night Dining'
  ];

  const dietaryTags = [
    'Halal Friendly',
    'Vegetarian / Vegan',
    'No Pork or Lard',
    'Seafood Obsessed',
    'No Spicy Food'
  ];

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleDiet = (tag: string) => {
    setSelectedDiet(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleBudgetTierChange = (tier: BudgetTier) => {
    setBudgetTier(tier);
    if (tier === 'budget') setDailyBudgetSgd(45);
    else if (tier === 'moderate') setDailyBudgetSgd(95);
    else setDailyBudgetSgd(260);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      tripName,
      durationDays,
      travelStyle,
      budgetTier,
      dailyBudgetSgd,
      pace,
      companion,
      interests: selectedInterests,
      dietaryRestrictions: selectedDiet,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Custom Singapore Itinerary Generator</h2>
              <p className="text-xs text-slate-500">Optimized routes, hidden neighborhood spots & real budget caps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Trip Name & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Trip Name</label>
              <input
                type="text"
                value={tripName}
                onChange={e => setTripName(e.target.value)}
                placeholder="e.g., 3-Day Singapore Hawker & Heritage Trip"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Duration (Days)</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      durationDays === d
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Travel Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Primary Travel Flavor</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {styleOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTravelStyle(opt.id)}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    travelStyle === opt.id
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <span>{opt.icon}</span>
                    <span>{opt.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Budget Constraints */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>Daily Budget Constraint (per person)</span>
              </label>
              <span className="text-sm font-bold text-amber-700 font-mono-numbers">
                S$ {dailyBudgetSgd} <span className="text-xs font-normal text-slate-500">/ day</span>
              </span>
            </div>

            {/* Tier Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleBudgetTierChange('budget')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                  budgetTier === 'budget'
                    ? 'bg-white border-amber-600 text-amber-900 font-semibold shadow-xs'
                    : 'bg-transparent border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                Backpacker (S$45/d)
              </button>
              <button
                type="button"
                onClick={() => handleBudgetTierChange('moderate')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                  budgetTier === 'moderate'
                    ? 'bg-white border-amber-600 text-amber-900 font-semibold shadow-xs'
                    : 'bg-transparent border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                Comfort (S$95/d)
              </button>
              <button
                type="button"
                onClick={() => handleBudgetTierChange('luxury')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                  budgetTier === 'luxury'
                    ? 'bg-white border-amber-600 text-amber-900 font-semibold shadow-xs'
                    : 'bg-transparent border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                Upscale (S$260/d)
              </button>
            </div>

            <input
              type="range"
              min="30"
              max="400"
              step="5"
              value={dailyBudgetSgd}
              onChange={e => setDailyBudgetSgd(parseInt(e.target.value, 10))}
              className="w-full accent-amber-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>S$30 (Hawker feast + MRT)</span>
              <span>Total for {durationDays} days: S${dailyBudgetSgd * durationDays}</span>
              <span>S$400+ (Rooftops & fine dining)</span>
            </div>
          </div>

          {/* Pace & Companions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Exploration Pace</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['relaxed', 'moderate', 'packed'] as Pace[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPace(p)}
                    className={`py-1.5 text-xs font-medium rounded-lg capitalize border ${
                      pace === p
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Travel Party</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['solo', 'couple', 'friends', 'family'] as CompanionType[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCompanion(c)}
                    className={`py-1.5 text-xs font-medium rounded-lg capitalize border ${
                      companion === c
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interests & Dietary Tags */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Special Highlights to Prioritize</label>
              <div className="flex flex-wrap gap-1.5">
                {interestTags.map(tag => {
                  const active = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`text-xs py-1 px-2.5 rounded-lg border transition-colors ${
                        active
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
                <Utensils className="w-3.5 h-3.5 text-slate-500" />
                <span>Dietary Considerations</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {dietaryTags.map(tag => {
                  const active = selectedDiet.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDiet(tag)}
                      className={`text-xs py-1 px-2.5 rounded-lg border transition-colors ${
                        active
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-600/20 active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Curating Itinerary & Transit Routes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Singapore Itinerary</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
