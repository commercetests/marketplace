import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FlowCard } from '@/components/FlowCard';
import { useNavigate } from 'react-router-dom';
import { databaseService } from '@/services/databaseService';
import type { Flow } from '@/types/agent';

export function Flows() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    try {
      setIsLoading(true);
      const userFlows = await databaseService.getUserFlows();
      setFlows(userFlows);
    } catch (error) {
      console.error('Failed to load flows:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-2xl font-semibold text-gray-900">My Flows</h1>
        <Button onClick={() => navigate('/flows/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Flow
        </Button>
      </div>

      {flows.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {flows.map((flow) => (
            <FlowCard
              key={flow.id}
              id={flow.id}
              name={flow.name}
              description={flow.description}
              agentCount={flow.agents?.length || 0}
              lastRun={`Last run ${new Date(flow.updatedAt).toLocaleDateString()}`}
              status="idle"
              onClick={() => navigate(`/flows/${flow.id}/settings`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flows yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first workflow to chain multiple agents and integrations together.
            </p>
            <Button onClick={() => navigate('/flows/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Flow
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}