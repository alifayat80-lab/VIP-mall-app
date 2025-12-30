import React from 'react';
import { DashboardStats } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const data = [
    { name: 'Passwords', value: stats.totalPasswords, color: '#6366f1' },
    { name: 'Pending', value: stats.pendingTasks, color: '#f59e0b' },
    { name: 'Completed', value: stats.completedTasks, color: '#10b981' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">System Overview</h2>
        <p className="text-slate-500">Real-time monitoring of your digital assets and productivity.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Passwords Secured</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.totalPasswords}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Tasks Completed</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.completedTasks}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">System Health</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.systemHealth}%</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Activity Breakdown</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reliability Message */}
      <div className="bg-slate-900 text-slate-300 p-6 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-white font-semibold text-lg mb-2">Why ZenFlow?</h4>
          <p className="max-w-2xl">
            We understand the frustration when apps don't work. ZenFlow is built with a "Offline-First" architecture. 
            This means your passwords and tasks are saved instantly to your device's secure storage. 
            No spinning wheels, no lost data. Just focus.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
      </div>
    </div>
  );
};