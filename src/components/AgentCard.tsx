import React, { useState } from 'react';
import { Bot, Play, Settings, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { agentService } from '@/services/agentService';

const typeColors = {
  writer: { bg: 'bg-blue-100', text: 'text-blue-700' },
  reasoning: { bg: 'bg-violet-100', text: 'text-violet-700' },
  orchestrator: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  scraper: { bg: 'bg-amber-100', text: 'text-amber-700' },
} as const;

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  type: keyof typeof typeColors;
  createdAt: string;
  status?: 'idle' | 'running' | 'error';
}

export function AgentCard({ id, name, description, type, createdAt, status = 'idle' }: AgentCardProps) {
  const navigate = useNavigate();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  
  const statusColors = {
    idle: 'bg-gray-100',
    running: 'bg-green-100',
    error: 'bg-red-100'
  };

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      setExecutionResult(null);
      
      // Get the agent
      const agent = await agentService.getAgent(id);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Execute with sample input
      const result = await agentService.executeAgent(agent, {
        input: { 
          topic: 'AI and Machine Learning',
          tone: 'professional',
          length: 'medium'
        },
        previousOutputs: {},
        apiKeys: {}
      });

      if (result.success) {
        setExecutionResult(result.output);
      } else {
        throw new Error(result.error || 'Execution failed');
      }
    } catch (error) {
      console.error('Agent execution failed:', error);
      setExecutionResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            typeColors[type].bg
          )}>
            <Bot className={cn('w-5 h-5', typeColors[type].text)} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          typeColors[type].bg,
          typeColors[type].text
        )}>
          {type}
        </span>
      </div>
      
      {executionResult && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Execution Result:</h4>
          <p className="text-sm text-gray-600 max-h-20 overflow-y-auto">
            {executionResult}
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            statusColors[status]
          )} />
          <span className="text-xs text-gray-500">{createdAt}</span>
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
          <Button variant="secondary" size="sm" onClick={() => navigate(`/agents/${id}/settings`)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}