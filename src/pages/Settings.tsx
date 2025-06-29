import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Bell, Shield, Database, Plug, Lock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { IntegrationCard } from '@/components/IntegrationCard';
import { INTEGRATION_LOGOS } from '@/types/integrations';

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    type: 'messaging',
    provider: 'slack',
    icon: INTEGRATION_LOGOS.slack,
    description: 'Send messages and manage channels',
    isConnected: true
  },
  {
    id: 'twitter',
    name: 'Twitter',
    type: 'social',
    provider: 'twitter',
    icon: INTEGRATION_LOGOS.twitter,
    description: 'Post and schedule tweets',
    isConnected: false
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    type: 'social',
    provider: 'linkedin',
    icon: INTEGRATION_LOGOS.linkedin,
    description: 'Share updates and manage posts',
    isConnected: false
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    type: 'advertising',
    provider: 'meta-ads',
    icon: INTEGRATION_LOGOS['meta-ads'],
    description: 'Manage Meta ad campaigns',
    isConnected: true
  },
  {
    id: 'amazon-ads',
    name: 'Amazon Ads',
    type: 'advertising',
    provider: 'amazon-ads',
    icon: INTEGRATION_LOGOS['amazon-ads'],
    description: 'Manage Amazon ad campaigns',
    isConnected: false
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    type: 'crm',
    provider: 'hubspot',
    icon: INTEGRATION_LOGOS.hubspot,
    description: 'Manage contacts and deals',
    isConnected: true
  }
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'integrations' | 'notifications'>('general');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { id: 'general', label: 'General', icon: SettingsIcon },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'integrations', label: 'Integrations', icon: Plug },
          { id: 'notifications', label: 'Notifications', icon: Bell }
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

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-[20px] border divide-y">
          {/* API Keys */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">API Keys</h2>
                <p className="text-sm text-gray-500">Manage your API keys for different services</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {['OpenAI', 'Anthropic', 'Google AI'].map((provider) => (
                <div key={provider} className="flex items-center justify-between">
                  <span className="text-gray-700">{provider}</span>
                  <Button variant="secondary" size="sm">Update Key</Button>
                </div>
              ))}
            </div>
          </div>

          {/* Storage */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Storage</h2>
                <p className="text-sm text-gray-500">Manage your storage settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Storage Used</span>
                  <span className="text-gray-900">65%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="w-[65%] h-full bg-amber-500 rounded-full" />
                </div>
              </div>
              <Button variant="secondary">Manage Storage</Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && <SecurityDashboard />}

      {activeTab === 'integrations' && (
        <div className="bg-white rounded-[20px] border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Plug className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h2 className="font-medium text-gray-900">Integrations</h2>
              <p className="text-sm text-gray-500">Connect your external services</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_INTEGRATIONS.map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={() => console.log('Connect:', integration.name)}
                onDisconnect={() => console.log('Disconnect:', integration.name)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-[20px] border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-violet-700" />
            </div>
            <div>
              <h2 className="font-medium text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">Configure your notification preferences</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              'Email notifications',
              'Desktop notifications',
              'Error alerts',
              'Performance reports',
              'Security alerts',
              'System maintenance'
            ].map((setting) => (
              <label key={setting} className="flex items-center justify-between">
                <span className="text-gray-700">{setting}</span>
                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}