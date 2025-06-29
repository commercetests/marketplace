import { Agent, LLMConfig } from '@/types/agent';
import { databaseService } from './databaseService';
import { authService } from './authService';

export interface ExecutionContext {
  input: Record<string, any>;
  previousOutputs: Record<string, any>;
  apiKeys: Record<string, string>;
}

export interface ExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
  tokensUsed?: number;
  model?: string;
  cost?: number;
}

class AgentService {
  private apiKeys: Map<string, string> = new Map();

  constructor() {
    // Load system API keys from environment
    this.loadSystemApiKeys();
  }

  private loadSystemApiKeys() {
    const systemKeys = {
      openai: import.meta.env.VITE_OPENAI_API_KEY,
      anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY,
      google: import.meta.env.VITE_GOOGLE_API_KEY,
      mistral: import.meta.env.VITE_MISTRAL_API_KEY,
      llama: import.meta.env.VITE_LLAMA_API_KEY,
    };

    Object.entries(systemKeys).forEach(([provider, key]) => {
      if (key) {
        this.apiKeys.set(provider, key);
      }
    });
  }

  setApiKey(provider: string, key: string) {
    this.apiKeys.set(provider, key);
  }

  getApiKey(provider: string): string | undefined {
    return this.apiKeys.get(provider);
  }

  async executeAgent(agent: Agent, context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      const llmConfig = agent.llm;
      let apiKey = this.getApiKey(llmConfig.provider);
      
      // If no system key, try to use the key from the agent config
      if (!apiKey && llmConfig.apiKey) {
        apiKey = llmConfig.apiKey;
      }
      
      if (!apiKey) {
        throw new Error(`API key not found for provider: ${llmConfig.provider}`);
      }

      // Process the prompt with context variables
      const processedPrompt = this.processPromptTemplate(agent.userPrompt, context);
      
      // Execute based on LLM provider
      let result;
      switch (llmConfig.provider) {
        case 'openai':
          result = await this.executeOpenAI(llmConfig, agent.systemPrompt, processedPrompt, apiKey);
          break;
        case 'anthropic':
          result = await this.executeAnthropic(llmConfig, agent.systemPrompt, processedPrompt, apiKey);
          break;
        case 'google':
          result = await this.executeGoogle(llmConfig, agent.systemPrompt, processedPrompt, apiKey);
          break;
        case 'mistral':
          result = await this.executeMistral(llmConfig, agent.systemPrompt, processedPrompt, apiKey);
          break;
        case 'llama':
          result = await this.executeLlama(llmConfig, agent.systemPrompt, processedPrompt, apiKey);
          break;
        default:
          throw new Error(`Unsupported LLM provider: ${llmConfig.provider}`);
      }

      const executionResult: ExecutionResult = {
        success: true,
        output: result.content,
        executionTime: Date.now() - startTime,
        tokensUsed: result.tokensUsed,
        model: llmConfig.model,
        cost: this.calculateCost(llmConfig.provider, llmConfig.model, result.tokensUsed || 0)
      };

      // Log execution to database
      await this.logExecution(agent, context, executionResult);

      return executionResult;
    } catch (error) {
      const executionResult: ExecutionResult = {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };

      // Log failed execution
      await this.logExecution(agent, context, executionResult);

      return executionResult;
    }
  }

  private async logExecution(agent: Agent, context: ExecutionContext, result: ExecutionResult) {
    try {
      await databaseService.logExecution({
        type: 'agent',
        targetId: agent.id,
        targetName: agent.name,
        input: context.input,
        output: result.output,
        success: result.success,
        error: result.error,
        executionTime: result.executionTime,
        tokensUsed: result.tokensUsed,
        cost: result.cost
      });

      // Update user usage
      await authService.updateUsage('agentExecutions');
    } catch (error) {
      console.error('Failed to log execution:', error);
    }
  }

  private calculateCost(provider: string, model: string, tokens: number): number {
    // Pricing per 1K tokens (approximate)
    const pricing: Record<string, Record<string, number>> = {
      openai: {
        'gpt-4o': 0.005,
        'gpt-4o-mini': 0.00015,
        'gpt-4-turbo': 0.01,
        'gpt-4': 0.03,
        'gpt-3.5-turbo': 0.0015,
        'dall-e-3': 0.04, // per image
        'dall-e-2': 0.02, // per image
      },
      anthropic: {
        'claude-3-5-sonnet-20241022': 0.003,
        'claude-3-opus-20240229': 0.015,
        'claude-3-sonnet-20240229': 0.003,
        'claude-3-haiku-20240307': 0.00025,
      },
      google: {
        'gemini-1.5-pro': 0.0035,
        'gemini-1.5-flash': 0.00035,
        'gemini-pro': 0.0005,
        'gemini-pro-vision': 0.0025,
      },
      mistral: {
        'mistral-large-2407': 0.008,
        'mistral-medium': 0.0027,
        'mistral-small': 0.002,
        'codestral-latest': 0.001,
      },
      llama: {
        'llama-3.1-405b': 0.005,
        'llama-3.1-70b': 0.0009,
        'llama-3.1-8b': 0.0002,
        'llama-2-70b': 0.0007,
      }
    };

    const providerPricing = pricing[provider];
    if (!providerPricing) return 0;

    const modelPrice = providerPricing[model];
    if (!modelPrice) return 0;

    return (tokens / 1000) * modelPrice;
  }

  private processPromptTemplate(template: string, context: ExecutionContext): string {
    let processed = template;
    
    // Replace input variables
    Object.entries(context.input).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{input\\.${key}}}`, 'g'), String(value));
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    
    // Replace previous outputs
    Object.entries(context.previousOutputs).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    
    return processed;
  }

  private async executeOpenAI(config: LLMConfig, systemPrompt: string, userPrompt: string, apiKey: string) {
    // Handle image generation models
    if (config.model.includes('dall-e')) {
      return await this.executeDALLE(config, userPrompt, apiKey);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens || 0
    };
  }

  private async executeDALLE(config: LLMConfig, prompt: string, apiKey: string) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        prompt: prompt,
        n: 1,
        size: config.model === 'dall-e-3' ? '1024x1024' : '512x512',
        quality: config.model === 'dall-e-3' ? 'standard' : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DALL-E API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.data[0]?.url || '',
      tokensUsed: 0 // Image generation doesn't use tokens
    };
  }

  private async executeAnthropic(config: LLMConfig, systemPrompt: string, userPrompt: string, apiKey: string) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature || 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text || '',
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0
    };
  }

  private async executeGoogle(config: LLMConfig, systemPrompt: string, userPrompt: string, apiKey: string) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 4096,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google AI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0]?.content?.parts[0]?.text || '',
      tokensUsed: data.usageMetadata?.totalTokenCount || 0
    };
  }

  private async executeMistral(config: LLMConfig, systemPrompt: string, userPrompt: string, apiKey: string) {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Mistral API error: ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens || 0
    };
  }

  private async executeLlama(config: LLMConfig, systemPrompt: string, userPrompt: string, apiKey: string) {
    // Using Together AI as an example provider for Llama models
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Llama API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens || 0
    };
  }

  // Agent management methods
  async createAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await databaseService.createAgent({
      ...agentData,
      tags: [],
      version: '1.0.0',
      status: 'active'
    });
  }

  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<void> {
    await databaseService.updateAgent(agentId, updates);
  }

  async deleteAgent(agentId: string): Promise<void> {
    await databaseService.deleteAgent(agentId);
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    return await databaseService.getAgent(agentId);
  }

  async getUserAgents(): Promise<Agent[]> {
    return await databaseService.getUserAgents();
  }

  async getPublicAgents(): Promise<Agent[]> {
    return await databaseService.getPublicAgents();
  }
}

export const agentService = new AgentService();