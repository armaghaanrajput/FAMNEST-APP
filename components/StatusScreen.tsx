
import React, { useState, useEffect } from 'react';
import { StatusUpdate, FamilyMember, Role } from '../types';
import { ICONS } from '../constants';

interface StatusScreenProps {
  currentUser: FamilyMember;
  statuses: StatusUpdate[];
  onAddStatus: () => void;
  onDeleteStatus: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onReply: (id: string, text: string) => void;
}

const StatusScreen: React.FC<StatusScreenProps> = ({ currentUser, statuses, onAddStatus, onDeleteStatus, onReact, onReply }) => {
  const [activeStatus, setActiveStatus] = useState<StatusUpdate | null>(null);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');

  // Auto-advance logic for active status
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeStatus) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveStatus(null);
            return 0;
          }
          return prev + 2;
        });
      }, 150); // Slightly slower for better readability
    }
    return () => clearInterval(timer);
  }, [activeStatus]);

  // Update activeStatus object when statuses prop changes (to reflect new reactions instantly)
  useEffect(() => {
    if (activeStatus) {
      const updated = statuses.find(s => s.id === activeStatus.id);
      if (updated) setActiveStatus(updated);
    }
  }, [statuses]);

  const sortedStatuses = [...statuses].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  const myStatuses = sortedStatuses.filter(s => s.senderId === currentUser.id);
  const othersStatuses = sortedStatuses.filter(s => s.senderId !== currentUser.id);

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return '1d ago';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6 pb-24 max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 px-4">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Family Stories</h1>
        <div className="flex space-x-2">
          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">{ICONS.Dots}</button>
        </div>
      </div>

      <div className="px-4 space-y-8">
        {/* My Status Section */}
        <section>
          <div className="flex items-center p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <button 
              onClick={onAddStatus}
              className="relative shrink-0 group"
            >
              <div className={`w-14 h-14 rounded-full p-1 border-2 ${myStatuses.length > 0 ? 'border-indigo-500' : 'border-slate-100'}`}>
                <img src={currentUser.avatar} alt="Me" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 border-2 border-white scale-75 shadow-md">
                {ICONS.Plus}
              </div>
            </button>
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-slate-800">My Status</h3>
              <p className="text-xs text-slate-400 font-medium">
                {myStatuses.length > 0 ? `Posted ${formatTime(myStatuses[0].timestamp)}` : 'Tap to add status update'}
              </p>
            </div>
            {myStatuses.length > 0 && (
              <button 
                onClick={() => setActiveStatus(myStatuses[0])}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl"
              >
                View
              </button>
            )}
          </div>
        </section>

        {/* Family Updates Section */}
        <section className="space-y-4">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2">Family Updates</h2>
          {othersStatuses.length > 0 ? (
            <div className="space-y-3">
              {othersStatuses.map(status => (
                <button 
                  key={status.id}
                  onClick={() => setActiveStatus(status)}
                  className="w-full flex items-center p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-full p-1 border-2 border-indigo-500 shrink-0">
                    <img src={status.senderAvatar} alt={status.senderName} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="ml-4 flex-1 overflow-hidden">
                    <h3 className="font-bold text-slate-800 truncate">{status.senderName}</h3>
                    <div className="flex items-center space-x-2">
                       <p className="text-xs text-slate-400 font-medium">{formatTime(status.timestamp)}</p>
                       {status.reactions.length > 0 && (
                          <div className="flex items-center space-x-1 bg-slate-50 px-1.5 py-0.5 rounded-full border border-slate-100">
                             <span className="text-[10px]">{status.reactions[0].emoji}</span>
                             <span className="text-[9px] font-black text-slate-400">{status.reactions.length}</span>
                          </div>
                       )}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {status.senderId === 'ai' ? (
                       <div className="bg-purple-50 text-purple-600 p-2 rounded-xl scale-75">
                          {ICONS.AI}
                       </div>
                    ) : (
                       <div className="bg-slate-50 text-slate-400 p-2 rounded-xl scale-75">
                          {ICONS.Forward}
                       </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">No updates from family yet.</p>
            </div>
          )}
        </section>
      </div>

      {/* Full Screen Status Viewer */}
      {activeStatus && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-300">
          {/* Progress Bar */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
             <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
             </div>
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
             <div className="flex items-center space-x-3">
                <img src={activeStatus.senderAvatar} alt="" className="w-10 h-10 rounded-full border border-white/20" />
                <div className="text-white">
                   <h4 className="text-sm font-bold">{activeStatus.senderName}</h4>
                   <p className="text-[10px] text-white/60 font-medium">{formatTime(activeStatus.timestamp)}</p>
                </div>
             </div>
             <div className="flex space-x-2">
                {(currentUser.role === Role.PARENT || activeStatus.senderId === currentUser.id) && (
                   <button onClick={() => { onDeleteStatus(activeStatus.id); setActiveStatus(null); }} className="p-2 text-white/60 hover:text-red-400">
                      {ICONS.Trash}
                   </button>
                )}
                <button onClick={() => setActiveStatus(null)} className="p-2 text-white/60 hover:text-white">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-8 relative">
             {activeStatus.type === 'image' ? (
                <img src={activeStatus.content} alt="" className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl" />
             ) : (
                <div 
                  className="w-full aspect-[9/16] max-h-[80vh] rounded-[3rem] flex items-center justify-center p-12 text-center text-white text-2xl font-black leading-tight shadow-2xl overflow-hidden"
                  style={{ backgroundColor: activeStatus.backgroundColor || '#6366f1' }}
                >
                   {activeStatus.content}
                </div>
             )}
          </div>

          {/* Bottom Actions */}
          <div className="p-8 pb-12 flex flex-col items-center space-y-6 bg-gradient-to-t from-black/60 to-transparent">
             {/* Reactions */}
             <div className="flex space-x-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-xl">
                {['❤️', '👍', '😀', '😋', '🔥'].map(emoji => {
                   const isReacted = activeStatus.reactions.some(r => r.userId === currentUser.id && r.emoji === emoji);
                   return (
                      <button 
                        key={emoji} 
                        onClick={(e) => { e.stopPropagation(); onReact(activeStatus.id, emoji); }}
                        className={`text-2xl transition-all duration-300 hover:scale-125 active:scale-90 ${isReacted ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] grayscale-0' : 'grayscale-[0.5] opacity-70 hover:opacity-100 hover:grayscale-0'}`}
                      >
                        {emoji}
                      </button>
                   );
                })}
             </div>

             {/* Reply field */}
             <div className="w-full max-w-sm flex items-center space-x-3">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Send a reply..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:bg-white/20 transition-all placeholder:text-white/40"
                  onKeyPress={(e) => e.key === 'Enter' && replyText.trim() && (onReply(activeStatus.id, replyText), setReplyText(''), setActiveStatus(null))}
                />
                <button 
                  onClick={() => { if(replyText.trim()){ onReply(activeStatus.id, replyText); setReplyText(''); setActiveStatus(null); } }}
                  className="p-3 bg-white text-slate-900 rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-xl"
                >
                   {ICONS.Forward}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusScreen;
