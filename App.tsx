
import React, { useState, useEffect } from 'react';
import { FamilyMember, FamilyPlan, Role, PlanStatus, Notification as NotificationType, Chat, ChatMessage, MessageType, StatusUpdate, StatusReaction } from './types';
import { MOCK_MEMBERS, INITIAL_PLANS, ICONS, INITIAL_CHATS, INITIAL_STATUSES } from './constants';
import Dashboard from './components/Dashboard';
import FamilyPlans from './components/FamilyPlans';
import NotificationsList from './components/NotificationsList';
import PlanForm from './components/PlanForm';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import UserProfile from './components/UserProfile';
import QRScanner from './components/QRScanner';
import Settings from './components/Settings';
import FamilyDirectory from './components/FamilyDirectory';
import CallScreen from './components/CallScreen';
import StatusScreen from './components/StatusScreen';
import StatusCreator from './components/StatusCreator';
import { chatWithAI } from './services/geminiService';

type Screen = 'dashboard' | 'plans' | 'notifications' | 'chat-list' | 'chat-window' | 'create-plan' | 'edit-plan' | 'profile' | 'scanner' | 'settings' | 'directory' | 'call' | 'status' | 'create-status';

interface ActiveCall {
  targetMember: FamilyMember;
  type: 'voice' | 'video';
  isOffline: boolean;
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [currentUser] = useState<FamilyMember>(MOCK_MEMBERS[0]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    try {
      const parsed = JSON.parse(saved);
      if (key === 'statusUpdates') {
        return parsed.map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) }));
      }
      return parsed;
    } catch (e) {
      return defaultValue;
    }
  };

  const [plans, setPlans] = useState<FamilyPlan[]>(() => getInitialState('plans', INITIAL_PLANS));
  const [chats, setChats] = useState<Chat[]>(() => getInitialState('chats', INITIAL_CHATS));
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>(() => getInitialState('statusUpdates', INITIAL_STATUSES));
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => getInitialState('blockedUserIds', []));
  
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => getInitialState('chatMessages', {
    'c1': [{ id: 'm1', senderId: '2', senderName: 'Sarah', text: "Don't forget the pizza night!", timestamp: new Date(), type: 'text' }],
    'c2': [{ id: 'm2', senderId: 'ai', senderName: 'Family AI', text: "Hello! I'm your Family Assistant. How can I help today?", timestamp: new Date(), type: 'text' }],
    'c3': [{ id: 'm3', senderId: '2', senderName: 'Sarah', text: "See you soon!", timestamp: new Date(Date.now() - 3600000), type: 'text' }]
  }));

  const [notifications, setNotifications] = useState<NotificationType[]>(() => getInitialState('notifications', [
    { id: '1', title: 'New Plan', message: 'Sarah created "Family Dinner"', timestamp: new Date(), read: false },
    { id: '2', title: 'Reminder', message: 'Math Tutoring starts in 10 mins', timestamp: new Date(), read: false }
  ]));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => { localStorage.setItem('plans', JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem('chats', JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem('chatMessages', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('statusUpdates', JSON.stringify(statusUpdates)); }, [statusUpdates]);
  useEffect(() => { localStorage.setItem('blockedUserIds', JSON.stringify(blockedUserIds)); }, [blockedUserIds]);

  const navigateTo = (screen: Screen, params?: any) => {
    if (screen === 'chat-window' && typeof params === 'string') setSelectedChatId(params);
    setCurrentScreen(screen);
  };

  const addPlan = (newPlan: Partial<FamilyPlan>) => {
    const plan: FamilyPlan = { ...newPlan, id: Math.random().toString(36).substr(2, 9), isApproved: currentUser.role === Role.PARENT } as FamilyPlan;
    setPlans(prev => [plan, ...prev]);
    setCurrentScreen('plans');
  };

  const handleBlockUser = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    if (chat.type === 'individual') {
      const otherId = chat.participants.find(p => p !== currentUser.id);
      if (otherId && !blockedUserIds.includes(otherId)) {
        if (confirm(`Block ${chat.name}? You will no longer receive messages from them.`)) setBlockedUserIds(prev => [...prev, otherId]);
      }
    } else {
      if (confirm(`Block all messages from ${chat.name}?`)) alert(`${chat.name} has been blocked.`);
    }
  };

  const handleUnblockUser = (userId: string) => setBlockedUserIds(prev => prev.filter(id => id !== userId));

  const startCall = (memberId: string, type: 'voice' | 'video') => {
    if (blockedUserIds.includes(memberId)) { alert("You cannot call a blocked contact."); return; }
    const member = MOCK_MEMBERS.find(m => m.id === memberId);
    if (!member) return;
    if (currentUser.role === Role.CHILD && type === 'video') {
       if (!confirm("Safety Check: Supervised video call? Continue?")) return;
    }
    setActiveCall({ targetMember: member, type, isOffline: !isOnline });
    setCurrentScreen('call');
  };

  const handleReactToStatus = (statusId: string, emoji: string) => {
    setStatusUpdates(prev => prev.map(status => {
      if (status.id === statusId) {
        const existingReactionIndex = status.reactions.findIndex(r => r.userId === currentUser.id && r.emoji === emoji);
        let newReactions = [...status.reactions];
        if (existingReactionIndex > -1) {
          newReactions = newReactions.filter((_, i) => i !== existingReactionIndex);
        } else {
          newReactions = newReactions.filter(r => r.userId !== currentUser.id);
          newReactions.push({ emoji, userId: currentUser.id });
        }
        return { ...status, reactions: newReactions };
      }
      return status;
    }));
  };

  const sendMessage = async (text: string, type: MessageType = 'text', mediaData?: string, replyToId?: string) => {
    if (!selectedChatId) return;
    const chat = chats.find(c => c.id === selectedChatId);
    const otherId = chat?.participants.find(p => p !== currentUser.id);
    if (otherId && blockedUserIds.includes(otherId)) { alert("You cannot send messages to a blocked contact."); return; }

    const newMessage: ChatMessage = { id: Date.now().toString(), senderId: currentUser.id, senderName: currentUser.name, text: type === 'image' ? (mediaData || 'Image') : (type === 'voice' ? (mediaData || 'Voice') : text), timestamp: new Date(), type, status: 'sent', replyToId, mediaUrl: mediaData };
    setChatMessages(prev => ({ ...prev, [selectedChatId]: [...(prev[selectedChatId] || []), newMessage] }));
    setChats(prev => prev.map(c => c.id === selectedChatId ? { ...c, lastMessage: newMessage, unreadCount: 0 } : c));
    
    if (chat?.type === 'ai' && type === 'text') {
      if (!isOnline) {
        const offlineMsg: ChatMessage = { id: Date.now().toString() + '_off', senderId: 'ai', senderName: 'Family AI', text: "I'm offline right now!", timestamp: new Date(), type: 'text' };
        setChatMessages(prev => ({ ...prev, [selectedChatId]: [...(prev[selectedChatId] || []), offlineMsg] }));
        return;
      }
      try {
        const history = (chatMessages[selectedChatId] || []).map(m => ({ role: (m.senderId === 'ai' ? 'model' : 'user') as any, parts: [{ text: m.text }] }));
        const response = await chatWithAI(text, history);
        const aiMsg: ChatMessage = { id: Date.now().toString(), senderId: 'ai', senderName: 'Family AI', text: response || '...', timestamp: new Date(), type: 'text' };
        setChatMessages(prev => ({ ...prev, [selectedChatId]: [...(prev[selectedChatId] || []), aiMsg] }));
        setChats(prev => prev.map(c => c.id === selectedChatId ? { ...c, lastMessage: aiMsg } : c));
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-4 bg-slate-50 relative selection:bg-indigo-100">
      {!isOnline && <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-bold text-center py-1 z-[60] shadow-sm">LOCAL FAMILY NETWORK • OFFLINE CALLS ENABLED</div>}
      <div className="max-w-4xl mx-auto px-4">
        {currentScreen === 'call' && activeCall ? (
          <CallScreen targetMember={activeCall.targetMember} type={activeCall.type} isOffline={activeCall.isOffline} onEnd={() => setCurrentScreen('dashboard')} />
        ) : (
          (() => {
            switch (currentScreen) {
              case 'dashboard': return <Dashboard onNavigate={navigateTo} plans={plans} notificationsCount={notifications.filter(n => !n.read).length} isOnline={isOnline} />;
              case 'plans': return <FamilyPlans plans={plans} currentUser={currentUser} onAdd={() => setCurrentScreen('create-plan')} onEdit={() => {}} onDelete={id => setPlans(p => p.filter(x => x.id !== id))} onUpdateStatus={(id, status) => setPlans(p => p.map(x => x.id === id ? {...x, status} : x))} />;
              case 'status': return <StatusScreen currentUser={currentUser} statuses={statusUpdates} onAddStatus={() => setCurrentScreen('create-status')} onDeleteStatus={id => setStatusUpdates(s => s.filter(x => x.id !== id))} onReact={handleReactToStatus} onReply={(id, text) => sendMessage(text, 'text')} />;
              case 'create-status': return <StatusCreator onCancel={() => setCurrentScreen('status')} onPost={s => { setStatusUpdates(prev => [{ ...s, id: Date.now().toString(), senderId: currentUser.id, senderName: currentUser.name, senderAvatar: currentUser.avatar, timestamp: new Date(), viewers: [], reactions: [] } as StatusUpdate, ...prev]); setCurrentScreen('status'); }} />;
              case 'chat-list': return <ChatList chats={chats} currentUser={currentUser} onSelectChat={id => { setSelectedChatId(id); setCurrentScreen('chat-window'); }} onPinChat={() => {}} onMuteChat={() => {}} onArchiveChat={() => {}} onDeleteChat={() => {}} onReportChat={() => {}} onBlockChat={handleBlockUser} onOpenSettings={() => setCurrentScreen('settings')} blockedUserIds={blockedUserIds} />;
              case 'chat-window':
                const chat = chats.find(c => c.id === selectedChatId);
                if (!chat) return null;
                const isBlocked = chat.type === 'individual' && blockedUserIds.includes(chat.participants.find(p => p !== currentUser.id) || '');
                return <ChatWindow chat={chat} messages={chatMessages[selectedChatId!] || []} currentUser={currentUser} onBack={() => setCurrentScreen('chat-list')} onSendMessage={sendMessage} onDeleteMessage={() => {}} onStarMessage={() => {}} onCall={(t) => startCall(chat.participants[0], t)} isBlocked={isBlocked} />;
              case 'create-plan': return <PlanForm currentUser={currentUser} onSubmit={addPlan} onCancel={() => setCurrentScreen('plans')} />;
              case 'notifications': return <NotificationsList notifications={notifications} onBack={() => setCurrentScreen('dashboard')} onClear={() => setNotifications([])} />;
              case 'profile': return <UserProfile member={currentUser} onBack={() => setCurrentScreen('dashboard')} onOpenScanner={() => setCurrentScreen('scanner')} />;
              case 'scanner': return <QRScanner onBack={() => setCurrentScreen('directory')} onScanSuccess={id => { const m = MOCK_MEMBERS.find(x => x.id === id); if(m) { setSelectedChatId(id); setCurrentScreen('chat-window'); } }} />;
              case 'settings': return <Settings currentUser={currentUser} onBack={() => setCurrentScreen('dashboard')} onLogout={() => alert('Logged out.')} blockedUserIds={blockedUserIds} onUnblockUser={handleUnblockUser} />;
              case 'directory': return <FamilyDirectory currentUser={currentUser} onBack={() => setCurrentScreen('dashboard')} onSelectMember={id => { setSelectedChatId(id); setCurrentScreen('chat-window'); }} onOpenScanner={() => setCurrentScreen('scanner')} onCall={startCall} />;
              default: return <Dashboard onNavigate={navigateTo} plans={plans} notificationsCount={0} isOnline={isOnline} />;
            }
          })()
        )}
      </div>
      {currentScreen !== 'call' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around py-3 md:hidden shadow-2xl z-50">
          <button onClick={() => setCurrentScreen('dashboard')} className={`p-2 rounded-xl transition-all ${currentScreen === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>{ICONS.Home}</button>
          <button onClick={() => setCurrentScreen('chat-list')} className={`p-2 rounded-xl transition-all ${currentScreen.includes('chat') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>{ICONS.Chat}</button>
          <button onClick={() => setCurrentScreen('status')} className={`p-2 rounded-xl transition-all ${currentScreen === 'status' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>{ICONS.Status}</button>
          <button onClick={() => setCurrentScreen('directory')} className={`p-2 rounded-xl transition-all ${currentScreen === 'directory' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>{ICONS.QRCode}</button>
          <button onClick={() => setCurrentScreen('settings')} className={`p-2 rounded-xl transition-all ${currentScreen === 'settings' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>{ICONS.Cog}</button>
        </nav>
      )}
    </div>
  );
};

export default App;
