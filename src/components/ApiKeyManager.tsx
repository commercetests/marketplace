import React, { useState } from 'react';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from './ui/Button';
import { agentService } from '@/services/agentService';
import { integrationService } from '@/services/integrationService';

interface ApiKeyManagerProps {
  provider: string;
  onKeySet?: (provider: string, isValid: boolean) => void;
}

export function ApiKeyManager({ provider, onKeySet }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    
    try {
      // Test the API key with a simple request
      let isKeyValid = false;
      
      switch (provider) {
        case 'openai':
          const openaiResponse = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          isKeyValid = openaiResponse.ok;
          break;
          
        case 'anthropic':
          // Anthropic doesn't have a simple validation endpoint, so we'll do a minimal request
          const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-3-haiku-20240307',
              max_tokens: 1,
              messages: [{ role: 'user', content: 'test' }]
            })
          });
          isKeyValid = anthropicResponse.status !== 401;
          break;
          
        case 'slack':
          const slackResponse = await fetch('https://slack.com/api/auth.test', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const slackData = await slackResponse.json();
          isKeyValid = slackData.ok;
          break;
          
        default:
          // For other providers, we'll assume the key is valid if it's not empty
          isKeyValid = apiKey.length > 10;
      }
      
      setIsValid(isKeyValid);
      
      if (isKeyValid) {
        // Store the API key in both services
        agentService.setApiKey(provider, apiKey);
        integrationService.setApiKey(provider, apiKey);
        onKeySet?.(provider, true);
      } else {
        onKeySet?.(provider, false);
      }
      
    } catch (error) {
      setIsValid(false);
      onKeySet?.(provider, false);
    } finally {
      setIsValidating(false);
    }
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'google': 'Google AI',
      'slack': 'Slack',
      'twitter': 'Twitter',
      'linkedin': 'LinkedIn',
      'meta-ads': 'Meta Ads',
      'hubspot': 'HubSpot',
      'mailchimp': 'Mailchimp',
      'sendgrid': 'SendGrid',
    };
    return names[provider] || provider;
  };

  const getKeyFormat = (provider: string) => {
    const formats: Record<string, string> = {
      'openai': 'sk-...',
      'anthropic': 'sk-ant-...',
      'google': 'AIza...',
      'slack': 'xoxb-...',
      'twitter': 'Bearer token',
      'linkedin': 'Access token',
      'meta-ads': 'Access token',
      'hubspot': 'pat-...',
      'mailchimp': 'API key',
      'sendgrid': 'SG...',
    };
    return formats[provider] || 'API key';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Key className="w-4 h-4 text-blue-700" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{getProviderName(provider)} API Key</h3>
          <p className="text-sm text-gray-500">Format: {getKeyFormat(provider)}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setIsValid(null);
            }}
            placeholder={`Enter your ${getProviderName(provider)} API key`}
            className="w-full pr-20 pl-4 py-2 rounded-[20px] border border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isValid !== null && (
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isValid ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isValid ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <X className="w-3 h-3 text-red-600" />
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {showKey ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        <Button
          onClick={validateApiKey}
          disabled={!apiKey.trim() || isValidating}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Validate & Save Key'}
        </Button>
        
        {isValid === false && (
          <p className="text-sm text-red-600">
            Invalid API key. Please check your key and try again.
          </p>
        )}
        
        {isValid === true && (
          <p className="text-sm text-green-600">
            API key validated and saved successfully!
          </p>
        )}
      </div>
    </div>
  );
}