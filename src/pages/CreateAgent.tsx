import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateAgentForm } from '@/components/CreateAgentForm';

export function CreateAgent() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Agent</h1>
      </div>
      
      <CreateAgentForm onCancel={() => navigate('/agents')} />
    </div>
  );
}