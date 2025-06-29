import { agentService, ExecutionContext, ExecutionResult } from './agentService';
import { integrationService, IntegrationExecutionContext, IntegrationResult } from './integrationService';
import { databaseService } from './databaseService';
import { authService } from './authService';
import { Agent } from '@/types/agent';
import { Node, Edge } from 'reactflow';

export interface FlowExecution {
  id: string;
  status: 'running' | 'completed' | 'error' | 'paused';
  currentNode?: string;
  results: Record<string, any>;
  errors: Record<string, string>;
  startTime: Date;
  endTime?: Date;
  totalCost?: number;
}

class FlowService {
  private executions: Map<string, FlowExecution> = new Map();

  async executeFlow(
    nodes: Node[],
    edges: Edge[],
    initialInput: Record<string, any>,
    nodeConfigs: Record<string, any>
  ): Promise<string> {
    const executionId = `flow_${Date.now()}`;
    
    const execution: FlowExecution = {
      id: executionId,
      status: 'running',
      results: {},
      errors: {},
      startTime: new Date(),
      totalCost: 0
    };

    this.executions.set(executionId, execution);

    try {
      // Find start node
      const startNode = nodes.find(n => n.type === 'start' || n.id.includes('start'));
      if (!startNode) {
        throw new Error('No start node found');
      }

      // Build execution graph
      const graph = this.buildExecutionGraph(nodes, edges);
      
      // Execute flow
      await this.executeNode(startNode.id, graph, nodes, initialInput, nodeConfigs, execution);
      
      execution.status = 'completed';
      execution.endTime = new Date();

      // Log flow execution
      await this.logFlowExecution(execution, nodes, initialInput);
      
    } catch (error) {
      execution.status = 'error';
      execution.errors['flow'] = error instanceof Error ? error.message : 'Unknown error';
      execution.endTime = new Date();

      // Log failed execution
      await this.logFlowExecution(execution, nodes, initialInput);
    }

    return executionId;
  }

  private async logFlowExecution(execution: FlowExecution, nodes: Node[], input: Record<string, any>) {
    try {
      await databaseService.logExecution({
        type: 'flow',
        targetId: execution.id,
        targetName: `Flow with ${nodes.length} nodes`,
        input,
        output: execution.results,
        success: execution.status === 'completed',
        error: Object.values(execution.errors).join('; ') || undefined,
        executionTime: execution.endTime ? execution.endTime.getTime() - execution.startTime.getTime() : 0,
        cost: execution.totalCost
      });

      // Update user usage
      await authService.updateUsage('flowExecutions');
    } catch (error) {
      console.error('Failed to log flow execution:', error);
    }
  }

  private buildExecutionGraph(nodes: Node[], edges: Edge[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    // Initialize all nodes
    nodes.forEach(node => {
      graph.set(node.id, []);
    });
    
    // Add edges
    edges.forEach(edge => {
      const targets = graph.get(edge.source) || [];
      targets.push(edge.target);
      graph.set(edge.source, targets);
    });
    
    return graph;
  }

  private async executeNode(
    nodeId: string,
    graph: Map<string, string[]>,
    nodes: Node[],
    input: Record<string, any>,
    nodeConfigs: Record<string, any>,
    execution: FlowExecution
  ): Promise<void> {
    execution.currentNode = nodeId;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const config = nodeConfigs[nodeId] || {};
    
    // Skip start node
    if (node.type === 'start' || nodeId.includes('start')) {
      const nextNodes = graph.get(nodeId) || [];
      for (const nextNodeId of nextNodes) {
        await this.executeNode(nextNodeId, graph, nodes, input, nodeConfigs, execution);
      }
      return;
    }

    try {
      let result: any;
      let cost = 0;
      
      if (node.type === 'agent' || nodeId.includes('agent')) {
        // Execute agent
        const agentResult = await this.executeAgentNode(nodeId, node, config, input, execution.results);
        result = agentResult.output;
        cost = agentResult.cost || 0;
        
        if (!agentResult.success) {
          throw new Error(agentResult.error || 'Agent execution failed');
        }
      } else if (node.type === 'integration' || nodeId.includes('integration')) {
        // Execute integration
        const integrationResult = await this.executeIntegrationNode(nodeId, node, config, input, execution.results);
        result = integrationResult.output;
        
        if (!integrationResult.success) {
          throw new Error(integrationResult.error || 'Integration execution failed');
        }
      }
      
      // Store result and update cost
      execution.results[nodeId] = result;
      execution.totalCost = (execution.totalCost || 0) + cost;
      
      // Execute next nodes
      const nextNodes = graph.get(nodeId) || [];
      for (const nextNodeId of nextNodes) {
        await this.executeNode(nextNodeId, graph, { ...input, [nodeId]: result }, nodeConfigs, execution);
      }
      
    } catch (error) {
      execution.errors[nodeId] = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle error based on configuration
      const errorHandling = config.errorHandling || 'stop';
      
      if (errorHandling === 'stop') {
        throw error;
      } else if (errorHandling === 'skip') {
        // Continue to next nodes
        const nextNodes = graph.get(nodeId) || [];
        for (const nextNodeId of nextNodes) {
          await this.executeNode(nextNodeId, graph, input, nodeConfigs, execution);
        }
      } else if (errorHandling === 'retry') {
        // Simple retry logic - could be enhanced
        await this.executeNode(nodeId, graph, nodes, input, nodeConfigs, execution);
      }
    }
  }

  private async executeAgentNode(
    nodeId: string,
    node: Node,
    config: Record<string, any>,
    input: Record<string, any>,
    previousResults: Record<string, any>
  ): Promise<ExecutionResult> {
    // Create agent from node configuration
    const agent: Agent = {
      id: nodeId,
      name: node.data.label || 'Flow Agent',
      description: node.data.description || 'Agent in flow execution',
      type: 'writer', // Default type
      llm: {
        provider: 'openai', // Default provider
        model: 'gpt-3.5-turbo', // Default model
        apiKey: '', // Will be set from service
        temperature: 0.7,
        maxTokens: 2048,
      },
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.',
      userPrompt: config.input || 'Process the following input: {{input}}',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Process input template
    let processedInput = config.input || '{{input}}';
    Object.entries(input).forEach(([key, value]) => {
      processedInput = processedInput.replace(new RegExp(`{{input\\.${key}}}`, 'g'), String(value));
      processedInput = processedInput.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    const context: ExecutionContext = {
      input: { processed: processedInput, ...input },
      previousOutputs: previousResults,
      apiKeys: {},
    };

    return await agentService.executeAgent(agent, context);
  }

  private async executeIntegrationNode(
    nodeId: string,
    node: Node,
    config: Record<string, any>,
    input: Record<string, any>,
    previousResults: Record<string, any>
  ): Promise<IntegrationResult> {
    const provider = node.data.provider || config.provider || 'slack';
    const action = config.action || 'send-message';
    const apiKey = config.apiKey || '';
    
    let parameters = {};
    try {
      parameters = typeof config.params === 'string' ? JSON.parse(config.params) : config.params || {};
    } catch (e) {
      parameters = {};
    }

    // Process parameters with input variables
    const processedParams = { ...parameters };
    Object.entries(processedParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        Object.entries(input).forEach(([inputKey, inputValue]) => {
          processedParams[key] = value.replace(new RegExp(`{{input\\.${inputKey}}}`, 'g'), String(inputValue));
          processedParams[key] = processedParams[key].replace(new RegExp(`{{${inputKey}}}`, 'g'), String(inputValue));
        });
        Object.entries(previousResults).forEach(([resultKey, resultValue]) => {
          processedParams[key] = processedParams[key].replace(new RegExp(`{{${resultKey}}}`, 'g'), String(resultValue));
        });
      }
    });

    const context: IntegrationExecutionContext = {
      action,
      parameters: processedParams,
      apiKey,
      input: { ...input, ...previousResults },
    };

    return await integrationService.executeIntegration(provider, context);
  }

  getExecution(executionId: string): FlowExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): FlowExecution[] {
    return Array.from(this.executions.values());
  }

  // Flow management methods
  async createFlow(flowData: any): Promise<string> {
    return await databaseService.createFlow({
      ...flowData,
      tags: [],
      version: '1.0.0',
      status: 'active',
      nodes: flowData.nodes || [],
      edges: flowData.edges || [],
      nodeConfigs: flowData.nodeConfigs || {}
    });
  }

  async updateFlow(flowId: string, updates: any): Promise<void> {
    await databaseService.updateFlow(flowId, updates);
  }

  async deleteFlow(flowId: string): Promise<void> {
    await databaseService.deleteFlow(flowId);
  }

  async getFlow(flowId: string): Promise<any> {
    return await databaseService.getFlow(flowId);
  }

  async getUserFlows(): Promise<any[]> {
    return await databaseService.getUserFlows();
  }
}

export const flowService = new FlowService();