'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Zap } from 'lucide-react';
import { EmailIcon, ConnectedIcon } from '@/components/icons/CustomIcons';

export default function IntegrationsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [connectedServices, setConnectedServices] = useState<Record<string, boolean>>({});
  const [connectingService, setConnectingService] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleConnect = async (serviceName: string) => {
    setConnectingService(serviceName);
    
    try {
      const response = await fetch('/api/services/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: serviceName })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Check if OAuth is required
        if (data.requiresOAuth && data.authUrl) {
          // Redirect to OAuth provider
          window.location.href = data.authUrl;
          return;
        }
        
        // Direct connection (no OAuth needed)
        setConnectedServices(prev => ({ ...prev, [serviceName.toLowerCase()]: true }));
        alert(`✓ ${serviceName} connected successfully!`);
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Failed to connect ${serviceName}. Please try again.`);
      setConnectingService(null);
    }
  };

  // Check for OAuth callback success (client-side only)
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');

    if (connected) {
      setConnectedServices(prev => ({ ...prev, [connected]: true }));
      alert(`✓ ${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`);
      // Clean URL
      window.history.replaceState({}, '', '/integrations');
    }

    if (error) {
      alert(`Connection failed: ${error}`);
      window.history.replaceState({}, '', '/integrations');
    }
  }, []);

  const availableIntegrations = [
    { name: 'Gmail', description: 'Email management and automation', icon: 'email', color: 'red' },
    { name: 'Slack', description: 'Team communication', icon: 'chat', color: 'purple' },
    { name: 'Google Calendar', description: 'Schedule and meetings', icon: 'calendar', color: 'blue' },
    { name: 'Notion', description: 'Notes and documentation', icon: 'file', color: 'gray' },
    { name: 'Twitter', description: 'Social media management', icon: 'twitter', color: 'blue' },
    { name: 'LinkedIn', description: 'Professional networking', icon: 'linkedin', color: 'blue' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-sm text-gray-600 mt-1">Connect your tools and services</p>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Integrations</h2>
            <div className="grid grid-cols-3 gap-6">
              {availableIntegrations.map((integration) => {
                const isConnected = connectedServices[integration.name.toLowerCase()];
                const isConnecting = connectingService === integration.name;
                
                return (
                  <div key={integration.name} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-${integration.color}-100 rounded-lg flex items-center justify-center`}>
                        <EmailIcon className={`h-6 w-6 text-${integration.color}-600`} />
                      </div>
                      <button 
                        onClick={() => !isConnected && handleConnect(integration.name)}
                        disabled={isConnected || isConnecting}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          isConnected 
                            ? 'bg-success-100 text-success-700 cursor-not-allowed' 
                            : isConnecting
                            ? 'bg-gray-100 text-gray-500 cursor-wait'
                            : 'text-primary-600 border border-primary-600 hover:bg-primary-50'
                        }`}
                      >
                        {isConnecting ? 'Connecting...' : isConnected ? '✓ Connected' : 'Connect'}
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{integration.name}</h3>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                    {isConnected && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-success-600 font-medium">✓ Ready to use</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900 mb-1">Secure Authentication</h3>
                <p className="text-sm text-primary-800">
                  All integrations use OAuth 2.0 and are securely stored in Auth0 Token Vault. 
                  Your credentials are encrypted and never exposed to our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
