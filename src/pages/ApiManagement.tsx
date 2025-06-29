import React, { useState } from 'react';
import { Code, Key, Book, BarChart, Webhook } from 'lucide-react';
import { ApiKeyGenerator } from '@/components/ApiKeyGenerator';
import { ApiDocumentation } from '@/components/ApiDocumentation';

export function ApiManagement() {
  const [activeTab, setActiveTab] = useState<'keys' | 'docs' | 'usage' | 'webhooks'>('keys');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">API Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { id: 'keys', label: 'API Keys', icon: Key },
          { id: 'docs', label: 'Documentation', icon: Book },
          { id: 'usage', label: 'Usage', icon: BarChart },
          { id: 'webhooks', label: 'Webhooks', icon: Webhook }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'keys' && <ApiKeyGenerator />}
      
      {activeTab === 'docs' && <ApiDocumentation />}
      
      {activeTab === 'usage' && (
        <div className="bg-white rounded-[20px] border p-6">
          <h2 className="font-medium text-gray-900 mb-6">API Usage Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900">This Month</h3>
              <p className="text-2xl font-semibold text-blue-900">1,247</p>
              <p className="text-sm text-blue-700">API Calls</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900">Success Rate</h3>
              <p className="text-2xl font-semibold text-green-900">99.2%</p>
              <p className="text-sm text-green-700">Successful Executions</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900">Total Cost</h3>
              <p className="text-2xl font-semibold text-purple-900">$24.75</p>
              <p className="text-sm text-purple-700">This Month</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Recent API Calls</h3>
            <div className="space-y-2">
              {[
                { endpoint: '/api/v1/agents/execute', method: 'POST', status: 200, time: '2 min ago' },
                { endpoint: '/api/v1/flows/execute', method: 'POST', status: 200, time: '5 min ago' },
                { endpoint: '/api/v1/executions/exec_123', method: 'GET', status: 200, time: '8 min ago' },
                { endpoint: '/api/v1/agents/execute', method: 'POST', status: 429, time: '12 min ago' },
              ].map((call, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      call.method === 'POST' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {call.method}
                    </span>
                    <code className="text-sm">{call.endpoint}</code>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      call.status === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {call.status}
                    </span>
                    <span className="text-sm text-gray-500">{call.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'webhooks' && (
        <div className="bg-white rounded-[20px] border p-6">
          <h2 className="font-medium text-gray-900 mb-6">Webhook Management</h2>
          <p className="text-gray-600 mb-4">
            Configure webhooks to receive real-time notifications about execution events.
          </p>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Production Webhook</h3>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">https://your-app.com/webhooks/marketplace</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">execution.completed</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">execution.failed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}