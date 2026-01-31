
import React from 'react';
import { FamilyMember, Role } from '../types';
import { ICONS } from '../constants';

interface UserProfileProps {
  member: FamilyMember;
  onBack: () => void;
  onOpenScanner: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ member, onBack, onOpenScanner }) => {
  // Use a public QR code generation API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(member.id)}`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6 pb-20 max-w-md mx-auto h-full flex flex-col">
      <div className="flex items-center space-x-4 mb-8 px-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <img src={member.avatar} alt={member.name} className="w-32 h-32 rounded-full border-4 border-white shadow-lg ring-1 ring-slate-100" />
          <span className={`absolute bottom-1 right-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-md ${member.role === Role.PARENT ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
            {member.role}
          </span>
        </div>
        
        <h2 className="text-2xl font-extrabold text-slate-900">{member.name}</h2>
        <p className="text-slate-500 text-sm mt-1 mb-8">Ready to connect with your family</p>

        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 w-full max-w-[280px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Your Connection QR</p>
          <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Ask a family member to scan this code to quickly start a chat or call with you.
          </p>
        </div>

        <button 
          onClick={onOpenScanner}
          className="w-full flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100"
        >
          <span className="scale-110">{ICONS.QRCode}</span>
          <span>Scan Someone Else</span>
        </button>
      </div>

      <div className="mt-8 p-6 bg-slate-900 text-white rounded-[2.5rem] shadow-xl">
        <h4 className="font-bold mb-2 flex items-center space-x-2">
           <span className="text-indigo-400">🛡️</span>
           <span>Safe Discovery</span>
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          QR codes are only for family members. If a child scans a code, parents will be notified to ensure a safe connection.
        </p>
      </div>
    </div>
  );
};

export default UserProfile;
