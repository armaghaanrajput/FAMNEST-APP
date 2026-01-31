
import React, { useState, useRef } from 'react';
import { StatusUpdate, StatusType, Role } from '../types';
import { ICONS, MOCK_MEMBERS } from '../constants';

interface StatusCreatorProps {
  onCancel: () => void;
  onPost: (status: Partial<StatusUpdate>) => void;
}

const COLORS = ['#6366f1', '#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#6b7280', '#000000'];

const StatusCreator: React.FC<StatusCreatorProps> = ({ onCancel, onPost }) => {
  const [type, setType] = useState<StatusType>('text');
  const [content, setContent] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const [privacy, setPrivacy] = useState<'Everyone' | 'Selected' | 'Parents Only'>('Everyone');
  const [excludedMembers, setExcludedMembers] = useState<string[]>([]);
  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onPost({
          type: 'image',
          content: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleExclude = (id: string) => {
    setExcludedMembers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'text' && !content.trim()) return;
    onPost({
      type: type,
      content: content.trim(),
      backgroundColor: type === 'text' ? COLORS[bgIndex] : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between text-white relative z-10">
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-xl">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-lg font-bold">Add Status</h2>
        <button 
          onClick={handleSubmit}
          disabled={type === 'text' && !content.trim()}
          className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold disabled:opacity-50"
        >
          Post
        </button>
      </div>

      {/* Editor Area */}
      <div 
        className="flex-1 flex flex-col items-center justify-center p-12 transition-colors duration-500 relative"
        style={{ backgroundColor: type === 'text' ? COLORS[bgIndex] : '#0f172a' }}
      >
        {type === 'text' ? (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent border-none text-white text-3xl font-black text-center placeholder:text-white/40 outline-none resize-none no-scrollbar leading-tight"
            rows={5}
          />
        ) : (
          <div className="text-center text-white/40 space-y-4">
             <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto text-white scale-[1.5]">
                {ICONS.Camera}
             </div>
             <p className="font-bold">Tap to upload a photo</p>
             <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
             />
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/20 px-8 py-3 rounded-full text-white font-bold hover:bg-white/30 transition-all"
             >
                Choose from Gallery
             </button>
          </div>
        )}

        {/* Privacy Trigger */}
        <button 
          onClick={() => setShowPrivacyOptions(true)}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full text-[10px] font-bold text-white/80 border border-white/10 transition-all"
        >
           {ICONS.Lock}
           <span className="uppercase tracking-widest">Privacy: {privacy}</span>
        </button>
      </div>

      {/* Toolbox & Controls */}
      <div className="p-8 pb-12 flex flex-col items-center space-y-6 bg-black/40 backdrop-blur-xl border-t border-white/5">
         {type === 'text' && (
           <div className="flex space-x-3">
              {COLORS.map((c, i) => (
                <button 
                  key={c} 
                  onClick={() => setBgIndex(i)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${bgIndex === i ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
           </div>
         )}

         <div className="flex bg-white/10 rounded-full p-1.5 border border-white/10">
            <button 
              onClick={() => setType('text')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${type === 'text' ? 'bg-white text-slate-900 shadow-md' : 'text-white/60'}`}
            >
               <span className="font-serif">Aa</span>
               <span>Text</span>
            </button>
            <button 
              onClick={() => setType('image')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${type === 'image' ? 'bg-white text-slate-900 shadow-md' : 'text-white/60'}`}
            >
               <span className="scale-[0.8]">{ICONS.Camera}</span>
               <span>Photo</span>
            </button>
         </div>

         <div className="flex flex-col items-center space-y-1">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em]">Disappears in 24 hours</p>
            <p className="text-[9px] text-indigo-400 font-medium italic">Safety Check: Parents supervise children's updates.</p>
         </div>
      </div>

      {/* Privacy Settings Modal */}
      {showPrivacyOptions && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowPrivacyOptions(false)}></div>
           <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 pb-12 relative z-10 animate-in slide-in-from-bottom-20 duration-500">
              <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-black text-slate-900 mb-6">Who can see my status?</h3>
              
              <div className="space-y-3 mb-8">
                 {['Everyone', 'Selected', 'Parents Only'].map(option => (
                    <button 
                      key={option}
                      onClick={() => setPrivacy(option as any)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${privacy === option ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                    >
                       <span className="font-bold">{option}</span>
                       {privacy === option && <span className="scale-[0.8]">{ICONS.Check}</span>}
                    </button>
                 ))}
              </div>

              {privacy === 'Selected' && (
                 <div className="mb-8 animate-in fade-in zoom-in-95">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Exclude Members</h4>
                    <div className="flex flex-wrap gap-2">
                       {MOCK_MEMBERS.filter(m => m.id !== 'ai' && m.id !== '1').map(member => (
                          <button 
                            key={member.id}
                            onClick={() => handleToggleExclude(member.id)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${excludedMembers.includes(member.id) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                          >
                             <img src={member.avatar} className="w-5 h-5 rounded-full" />
                             <span className="text-[10px] font-bold">{member.name}</span>
                             {excludedMembers.includes(member.id) && <span className="text-[10px]">🔕</span>}
                          </button>
                       ))}
                    </div>
                 </div>
              )}

              <button 
                onClick={() => setShowPrivacyOptions(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
              >
                 Confirm Privacy
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default StatusCreator;
