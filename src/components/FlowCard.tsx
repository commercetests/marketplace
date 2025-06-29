import React, { useState } from 'react';
import { GitGraph, Play, Settings, Clock, Bot, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { flowService } from '@/services/flowService';

interface FlowCardProps {
  id: string;
  name: string;
  description: string;
  agentCount: number;
  lastRun: string;
  status?: 'idle' | 'running' | 'completed' | 'error';
  onClick?: () => void;
}

export function FlowCard({ id, name, description, agentCount, lastRun, status = 'idle', onClick }: FlowCardProps) {
  const navigate = useNavigate();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  
  const statusColors = {
    idle: 'bg-gray-100 text-gray-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700'
  };

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      setExecutionResult(null);
      
      // Get the flow
      const flow = await flowService.getFlow(id);
      if (!flow) {
        throw new Error('Flow not found');
      }

      // Execute with sample input
      const executionId = await flowService.executeFlow(
        flow.nodes || [],
        flow.edges || [],
        { 
          topic: 'AI and Machine Learning',
          tone: 'professional'
        },
        flow.nodeConfigs || {}
      );

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      const pollExecution = () => {
        const execution = flowService.getExecution(executionId);
        if (execution) {
          if (execution.status === 'completed') {
            setExecutionResult('Flow executed successfully');
          } else if (execution.status === 'error') {
            setExecutionResult(`Flow failed: ${Object.values(execution.errors).join(', ')}`);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(pollExecution, 1000);
            return;
          } else {
            setExecutionResult('Flow execution timed out');
          }
        } else {
          setExecutionResult('Flow execution failed to start');
        }
        setIsExecuting(false);
      };

      setTimeout(pollExecution, 1000);
      
    } catch (error) {
      console.error('Flow execution failed:', error);
      setExecutionResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <GitGraph className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Bot className="w-3 h-3" />
          {agentCount} agents
        </span>
      </div>
      
      {executionResult && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Execution Result:</h4>
          <p className="text-sm text-gray-600">
            {executionResult}
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{lastRun}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/flows/${id}/settings`)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}