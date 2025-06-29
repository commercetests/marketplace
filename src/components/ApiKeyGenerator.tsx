import React, { useState } from 'react';
import { Key, Copy, RefreshCw, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

export function ApiKeyGenerator() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'mk_live_1234567890abcdef',
      createdAt: '2024-01-10',
      lastUsed: '2024-01-15',
      permissions: ['agents:execute', 'flows:execute', 'executions:read']
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'mk_test_abcdef1234567890',
      createdAt: '2024-01-05',
      permissions: ['agents:execute', 'executions:read']
    }
  ]);
  
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const availablePermissions = [
    { id: 'agents:execute', label: 'Execute Agents', description: 'Run individual agents' },
    { id: 'flows:execute', label: 'Execute Flows', description: 'Run complete workflows' },
    { id: 'executions:read', label: 'Read Executions', description: 'View execution status and results' },
    { id: 'executions:cancel', label: 'Cancel Executions', description: 'Cancel running executions' },
    { id: 'webhooks:manage', label: 'Manage Webhooks', description: 'Create and manage webhooks' },
    { id: 'usage:read', label: 'Read Usage', description: 'View usage and billing data' }
  ];

  const generateApiKey = async () => {
    if (!newKeyName.trim() || selectedPermissions.length === 0) return;
    
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `mk_${selectedPermissions.includes('agents:execute') ? 'live' : 'test'}_${Math.random().toString(36).substring(2, 18)}`,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: [...selectedPermissions]
    };
    
    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setSelectedPermissions([]);
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const deleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="space-y-6">
      {/* Generate New API Key */}
      <div className="bg-white rounded-[20px] border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="font-medium text-gray-900">Generate API Key</h2>
            <p className="text-sm text-gray-500">Create a new API key for your applications</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Name
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production API Key"
              className="w-full px-4 py-2 rounded-[20px] border border-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePermissions.map(permission => (
                <label
                  key={permission.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{permission.label}</div>
                    <div className="text-sm text-gray-500">{permission.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={generateApiKey}
            disabled={!newKeyName.trim() || selectedPermissions.length === 0 || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Generate API Key
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Existing API Keys */}
      <div className="bg-white rounded-[20px] border p-6">
        <h3 className="font-medium text-gray-900 mb-4">Your API Keys</h3>
        
        {apiKeys.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No API keys generated yet.</p>
        ) : (
          <div className="space-y-4">
            {apiKeys.map(apiKey => (
              <div key={apiKey.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                    <p className="text-sm text-gray-500">
                      Created {apiKey.createdAt}
                      {apiKey.lastUsed && ` • Last used ${apiKey.lastUsed}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {showKeys[apiKey.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => deleteApiKey(apiKey.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <code className="text-sm font-mono">
                    {showKeys[apiKey.id] ? apiKey.key : '•'.repeat(apiKey.key.length)}
                  </code>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Permissions</h5>
                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.map(permission => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}