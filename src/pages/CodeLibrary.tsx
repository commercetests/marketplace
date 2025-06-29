import React from 'react';
import { Plus, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CodeLibrary() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Code Library</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Code Snippet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'Data Processing', language: 'Python' },
          { name: 'API Integration', language: 'JavaScript' },
          { name: 'Text Analysis', language: 'Python' },
          { name: 'Web Scraping', language: 'Python' }
        ].map((snippet) => (
          <div key={snippet.name} className="bg-white rounded-[20px] border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{snippet.name}</h3>
                  <p className="text-sm text-gray-500">{snippet.language}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-[20px] p-4">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                <code>{`def process_data(data):
    # Example code
    return transformed_data`}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}