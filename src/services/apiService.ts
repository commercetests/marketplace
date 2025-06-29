// API Service for remote execution
export interface ApiCredentials {
  apiKey: string;
  baseUrl: string;
}

export interface AgentExecutionRequest {
  agentId: string;
  input: Record<string, any>;
  config?: Record<string, any>;
}

export interface FlowExecutionRequest {
  flowId: string;
  input: Record<string, any>;
  config?: Record<string, any>;
}

export interface ExecutionResponse {
  executionId: string;
  status: 'queued' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

class ApiService {
  private credentials: ApiCredentials | null = null;

  setCredentials(credentials: ApiCredentials) {
    this.credentials = credentials;
  }

  async executeAgent(request: AgentExecutionRequest): Promise<ExecutionResponse> {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }

    const response = await fetch(`${this.credentials.baseUrl}/api/v1/agents/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Agent execution failed');
    }

    return await response.json();
  }

  async executeFlow(request: FlowExecutionRequest): Promise<ExecutionResponse> {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }

    const response = await fetch(`${this.credentials.baseUrl}/api/v1/flows/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Flow execution failed');
    }

    return await response.json();
  }

  async getExecution(executionId: string): Promise<ExecutionResponse> {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }

    const response = await fetch(`${this.credentials.baseUrl}/api/v1/executions/${executionId}`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get execution status');
    }

    return await response.json();
  }

  async listExecutions(limit = 50, offset = 0): Promise<{ executions: ExecutionResponse[]; total: number }> {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }

    const response = await fetch(`${this.credentials.baseUrl}/api/v1/executions?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to list executions');
    }

    return await response.json();
  }

  async cancelExecution(executionId: string): Promise<void> {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }

    const response = await fetch(`${this.credentials.baseUrl}/api/v1/executions/${executionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel execution');
    }
  }

  // Webhook management
  async createWebhook(url: string, events: string[]): Promise<{ webhookId: string }> {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }

    const response = await fetch(`${this.credentials.baseUrl}/api/v1/webhooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, events }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create webhook');
    }

    return await response.json();
  }

  // Usage and billing
  async getUsage(startDate?: string, endDate?: string): Promise<{
    agentExecutions: number;
    flowExecutions: number;
    totalCost: number;
    breakdown: Record<string, number>;
  }> {
    if (!this.credentials) {
      throw new Error('API credentials not set');
    }

    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${this.credentials.baseUrl}/api/v1/usage?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get usage data');
    }

    return await response.json();
  }
}

export const apiService = new ApiService();