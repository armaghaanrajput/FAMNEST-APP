
import React, { useState } from 'react';
import { FamilyMember, Role } from '../types';
import { MOCK_MEMBERS, ICONS } from '../constants';

interface FamilyDirectoryProps {
  currentUser: FamilyMember;
  onBack: () => void;
  onSelectMember: (id: string) => void;
  onOpenScanner: () => void;
  onCall: (id: string, type: 'voice' | 'video') => void;
}

const FamilyDirectory: React.FC<FamilyDirectoryProps> = ({ currentUser, onBack, onSelectMember, onOpenScanner, onCall }) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const members = MOCK_MEMBERS.filter(m => m.id !== 'ai');

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pt-6 pb-20 max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Family Members</h1>
        </div>
        <button onClick={onOpenScanner} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 11v1m4-6h1m-11 0h1m2-2h4m-4 4h4m1-4v4M7 9v4m10-4v4M5 5h3v3H5V5zm0 11h3v3H5v-3zm11-11h3v3h-3V5zm0 11h3v3h-3v-3z" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 px-4">
        {members.map(member => (
          <button 
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className={`p-6 rounded-[2.5rem] bg-white border shadow-sm transition-all text-center flex flex-col items-center group ${selectedMember?.id === member.id ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.02]' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <div className="relative mb-4">
              <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full border-4 border-slate-50 group-hover:scale-105 transition-transform" />
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${member.id === currentUser.id ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm truncate w-full">{member.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{member.role}</p>
            {member.id === currentUser.id && <span className="mt-2 text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Me</span>}
          </button>
        ))}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedMember(null)}></div>
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm relative z-10 text-center shadow-2xl border border-white/20">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="mb-6 flex flex-col items-center">
              <img src={selectedMember.avatar} alt={selectedMember.name} className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-lg mb-4" />
              <h2 className="text-2xl font-black text-slate-900">{selectedMember.name}</h2>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em]">{selectedMember.role}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-[2.5rem] border border-slate-100 mb-6 inline-block">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedMember.id)}`} 
                alt="Member QR" 
                className="w-32 h-32 mix-blend-multiply" 
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {selectedMember.id !== currentUser.id ? (
                <>
                  <button 
                    onClick={() => { onSelectMember(selectedMember.id); setSelectedMember(null); }}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{ICONS.Chat}</span>
                    <span>Send Message</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => onCall(selectedMember.id, 'voice')}
                      className="bg-emerald-50 text-emerald-600 py-3.5 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>{ICONS.Phone}</span>
                      <span>Voice</span>
                    </button>
                    <button 
                      onClick={() => onCall(selectedMember.id, 'video')}
                      className="bg-indigo-50 text-indigo-600 py-3.5 rounded-2xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>{ICONS.Video}</span>
                      <span>Video</span>
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 font-medium">This is your connection code</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto px-6 py-8 bg-slate-900 text-white rounded-[3rem] shadow-xl mx-4 relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="font-bold mb-2 flex items-center space-x-2">
             <span className="text-indigo-400">🛡️</span>
             <span>Universal Connection</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Every family member has a unique identity. Connect instantly for safe, private messaging and calling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FamilyDirectory;
