
import React, { useState, useRef, useEffect } from 'react';
import { Chat, ChatMessage, FamilyMember, Role, MessageType } from '../types';
import { ICONS, MOCK_MEMBERS } from '../constants';

interface ChatWindowProps {
  chat: Chat;
  messages: ChatMessage[];
  currentUser: FamilyMember;
  onBack: () => void;
  onSendMessage: (text: string, type?: MessageType, mediaData?: string, replyToId?: string) => void;
  onDeleteMessage: (msgId: string) => void;
  onStarMessage: (msgId: string) => void;
  onCall?: (type: 'voice' | 'video') => void;
  isBlocked?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chat, messages, currentUser, onBack, onSendMessage, onDeleteMessage, onStarMessage, onCall, isBlocked
}) => {
  const [input, setInput] = useState('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'full' | 'starred'>('full');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (viewMode === 'full') {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewMode]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
      stopVisualizer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopVisualizer();
    };
  }, [isRecording]);

  const stopVisualizer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    audioContextRef.current = null;
    analyzerRef.current = null;
  };

  const startVisualizer = (stream: MediaStream) => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioCtx();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    audioContextRef.current = audioContext;
    analyzerRef.current = analyzer;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvasRef.current || !analyzerRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      analyzerRef.current.getByteFrequencyData(dataArray);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(79, 70, 229)`; 
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const handleMessageTap = (msgId: string) => {
    setActiveMessageId(prev => (prev === msgId ? null : msgId));
  };

  const handleSend = async () => {
    if (isBlocked || uploadProgress !== null) return;
    if (isRecording) {
      stopRecording();
      return;
    }
    if (!input.trim()) return;
    const text = input.trim();
    const replyId = replyingTo?.id;
    setInput('');
    setReplyingTo(null);
    onSendMessage(text, 'text', undefined, replyId);
  };

  const startRecording = async () => {
    if (isBlocked || uploadProgress !== null) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage('Voice message', 'voice', base64Audio, replyingTo?.id);
          setReplyingTo(null);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startVisualizer(stream);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopVisualizer();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioChunksRef.current = [];
      stopVisualizer();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileClick = (type: 'image' | 'file' = 'file') => {
    if (isBlocked || uploadProgress !== null) return;
    if (currentUser.role === Role.CHILD) {
      const proceed = window.confirm(
        "🛡️ Safety Check: Parents will be notified of shared media. Please only send family-friendly photos. Proceed?"
      );
      if (!proceed) return;
    }
    
    if (type === 'image') {
      fileInputRef.current?.setAttribute('accept', 'image/*');
    } else {
      fileInputRef.current?.setAttribute('accept', 'image/*,.pdf,.doc,.docx');
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload progress
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          onSendMessage('', file.type.startsWith('image/') ? 'image' : 'system', event.target?.result as string);
          setUploadProgress(null);
        };
        reader.readAsDataURL(file);
      }
      setUploadProgress(progress);
    }, 200);

    e.target.value = '';
  };

  const toggleVoicePlayback = (msgId: string, url: string) => {
    if (currentlyPlaying === msgId) {
      audioRef.current?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setCurrentlyPlaying(msgId);
      }
    }
  };

  const displayedMessages = viewMode === 'starred' ? messages.filter(m => m.isStarred) : messages;

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-2rem)] bg-slate-50 md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 animate-in slide-in-from-right-4 duration-500 relative">
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} className="hidden" />
      
      <header className="bg-white px-4 py-3 flex items-center border-b border-slate-100 shrink-0 shadow-sm z-20">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 mr-2 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center flex-1 min-w-0 cursor-pointer group">
          <div className="relative">
            <img src={chat.avatar} alt={chat.name} className={`w-10 h-10 rounded-full shrink-0 border border-slate-100 object-cover ${isBlocked ? 'grayscale' : ''}`} />
            {isBlocked && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full p-0.5 border border-white">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
              </span>
            )}
          </div>
          <div className="ml-3 truncate">
            <h2 className="font-bold text-slate-800 leading-tight truncate">
              {viewMode === 'starred' ? 'Starred Messages' : chat.name}
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isBlocked ? 'text-red-500' : 'text-emerald-500'}`}>
              {isBlocked ? 'Contact Blocked' : (viewMode === 'starred' ? `${displayedMessages.length} saved` : 'Active Now')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setViewMode(v => v === 'full' ? 'starred' : 'full')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'starred' ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {ICONS.Star}
          </button>
          {!isBlocked && (
            <>
              <button onClick={() => onCall?.('voice')} className="p-2 text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors">{ICONS.Phone}</button>
              <button onClick={() => onCall?.('video')} className="p-2 text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors">{ICONS.Video}</button>
            </>
          )}
        </div>
      </header>

      {isBlocked && (
        <div className="bg-red-50 p-3 flex items-center justify-center space-x-2 border-b border-red-100 animate-in slide-in-from-top-4">
          <span className="text-red-500">🚫</span>
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">You have blocked this contact. Unblock to send messages.</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]/40 relative chat-pattern">
        {viewMode === 'starred' && displayedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-amber-400 mb-4 shadow-sm border border-white">
              <span className="scale-[1.5]">{ICONS.Star}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Starred Messages</h3>
            <p className="text-sm text-slate-500 max-w-xs mt-2">Long press any message and select "Star" to save it for quick access here.</p>
            <button onClick={() => setViewMode('full')} className="mt-6 text-indigo-600 font-bold text-sm bg-white px-6 py-2.5 rounded-full shadow-sm border border-slate-100">Back to chat</button>
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isAi = msg.senderId === 'ai';
            const replyMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative group`}>
                <div 
                  onClick={() => handleMessageTap(msg.id)}
                  className={`max-w-[85%] min-w-[80px] rounded-2xl p-2.5 shadow-sm relative transition-all cursor-pointer select-none ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : isAi 
                        ? 'bg-purple-50 text-slate-800 border border-purple-100 rounded-tl-none'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  } ${activeMessageId === msg.id ? 'ring-4 ring-indigo-500/20 scale-[0.98]' : ''}`}
                >
                  {replyMsg && (
                    <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${isMe ? 'bg-white/10 border-white/40 text-indigo-50' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <p className="font-bold truncate">{replyMsg.senderName}</p>
                      <p className="truncate italic">{replyMsg.type === 'image' ? 'Image' : replyMsg.text}</p>
                    </div>
                  )}

                  {!isMe && chat.type === 'group' && <p className="text-[10px] font-bold text-indigo-500 mb-0.5">{msg.senderName}</p>}
                  
                  {msg.type === 'image' ? (
                    <div className="py-1"><img src={msg.text} alt="Shared" className="rounded-xl max-w-full max-h-72 object-cover border border-slate-100/10" /></div>
                  ) : msg.type === 'voice' ? (
                    <div className="py-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleVoicePlayback(msg.id, msg.mediaUrl || ''); }}
                        className={`flex items-center space-x-3 p-3 rounded-2xl transition-all ${isMe ? 'bg-indigo-700/50 hover:bg-indigo-700' : 'bg-slate-50 hover:bg-slate-100'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white shadow-md'}`}>
                          {currentlyPlaying === msg.id ? ICONS.Pause : ICONS.Play}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className={`h-1 rounded-full overflow-hidden ${isMe ? 'bg-white/20' : 'bg-slate-200'}`}>
                            <div className={`h-full bg-indigo-500 transition-all duration-300 ${currentlyPlaying === msg.id ? 'animate-progress-pulse' : 'w-0'}`} style={{ width: currentlyPlaying === msg.id ? '100%' : '0%' }}></div>
                          </div>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <p className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}

                  <div className={`flex items-center justify-end mt-1 space-x-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.isStarred && <span className="scale-[0.7] text-amber-400 fill-amber-400">{ICONS.Star}</span>}
                    <span className="text-[9px] font-bold uppercase">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <span className="scale-[0.6]">{ICONS.Check}</span>}
                  </div>

                  {activeMessageId === msg.id && (
                    <div className={`absolute bottom-full mb-2 z-30 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 flex flex-col min-w-[120px] ${isMe ? 'right-0' : 'left-0 animate-in fade-in zoom-in-95'}`}>
                      {!isBlocked && (
                        <button onClick={() => {setReplyingTo(msg); setActiveMessageId(null);}} className="px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-2">
                          <span className="scale-[0.7]">{ICONS.Reply}</span><span>Reply</span>
                        </button>
                      )}
                      <button onClick={() => {onStarMessage(msg.id); setActiveMessageId(null);}} className="px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-2">
                        <span className={`scale-[0.7] ${msg.isStarred ? 'text-amber-500' : ''}`}>{ICONS.Star}</span>
                        <span>{msg.isStarred ? 'Unstar' : 'Star'}</span>
                      </button>
                      <div className="h-px bg-slate-50 my-1 mx-1.5"></div>
                      {(isMe || currentUser.role === Role.PARENT) && (
                        <button onClick={() => {onDeleteMessage(msg.id); setActiveMessageId(null);}} className="px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2">
                          <span className="scale-[0.7] text-red-400">{ICONS.Trash}</span><span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      <div className={`bg-white border-t border-slate-100 shrink-0 shadow-lg relative z-20 ${viewMode === 'starred' ? 'hidden' : ''} ${isBlocked ? 'opacity-50 pointer-events-none' : ''}`}>
        {replyingTo && (
          <div className="px-4 py-2 bg-slate-50 flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-2 border-l-4 border-indigo-500 pl-3 py-1">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-indigo-600">{replyingTo.senderName}</p>
                <p className="text-xs text-slate-500 truncate italic">{replyingTo.text}</p>
              </div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploadProgress !== null && (
          <div className="px-4 pt-2 pb-1 bg-white border-t border-slate-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-1.5">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Processing Attachment...</span>
               <span className="text-[10px] font-black text-indigo-600">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-600 transition-all duration-300 shadow-[0_0_8px_rgba(79,70,229,0.4)]" 
                 style={{ width: `${uploadProgress}%` }}
               />
            </div>
          </div>
        )}

        {isRecording && (
          <div className="px-6 py-4 bg-white flex flex-col space-y-3">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                  <span className="text-lg font-black text-slate-900 tabular-nums">{formatTime(recordingTime)}</span>
               </div>
               <button onClick={cancelRecording} className="text-[10px] font-black text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-red-100">Cancel</button>
            </div>
            <div className="h-12 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
               <canvas ref={canvasRef} className="w-full h-full" width={400} height={48} />
            </div>
          </div>
        )}

        <div className="p-4 flex items-center space-x-2">
          {!isRecording && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <div className="flex space-x-1 shrink-0">
                <button 
                  onClick={() => handleFileClick('file')} 
                  disabled={uploadProgress !== null}
                  className={`p-2 rounded-full transition-colors ${uploadProgress !== null ? 'opacity-20' : 'text-slate-400 hover:bg-slate-50'}`} 
                  title="Attach Files"
                >
                  {ICONS.Clip}
                </button>
                <button 
                  onClick={() => handleFileClick('image')} 
                  disabled={uploadProgress !== null}
                  className={`p-2 rounded-full transition-all ${uploadProgress !== null ? 'opacity-20' : 'text-indigo-500 bg-indigo-50 hover:bg-indigo-100'}`} 
                  title="Attach Image"
                >
                  {ICONS.Camera}
                </button>
                <button className={`p-2 text-slate-400 hover:bg-slate-50 rounded-full ${uploadProgress !== null ? 'opacity-20' : ''}`}>{ICONS.Emoji}</button>
              </div>
              <div className="flex-1">
                <input
                  type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isBlocked ? "Contact is blocked" : uploadProgress !== null ? "Waiting for upload..." : "Type a message..."}
                  disabled={isBlocked || uploadProgress !== null}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                />
              </div>
            </>
          )}
          <button 
            onClick={() => input.trim() ? handleSend() : isRecording ? stopRecording() : startRecording()}
            disabled={(isBlocked && !input.trim()) || uploadProgress !== null}
            className={`p-3.5 rounded-full transition-all shadow-2xl ${
              input.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : isRecording ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-100 text-slate-400'
            } ${uploadProgress !== null ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          >
            {input.trim() ? <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg> : ICONS.Mic}
          </button>
        </div>
      </div>

      <style>{`
        .chat-pattern {
          background-image: radial-gradient(#334155 0.5px, transparent 0.5px);
          background-size: 20px 20px;
          background-attachment: fixed;
        }
        @keyframes progress-pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        .animate-progress-pulse { animation: progress-pulse 1s infinite ease-in-out; }
      `}</style>

      {activeMessageId && <div className="fixed inset-0 z-10" onClick={() => setActiveMessageId(null)}></div>}
    </div>
  );
};

export default ChatWindow;
