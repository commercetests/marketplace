export type AgentType = 'orchestrator' | 'reasoning' | 'writer' | 'scraper';
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'llama';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export interface KnowledgeBase {
  type: 'rag' | 'kg';
  name: string;
  description: string;
  sources: string[];
  embeddingModel?: string;
  vectorStore?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  category?: string;
  llm: LLMConfig;
  systemPrompt: string;
  userPrompt: string;
  outputFormat?: string;
  knowledgeBase?: KnowledgeBase;
  fineTuningConfig?: {
    enabled: boolean;
    datasetPath?: string;
    epochs?: number;
    learningRate?: number;
  };
  code?: {
    language?: string;
    content?: string;
  };
  performance?: {
    maxRequestsPerHour?: number;
    timeoutSeconds?: number;
    priority?: 'normal' | 'high' | 'critical';
    errorHandling?: 'retry' | 'fail' | 'graceful';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  category?: string;
  agents: {
    agentId: string;
    order: number;
    config: Record<string, unknown>;
  }[];
  integrations?: {
    integrationId: string;
    order: number;
    config: Record<string, unknown>;
  }[];
  createdAt: Date;
  updatedAt: Date;
}