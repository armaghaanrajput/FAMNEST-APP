
import React, { useState, useEffect } from 'react';
import { FamilyMember } from '../types';
import { MOCK_MEMBERS } from '../constants';

interface CallScreenProps {
  targetMember: FamilyMember;
  type: 'voice' | 'video';
  isOffline?: boolean;
  onEnd: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ targetMember, type, isOffline, onEnd }) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'ringing' | 'active'>('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    const ringingTimeout = setTimeout(() => setCallStatus('ringing'), 2000);
    const activeTimeout = setTimeout(() => setCallStatus('active'), 5000);
    return () => { clearTimeout(ringingTimeout); clearTimeout(activeTimeout); };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === 'active') {
      timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-between text-white overflow-hidden animate-in fade-in duration-500">
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 bg-amber-600 text-white text-[10px] font-black text-center py-2 z-50 uppercase tracking-widest shadow-lg">
          Local Family Link Mode (Offline)
        </div>
      )}

      {type === 'video' && !isCameraOff && (
        <div className="absolute inset-0 bg-slate-800">
          <div className="w-full h-full opacity-40 blur-3xl scale-150 animate-pulse bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="absolute top-10 right-6 w-32 h-48 bg-slate-700 rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden z-20">
             <img src={MOCK_MEMBERS[0].avatar} alt="Me" className="w-full h-full object-cover grayscale opacity-50" />
          </div>
        </div>
      )}

      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            {callStatus !== 'active' && <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-25"></div>}
            <img 
              src={targetMember.avatar} 
              alt={targetMember.name} 
              className={`w-36 h-36 rounded-full border-4 border-white/20 shadow-2xl relative z-10 transition-transform duration-700 ${callStatus === 'active' ? 'scale-90' : 'scale-110'} ${isOffline ? 'grayscale' : ''}`} 
            />
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tight">{targetMember.name}</h2>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            <p className="text-sm font-bold uppercase tracking-widest text-white/60">
              {callStatus === 'calling' ? 'Connecting...' : callStatus === 'ringing' ? 'Ringing...' : formatDuration(callDuration)}
            </p>
          </div>
          <p className="mt-4 text-xs font-bold text-white/40 uppercase tracking-[0.3em]">
            {isOffline ? 'Local Peer-to-Peer' : (type === 'video' ? 'Family Video Call' : 'Secure Voice Call')}
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-10 pb-16 pt-8 bg-gradient-to-t from-black/60 to-transparent">
        <div className="grid grid-cols-4 gap-4 mb-10">
          <button onClick={() => setIsMuted(!isMuted)} className={`flex flex-col items-center justify-center space-y-2`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />{isMuted && <path d="M3 3l18 18" />}</svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Mute</span>
          </button>
          <button onClick={() => setIsSpeakerOn(!isSpeakerOn)} className={`flex flex-col items-center justify-center space-y-2`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isSpeakerOn ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Speaker</span>
          </button>
          {type === 'video' && (
            <button onClick={() => setIsCameraOff(!isCameraOff)} className={`flex flex-col items-center justify-center space-y-2`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCameraOff ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />{isCameraOff && <path d="M3 3l18 18" />}</svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Camera</span>
            </button>
          )}
          <button className={`flex flex-col items-center justify-center space-y-2`}>
            <div className={`w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Chat</span>
          </button>
        </div>
        <button onClick={onEnd} className="w-full bg-red-600 hover:bg-red-700 py-6 rounded-[2.5rem] flex items-center justify-center space-x-3 transition-all shadow-2xl active:scale-95 group">
          <div className="bg-white/20 p-2 rounded-full group-hover:rotate-45 transition-transform"><svg className="w-6 h-6 text-white rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.47 5.47l.773-1.547a1 1 0 011.062-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></div>
          <span className="text-lg font-black uppercase tracking-[0.2em]">End Call</span>
        </button>
      </div>
    </div>
  );
};

export default CallScreen;
