import React from 'react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import type { Integration } from '@/types/integrations';

interface IntegrationCardProps {
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function IntegrationCard({ integration, onConnect, onDisconnect }: IntegrationCardProps) {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center p-2">
            <img 
              src={integration.icon} 
              alt={integration.name}
              className="w-full h-full"
              style={{ filter: 'invert(0.4)' }}
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{integration.name}</h3>
            <p className="text-sm text-gray-500">{integration.description}</p>
          </div>
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          integration.isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        )}>
          {integration.isConnected ? 'Connected' : 'Not Connected'}
        </span>
      </div>
      <Button
        variant={integration.isConnected ? 'secondary' : 'primary'}
        onClick={integration.isConnected ? onDisconnect : onConnect}
        className="w-full"
      >
        {integration.isConnected ? 'Disconnect' : 'Connect'}
      </Button>
    </div>
  );
}