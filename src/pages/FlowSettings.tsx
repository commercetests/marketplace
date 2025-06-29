import React from 'react';
import { useParams } from 'react-router-dom';
import { GitGraph, Save, Trash2, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { INTEGRATION_LOGOS } from '@/types/integrations';

const AVAILABLE_INTEGRATIONS = [
  { name: 'Slack', provider: 'slack', actions: ['Send Message', 'Create Channel'] },
  { name: 'Twitter', provider: 'twitter', actions: ['Post Tweet', 'Schedule Tweet'] },
  { name: 'LinkedIn', provider: 'linkedin', actions: ['Create Post', 'Share Update'] },
  { name: 'Meta Ads', provider: 'meta-ads', actions: ['Create Campaign', 'Update Ad Set'] },
  { name: 'Amazon Ads', provider: 'amazon-ads', actions: ['Create Campaign', 'Update Budget'] },
  { name: 'HubSpot', provider: 'hubspot', actions: ['Create Contact', 'Update Deal'] },
];

export function FlowSettings() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <GitGraph className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Content Pipeline Settings</h1>
            <p className="text-gray-500">Configure your flow's sequence and behavior</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[20px] border p-6 space-y-8">
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flow Name
              </label>
              <input
                type="text"
                className="w-full rounded-[20px] border border-gray-300 px-4 py-2"
                defaultValue="Content Pipeline"
              />
            </div>
            <TextArea
              label="Description"
              defaultValue="Automated content creation and publishing pipeline"
              rows={3}
            />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Sequence</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-[20px] p-4">
              <div className="space-y-4">
                {/* Agent 1 */}
                <div className="bg-white rounded-[20px] p-4 border">
                  <div className="flex items-center justify-between mb-4">
                    <Select defaultValue="content-writer" className="w-64">
                      <option value="content-writer">Content Writer</option>
                      <option value="data-analyzer">Data Analyzer</option>
                      <option value="web-scraper">Web Scraper</option>
                    </Select>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <TextArea
                    label="Configuration"
                    defaultValue="{
  'topic': '{{input.topic}}',
  'tone': 'professional',
  'length': 'medium'
}"
                    rows={4}
                  />
                </div>

                {/* Agent 2 */}
                <div className="bg-white rounded-[20px] p-4 border">
                  <div className="flex items-center justify-between mb-4">
                    <Select defaultValue="content-reviewer" className="w-64">
                      <option value="content-writer">Content Writer</option>
                      <option value="content-reviewer">Content Reviewer</option>
                      <option value="publisher">Publisher</option>
                    </Select>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <TextArea
                    label="Configuration"
                    defaultValue="{
  'criteria': ['grammar', 'tone', 'accuracy'],
  'strictness': 'high'
}"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            {/* Integration Step */}
            <div className="bg-white rounded-[20px] p-4 border">
              <div className="flex items-center justify-between mb-4">
                <Select className="w-64">
                  <option value="">Add Integration</option>
                  {AVAILABLE_INTEGRATIONS.map(integration => (
                    <option key={integration.provider} value={integration.provider}>
                      {integration.name}
                    </option>
                  ))}
                </Select>
                <div className="flex items-center gap-2">
                  <img
                    src={INTEGRATION_LOGOS['slack']}
                    alt="Slack"
                    className="w-6 h-6"
                    style={{ filter: 'invert(0.4)' }}
                  />
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Select className="w-48">
                    <option value="">Select Action</option>
                    <option value="send-message">Send Message</option>
                    <option value="create-channel">Create Channel</option>
                  </Select>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <TextArea
                label="Configuration"
                defaultValue="{
  'channel': '{{output.channel}}',
  'message': '{{output.content}}'
}"
                rows={4}
              />
            </div>
            
            <Button variant="secondary" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
            <Button variant="secondary" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Flow Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Error Handling"
                defaultValue="retry"
              >
                <option value="retry">Retry (3x)</option>
                <option value="skip">Skip Failed Steps</option>
                <option value="stop">Stop Execution</option>
              </Select>
              <Select
                label="Execution Mode"
                defaultValue="sequential"
              >
                <option value="sequential">Sequential</option>
                <option value="parallel">Parallel (where possible)</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (minutes)
              </label>
              <input
                type="number"
                className="w-full rounded-[20px] border border-gray-300 px-4 py-2"
                defaultValue="30"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}