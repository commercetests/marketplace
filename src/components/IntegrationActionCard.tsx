import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import type { IntegrationAction } from '@/types/integrations';

interface IntegrationActionCardProps {
  action: IntegrationAction;
  onSelect: () => void;
}

export function IntegrationActionCard({ action, onSelect }: IntegrationActionCardProps) {
  return (
    <button 
      onClick={onSelect}
      className="w-full bg-white rounded-[20px] p-6 shadow-sm border hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{action.name}</h3>
          <p className="text-sm text-gray-500">{action.description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
}