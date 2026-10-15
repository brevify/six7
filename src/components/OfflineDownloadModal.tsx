import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CheckCircle2, 
  HardDrive, 
  WifiOff, 
  Wifi, 
  Printer, 
  PhoneCall, 
  BookOpen,
  MapPin
} from 'lucide-react';
import { FullItinerary } from '../types';
import { offlineStorage, OfflinePackData } from '../utils/offlineStorage';
import { ALL_MRT_STATIONS } from '../utils/transitCalculator';

interface OfflineDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: FullItinerary | null;
  isOfflineMode: boolean;
  setIsOfflineMode: (val: boolean) => void;
}

export const OfflineDownloadModal: React.FC<OfflineDownloadModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  isOfflineMode,
  setIsOfflineMode,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cachedPack, setCachedPack] = useState<OfflinePackData | null>(offlineStorage.getOfflinePack());

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setDownloadProgress(20);

    const timer1 = setTimeout(() => setDownloadProgress(60), 300);
    const timer2 = setTimeout(() => {
      setDownloadProgress(100);

      const pack: OfflinePackData = {
        downloadedAt: new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
        version: 'SG-2026.1',
        sizeKb: 1420,
        itinerary,
        emergencyHotlines: [
          { name: 'Police Emergency', number: '999', note: '24/7 Toll-free' },
          { name: 'Ambulance & Fire', number: '995', note: 'Emergency rescue' },
          { name: 'Tourist Hotline (STB)', number: '1800 736 2000', note: 'Visitor assistance' },
          { name: 'SMRT Transit Lost & Found', number: '1800 336 8900', note: 'MRT & Buses' },
        ],
        essentialPhrases: [
          { term: 'Chope', meaning: 'To reserve a table', usage: 'Place a tissue packet on a hawker table' },
          { term: 'Dabao', meaning: 'Takeaway / To go', usage: '"Uncle, chicken rice dabao"' },
          { term: 'Kopi-C', meaning: 'Coffee with evaporated milk & sugar', usage: 'Local staple morning brew' },
          { term: 'Shiok', meaning: 'Delicious or extremely pleasurable', usage: 'Expressing love for food' },
        ],
        mrtStationList: ALL_MRT_STATIONS.map(s => ({ code: s.code, name: s.name, line: s.line })),
      };

      offlineStorage.saveOfflinePack(pack);
      setCachedPack(pack);
      setDownloading(false);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Singapore Offline Map & Pocket Pack</h2>
              <p className="text-xs text-slate-500">Navigate seamlessly without international data roaming</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Offline Cache Status Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Storage Footprint</span>
              <span className="text-xs font-bold text-slate-900 font-mono-numbers">1.4 MB (Local Cache)</span>
            </div>

            {cachedPack ? (
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/70 p-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">Offline Pack Downloaded: </span>
                  <span>Ready for offline use ({cachedPack.downloadedAt})</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Download includes Singapore vector map coordinates, full MRT transit network, all itinerary stops, local tips, and hawker recommendations.
              </p>
            )}

            {/* Progress bar during download */}
            {downloading && (
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 text-right font-mono-numbers">
                  Caching vector tiles & stations... {downloadProgress}%
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>{cachedPack ? 'Re-Sync Offline Map Pack' : 'Download Offline Map Pack'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                title="Print or Save PDF Pocket Guide"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print PDF Guide</span>
              </button>
            </div>
          </div>

          {/* Test Offline Mode Simulator */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Simulate Offline / Flight Mode</span>
              </div>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Test the app as if you just landed at Changi Airport without mobile data roaming.
              </p>
            </div>

            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                isOfflineMode
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {isOfflineMode ? 'Turn Online' : 'Turn Offline'}
            </button>
          </div>

          {/* Emergency Hotlines Included in Offline Pack */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
              <span>Singapore Emergency & Tourist Hotlines</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Police Emergency</span>
                <span className="font-bold text-slate-900 font-mono-numbers">999</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Ambulance & Fire</span>
                <span className="font-bold text-slate-900 font-mono-numbers">995</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Tourist Helpline (STB)</span>
                <span className="font-bold text-slate-900 font-mono-numbers">1800 736 2000</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">SMRT Lost & Found</span>
                <span className="font-bold text-slate-900 font-mono-numbers">1800 336 8900</span>
              </div>
            </div>
          </div>

          {/* Singlish & Hawker Survival Lexicon */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Hawker Survival Pocket Lexicon</span>
            </h4>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-1.5 flex justify-between">
                <span className="font-bold text-slate-800">Chope</span>
                <span className="text-slate-500">To reserve table with tissue pack</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="font-bold text-slate-800">Dabao (打包)</span>
                <span className="text-slate-500">Takeaway meal to go</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="font-bold text-slate-800">Kopi-O / Kopi-C</span>
                <span className="text-slate-500">Black coffee / with evaporated milk</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="font-bold text-slate-800">Uncle / Aunty</span>
                <span className="text-slate-500">Respectful term for hawker stall owners</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
