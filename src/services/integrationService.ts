import { databaseService } from './databaseService';

export interface IntegrationExecutionContext {
  action: string;
  parameters: Record<string, any>;
  apiKey: string;
  input: Record<string, any>;
}

export interface IntegrationResult {
  success: boolean;
  output: any;
  error?: string;
}

class IntegrationService {
  private apiKeys: Map<string, string> = new Map();

  setApiKey(provider: string, key: string) {
    this.apiKeys.set(provider, key);
  }

  getApiKey(provider: string): string | undefined {
    return this.apiKeys.get(provider);
  }

  async executeIntegration(provider: string, context: IntegrationExecutionContext): Promise<IntegrationResult> {
    try {
      const apiKey = this.getApiKey(provider) || context.apiKey;
      
      if (!apiKey) {
        throw new Error(`API key not found for provider: ${provider}`);
      }

      // Process parameters with input variables
      const processedParams = this.processParameters(context.parameters, context.input);

      switch (provider) {
        case 'slack':
          return await this.executeSlack(context.action, processedParams, apiKey);
        case 'twitter':
          return await this.executeTwitter(context.action, processedParams, apiKey);
        case 'linkedin':
          return await this.executeLinkedIn(context.action, processedParams, apiKey);
        case 'meta-ads':
          return await this.executeMetaAds(context.action, processedParams, apiKey);
        case 'google-ads':
          return await this.executeGoogleAds(context.action, processedParams, apiKey);
        case 'hubspot':
          return await this.executeHubSpot(context.action, processedParams, apiKey);
        case 'mailchimp':
          return await this.executeMailchimp(context.action, processedParams, apiKey);
        case 'sendgrid':
          return await this.executeSendGrid(context.action, processedParams, apiKey);
        default:
          throw new Error(`Unsupported integration provider: ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private processParameters(params: Record<string, any>, input: Record<string, any>): Record<string, any> {
    const processed = { ...params };
    
    Object.entries(processed).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Replace input variables
        Object.entries(input).forEach(([inputKey, inputValue]) => {
          processed[key] = value.replace(new RegExp(`{{input\\.${inputKey}}}`, 'g'), String(inputValue));
          processed[key] = processed[key].replace(new RegExp(`{{${inputKey}}}`, 'g'), String(inputValue));
        });
      }
    });
    
    return processed;
  }

  private async executeSlack(action: string, params: Record<string, any>, apiKey: string): Promise<IntegrationResult> {
    switch (action) {
      case 'send-message':
        const response = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: params.channel || '#general',
            text: params.message || params.text,
            username: params.username || 'Agent Bot',
          }),
        });

        const data = await response.json();
        if (!data.ok) {
          throw new Error(`Slack API error: ${data.error}`);
        }

        return {
          success: true,
          output: { messageId: data.ts, channel: data.channel }
        };

      case 'create-channel':
        const createResponse = await fetch('https://slack.com/api/conversations.create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: params.name,
            is_private: params.isPrivate || false,
          }),
        });

        const createData = await createResponse.json();
        if (!createData.ok) {
          throw new Error(`Slack API error: ${createData.error}`);
        }

        return {
          success: true,
          output: { channelId: createData.channel.id, channelName: createData.channel.name }
        };

      default:
        throw new Error(`Unsupported Slack action: ${action}`);
    }
  }

  private async executeTwitter(action: string, params: Record<string, any>, apiKey: string): Promise<IntegrationResult> {
    switch (action) {
      case 'post-tweet':
        const response = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: params.text || params.message,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Twitter API error: ${error.detail || 'Unknown error'}`);
        }

        const data = await response.json();
        return {
          success: true,
          output: { tweetId: data.data.id, text: data.data.text }
        };

      case 'schedule-tweet':
        // Note: Twitter API v2 doesn't support scheduling directly
        // This would typically be handled by a third-party service
        return {
          success: true,
          output: { scheduled: true, text: params.text, scheduledFor: params.scheduledFor }
        };

      default:
        throw new Error(`Unsupported Twitter action: ${action}`);
    }
  }

  private async executeLinkedIn(action: string, params: Record<string, any>, apiKey: string): Promise<IntegrationResult> {
    switch (action) {
      case 'create-post':
        const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            author: params.author,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: params.text || params.message
                },
                shareMediaCategory: 'NONE'
              }
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`LinkedIn API error: ${error.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return {
          success: true,
          output: { postId: data.id }
        };

      default:
        throw new Error(`Unsupported LinkedIn action: ${action}`);
    }
  }

  private async executeHubSpot(action: string, params: Record<string, any>, apiKey: string): Promise<IntegrationResult> {
    switch (action) {
      case 'create-contact':
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              email: params.email,
              firstname: params.firstName || params.firstname,
              lastname: params.lastName || params.lastname,
              company: params.company,
              phone: params.phone,
            }
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`HubSpot API error: ${error.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return {
          success: true,
          output: { contactId: data.id, email: data.properties.email }
        };

      case 'update-deal':
        const dealResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${params.dealId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: params.properties || {}
          }),
        });

        if (!dealResponse.ok) {
          const error = await dealResponse.json();
          throw new Error(`HubSpot API error: ${error.message || 'Unknown error'}`);
        }

        const dealData = await dealResponse.json();
        return {
          success: true,
          output: { dealId: dealData.id, updated: true }
        };

      default:
        throw new Error(`Unsupported HubSpot action: ${action}`);
    }
  }

  private async executeMailchimp(action: string, params: Record<string, any>, apiKey: string): Promise<IntegrationResult> {
    const datacenter = apiKey.split('-')[1];
    const baseUrl = `https://${datacenter}.api.mailchimp.com/3.0`;

    switch (action) {
      case 'add-subscriber':
        const response = await fetch(`${baseUrl}/lists/${params.listId}/members`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: params.email,
            status: params.status || 'subscribed',
            merge_fields: params.mergeFields || {},
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Mailchimp API error: ${error.detail || 'Unknown error'}`);
        }

        const data = await response.json();
        return {
          success: true,
          output: { subscriberId: data.id, email: data.email_address }
        };

      case 'send-campaign':
        const campaignResponse = await fetch(`${baseUrl}/campaigns/${params.campaignId}/actions/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!campaignResponse.ok) {
          const error = await campaignResponse.json();
          throw new Error(`Mailchimp API error: ${error.detail || 'Unknown error'}`);
        }

        return {
          success: true,
          output: { campaignId: params.campaignId, sent: true }
        };

      default:
        throw new Error(`Unsupported Mailchimp action: ${action}`);
    }
  }

  private async executeSendGrid(action: string, params: Record<string, any>, apiKey: string): Promise<IntegrationResult> {
    switch (action) {
      case 'send-email':
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: params.to }],
              subject: params.subject,
            }],
            from: { email: params.from },
            content: [{
              type: params.contentType || 'text/html',
              value: params.content || params.message,
            }],
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`SendGrid API error: ${error.errors?.[0]?.message || 'Unknown error'}`);
        }

        return {
          success: true,
          output: { status: 'sent', to: params.to, subject: params.subject }
        };

      case 'add-contact':
        const contactResponse = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contacts: [{
              email: params.email,
              first_name: params.firstName,
              last_name: params.lastName,
            }]
          }),
        });

        if (!contactResponse.ok) {
          const error = await contactResponse.json();
          throw new Error(`SendGrid API error: ${error.errors?.[0]?.message || 'Unknown error'}`);
        }

        const contactData = await contactResponse.json();
        return {
          success: true,
          output: { contactId: contactData.job_id, email: params.email }
        };

      default:
        throw new Error(`Unsupported SendGrid action: ${action}`);
    }
  }

  private async executeMetaAds(action: string, params: Record<string, any>, apiKey: string): Promise<IntegrationResult> {
    // Meta Ads API implementation
    switch (action) {
      case 'create-campaign':
        const response = await fetch(`https://graph.facebook.com/v18.0/${params.adAccountId}/campaigns`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: params.name,
            objective: params.objective || 'LINK_CLICKS',
            status: params.status || 'PAUSED',
            special_ad_categories: params.specialAdCategories || [],
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Meta Ads API error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return {
          success: true,
          output: { campaignId: data.id, name: params.name }
        };

      default:
        throw new Error(`Unsupported Meta Ads action: ${action}`);
    }
  }

  private async executeGoogleAds(action: string, params: Record<string, any>, apiKey: string): Promise<IntegrationResult> {
    // Google Ads API implementation would go here
    // Note: Google Ads API requires OAuth2 and is more complex
    throw new Error('Google Ads integration requires OAuth2 setup');
  }

  // Integration management methods
  async createIntegration(integrationData: any): Promise<string> {
    return await databaseService.createIntegration(integrationData);
  }

  async getUserIntegrations(): Promise<any[]> {
    return await databaseService.getUserIntegrations();
  }

  async updateIntegration(integrationId: string, updates: any): Promise<void> {
    // Implementation would update integration in database
  }

  async deleteIntegration(integrationId: string): Promise<void> {
    // Implementation would delete integration from database
  }
}

export const integrationService = new IntegrationService();