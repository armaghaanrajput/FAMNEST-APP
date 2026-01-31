
import React, { useState } from 'react';
import { FamilyPlan, FamilyMember, PlanType, PlanStatus, Role } from '../types';
import { ICONS, MOCK_MEMBERS } from '../constants';

interface FamilyPlansProps {
  plans: FamilyPlan[];
  currentUser: FamilyMember;
  onAdd: () => void;
  onEdit: (plan: FamilyPlan) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: PlanStatus) => void;
}

const FamilyPlans: React.FC<FamilyPlansProps> = ({ plans, currentUser, onAdd, onEdit, onDelete, onUpdateStatus }) => {
  const [filter, setFilter] = useState<PlanType | 'All'>('All');

  const filteredPlans = filter === 'All' ? plans : plans.filter(p => p.type === filter);
  const isParent = currentUser.role === Role.PARENT;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pt-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Family Plans</h1>
          <p className="text-slate-500 mt-1">Family Plans help you organize activities, routines, and goals together as a family.</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200"
        >
          {ICONS.Plus}
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
        {['All', ...Object.values(PlanType)].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === t ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Plans List */}
      <div className="grid gap-4">
        {filteredPlans.length > 0 ? filteredPlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${plan.status === PlanStatus.COMPLETED ? 'bg-emerald-500' : plan.status === PlanStatus.ONGOING ? 'bg-amber-500' : 'bg-indigo-500'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{plan.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  plan.status === PlanStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {plan.status}
                </span>
                {isParent && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button onClick={() => onEdit(plan)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => onDelete(plan.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.title}</h3>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{plan.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>{plan.startDate} @ {plan.startTime}</span>
              </div>
              <div className="flex -space-x-2">
                {plan.participants.map(pid => {
                  const member = MOCK_MEMBERS.find(m => m.id === pid);
                  return member ? (
                    <img key={pid} src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full border-2 border-white" title={member.name} />
                  ) : null;
                })}
              </div>
            </div>

            {isParent && plan.status !== PlanStatus.COMPLETED && (
              <div className="mt-6 pt-6 border-t border-slate-50 flex space-x-3">
                <button 
                  onClick={() => onUpdateStatus(plan.id, PlanStatus.COMPLETED)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors"
                >
                  {ICONS.Check}
                  <span>Mark Completed</span>
                </button>
                <button 
                   onClick={() => onUpdateStatus(plan.id, PlanStatus.CANCELLED)}
                   className="px-4 py-2.5 bg-slate-50 text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No plans found. Start organizing your family life!</p>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
        <h4 className="font-bold text-indigo-900 text-sm mb-2">🛡️ Parent Notice</h4>
        <p className="text-xs text-indigo-700 leading-relaxed">
          Parents manage family plans to ensure safety, clarity, and organization. Plans must be family-friendly and respectful.
        </p>
      </div>
    </div>
  );
};

export default FamilyPlans;
