import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { 
  Background, 
  Controls,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GitGraph, Plus, Trash2, Settings, Save, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { FlowExecutor } from '@/components/FlowExecutor';
import { INTEGRATION_LOGOS, type Integration } from '@/types/integrations';
import { MOCK_AGENTS } from '@/pages/Agents';
import { INTEGRATIONS } from '@/pages/Integrations';

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 0 },
    className: 'bg-emerald-100 border-emerald-500 rounded-xl',
  },
];

const nodeTypes = {
  agent: ({ data }: any) => (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${data.color} flex items-center justify-center`}>
          <data.icon className={`w-5 h-5 ${data.iconColor}`} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{data.label}</h3>
          <p className="text-sm text-gray-500">{data.description}</p>
        </div>
      </div>
      {data.needsApiKey && !data.hasApiKey && (
        <div className="mt-2 px-2 py-1 bg-amber-50 rounded text-amber-700 text-xs">
          API Key Required
        </div>
      )}
    </div>
  ),
  integration: ({ data }: any) => (
    <div className="bg-white rounded-xl border p-4 shadow-sm min-w-[200px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center p-2">
          <img 
            src={data.icon} 
            alt={data.label}
            className="w-full h-full"
            style={{ filter: 'invert(0.4)' }}
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{data.label}</h3>
          <p className="text-sm text-gray-500">{data.description}</p>
        </div>
      </div>
      {!data.isConfigured && (
        <div className="mt-3 p-2 bg-amber-50 rounded-lg text-amber-700 text-sm">
          API Key Required
        </div>
      )}
    </div>
  ),
};

export function CreateFlow() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [nodeConfigs, setNodeConfigs] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'components' | 'execute' | 'api-keys'>('components');
  const [apiKeyStatus, setApiKeyStatus] = useState<Record<string, boolean>>({});

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#94a3b8' },
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeConfig = (nodeId: string, config: any) => {
    setNodeConfigs(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        ...config
      }
    }));
  };

  const addAgent = (agent: any) => {
    const newNode: Node = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      position: { 
        x: Math.random() * 300 + 100,
        y: (nodes.length + 1) * 100 
      },
      data: {
        ...agent,
        needsApiKey: true,
        hasApiKey: apiKeyStatus['openai'] || false, // Default to OpenAI for agents
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addIntegration = (integration: any) => {
    const newNode: Node = {
      id: `integration-${Date.now()}`,
      type: 'integration',
      position: { 
        x: Math.random() * 300 + 100,
        y: (nodes.length + 1) * 100 
      },
      data: {
        ...integration,
        provider: integration.provider,
        isConfigured: apiKeyStatus[integration.provider] || false,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleApiKeySet = (provider: string, isValid: boolean) => {
    setApiKeyStatus(prev => ({
      ...prev,
      [provider]: isValid
    }));

    // Update existing nodes
    setNodes(nodes => nodes.map(node => {
      if (node.type === 'agent' && provider === 'openai') {
        return {
          ...node,
          data: { ...node.data, hasApiKey: isValid }
        };
      }
      if (node.type === 'integration' && node.data.provider === provider) {
        return {
          ...node,
          data: { ...node.data, isConfigured: isValid }
        };
      }
      return node;
    }));
  };

  const requiredProviders = Array.from(new Set([
    'openai', // For agents
    ...nodes
      .filter(node => node.type === 'integration')
      .map(node => node.data.provider)
  ]));

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <GitGraph className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Flow</h1>
            <p className="text-gray-500">Design your agent workflow</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/flows')}>
            Cancel
          </Button>
          <Button onClick={() => navigate('/flows')}>
            <Save className="w-4 h-4 mr-2" />
            Save Flow
          </Button>
        </div>
      </div>

      <div className="flex h-full bg-white rounded-[20px] border overflow-hidden">
        <div className={`w-80 border-r flex flex-col ${showSidebar ? 'block' : 'hidden'}`}>
          {/* Fixed Tabs */}
          <div className="p-4 border-b bg-white">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('components')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'components' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab('api-keys')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'api-keys' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Key className="w-4 h-4 mr-1 inline" />
                API Keys
              </button>
              <button
                onClick={() => setActiveTab('execute')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'execute' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Execute
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'components' && (
              <>
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search components..."
                    className="w-full px-4 py-2 rounded-[20px] border mb-4"
                  />
                  
                  <h3 className="font-medium text-gray-900 mb-3">Agents</h3>
                  <div className="space-y-2">
                    {MOCK_AGENTS.map((agent) => {
                      const agentColors = {
                        writer: { bg: 'bg-blue-100', text: 'text-blue-700' },
                        reasoning: { bg: 'bg-violet-100', text: 'text-violet-700' },
                        orchestrator: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
                        scraper: { bg: 'bg-amber-100', text: 'text-amber-700' }
                      };
                      
                      return (
                      <button
                        key={agent.id}
                        className="w-full text-left p-3 rounded-xl border hover:bg-gray-50"
                        onClick={() => addAgent({
                          label: agent.name,
                          description: agent.description,
                          icon: GitGraph,
                          color: agentColors[agent.type].bg,
                          iconColor: agentColors[agent.type].text
                        })}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${agentColors[agent.type].bg} flex items-center justify-center`}>
                            <GitGraph className={`w-4 h-4 ${agentColors[agent.type].text}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{agent.name}</h4>
                            <p className="text-sm text-gray-500">{agent.description}</p>
                          </div>
                        </div>
                      </button>
                    )})}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Integrations</h3>
                  <div className="space-y-2">
                    {INTEGRATIONS.map((integration) => (
                      <button
                        key={integration.id}
                        className="w-full text-left p-3 rounded-xl border hover:bg-gray-50"
                        onClick={() => addIntegration({
                          label: integration.name,
                          description: integration.description,
                          icon: integration.icon,
                          provider: integration.provider,
                          isConfigured: integration.isConnected
                        })}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center p-1.5">
                            <img 
                              src={integration.icon} 
                              alt={integration.name}
                              className="w-full h-full"
                              style={{ filter: 'invert(0.4)' }}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{integration.name}</h4>
                            <p className="text-sm text-gray-500">{integration.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Required API Keys</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Configure API keys for the services used in your flow.
                  </p>
                </div>
                
                {requiredProviders.map(provider => (
                  <ApiKeyManager
                    key={provider}
                    provider={provider}
                    onKeySet={handleApiKeySet}
                  />
                ))}
                
                {requiredProviders.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Add agents and integrations to see required API keys.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'execute' && (
              <FlowExecutor
                nodes={nodes}
                edges={edges}
                nodeConfigs={nodeConfigs}
              />
            )}
          </div>
        </div>

        {/* Flow Editor */}
        <div className="flex-1 bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {/* Settings Panel */}
        {selectedNode && (
          <div className="w-80 border-l p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Node Settings</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setNodes(nodes => nodes.filter(n => n.id !== selectedNode.id));
                      setSelectedNode(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Name</h4>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-[20px] border"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    setNodes(nodes => nodes.map(node => 
                      node.id === selectedNode.id 
                        ? { ...node, data: { ...node.data, label: e.target.value } }
                        : node
                    ));
                  }}
                />
              </div>

              {selectedNode.type === 'agent' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Input Variables</h4>
                    <textarea
                      className="w-full px-4 py-2 rounded-[20px] border"
                      rows={4}
                      placeholder="{\n  'topic': '{{input.topic}}',\n  'tone': 'professional'\n}"
                      value={nodeConfigs[selectedNode.id]?.input || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { input: e.target.value })}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Output Mapping</h4>
                    <textarea
                      className="w-full px-4 py-2 rounded-[20px] border"
                      rows={4}
                      placeholder="{\n  'content': '{{output.text}}',\n  'metadata': '{{output.tags}}'\n}"
                      value={nodeConfigs[selectedNode.id]?.output || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { output: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'integration' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">API Key</h4>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-[20px] border"
                      placeholder="Enter API key..."
                      value={nodeConfigs[selectedNode.id]?.apiKey || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { apiKey: e.target.value })}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Action</h4>
                    <select
                      className="w-full px-4 py-2 rounded-[20px] border"
                      value={nodeConfigs[selectedNode.id]?.action || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { action: e.target.value })}
                    >
                      <option value="">Select an action...</option>
                      {selectedNode.data.provider === 'slack' && (
                        <>
                          <option value="send-message">Send Message</option>
                          <option value="create-channel">Create Channel</option>
                          <option value="upload-file">Upload File</option>
                        </>
                      )}
                      {selectedNode.data.provider === 'twitter' && (
                        <>
                          <option value="post-tweet">Post Tweet</option>
                          <option value="schedule-tweet">Schedule Tweet</option>
                          <option value="create-thread">Create Thread</option>
                        </>
                      )}
                      {selectedNode.data.provider === 'linkedin' && (
                        <>
                          <option value="create-post">Create Post</option>
                          <option value="share-update">Share Update</option>
                        </>
                      )}
                      {selectedNode.data.provider === 'hubspot' && (
                        <>
                          <option value="create-contact">Create Contact</option>
                          <option value="update-deal">Update Deal</option>
                        </>
                      )}
                      {selectedNode.data.provider === 'mailchimp' && (
                        <>
                          <option value="add-subscriber">Add Subscriber</option>
                          <option value="send-campaign">Send Campaign</option>
                        </>
                      )}
                      {selectedNode.data.provider === 'sendgrid' && (
                        <>
                          <option value="send-email">Send Email</option>
                          <option value="add-contact">Add Contact</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Parameters</h4>
                    <textarea
                      className="w-full px-4 py-2 rounded-[20px] border"
                      rows={4}
                      placeholder="{\n  'channel': '#marketing',\n  'message': '{{input.content}}'\n}"
                      value={nodeConfigs[selectedNode.id]?.params || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { params: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Error Handling</h4>
                <select
                  className="w-full px-4 py-2 rounded-[20px] border"
                  value={nodeConfigs[selectedNode.id]?.errorHandling || 'retry'}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { errorHandling: e.target.value })}
                >
                  <option value="retry">Retry (3x)</option>
                  <option value="skip">Skip on Error</option>
                  <option value="stop">Stop Execution</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}