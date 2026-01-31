
import React from 'react';
import { ICONS, MOCK_MEMBERS } from '../constants';
import { FamilyPlan, PlanStatus } from '../types';

interface DashboardProps {
  onNavigate: (screen: any, params?: any) => void;
  plans: FamilyPlan[];
  notificationsCount: number;
  isOnline: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, plans, notificationsCount, isOnline }) => {
  const upcomingPlans = plans
    .filter(p => p.status === PlanStatus.UPCOMING)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const currentUser = MOCK_MEMBERS[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center pt-8">
        <div className="flex items-center space-x-3">
          <button onClick={() => onNavigate('profile')} className="relative group">
            <img src={currentUser.avatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm text-indigo-600 border border-slate-100 scale-75">
              {ICONS.QRCode}
            </div>
          </button>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connected Family</p>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{currentUser.name.split(' ')[0]}</h1>
              {!isOnline && (
                <span className="flex items-center bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onNavigate('notifications')}
            className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 relative hover:text-indigo-600 transition-colors"
          >
            {ICONS.Bell}
            {notificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </header>

      <section className="text-center relative py-4">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Welcome to Your Family Dashboard</h2>
        <p className="mt-3 text-lg text-slate-600 font-medium">Stay connected, organized, and safe together.</p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => onNavigate('chat-list')}
          className="group p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-indigo-100"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {ICONS.Chat}
          </div>
          <h3 className="font-bold text-slate-800">Chats</h3>
          <p className="text-[10px] text-slate-500 mt-1">Chat with family and AI Assistant.</p>
        </button>

        <button 
          onClick={() => onNavigate('plans')}
          className="group p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-emerald-100"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {ICONS.Calendar}
          </div>
          <h3 className="font-bold text-slate-800">Family Plans</h3>
          <p className="text-[10px] text-slate-500 mt-1">Create, manage, and track life together.</p>
        </button>

        <button 
          onClick={() => onNavigate('chat-window', 'c2')} 
          className="group p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-purple-100"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {ICONS.AI}
          </div>
          <h3 className="font-bold text-slate-800">AI Assistant</h3>
          <p className="text-[10px] text-slate-500 mt-1">Ask questions and get safe family help.</p>
        </button>

        <button 
          onClick={() => onNavigate('notifications')}
          className="group p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-amber-100"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {ICONS.Bell}
          </div>
          <h3 className="font-bold text-slate-800">Notifications</h3>
          <p className="text-[10px] text-slate-500 mt-1">View reminders and alerts.</p>
        </button>
      </div>

      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Today’s Family Summary</h2>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              {ICONS.Home}
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="mt-1 text-indigo-400">{ICONS.Calendar}</div>
              <div>
                <p className="font-bold text-sm tracking-wide">Upcoming family plans</p>
                <div className="mt-2 space-y-2">
                  {upcomingPlans.length > 0 ? upcomingPlans.map(plan => (
                    <div key={plan.id} className="text-xs text-slate-300 flex justify-between items-center bg-white/5 p-2 rounded-xl">
                      <span>• {plan.title}</span>
                      <span className="font-black text-indigo-400">{plan.startTime}</span>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-500 italic">No plans for today.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-emerald-400">{ICONS.Chat}</div>
              <div>
                <p className="font-bold text-sm tracking-wide">New chat messages</p>
                <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">Sarah: "Don't forget the pizza night!"</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-amber-400">{ICONS.Bell}</div>
              <div>
                <p className="font-bold text-sm tracking-wide">Important reminders</p>
                <p className="text-xs text-slate-400 mt-1">Tutoring starts in 10 minutes</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -ml-20 -mb-20"></div>
      </section>
    </div>
  );
};

export default Dashboard;
