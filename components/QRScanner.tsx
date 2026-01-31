
import React, { useState } from 'react';
import { ICONS, MOCK_MEMBERS } from '../constants';

interface QRScannerProps {
  onBack: () => void;
  onScanSuccess: (memberId: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onBack, onScanSuccess }) => {
  const [isSimulating, setIsSimulating] = useState(false);

  const handleMockScan = (memberId: string) => {
    setIsSimulating(true);
    setTimeout(() => {
      onScanSuccess(memberId);
      setIsSimulating(false);
    }, 1200);
  };

  const others = MOCK_MEMBERS.filter(m => m.id !== '1' && m.id !== 'ai');

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 flex items-center justify-between z-10 text-white bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight">QR Scanner</h1>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8">
        <div className="w-full aspect-square max-w-[280px] relative">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl"></div>

          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-scan-line z-10"></div>

          <div className="w-full h-full bg-slate-900/40 backdrop-blur-md rounded-3xl flex items-center justify-center overflow-hidden border border-white/10">
             <div className="text-white/10 scale-[5]">{ICONS.QRCode}</div>
             {isSimulating && (
                <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center animate-pulse">
                  <div className="bg-white p-4 rounded-3xl shadow-2xl">
                     <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
             )}
          </div>
        </div>

        <div className="mt-12 w-full max-w-sm">
          <p className="text-center text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Nearby Member Codes</p>
          <div className="grid grid-cols-3 gap-3">
             {others.map(m => (
               <button 
                key={m.id}
                disabled={isSimulating}
                onClick={() => handleMockScan(m.id)}
                className="flex flex-col items-center space-y-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
               >
                 <img src={m.avatar} className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform" alt={m.name} />
                 <span className="text-[10px] text-white/80 font-bold truncate w-full text-center">{m.name.split(' ')[0]}</span>
               </button>
             ))}
          </div>
          <p className="mt-10 text-center text-white/30 text-[10px] leading-relaxed font-medium">
            Position a family member's unique connection QR within the frame to instantly link dashboards.
          </p>
        </div>
      </div>

      <div className="p-8 text-center bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-[9px] text-white/30 uppercase tracking-[0.5em] font-black">FamilyConnect Secure Discovery</p>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
