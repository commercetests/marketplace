import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IntegrationCard } from '@/components/IntegrationCard';
import { INTEGRATION_LOGOS } from '@/types/integrations';
import type { IntegrationType } from '@/types/integrations';

export const INTEGRATIONS = [
  // Messaging & Communication
  {
    id: 'slack',
    name: 'Slack',
    type: 'messaging',
    provider: 'slack',
    icon: INTEGRATION_LOGOS.slack,
    description: 'Send messages and manage channels',
    isConnected: true
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    type: 'messaging',
    provider: 'whatsapp',
    icon: INTEGRATION_LOGOS.whatsapp,
    description: 'Send messages and manage conversations',
    isConnected: false
  },
  {
    id: 'telegram',
    name: 'Telegram',
    type: 'messaging',
    provider: 'telegram',
    icon: INTEGRATION_LOGOS.telegram,
    description: 'Automate messaging and bot interactions',
    isConnected: false
  },
  
  // Social Media
  {
    id: 'twitter',
    name: 'Twitter',
    type: 'social',
    provider: 'twitter',
    icon: INTEGRATION_LOGOS.twitter,
    description: 'Post and schedule tweets',
    isConnected: false
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    type: 'social',
    provider: 'linkedin',
    icon: INTEGRATION_LOGOS.linkedin,
    description: 'Share updates and manage posts',
    isConnected: true
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    type: 'social',
    provider: 'tiktok',
    icon: INTEGRATION_LOGOS.tiktok,
    description: 'Create and manage TikTok content',
    isConnected: false
  },
  
  // Advertising
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    type: 'advertising',
    provider: 'meta-ads',
    icon: INTEGRATION_LOGOS['meta-ads'],
    description: 'Manage Meta ad campaigns',
    isConnected: true
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    type: 'advertising',
    provider: 'google-ads',
    icon: INTEGRATION_LOGOS['google-ads'],
    description: 'Manage Google ad campaigns',
    isConnected: false
  },
  {
    id: 'tiktok-ads',
    name: 'TikTok Ads',
    type: 'advertising',
    provider: 'tiktok-ads',
    icon: INTEGRATION_LOGOS['tiktok-ads'],
    description: 'Manage TikTok ad campaigns',
    isConnected: false
  },
  
  // Email Marketing
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    type: 'email',
    provider: 'mailchimp',
    icon: INTEGRATION_LOGOS.mailchimp,
    description: 'Email marketing automation',
    isConnected: true
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    type: 'email',
    provider: 'sendgrid',
    icon: INTEGRATION_LOGOS.sendgrid,
    description: 'Email delivery and management',
    isConnected: false
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    type: 'email',
    provider: 'klaviyo',
    icon: INTEGRATION_LOGOS.klaviyo,
    description: 'Ecommerce email marketing',
    isConnected: false
  },
  
  // CRM & Sales
  {
    id: 'hubspot',
    name: 'HubSpot',
    type: 'crm',
    provider: 'hubspot',
    icon: INTEGRATION_LOGOS.hubspot,
    description: 'CRM and marketing automation',
    isConnected: true
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    type: 'crm',
    provider: 'salesforce',
    icon: INTEGRATION_LOGOS.salesforce,
    description: 'Enterprise CRM platform',
    isConnected: false
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    type: 'crm',
    provider: 'zendesk',
    icon: INTEGRATION_LOGOS.zendesk,
    description: 'Customer service and support',
    isConnected: false
  },
  
  // Analytics
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    type: 'analytics',
    provider: 'google-analytics',
    icon: INTEGRATION_LOGOS['google-analytics'],
    description: 'Web analytics and reporting',
    isConnected: true
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    type: 'analytics',
    provider: 'mixpanel',
    icon: INTEGRATION_LOGOS.mixpanel,
    description: 'Product analytics platform',
    isConnected: false
  },
  {
    id: 'segment',
    name: 'Segment',
    type: 'analytics',
    provider: 'segment',
    icon: INTEGRATION_LOGOS.segment,
    description: 'Customer data platform',
    isConnected: false
  },
  
  // CDN & Cloud
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    type: 'cdn',
    provider: 'cloudflare',
    icon: INTEGRATION_LOGOS.cloudflare,
    description: 'CDN and security services',
    isConnected: true
  },
  {
    id: 'aws',
    name: 'AWS',
    type: 'cloud',
    provider: 'aws',
    icon: INTEGRATION_LOGOS.aws,
    description: 'Cloud computing services',
    isConnected: false
  },
  {
    id: 'azure',
    name: 'Azure',
    type: 'cloud',
    provider: 'azure',
    icon: INTEGRATION_LOGOS.azure,
    description: 'Microsoft cloud platform',
    isConnected: false
  },
  
  // Payments
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'payment',
    provider: 'stripe',
    icon: INTEGRATION_LOGOS.stripe,
    description: 'Payment processing',
    isConnected: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'payment',
    provider: 'paypal',
    icon: INTEGRATION_LOGOS.paypal,
    description: 'Online payments',
    isConnected: false
  },
  {
    id: 'square',
    name: 'Square',
    type: 'payment',
    provider: 'square',
    icon: INTEGRATION_LOGOS.square,
    description: 'Payment and point of sale',
    isConnected: false
  },
  
  // Search
  {
    id: 'algolia',
    name: 'Algolia',
    type: 'search',
    provider: 'algolia',
    icon: INTEGRATION_LOGOS.algolia,
    description: 'Search and discovery',
    isConnected: true
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    type: 'search',
    provider: 'elasticsearch',
    icon: INTEGRATION_LOGOS.elasticsearch,
    description: 'Search and analytics engine',
    isConnected: false
  },
  
  // Video
  {
    id: 'youtube-api',
    name: 'YouTube',
    type: 'video',
    provider: 'youtube-api',
    icon: INTEGRATION_LOGOS['youtube-api'],
    description: 'Video content management',
    isConnected: true
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    type: 'video',
    provider: 'vimeo',
    icon: INTEGRATION_LOGOS.vimeo,
    description: 'Professional video platform',
    isConnected: false
  },
  
  // Ecommerce
  {
    id: 'shopify',
    name: 'Shopify',
    type: 'ecommerce',
    provider: 'shopify',
    icon: INTEGRATION_LOGOS.shopify,
    description: 'Ecommerce platform',
    isConnected: true
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    type: 'ecommerce',
    provider: 'woocommerce',
    icon: INTEGRATION_LOGOS.woocommerce,
    description: 'WordPress ecommerce',
    isConnected: false
  }
];

const CATEGORIES: { label: string; value: IntegrationType }[] = [
  { label: 'All', value: 'all' as IntegrationType },
  { label: 'Messaging', value: 'messaging' },
  { label: 'Social', value: 'social' },
  { label: 'Advertising', value: 'advertising' },
  { label: 'Email', value: 'email' },
  { label: 'CRM', value: 'crm' },
  { label: 'Analytics', value: 'analytics' },
  { label: 'CDN', value: 'cdn' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Payment', value: 'payment' },
  { label: 'Search', value: 'search' },
  { label: 'Video', value: 'video' },
  { label: 'Ecommerce', value: 'ecommerce' }
];

export function Integrations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IntegrationType | 'all'>('all');
  const [showConnected, setShowConnected] = useState<boolean | null>(null);

  const filteredIntegrations = INTEGRATIONS.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.type === selectedCategory;
    const matchesConnection = showConnected === null || integration.isConnected === showConnected;
    
    return matchesSearch && matchesCategory && matchesConnection;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
      </div>

      <div className="bg-white rounded-[20px] border p-6">
        <div className="flex flex-col gap-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                className="w-full pl-10 pr-4 py-2 rounded-[20px] border border-gray-200 focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                className="rounded-[20px] border border-gray-200 px-4 py-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as IntegrationType | 'all')}
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showConnected === true ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowConnected(showConnected === true ? null : true)}
              >
                Connected
              </Button>
              <Button
                variant={showConnected === false ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowConnected(showConnected === false ? null : false)}
              >
                Not Connected
              </Button>
            </div>
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={() => console.log('Connect:', integration.name)}
                onDisconnect={() => console.log('Disconnect:', integration.name)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}