
import React from 'react';
import { Notification } from '../types';
import { ICONS } from '../constants';

interface NotificationsListProps {
  notifications: Notification[];
  onBack: () => void;
  onClear: () => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ notifications, onBack, onClear }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pt-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
        </div>
        {notifications.length > 0 && (
          <button onClick={onClear} className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors">Clear All</button>
        )}
      </div>

      <div className="space-y-3 px-4">
        {notifications.length > 0 ? notifications.map((n) => (
          <div key={n.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-start space-x-4 hover:shadow-md transition-shadow">
            <div className="mt-1 p-2.5 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
              {ICONS.Bell}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-slate-800">{n.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
            </div>
          </div>
        )) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 text-slate-300 rounded-full mb-6">
              {ICONS.Bell}
            </div>
            <p className="text-slate-400 font-medium">You're all caught up!</p>
          </div>
        )}
      </div>

      <div className="mt-12 px-8 py-6 bg-slate-900 text-white rounded-[2.5rem] shadow-xl mx-4">
        <h4 className="font-bold mb-2">Staying Informed</h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          You will receive reminders before family plans start so no one misses important moments.
        </p>
      </div>
    </div>
  );
};

export default NotificationsList;
