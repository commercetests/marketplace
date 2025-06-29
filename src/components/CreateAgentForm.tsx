import React, { useState } from 'react';
import { Bot, Database, Sparkles, Code, Image, Globe, Calculator, MessageCircle, Zap, Brain, Search, Palette, Layers, ClipboardList, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { TextArea } from './ui/TextArea';
import { agentService } from '@/services/agentService';
import type { AgentType, LLMProvider } from '@/types/agent';

interface CreateAgentFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const llmProviders: { value: LLMProvider; label: string; models: string[] }[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'dall-e-3', 'dall-e-2'],
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  },
  {
    value: 'google',
    label: 'Google',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-pro-vision'],
  },
  {
    value: 'mistral',
    label: 'Mistral AI',
    models: ['mistral-large-2407', 'mistral-medium', 'mistral-small', 'codestral-latest'],
  },
  {
    value: 'llama',
    label: 'Meta Llama',
    models: ['llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b', 'llama-2-70b'],
  },
];

const agentCategories = [
  {
    category: 'Full Stack Development',
    icon: Layers,
    types: [
      { value: 'reasoning', label: 'Full Stack Architect', description: 'Complete application architecture design' },
      { value: 'writer', label: 'React Developer', description: 'Modern React applications and components' },
      { value: 'writer', label: 'Node.js Backend Developer', description: 'Server-side APIs and logic' },
      { value: 'reasoning', label: 'Database Designer', description: 'Database schemas and optimization' },
      { value: 'orchestrator', label: 'DevOps Engineer', description: 'CI/CD pipelines and deployments' },
      { value: 'writer', label: 'API Developer', description: 'RESTful and GraphQL APIs' },
      { value: 'writer', label: 'Frontend UI/UX Developer', description: 'Responsive user interfaces' },
      { value: 'writer', label: 'Mobile App Developer', description: 'React Native and Flutter apps' },
      { value: 'reasoning', label: 'Code Reviewer', description: 'Code quality and best practices' },
      { value: 'writer', label: 'Testing Specialist', description: 'Automated testing suites' },
      { value: 'reasoning', label: 'Security Auditor', description: 'Security vulnerabilities and fixes' },
      { value: 'reasoning', label: 'Performance Optimizer', description: 'Application performance tuning' },
      { value: 'writer', label: 'Documentation Writer', description: 'Technical documentation' },
      { value: 'reasoning', label: 'Microservices Architect', description: 'Microservices design patterns' },
      { value: 'reasoning', label: 'Cloud Solutions Architect', description: 'Scalable cloud infrastructure' }
    ]
  },
  {
    category: 'Planning & Strategy',
    icon: ClipboardList,
    types: [
      { value: 'reasoning', label: 'Project Planner', description: 'Detailed project plans and timelines' },
      { value: 'reasoning', label: 'Requirements Analyst', description: 'Business requirements gathering' },
      { value: 'writer', label: 'Technical Specification Writer', description: 'Technical design documents' },
      { value: 'reasoning', label: 'Sprint Planner', description: 'Agile sprint planning and management' },
      { value: 'reasoning', label: 'Risk Assessment Specialist', description: 'Project risk analysis and mitigation' },
      { value: 'reasoning', label: 'Resource Planner', description: 'Team and resource allocation' },
      { value: 'reasoning', label: 'Timeline Optimizer', description: 'Project timeline optimization' },
      { value: 'reasoning', label: 'Stakeholder Coordinator', description: 'Stakeholder communication plans' },
      { value: 'reasoning', label: 'Quality Assurance Planner', description: 'QA strategy and test planning' },
      { value: 'reasoning', label: 'Budget Analyst', description: 'Project cost estimation and tracking' }
    ]
  },
  {
    category: 'Media & Content',
    icon: Palette,
    types: [
      { value: 'writer', label: 'Content Writer', description: 'Blog posts, articles, social media' },
      { value: 'writer', label: 'Video Script Writer', description: 'YouTube, TikTok, ad scripts' },
      { value: 'writer', label: 'Ad Copy Creator', description: 'High-converting advertisements' },
      { value: 'writer', label: 'Email Marketer', description: 'Email campaigns and sequences' },
      { value: 'writer', label: 'Social Media Manager', description: 'Social content and engagement' },
      { value: 'writer', label: 'Brand Voice Specialist', description: 'Consistent brand messaging' }
    ]
  },
  {
    category: 'Commerce & Business',
    icon: Zap,
    types: [
      { value: 'writer', label: 'Product Description Writer', description: 'E-commerce product content' },
      { value: 'reasoning', label: 'Price Optimizer', description: 'Dynamic pricing strategies' },
      { value: 'reasoning', label: 'Customer Support Bot', description: 'Automated customer service' },
      { value: 'reasoning', label: 'Review Analyzer', description: 'Customer feedback insights' },
      { value: 'reasoning', label: 'Inventory Forecaster', description: 'Stock level predictions' },
      { value: 'scraper', label: 'Competitor Monitor', description: 'Market intelligence gathering' }
    ]
  },
  {
    category: 'Data & Analytics',
    icon: Database,
    types: [
      { value: 'reasoning', label: 'Data Analyst', description: 'Statistical analysis and insights' },
      { value: 'reasoning', label: 'Financial Analyst', description: 'Financial reporting and forecasting' },
      { value: 'reasoning', label: 'Market Researcher', description: 'Market trends and analysis' },
      { value: 'reasoning', label: 'KPI Dashboard Creator', description: 'Automated reporting systems' },
      { value: 'reasoning', label: 'Predictive Modeler', description: 'Machine learning predictions' },
      { value: 'reasoning', label: 'Data Visualizer', description: 'Charts and visual reports' }
    ]
  },
  {
    category: 'Math & Science',
    icon: Calculator,
    types: [
      { value: 'reasoning', label: 'Math Problem Solver', description: 'Complex mathematical solutions' },
      { value: 'reasoning', label: 'Statistical Analyzer', description: 'Statistical computations' },
      { value: 'reasoning', label: 'Scientific Calculator', description: 'Advanced calculations' },
      { value: 'reasoning', label: 'Formula Generator', description: 'Mathematical formulas' },
      { value: 'reasoning', label: 'Data Science Helper', description: 'ML and data science tasks' },
      { value: 'reasoning', label: 'Research Assistant', description: 'Scientific research support' }
    ]
  },
  {
    category: 'Chat & Conversation',
    icon: MessageCircle,
    types: [
      { value: 'reasoning', label: 'General Assistant', description: 'Multi-purpose AI helper' },
      { value: 'writer', label: 'Creative Writing Partner', description: 'Story and creative content' },
      { value: 'reasoning', label: 'Learning Tutor', description: 'Educational assistance' },
      { value: 'reasoning', label: 'Brainstorming Partner', description: 'Idea generation and creativity' },
      { value: 'reasoning', label: 'Language Translator', description: 'Multi-language translation' },
      { value: 'reasoning', label: 'Code Assistant', description: 'Programming help and debugging' }
    ]
  },
  {
    category: 'Automation & Workflow',
    icon: Bot,
    types: [
      { value: 'orchestrator', label: 'Workflow Manager', description: 'Complex process automation' },
      { value: 'orchestrator', label: 'Task Scheduler', description: 'Automated task management' },
      { value: 'orchestrator', label: 'Email Automation', description: 'Email workflow automation' },
      { value: 'orchestrator', label: 'Report Generator', description: 'Automated report creation' },
      { value: 'orchestrator', label: 'Data Pipeline Manager', description: 'ETL and data processing' },
      { value: 'orchestrator', label: 'Integration Orchestrator', description: 'Multi-system coordination' }
    ]
  },
  {
    category: 'Reasoning & Logic',
    icon: Brain,
    types: [
      { value: 'reasoning', label: 'Logic Puzzle Solver', description: 'Complex reasoning problems' },
      { value: 'reasoning', label: 'Decision Analyzer', description: 'Decision support systems' },
      { value: 'reasoning', label: 'Strategy Planner', description: 'Strategic planning and roadmaps' },
      { value: 'reasoning', label: 'Risk Assessor', description: 'Risk analysis and mitigation' },
      { value: 'reasoning', label: 'Pattern Recognizer', description: 'Pattern identification' },
      { value: 'reasoning', label: 'Fact Checker', description: 'Information verification' }
    ]
  },
  {
    category: 'Web Scraping & Research',
    icon: Search,
    types: [
      { value: 'scraper', label: 'Web Researcher', description: 'Comprehensive web research' },
      { value: 'scraper', label: 'News Aggregator', description: 'News collection and curation' },
      { value: 'scraper', label: 'Social Media Scraper', description: 'Social media data collection' },
      { value: 'scraper', label: 'Price Tracker', description: 'Product price monitoring' },
      { value: 'scraper', label: 'Job Listing Collector', description: 'Employment data gathering' },
      { value: 'scraper', label: 'Real Estate Monitor', description: 'Property market tracking' }
    ]
  },
  {
    category: 'Image & Visual',
    icon: Image,
    types: [
      { value: 'writer', label: 'Image Generator', description: 'AI-powered image creation' },
      { value: 'reasoning', label: 'Image Analyzer', description: 'Visual content analysis' },
      { value: 'writer', label: 'Logo Designer', description: 'Brand logo creation' },
      { value: 'reasoning', label: 'Visual Content Optimizer', description: 'Image optimization' },
      { value: 'writer', label: 'Graphic Design Assistant', description: 'Design concept generation' },
      { value: 'reasoning', label: 'Image Classifier', description: 'Visual recognition and tagging' }
    ]
  },
  {
    category: 'Internet & Browsing',
    icon: Globe,
    types: [
      { value: 'scraper', label: 'Internet Browser', description: 'Web browsing and navigation' },
      { value: 'scraper', label: 'Trend Spotter', description: 'Internet trend identification' },
      { value: 'scraper', label: 'Citation Generator', description: 'Academic citation creation' },
      { value: 'scraper', label: 'Link Checker', description: 'Website link validation' },
      { value: 'scraper', label: 'SEO Analyzer', description: 'Website SEO analysis' },
      { value: 'scraper', label: 'Content Aggregator', description: 'Multi-source content collection' }
    ]
  }
];

export function CreateAgentForm({ onCancel, onSuccess }: CreateAgentFormProps) {
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openai');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAgentType, setSelectedAgentType] = useState<string>('');
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [apiKeySource, setApiKeySource] = useState<'system' | 'custom'>('system');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const models = llmProviders.find(p => p.value === selectedProvider)?.models || [];

  const getSystemApiKeyStatus = (provider: LLMProvider) => {
    const systemKeys = {
      openai: !!import.meta.env.VITE_OPENAI_API_KEY,
      anthropic: !!import.meta.env.VITE_ANTHROPIC_API_KEY,
      google: !!import.meta.env.VITE_GOOGLE_API_KEY,
      mistral: !!import.meta.env.VITE_MISTRAL_API_KEY,
      llama: !!import.meta.env.VITE_LLAMA_API_KEY,
    };
    return systemKeys[provider] || false;
  };

  const hasSystemKey = getSystemApiKeyStatus(selectedProvider);

  const handleAgentTypeSelect = (category: string, type: any) => {
    setSelectedCategory(category);
    setSelectedAgentType(type.label);
    setAgentName(type.label);
    setAgentDescription(type.description);
    
    // Set default prompts based on agent type
    setSystemPrompt(`You are a ${type.label} specialized in ${category.toLowerCase()}. You are helpful, accurate, and professional.`);
    setUserPrompt('Please help me with: {{input}}');
  };

  const handleCreateAgent = async () => {
    try {
      setIsCreating(true);

      // Validate required fields
      if (!agentName || !selectedProvider || !selectedModel) {
        throw new Error('Please fill in all required fields');
      }

      if (apiKeySource === 'custom' && !customApiKey) {
        throw new Error('Please provide an API key');
      }

      if (apiKeySource === 'system' && !hasSystemKey) {
        throw new Error('No system API key available for this provider');
      }

      // Get the selected agent type info
      const selectedTypeInfo = agentCategories
        .flatMap(cat => cat.types)
        .find(type => type.label === selectedAgentType);

      const agentData = {
        name: agentName,
        description: agentDescription,
        type: (selectedTypeInfo?.value || 'writer') as AgentType,
        category: selectedCategory,
        llm: {
          provider: selectedProvider,
          model: selectedModel,
          apiKey: apiKeySource === 'custom' ? customApiKey : '',
          temperature,
          maxTokens,
        },
        systemPrompt,
        userPrompt,
      };

      await agentService.createAgent(agentData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert(error instanceof Error ? error.message : 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedAgentType !== '';
      case 2:
        return agentName.trim() !== '' && agentDescription.trim() !== '';
      case 3:
        return selectedProvider && selectedModel && (apiKeySource === 'system' ? hasSystemKey : customApiKey.trim() !== '');
      case 4:
        return systemPrompt.trim() !== '' && userPrompt.trim() !== '';
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[20px] border p-8">
      <div className="space-y-8">
        {/* Step 1: Agent Category & Type */}
        <div className={step === 1 ? 'block' : 'hidden'}>
          <h2 className="text-xl font-semibold mb-6">Choose Agent Type</h2>
          
          <div className="space-y-6">
            {agentCategories.map((category) => (
              <div key={category.category} className="border rounded-[20px] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{category.category}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.types.map((type, index) => (
                    <button
                      key={`${category.category}-${index}`}
                      onClick={() => handleAgentTypeSelect(category.category, type)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedAgentType === type.label
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{type.label}</h4>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Basic Configuration */}
        <div className={step === 2 ? 'block' : 'hidden'}>
          <h2 className="text-xl font-semibold mb-4">Basic Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full rounded-[20px] border border-gray-300 px-4 py-2"
                placeholder="Enter agent name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <TextArea
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Describe what your agent does..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={selectedCategory}
                  readOnly
                  className="w-full rounded-[20px] border border-gray-300 px-4 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <input
                  type="text"
                  value={selectedAgentType}
                  readOnly
                  className="w-full rounded-[20px] border border-gray-300 px-4 py-2 bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: LLM Configuration */}
        <div className={step === 3 ? 'block' : 'hidden'}>
          <h2 className="text-xl font-semibold mb-4">LLM Configuration</h2>
          <div className="space-y-4">
            <Select
              label="LLM Provider"
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value as LLMProvider);
                setSelectedModel(''); // Reset model when provider changes
              }}
            >
              {llmProviders.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </Select>
            
            <Select
              label="Model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="">Select a model</option>
              {models.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </Select>

            {/* API Key Configuration */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                API Key Configuration
              </label>
              
              <div className="space-y-3">
                {/* System API Key Option */}
                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="apiKeySource"
                    value="system"
                    checked={apiKeySource === 'system'}
                    onChange={(e) => setApiKeySource(e.target.value as 'system' | 'custom')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">Use System API Key</span>
                      {hasSystemKey ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Not Configured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {hasSystemKey 
                        ? `Use the ${llmProviders.find(p => p.value === selectedProvider)?.label} API key configured in the system environment variables.`
                        : `No ${llmProviders.find(p => p.value === selectedProvider)?.label} API key found in system environment variables.`
                      }
                    </p>
                  </div>
                </label>

                {/* Custom API Key Option */}
                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="apiKeySource"
                    value="custom"
                    checked={apiKeySource === 'custom'}
                    onChange={(e) => setApiKeySource(e.target.value as 'system' | 'custom')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">Use My Own API Key</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Custom
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Provide your own {llmProviders.find(p => p.value === selectedProvider)?.label} API key for this agent.
                    </p>
                  </div>
                </label>

                {/* Custom API Key Input */}
                {apiKeySource === 'custom' && (
                  <div className="ml-6 space-y-2">
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder={`Enter your ${llmProviders.find(p => p.value === selectedProvider)?.label} API key`}
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        className="w-full pr-12 pl-4 py-2 rounded-[20px] border border-gray-300 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your API key will be encrypted and stored securely. It will only be used for this agent.
                    </p>
                  </div>
                )}
              </div>

              {/* Warning for missing system key */}
              {apiKeySource === 'system' && !hasSystemKey && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <strong>Warning:</strong> No system API key is configured for {llmProviders.find(p => p.value === selectedProvider)?.label}. 
                    Please select "Use My Own API Key\" or contact your administrator to configure the system API key.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (0-2)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full rounded-[20px] border border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full rounded-[20px] border border-gray-300 px-4 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Prompts */}
        <div className={step === 4 ? 'block' : 'hidden'}>
          <h2 className="text-xl font-semibold mb-4">Prompts & Instructions</h2>
          <div className="space-y-4">
            <TextArea
              label="System Prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define the agent's role, personality, and behavior..."
              rows={4}
            />
            <TextArea
              label="User Prompt Template"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Define how user inputs should be formatted... Use {{variable}} for dynamic inputs"
              rows={4}
            />
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Template Variables</h4>
              <p className="text-sm text-blue-700 mb-2">You can use these variables in your prompts:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <code>{"{{input}}"}</code> - The main user input</li>
                <li>• <code>{"{{topic}}"}</code> - Topic or subject</li>
                <li>• <code>{"{{tone}}"}</code> - Writing tone or style</li>
                <li>• <code>{"{{length}}"}</code> - Desired output length</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant={step === 1 ? 'ghost' : 'secondary'}
            onClick={() => step > 1 ? setStep(step - 1) : onCancel?.()}
            disabled={isCreating}
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Step {step} of 4</span>
            <Button
              onClick={() => {
                if (step === 4) {
                  handleCreateAgent();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={!canProceed() || isCreating}
            >
              {step === 4 ? (isCreating ? 'Creating...' : 'Create Agent') : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}