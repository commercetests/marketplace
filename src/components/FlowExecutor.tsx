import React, { useState } from 'react';
import { Play, Square, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { flowService, FlowExecution } from '@/services/flowService';
import { Node, Edge } from 'reactflow';

interface FlowExecutorProps {
  nodes: Node[];
  edges: Edge[];
  nodeConfigs: Record<string, any>;
}

export function FlowExecutor({ nodes, edges, nodeConfigs }: FlowExecutorProps) {
  const [execution, setExecution] = useState<FlowExecution | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [input, setInput] = useState('{"topic": "AI and Machine Learning", "tone": "professional"}');

  const executeFlow = async () => {
    try {
      setIsRunning(true);
      
      const initialInput = JSON.parse(input);
      const executionId = await flowService.executeFlow(nodes, edges, initialInput, nodeConfigs);
      
      // Poll for execution status
      const pollExecution = () => {
        const currentExecution = flowService.getExecution(executionId);
        if (currentExecution) {
          setExecution(currentExecution);
          
          if (currentExecution.status === 'running') {
            setTimeout(pollExecution, 1000);
          } else {
            setIsRunning(false);
          }
        }
      };
      
      pollExecution();
      
    } catch (error) {
      console.error('Flow execution error:', error);
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    // In a real implementation, you'd send a stop signal to the flow service
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[20px] border p-6">
        <h3 className="font-medium text-gray-900 mb-4">Flow Execution</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Input (JSON)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-2 rounded-[20px] border border-gray-300 focus:outline-none focus:border-blue-500"
              rows={4}
              placeholder='{"topic": "AI and Machine Learning", "tone": "professional"}'
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={executeFlow}
              disabled={isRunning || nodes.length === 0}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running...' : 'Execute Flow'}
            </Button>
            
            {isRunning && (
              <Button
                variant="secondary"
                onClick={stopExecution}
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </div>

      {execution && (
        <div className="bg-white rounded-[20px] border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Execution Results</h3>
            <div className="flex items-center gap-2">
              {getStatusIcon(execution.status)}
              <span className="text-sm text-gray-600 capitalize">{execution.status}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
              <div className="text-sm text-gray-600">
                <p>Started: {execution.startTime.toLocaleString()}</p>
                {execution.endTime && (
                  <p>Completed: {execution.endTime.toLocaleString()}</p>
                )}
                {execution.currentNode && (
                  <p>Current Node: {execution.currentNode}</p>
                )}
              </div>
            </div>
            
            {Object.keys(execution.results).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Results</h4>
                <div className="space-y-2">
                  {Object.entries(execution.results).map(([nodeId, result]) => (
                    <div key={nodeId} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-sm text-gray-700 mb-1">{nodeId}</div>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {Object.keys(execution.errors).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">Errors</h4>
                <div className="space-y-2">
                  {Object.entries(execution.errors).map(([nodeId, error]) => (
                    <div key={nodeId} className="bg-red-50 rounded-lg p-3">
                      <div className="font-medium text-sm text-red-700 mb-1">{nodeId}</div>
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}