import React from 'react';
import { useParams } from 'react-router-dom';
import { Bot, Save, Trash2, Code2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';

function getApiExamples(id: string) {
  return {
    curl: `curl -X POST https://api.example.com/v1/agents/${id}/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": {
      "topic": "AI and Machine Learning",
      "tone": "professional",
      "keyPoints": ["recent advances", "practical applications"]
    }
  }'`,
    python: `import requests

response = requests.post(
    'https://api.example.com/v1/agents/${id}/run',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'input': {
            'topic': 'AI and Machine Learning',
            'tone': 'professional',
            'keyPoints': ['recent advances', 'practical applications']
        }
    }
)

result = response.json()
print(result)`,
    javascript: `const response = await fetch('https://api.example.com/v1/agents/${id}/run', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    input: {
      topic: 'AI and Machine Learning',
      tone: 'professional',
      keyPoints: ['recent advances', 'practical applications']
    }
  })
});

const result = await response.json();
console.log(result);`
  };
}

export function AgentSettings() {
  const { id } = useParams();
  const apiExamples = getApiExamples(id || '');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Content Writer Settings</h1>
            <p className="text-gray-500">Configure your agent's behavior and capabilities</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[20px] border p-6 space-y-8">
        <div className="flex gap-4 border-b pb-4">
          <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600">Settings</button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">API</button>
        </div>

        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
              </label>
              <input
                type="text"
                className="w-full rounded-[20px] border border-gray-300 px-4 py-2"
                defaultValue="Content Writer"
              />
            </div>
            <TextArea
              label="Description"
              defaultValue="AI-powered content generation for blogs and social media"
              rows={3}
            />
            <Select
              label="Agent Type"
              defaultValue="writer"
            >
              <option value="writer">Writer</option>
              <option value="reasoning">Reasoning</option>
              <option value="orchestrator">Orchestrator</option>
              <option value="scraper">Scraper</option>
            </Select>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">LLM Configuration</h3>
          <div className="space-y-4">
            <Select
              label="Model"
              defaultValue="gpt-4-turbo"
            >
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="gemini-pro">Gemini Pro</option>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full rounded-[20px] border border-gray-300 px-4 py-2"
                  defaultValue="0.7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  className="w-full rounded-[20px] border border-gray-300 px-4 py-2"
                  defaultValue="2048"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  className="w-full rounded-[20px] border border-gray-300 px-4 py-2"
                  defaultValue="sk-..."
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Prompts</h3>
          <div className="space-y-4">
            <TextArea
              label="System Prompt"
              defaultValue="You are an expert content writer specializing in creating engaging blog posts and social media content. Focus on {{tone}} writing style and optimize for {{platform}}."
              rows={4}
            />
            <TextArea
              label="User Prompt Template"
              defaultValue="Write a blog post about {{topic}} in a {{tone}} tone, focusing on {{keyPoints}}."
              rows={4}
            />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Knowledge Base</h3>
          <div className="space-y-4">
            <Select
              label="Vector Store"
              defaultValue="pinecone"
            >
              <option value="pinecone">Pinecone</option>
              <option value="weaviate">Weaviate</option>
              <option value="qdrant">Qdrant</option>
            </Select>
            <div className="border-2 border-dashed border-gray-300 rounded-[20px] p-8">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Current documents:</p>
                <ul className="text-sm text-gray-700">
                  <li>style-guide.md</li>
                  <li>brand-voice.pdf</li>
                  <li>content-examples.txt</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <div className="bg-white rounded-[20px] border p-6 space-y-8 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h2 className="font-medium text-gray-900">API Reference</h2>
            <p className="text-sm text-gray-500">Integration examples and documentation</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Endpoint</h3>
            <div className="bg-gray-50 rounded-[20px] p-4 flex items-center justify-between">
              <code className="text-sm">POST https://api.example.com/v1/agents/{id}/run</code>
              <Button variant="ghost" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Authentication</h3>
            <p className="text-sm text-gray-600 mb-2">Add your API key to the Authorization header:</p>
            <div className="bg-gray-50 rounded-[20px] p-4">
              <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Request Format</h3>
            <div className="bg-gray-50 rounded-[20px] p-4">
              <pre className="text-sm"><code>{
`{
  "input": {
    "topic": "string",
    "tone": "string",
    "keyPoints": "string[]"
  }
}`
              }</code></pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Code Examples</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">cURL</h4>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-[20px] p-4 overflow-x-auto">
                  <pre className="text-sm"><code>{apiExamples.curl}</code></pre>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Python</h4>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-[20px] p-4 overflow-x-auto">
                  <pre className="text-sm"><code>{apiExamples.python}</code></pre>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">JavaScript</h4>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-[20px] p-4 overflow-x-auto">
                  <pre className="text-sm"><code>{apiExamples.javascript}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}