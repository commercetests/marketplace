import React, { useState, useEffect } from 'react';
import { AgentCard } from '@/components/AgentCard';
import { FlowCard } from '@/components/FlowCard';
import { databaseService } from '@/services/databaseService';
import { Agent, Flow } from '@/types/agent';
import { BarChart, TrendingUp, Clock, Zap } from 'lucide-react';

export function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [analytics, setAnalytics] = useState({
    totalAgents: 0,
    totalFlows: 0,
    totalExecutions: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load recent agents and flows
      const [userAgents, userFlows, analyticsData] = await Promise.all([
        databaseService.getUserAgents(),
        databaseService.getUserFlows(),
        databaseService.getAnalytics()
      ]);

      setAgents(userAgents.slice(0, 6)); // Show only recent 6
      setFlows(userFlows.slice(0, 6)); // Show only recent 6
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] border p-6">
          <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-4">
            <BarChart className="w-6 h-6 text-cyan-700" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">{analytics.totalExecutions}</h3>
          <p className="text-sm text-gray-500">Total Executions</p>
        </div>

        <div className="bg-white rounded-[20px] border p-6">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">98.5%</h3>
          <p className="text-sm text-gray-500">Success Rate</p>
        </div>

        <div className="bg-white rounded-[20px] border p-6">
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-violet-700" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">1.2s</h3>
          <p className="text-sm text-gray-500">Avg Response Time</p>
        </div>

        <div className="bg-white rounded-[20px] border p-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">{analytics.totalAgents}</h3>
          <p className="text-sm text-gray-500">Active Agents</p>
        </div>
      </div>

      {/* Recent Agents */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Agents</h2>
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
          <div className="bg-white rounded-[20px] border p-8 text-center">
            <p className="text-gray-500">No agents created yet. Create your first agent to get started!</p>
          </div>
        )}
      </section>
      
      {/* Recent Flows */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Flows</h2>
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
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[20px] border p-8 text-center">
            <p className="text-gray-500">No flows created yet. Create your first flow to automate tasks!</p>
          </div>
        )}
      </section>

      {/* Recent Activity */}
      {analytics.recentActivity.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="bg-white rounded-[20px] border p-6">
            <div className="space-y-4">
              {analytics.recentActivity.slice(0, 5).map((activity: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{activity.targetName}</h4>
                    <p className="text-sm text-gray-500">
                      {activity.type === 'agent' ? 'Agent execution' : 'Flow execution'} • 
                      {activity.success ? ' Completed' : ' Failed'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                    {activity.cost && (
                      <p className="text-xs text-gray-400">${activity.cost.toFixed(4)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}