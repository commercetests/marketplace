import React from 'react';
import { History as HistoryIcon, CheckCircle, XCircle } from 'lucide-react';

export function History() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Execution History</h1>

      <div className="bg-white rounded-[20px] border">
        <div className="p-6 space-y-6">
          {[
            { name: 'Content Generation', status: 'success', time: '2 hours ago' },
            { name: 'Data Analysis', status: 'error', time: '3 hours ago' },
            { name: 'Web Scraping', status: 'success', time: '5 hours ago' }
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <HistoryIcon className="w-5 h-5 text-indigo-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  {item.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}