import React, { useState } from 'react';
import { Copy, Code, Book, Key, Webhook, DollarSign } from 'lucide-react';
import { Button } from './ui/Button';

interface ApiDocumentationProps {
  agentId?: string;
  flowId?: string;
}

export function ApiDocumentation({ agentId, flowId }: ApiDocumentationProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'flows' | 'webhooks' | 'billing'>('overview');
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'javascript' | 'python' | 'php'>('curl');

  const baseUrl = 'https://api.marketplace.com';
  const apiKey = 'your_api_key_here';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getAgentExecutionExample = (language: string) => {
    const examples = {
      curl: `curl -X POST ${baseUrl}/api/v1/agents/execute \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "${agentId || 'agent_123'}",
    "input": {
      "topic": "AI and Machine Learning",
      "tone": "professional",
      "length": "medium"
    }
  }'`,
      javascript: `const response = await fetch('${baseUrl}/api/v1/agents/execute', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agentId: '${agentId || 'agent_123'}',
    input: {
      topic: 'AI and Machine Learning',
      tone: 'professional',
      length: 'medium'
    }
  })
});

const result = await response.json();
console.log(result);`,
      python: `import requests

response = requests.post(
    '${baseUrl}/api/v1/agents/execute',
    headers={
        'Authorization': 'Bearer ${apiKey}',
        'Content-Type': 'application/json'
    },
    json={
        'agentId': '${agentId || 'agent_123'}',
        'input': {
            'topic': 'AI and Machine Learning',
            'tone': 'professional',
            'length': 'medium'
        }
    }
)

result = response.json()
print(result)`,
      php: `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, '${baseUrl}/api/v1/agents/execute');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'agentId' => '${agentId || 'agent_123'}',
    'input' => [
        'topic' => 'AI and Machine Learning',
        'tone' => 'professional',
        'length' => 'medium'
    ]
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ${apiKey}',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`
    };
    return examples[language as keyof typeof examples];
  };

  const getFlowExecutionExample = (language: string) => {
    const examples = {
      curl: `curl -X POST ${baseUrl}/api/v1/flows/execute \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "flowId": "${flowId || 'flow_456'}",
    "input": {
      "topic": "Product Launch",
      "channels": ["twitter", "linkedin"],
      "schedule": "2024-01-15T10:00:00Z"
    }
  }'`,
      javascript: `const response = await fetch('${baseUrl}/api/v1/flows/execute', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    flowId: '${flowId || 'flow_456'}',
    input: {
      topic: 'Product Launch',
      channels: ['twitter', 'linkedin'],
      schedule: '2024-01-15T10:00:00Z'
    }
  })
});

const result = await response.json();
console.log(result);`,
      python: `import requests

response = requests.post(
    '${baseUrl}/api/v1/flows/execute',
    headers={
        'Authorization': 'Bearer ${apiKey}',
        'Content-Type': 'application/json'
    },
    json={
        'flowId': '${flowId || 'flow_456'}',
        'input': {
            'topic': 'Product Launch',
            'channels': ['twitter', 'linkedin'],
            'schedule': '2024-01-15T10:00:00Z'
        }
    }
)

result = response.json()
print(result)`,
      php: `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, '${baseUrl}/api/v1/flows/execute');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'flowId' => '${flowId || 'flow_456'}',
    'input' => [
        'topic' => 'Product Launch',
        'channels' => ['twitter', 'linkedin'],
        'schedule' => '2024-01-15T10:00:00Z'
    ]
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ${apiKey}',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`
    };
    return examples[language as keyof typeof examples];
  };

  return (
    <div className="bg-white rounded-[20px] border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <Book className="w-5 h-5 text-indigo-700" />
        </div>
        <div>
          <h2 className="font-medium text-gray-900">API Documentation</h2>
          <p className="text-sm text-gray-500">Execute agents and flows from your applications</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Book },
          { id: 'agents', label: 'Agents', icon: Code },
          { id: 'flows', label: 'Flows', icon: Code },
          { id: 'webhooks', label: 'Webhooks', icon: Webhook },
          { id: 'billing', label: 'Billing', icon: DollarSign }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
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
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Getting Started</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Base URL</h4>
                  <code className="text-blue-800">{baseUrl}</code>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">Authentication</h4>
                  <p className="text-amber-800 text-sm mb-2">Include your API key in the Authorization header:</p>
                  <code className="text-amber-800">Authorization: Bearer your_api_key</code>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Rate Limits</h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• 1000 requests per hour for agent executions</li>
                    <li>• 500 requests per hour for flow executions</li>
                    <li>• 10,000 requests per hour for status checks</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Response Format</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm"><code>{`{
  "executionId": "exec_123456789",
  "status": "completed",
  "result": {
    "output": "Generated content here...",
    "metadata": {
      "tokens_used": 150,
      "execution_time": 2.3
    }
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "completedAt": "2024-01-15T10:00:02Z"
}`}</code></pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Execute Agent</h3>
              <p className="text-gray-600 mb-4">Execute a single agent with custom input parameters.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">POST /api/v1/agents/execute</span>
                  <div className="flex gap-2">
                    {['curl', 'javascript', 'python', 'php'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang as any)}
                        className={`px-3 py-1 text-xs rounded ${
                          selectedLanguage === lang 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{getAgentExecutionExample(selectedLanguage)}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                  onClick={() => copyToClipboard(getAgentExecutionExample(selectedLanguage))}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Check Execution Status</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <span className="font-mono text-sm">GET /api/v1/executions/{executionId}</span>
              </div>
              
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`curl -H "Authorization: Bearer ${apiKey}" \\
  ${baseUrl}/api/v1/executions/exec_123456789`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                  onClick={() => copyToClipboard(`curl -H "Authorization: Bearer ${apiKey}" \\\n  ${baseUrl}/api/v1/executions/exec_123456789`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flows' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Execute Flow</h3>
              <p className="text-gray-600 mb-4">Execute a complete workflow with multiple agents and integrations.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">POST /api/v1/flows/execute</span>
                  <div className="flex gap-2">
                    {['curl', 'javascript', 'python', 'php'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang as any)}
                        className={`px-3 py-1 text-xs rounded ${
                          selectedLanguage === lang 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{getFlowExecutionExample(selectedLanguage)}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                  onClick={() => copyToClipboard(getFlowExecutionExample(selectedLanguage))}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Webhook Events</h3>
              <p className="text-gray-600 mb-4">Get real-time notifications when executions complete.</p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Available Events</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• <code>execution.started</code> - When an execution begins</li>
                    <li>• <code>execution.completed</code> - When an execution finishes successfully</li>
                    <li>• <code>execution.failed</code> - When an execution fails</li>
                    <li>• <code>execution.cancelled</code> - When an execution is cancelled</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Create Webhook</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`curl -X POST ${baseUrl}/api/v1/webhooks \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-app.com/webhooks/marketplace",
    "events": ["execution.completed", "execution.failed"]
  }'`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                      onClick={() => copyToClipboard(`curl -X POST ${baseUrl}/api/v1/webhooks \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "url": "https://your-app.com/webhooks/marketplace",\n    "events": ["execution.completed", "execution.failed"]\n  }'`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Usage & Billing</h3>
              <p className="text-gray-600 mb-4">Monitor your API usage and costs.</p>
              
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Pricing</h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Agent executions: $0.01 per execution</li>
                    <li>• Flow executions: $0.05 per execution</li>
                    <li>• Additional LLM costs based on tokens used</li>
                    <li>• Integration API calls: $0.001 per call</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Get Usage Data</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`curl -H "Authorization: Bearer ${apiKey}" \\
  "${baseUrl}/api/v1/usage?start_date=2024-01-01&end_date=2024-01-31"`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                      onClick={() => copyToClipboard(`curl -H "Authorization: Bearer ${apiKey}" \\\n  "${baseUrl}/api/v1/usage?start_date=2024-01-01&end_date=2024-01-31"`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Response Example</h4>
                  <pre className="text-sm"><code>{`{
  "agentExecutions": 150,
  "flowExecutions": 25,
  "totalCost": 2.75,
  "breakdown": {
    "agent_executions": 1.50,
    "flow_executions": 1.25,
    "llm_costs": 0.00,
    "integration_calls": 0.00
  }
}`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}