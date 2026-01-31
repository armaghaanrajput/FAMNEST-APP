
import React, { useState } from 'react';
import { FamilyMember, Role } from '../types';
import { ICONS, MOCK_MEMBERS } from '../constants';

interface SettingsProps {
  currentUser: FamilyMember;
  onBack: () => void;
  onLogout: () => void;
  blockedUserIds: string[];
  onUnblockUser: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, onBack, onLogout, blockedUserIds, onUnblockUser }) => {
  const [settingsState, setSettingsState] = useState({
    readReceipts: true,
    msgNotifications: true,
    groupNotifications: true,
    aiNotifications: false,
    vibration: true,
    popupPrevs: true,
    backupEnabled: true,
    backupFreq: 'Daily',
    backupNetwork: 'Wi-Fi Only',
    backupIncludeVideos: false,
    lastSeen: 'My Contacts',
    profileVisibility: 'Everyone',
    aboutVisibility: 'My Contacts',
    statusPrivacy: 'Everyone',
    statusDuration: '24h',
    tone: 'Default',
    muteDuration: 'None',
    childSupervision: currentUser.role === Role.PARENT,
    aiRestriction: false,
    mediaSharing: 'Allow All',
    timeLimit: 'No Limit',
    planApproval: 'Optional'
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [mutedStatusMembers, setMutedStatusMembers] = useState<string[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const toggleSetting = (key: string) => {
    setSettingsState(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] as any }));
  };

  const handleToggleMute = (id: string) => {
    setMutedStatusMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setTimeout(() => { setIsBackingUp(false); alert("Backup complete! Your family data is secure."); }, 3000);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="px-6 pt-8 pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
  );

  const SettingsRow = ({ icon, label, sublabel, onClick, toggle, destructive, keyName }: any) => (
    <button 
      onClick={toggle !== undefined ? () => toggleSetting(keyName) : onClick}
      className={`w-full flex items-center px-6 py-4.5 hover:bg-slate-50 transition-colors border-b border-slate-50/50 text-left ${destructive ? 'text-red-600' : 'text-slate-800'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${destructive ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>{icon}</div>
      <div className="ml-4 flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-500 truncate mt-0.5">{sublabel}</p>}
      </div>
      {toggle !== undefined ? (
        <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${toggle ? 'bg-indigo-600' : 'bg-slate-200'}`}>
          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${toggle ? 'right-1' : 'left-1'}`}></div>
        </div>
      ) : <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-500 pb-24 overflow-y-auto no-scrollbar relative">
      <div className="p-4 border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-40 flex items-center space-x-4 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      </div>

      <SectionHeader title="Profile Settings" />
      <div className="px-6 py-6 flex items-center space-x-5 border-b border-slate-100">
        <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-[2rem] border-4 border-slate-50 shadow-xl object-cover" />
        <div className="flex-1 space-y-2">
          <input type="text" defaultValue={currentUser.name} className="w-full text-xl font-extrabold text-slate-900 bg-transparent border-none focus:ring-0 p-0" />
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em]">{currentUser.role}</p>
        </div>
      </div>

      <SectionHeader title="Privacy Settings" />
      <SettingsRow icon={ICONS.Info} label="Last Seen" sublabel={settingsState.lastSeen} onClick={() => setActiveModal('lastSeen')} />
      <SettingsRow icon={ICONS.Phone} label="Profile Photo Visibility" sublabel={settingsState.profileVisibility} onClick={() => setActiveModal('visibility')} />
      <SettingsRow icon={ICONS.Info} label="About / Status Text" sublabel={settingsState.aboutVisibility} onClick={() => setActiveModal('about')} />
      <SettingsRow icon={ICONS.Status} label="Status (Stories) Privacy" sublabel={settingsState.statusPrivacy} onClick={() => setActiveModal('statusSettings')} />
      <SettingsRow icon={ICONS.Lock} label="Blocked Contacts" sublabel={`${blockedUserIds.length} members`} onClick={() => setActiveModal('blocked')} />
      <SettingsRow icon={ICONS.Archive} label="Chat Backup" sublabel={`${settingsState.backupFreq} • ${settingsState.backupNetwork}`} onClick={() => setActiveModal('backup')} />

      <SectionHeader title="Notifications" />
      <SettingsRow icon={ICONS.Speaker} label="Notification Tone" sublabel={settingsState.tone} onClick={() => setActiveModal('tone')} />

      <SectionHeader title="Account" />
      <SettingsRow icon={ICONS.Logout} label="Log Out" onClick={onLogout} />

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
           <div className="w-full max-w-md bg-white rounded-t-[3rem] p-8 pb-12 z-10 animate-in slide-in-from-bottom-8 overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="space-y-6 pb-4">
                {activeModal === 'visibility' && (
                  <>
                    <h4 className="text-xl font-bold text-slate-900 text-center">Profile Photo</h4>
                    {['Everyone', 'My Contacts', 'Nobody'].map(o => (
                      <button key={o} onClick={() => setSettingsState(s => ({ ...s, profileVisibility: o }))} className={`w-full flex items-center justify-between p-4 rounded-2xl border ${settingsState.profileVisibility === o ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100'}`}><span className="font-bold">{o}</span>{settingsState.profileVisibility === o && <span className="scale-[0.8]">{ICONS.Check}</span>}</button>
                    ))}
                  </>
                )}
                {activeModal === 'about' && (
                  <>
                    <h4 className="text-xl font-bold text-slate-900 text-center">About / Status Text</h4>
                    {['Everyone', 'My Contacts', 'Nobody'].map(o => (
                      <button key={o} onClick={() => setSettingsState(s => ({ ...s, aboutVisibility: o }))} className={`w-full flex items-center justify-between p-4 rounded-2xl border ${settingsState.aboutVisibility === o ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100'}`}><span className="font-bold">{o}</span>{settingsState.aboutVisibility === o && <span className="scale-[0.8]">{ICONS.Check}</span>}</button>
                    ))}
                  </>
                )}
                {activeModal === 'statusSettings' && (
                  <>
                    <h4 className="text-xl font-bold text-slate-900 text-center">Status Privacy</h4>
                    {[{id: 'Everyone', l: 'My Family'}, {id: 'Selected Members', l: 'Selected Members'}, {id: 'Parents Only', l: 'Parents Only'}].map(o => (
                      <button key={o.id} onClick={() => setSettingsState(s => ({ ...s, statusPrivacy: o.id }))} className={`w-full flex items-center justify-between p-5 rounded-2xl border ${settingsState.statusPrivacy === o.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100'}`}><span className="font-bold">{o.l}</span>{settingsState.statusPrivacy === o.id && <span className="scale-[0.8]">{ICONS.Check}</span>}</button>
                    ))}
                  </>
                )}
                {activeModal === 'lastSeen' && (
                  <>
                    <h4 className="text-xl font-bold text-slate-900 text-center">Last Seen</h4>
                    {['Everyone', 'My Contacts', 'Nobody'].map(o => (
                      <button key={o} onClick={() => setSettingsState(s => ({ ...s, lastSeen: o }))} className={`w-full flex items-center justify-between p-4 rounded-2xl border ${settingsState.lastSeen === o ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100'}`}><span className="font-bold">{o}</span>{settingsState.lastSeen === o && <span className="scale-[0.8]">{ICONS.Check}</span>}</button>
                    ))}
                  </>
                )}
                {activeModal === 'backup' && (
                  <>
                    <h4 className="text-xl font-bold text-slate-900 text-center">Chat Backup</h4>
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <p className="font-bold text-slate-800">Start Backup</p>
                      <button onClick={handleBackupNow} disabled={isBackingUp} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs disabled:opacity-50">{isBackingUp ? 'Backing up...' : 'Now'}</button>
                    </div>
                    {['Daily', 'Weekly', 'Monthly', 'Never'].map(o => (
                      <button key={o} onClick={() => setSettingsState(s => ({ ...s, backupFreq: o }))} className={`w-full flex items-center justify-between p-4 rounded-2xl border ${settingsState.backupFreq === o ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100'}`}><span className="font-bold">{o}</span>{settingsState.backupFreq === o && <span className="scale-[0.8]">{ICONS.Check}</span>}</button>
                    ))}
                  </>
                )}
                {activeModal === 'tone' && (
                  <>
                    <h4 className="text-xl font-bold text-slate-900 text-center">Notification Tone</h4>
                    {['Default', 'Joyful', 'Alert', 'Bell', 'Minimal'].map(t => (
                      <button key={t} onClick={() => setSettingsState(s => ({ ...s, tone: t }))} className={`w-full flex items-center justify-between p-4 rounded-2xl border ${settingsState.tone === t ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-100'}`}><span className="font-bold">{t}</span>{settingsState.tone === t && <span className="scale-[0.8]">{ICONS.Check}</span>}</button>
                    ))}
                  </>
                )}
                {activeModal === 'blocked' && (
                  <>
                    <h4 className="text-xl font-bold text-slate-900 text-center">Blocked Contacts</h4>
                    {blockedUserIds.length > 0 ? blockedUserIds.map(id => {
                      const m = MOCK_MEMBERS.find(x => x.id === id);
                      return m ? <div key={id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="font-bold">{m.name}</span><button onClick={() => onUnblockUser(id)} className="text-indigo-600 font-bold text-xs uppercase">Unblock</button></div> : null;
                    }) : <p className="text-center text-slate-400">No blocked contacts.</p>}
                  </>
                )}
              </div>
              <button onClick={() => setActiveModal(null)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 mt-4">Save & Close</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
