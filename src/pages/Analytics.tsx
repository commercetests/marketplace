import React from 'react';
import { BarChart as BarChartIcon, TrendingUp, Clock, Zap } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Executions', value: '1,234', icon: BarChartIcon, color: 'cyan' },
          { label: 'Success Rate', value: '98.5%', icon: TrendingUp, color: 'emerald' },
          { label: 'Avg Response Time', value: '1.2s', icon: Clock, color: 'violet' },
          { label: 'Active Agents', value: '12', icon: Zap, color: 'amber' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-[20px] border p-6">
            <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-700`} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[20px] border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Execution Trends</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {[40, 65, 50, 80, 75, 90, 85].map((height, i) => (
            <div key={i} className="w-full bg-cyan-100 rounded-t-lg" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-4 text-sm text-gray-500">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
  );
}