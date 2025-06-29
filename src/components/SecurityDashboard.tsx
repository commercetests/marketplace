import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, Globe, Smartphone, Lock, Eye, TrendingUp } from 'lucide-react';
import { securityService } from '@/services/securityService';
import { authService } from '@/services/authService';

interface SecurityMetrics {
  riskScore: number;
  threatsBlocked: number;
  securityEvents: number;
  deviceTrust: number;
  complianceScore: number;
}

interface SecurityEvent {
  id: string;
  type: string;
  timestamp: Date;
  riskScore: number;
  details: string;
  status: 'resolved' | 'investigating' | 'active';
}

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    riskScore: 0,
    threatsBlocked: 0,
    securityEvents: 0,
    deviceTrust: 0,
    complianceScore: 0
  });
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadSecurityData();
  }, [selectedTimeframe]);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      const user = authService.getUserProfile();
      if (!user) return;

      // Load security compliance
      const compliance = await securityService.validateSecurityCompliance(user.uid);
      
      // Mock data for demonstration - in production, this would come from your security service
      setMetrics({
        riskScore: compliance.riskScore,
        threatsBlocked: Math.floor(Math.random() * 50) + 10,
        securityEvents: Math.floor(Math.random() * 20) + 5,
        deviceTrust: 85,
        complianceScore: compliance.compliant ? 95 : 60
      });

      // Mock recent events
      setRecentEvents([
        {
          id: '1',
          type: 'Login Attempt',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          riskScore: 15,
          details: 'Successful login from trusted device',
          status: 'resolved'
        },
        {
          id: '2',
          type: 'Rate Limit',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          riskScore: 60,
          details: 'API rate limit exceeded from IP 192.168.1.100',
          status: 'investigating'
        },
        {
          id: '3',
          type: 'Device Change',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          riskScore: 40,
          details: 'New device detected and verified',
          status: 'resolved'
        },
        {
          id: '4',
          type: 'Suspicious Activity',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          riskScore: 80,
          details: 'Multiple failed authentication attempts',
          status: 'active'
        }
      ]);

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600 bg-green-100';
    if (score <= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskScoreLabel = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Medium Risk';
    return 'High Risk';
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your security posture</p>
        </div>
        
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-[20px] border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(metrics.riskScore)}`}>
              {getRiskScoreLabel(metrics.riskScore)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.riskScore}</h3>
          <p className="text-sm text-gray-500">Risk Score</p>
        </div>

        <div className="bg-white rounded-[20px] border p-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.threatsBlocked}</h3>
          <p className="text-sm text-gray-500">Threats Blocked</p>
        </div>

        <div className="bg-white rounded-[20px] border p-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.securityEvents}</h3>
          <p className="text-sm text-gray-500">Security Events</p>
        </div>

        <div className="bg-white rounded-[20px] border p-6">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.deviceTrust}%</h3>
          <p className="text-sm text-gray-500">Device Trust</p>
        </div>

        <div className="bg-white rounded-[20px] border p-6">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.complianceScore}%</h3>
          <p className="text-sm text-gray-500">Compliance Score</p>
        </div>
      </div>

      {/* Security Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Security Events */}
        <div className="bg-white rounded-[20px] border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Security Events</h2>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  event.riskScore <= 30 ? 'bg-green-500' :
                  event.riskScore <= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{event.type}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.details}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{event.timestamp.toLocaleString()}</span>
                    <span>Risk: {event.riskScore}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Controls */}
        <div className="bg-white rounded-[20px] border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Security Controls</h2>
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Triple Radial Lock</h4>
                  <p className="text-xs text-gray-500">Multi-layer authentication system</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Geographic Security</h4>
                  <p className="text-xs text-gray-500">Location-based access control</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Rate Limiting</h4>
                  <p className="text-xs text-gray-500">DDoS and brute force protection</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Device Fingerprinting</h4>
                  <p className="text-xs text-gray-500">Device trust and verification</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Anomaly Detection</h4>
                  <p className="text-xs text-gray-500">AI-powered threat detection</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-white rounded-[20px] border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Enable 2FA</h4>
            </div>
            <p className="text-sm text-blue-700">
              Add an extra layer of security with two-factor authentication
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Review Devices</h4>
            </div>
            <p className="text-sm text-yellow-700">
              Check and remove any untrusted devices from your account
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">Update Password</h4>
            </div>
            <p className="text-sm text-green-700">
              Use a strong, unique password for better security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}