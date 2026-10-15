import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  QrCode, 
  Send, 
  Sparkles, 
  Heart,
  MessageCircle
} from 'lucide-react';
import { FullItinerary, Collaborator } from '../types';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: FullItinerary | null;
  onAddCollaborator: (name: string) => void;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  onAddCollaborator,
}) => {
  const [copied, setCopied] = useState(false);
  const [whatsappCopied, setWhatsappCopied] = useState(false);
  const [inviteName, setInviteName] = useState('');

  if (!isOpen) return null;

  const shareCode = itinerary?.shareCode || 'LION-SG88';
  const shareUrl = `${window.location.origin}?trip=${shareCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWhatsapp = () => {
    if (!itinerary) return;
    const text = `🇸🇬 *Singapore Trip: ${itinerary.title}*\n` +
      `📅 Duration: ${itinerary.days?.length || 3} Days | Budget: S$${itinerary.preferences?.dailyBudgetSgd}/day\n\n` +
      itinerary.days?.map(d => `*Day ${d.dayNumber}: ${d.theme}*\n` + d.stops.map(s => `• ${s.title} (${s.mrtStation})`).join('\n')).join('\n\n') +
      `\n\n🔗 Join & vote on our itinerary here: ${shareUrl}`;
    
    navigator.clipboard.writeText(text);
    setWhatsappCopied(true);
    setTimeout(() => setWhatsappCopied(false), 2500);
  };

  const handleAddBuddy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;
    onAddCollaborator(inviteName.trim());
    setInviteName('');
  };

  const collaborators: Collaborator[] = itinerary?.collaborators || [
    { id: '1', name: 'Trip Organizer (You)', avatarColor: '#0284c7', role: 'owner' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Collaborative Trip Planning</h2>
              <p className="text-xs text-slate-500">Plan together, vote on hidden gems, and split expenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Code & Quick Link */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Trip Invite Code</span>
              <span className="px-2.5 py-1 text-xs font-bold font-mono-numbers bg-white border border-slate-300 rounded-lg text-slate-900">
                {shareCode}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social Export / WhatsApp */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyWhatsapp}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>{whatsappCopied ? 'Formatted Text Copied!' : 'Copy for WhatsApp Group'}</span>
            </button>
          </div>

          {/* Travel Buddies List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Co-Travelers in this Trip ({collaborators.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">Can vote & add tips</span>
            </h4>

            <div className="space-y-2">
              {collaborators.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase"
                      style={{ backgroundColor: c.avatarColor || '#0284c7' }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{c.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                    Active
                  </span>
                </div>
              ))}
            </div>

            {/* Invite Form */}
            <form onSubmit={handleAddBuddy} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Travel buddy's name..."
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Add Buddy
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
