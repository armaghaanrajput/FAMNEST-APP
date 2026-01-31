
import React, { useState } from 'react';
import { Chat, FamilyMember } from '../types';
import { ICONS } from '../constants';

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  currentUser: FamilyMember;
  onPinChat: (id: string) => void;
  onMuteChat: (id: string) => void;
  onArchiveChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onReportChat: (id: string) => void;
  onBlockChat: (id: string) => void;
  onOpenSettings: () => void;
  blockedUserIds: string[];
}

const ChatList: React.FC<ChatListProps> = ({ 
  chats, onSelectChat, currentUser, onPinChat, onMuteChat, onArchiveChat, onDeleteChat, onReportChat, onBlockChat, onOpenSettings, blockedUserIds
}) => {
  const [search, setSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredChats = chats
    .filter(c => !c.isArchived)
    .filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.lastMessage?.text.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0);
    });

  const handleLongPress = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    setActiveMenuId(id === activeMenuId ? null : id);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-left-4 duration-500 relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Chats</h1>
          <div className="flex space-x-2">
             <button 
                onClick={onOpenSettings}
                className="p-2 hover:bg-slate-50 rounded-full text-indigo-600 transition-colors"
                title="Settings"
             >
              {ICONS.Cog}
            </button>
             <button className="p-2 hover:bg-slate-50 rounded-full text-indigo-600 transition-colors">
              {ICONS.Dots}
            </button>
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {ICONS.Search}
          </span>
          <input 
            type="text" 
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? filteredChats.map((chat) => {
          const isBlocked = chat.type === 'individual' && blockedUserIds.includes(chat.participants.find(p => p !== currentUser.id) || '');
          
          return (
            <div key={chat.id} className="relative group">
              <button
                onClick={() => activeMenuId ? setActiveMenuId(null) : onSelectChat(chat.id)}
                onContextMenu={(e) => handleLongPress(e, chat.id)}
                className={`w-full flex items-center p-4 hover:bg-slate-50 transition-colors border-b border-slate-50/50 ${activeMenuId === chat.id ? 'bg-slate-100' : ''} ${isBlocked ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="relative shrink-0">
                  <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full border border-slate-100 object-cover" />
                  {chat.type === 'ai' && (
                    <span className="absolute -bottom-1 -right-1 bg-purple-500 p-1.5 rounded-full border-2 border-white shadow-sm text-white">
                      <div className="scale-[0.5]">{ICONS.AI}</div>
                    </span>
                  )}
                  {isBlocked && (
                    <span className="absolute -bottom-1 -right-1 bg-red-500 p-1 rounded-full border-2 border-white text-white">
                       <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                    </span>
                  )}
                </div>
                <div className="ml-4 flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="flex items-center space-x-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{chat.name}</h3>
                      {chat.isMuted && <span className="text-slate-300">{ICONS.Muted}</span>}
                      {isBlocked && <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Blocked</span>}
                    </div>
                    <span className={`text-[10px] font-bold ${chat.unreadCount > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {chat.lastMessage?.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500 truncate pr-4 leading-tight">
                      {isBlocked ? 'This contact is blocked' : (chat.lastMessage?.senderId === currentUser.id ? 'You: ' : '') + (chat.lastMessage?.text || 'No messages yet')}
                    </p>
                    <div className="flex items-center space-x-2 shrink-0">
                      {chat.isPinned && <span className="text-slate-300">{ICONS.Pin}</span>}
                      {chat.unreadCount > 0 && !isBlocked && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Options Menu (Overlay) */}
              {activeMenuId === chat.id && (
                <div className="absolute right-4 top-4 z-20 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => {onPinChat(chat.id); setActiveMenuId(null);}} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-3">
                    <span className="text-slate-400">{ICONS.Pin}</span>
                    <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                  <button onClick={() => {onMuteChat(chat.id); setActiveMenuId(null);}} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-3">
                    <span className="text-slate-400">{ICONS.Muted}</span>
                    <span>{chat.isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>
                  <button onClick={() => {onBlockChat(chat.id); setActiveMenuId(null);}} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center space-x-3">
                    <span className="text-red-400">🚫</span>
                    <span>{isBlocked ? 'Already Blocked' : 'Block Contact'}</span>
                  </button>
                  <button onClick={() => {onReportChat(chat.id); setActiveMenuId(null);}} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-3">
                    <span className="text-slate-400">{ICONS.Report}</span>
                    <span>Report</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                  <button onClick={() => {onDeleteChat(chat.id); setActiveMenuId(null);}} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center space-x-3">
                    <span className="text-red-400">{ICONS.Trash}</span>
                    <span>Delete Chat</span>
                  </button>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-center py-24 px-8">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
               {ICONS.Chat}
             </div>
            <p className="text-slate-400 text-sm font-medium">No chats yet. Tap + to start a new conversation.</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-200 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-10">
        {ICONS.Plus}
      </button>

      {/* Backdrop for Menu */}
      {activeMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
      )}
    </div>
  );
};

export default ChatList;
