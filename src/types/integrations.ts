export type IntegrationType = 
  | 'messaging' 
  | 'social' 
  | 'advertising' 
  | 'email' 
  | 'crm' 
  | 'analytics'
  | 'cdn'
  | 'payment'
  | 'cloud'
  | 'database'
  | 'search'
  | 'video'
  | 'ecommerce';

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  provider: string;
  icon: string;
  description: string;
  isConnected: boolean;
  credentials?: Record<string, string>;
}

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  provider: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

// Integration provider logos
export const INTEGRATION_LOGOS = {
  // Messaging & Communication
  slack: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/slack.svg',
  discord: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg',
  teams: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoftteams.svg',
  whatsapp: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg',
  telegram: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg',
  messenger: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/messenger.svg',
  wechat: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/wechat.svg',
  line: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/line.svg',
  
  // Social Media
  twitter: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg',
  linkedin: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg',
  facebook: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg',
  instagram: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg',
  tiktok: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg',
  pinterest: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pinterest.svg',
  reddit: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/reddit.svg',
  youtube: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg',
  
  // Advertising
  'meta-ads': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/meta.svg',
  'google-ads': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googleads.svg',
  'amazon-ads': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazon.svg',
  'microsoft-ads': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoftbing.svg',
  'tiktok-ads': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg',
  'snapchat-ads': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/snapchat.svg',
  'pinterest-ads': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pinterest.svg',
  'linkedin-ads': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg',
  
  // Email Marketing
  mailchimp: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mailchimp.svg',
  sendgrid: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/sendgrid.svg',
  'constant-contact': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/constantcontact.svg',
  'campaign-monitor': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/campaignmonitor.svg',
  klaviyo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/klaviyo.svg',
  
  // CRM & Sales
  hubspot: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hubspot.svg',
  salesforce: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/salesforce.svg',
  zoho: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/zoho.svg',
  pipedrive: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pipedrive.svg',
  zendesk: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/zendesk.svg',
  
  // Analytics
  'google-analytics': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googleanalytics.svg',
  mixpanel: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mixpanel.svg',
  amplitude: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amplitude.svg',
  segment: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/segment.svg',
  hotjar: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hotjar.svg',
  
  // CDN & Cloud
  cloudflare: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg',
  akamai: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/akamai.svg',
  fastly: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/fastly.svg',
  aws: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazonaws.svg',
  'google-cloud': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlecloud.svg',
  azure: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoftazure.svg',
  
  // Payments
  stripe: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/stripe.svg',
  paypal: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/paypal.svg',
  square: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/square.svg',
  wise: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/wise.svg',
  'google-pay': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlepay.svg',
  
  // Search
  algolia: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/algolia.svg',
  elasticsearch: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/elasticsearch.svg',
  meilisearch: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/meilisearch.svg',
  
  // Video
  twitch: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitch.svg',
  vimeo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/vimeo.svg',
  'youtube-api': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg',
  
  // Ecommerce
  shopify: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/shopify.svg',
  woocommerce: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/woocommerce.svg',
  magento: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/magento.svg',
  bigcommerce: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bigcommerce.svg'
};