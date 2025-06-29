import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AgentCard } from '@/components/AgentCard';
import { CreateAgentForm } from '@/components/CreateAgentForm';
import { databaseService } from '@/services/databaseService';
import type { Agent } from '@/types/agent';

export const MOCK_AGENTS = [
  {
    id: '1',
    name: 'Content Writer',
    description: 'AI agent specialized in creating high-quality written content',
    type: 'writer' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Data Analyzer',
    description: 'AI agent for complex reasoning and data analysis tasks',
    type: 'reasoning' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Workflow Manager',
    description: 'AI agent that orchestrates and manages complex workflows',
    type: 'orchestrator' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Web Scraper',
    description: 'AI agent for extracting and processing web data',
    type: 'scraper' as const,
    createdAt: new Date().toISOString(),
  },
];

export function Agents() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const userAgents = await databaseService.getUserAgents();
      setAgents(userAgents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentCreated = () => {
    setShowCreateForm(false);
    loadAgents(); // Reload agents after creation
  };

  if (showCreateForm) {
    return <CreateAgentForm onCancel={() => setShowCreateForm(false)} onSuccess={handleAgentCreated} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Agents</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {agents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              description={agent.description}
              type={agent.type}
              createdAt={`Created ${new Date(agent.createdAt).toLocaleDateString()}`}
              status="idle"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first AI agent to start automating tasks and generating content.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}