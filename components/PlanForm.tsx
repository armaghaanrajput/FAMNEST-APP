
import React, { useState } from 'react';
import { PlanType, Priority, Visibility, FamilyPlan, FamilyMember, PlanStatus, Role } from '../types';
import { MOCK_MEMBERS, ICONS } from '../constants';

interface PlanFormProps {
  initialData?: FamilyPlan;
  onSubmit: (plan: Partial<FamilyPlan>) => void;
  onCancel: () => void;
  currentUser: FamilyMember;
}

const PlanForm: React.FC<PlanFormProps> = ({ initialData, onSubmit, onCancel, currentUser }) => {
  const [formData, setFormData] = useState<Partial<FamilyPlan>>(initialData || {
    title: '',
    type: PlanType.EVENT,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    repeat: 'One-time',
    participants: [currentUser.id],
    reminder: '1 hour before',
    priority: Priority.NORMAL,
    visibility: Visibility.ALL,
    status: PlanStatus.UPCOMING,
    createdBy: currentUser.id,
    isApproved: currentUser.role === Role.PARENT
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleParticipantToggle = (id: string) => {
    setFormData(prev => {
      const current = prev.participants || [];
      if (current.includes(id)) {
        return { ...prev, participants: current.filter(p => p !== id) };
      } else {
        return { ...prev, participants: [...current, id] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return alert("Please enter a title");
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-2xl mx-auto border border-slate-100 animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800">{initialData ? 'Edit Plan' : 'Create New Plan'}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Plan Title</label>
          <input 
            type="text" name="title" value={formData.title} onChange={handleChange} required
            placeholder="Enter plan title (e.g., Family Dinner, Study Time)"
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Plan Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white outline-none font-medium">
              {Object.values(PlanType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Priority Level</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white outline-none font-medium">
              {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Plan Description</label>
          <textarea 
            name="description" value={formData.description} onChange={handleChange} rows={3}
            placeholder="Describe the plan so everyone understands it clearly."
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Repeat Options</label>
            <select name="repeat" value={formData.repeat} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-medium">
              <option value="One-time">One-time</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Reminders</label>
            <select name="reminder" value={formData.reminder} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-medium">
              <option value="10 minutes before">10 minutes before</option>
              <option value="30 minutes before">30 minutes before</option>
              <option value="1 hour before">1 hour before</option>
              <option value="1 day before">1 day before</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">Participants</label>
          <div className="flex flex-wrap gap-2">
            {MOCK_MEMBERS.map(member => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleParticipantToggle(member.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
                  formData.participants?.includes(member.id) 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                <span className="text-xs font-bold">{member.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
           <label className="block text-sm font-bold text-slate-700 mb-2">Plan Visibility</label>
           <select name="visibility" value={formData.visibility} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-medium">
              {Object.values(Visibility).map(v => <option key={v} value={v}>{v}</option>)}
           </select>
        </div>

        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-1">
          <p className="text-xs font-bold text-amber-800">📌 PLAN RULE NOTICE</p>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Plans must be family-friendly and respectful. Parents manage and approve plans created by children.
          </p>
        </div>

        <div className="flex space-x-4 pt-4">
          <button 
            type="submit" 
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200"
          >
            {initialData ? 'Update Plan' : 'Create Plan'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;
