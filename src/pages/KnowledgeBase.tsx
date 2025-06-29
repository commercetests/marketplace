import React from 'react';
import { Plus, Database, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function KnowledgeBase() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Documents
        </Button>
      </div>

      <div className="bg-white rounded-[20px] border p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 rounded-[20px] border border-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-4">
          {['Company Guidelines', 'Product Documentation', 'API Reference'].map((name) => (
            <div key={name} className="flex items-center justify-between p-4 border rounded-[20px] hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{name}</h3>
                  <p className="text-sm text-gray-500">Last updated 2 days ago</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">23 documents</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}