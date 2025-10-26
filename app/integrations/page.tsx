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
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading]);

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
        requestAnimationFrame(() => {
          setConnectedServices(prev => ({ ...prev, [serviceName.toLowerCase()]: true }));
          setShowSuccessMessage(serviceName.toLowerCase());
          setConnectingService(null);
        });
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      requestAnimationFrame(() => {
        setShowErrorMessage((error as Error).message || 'Connection failed');
        setConnectingService(null);
      });
    }
  };

  // Mark component as mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check sessionStorage for OAuth callback results AFTER mount
  useEffect(() => {
    // Only run on client side after component is fully mounted
    if (!isMounted || typeof window === 'undefined') return;
    
    // Use setTimeout to defer state updates to next tick
    setTimeout(() => {
      const connected = sessionStorage.getItem('oauth_success');
      const error = sessionStorage.getItem('oauth_error');

      if (connected) {
        sessionStorage.removeItem('oauth_success');
        setConnectedServices(prev => ({ ...prev, [connected]: true }));
        setShowSuccessMessage(connected);
        setTimeout(() => setShowSuccessMessage(null), 5000);
      }

      if (error) {
        sessionStorage.removeItem('oauth_error');
        setShowErrorMessage(error);
        setTimeout(() => setShowErrorMessage(null), 5000);
      }
    }, 0);
  }, [isMounted]);

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
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-success-100 border border-success-500 text-success-800 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span>✓ {showSuccessMessage.charAt(0).toUpperCase() + showSuccessMessage.slice(1)} connected successfully!</span>
          <button onClick={() => setShowSuccessMessage(null)} className="ml-2 text-success-600 hover:text-success-800 font-bold">×</button>
        </div>
      )}
      
      {/* Error Message */}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-500 text-red-800 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span>Connection failed: {showErrorMessage}</span>
          <button onClick={() => setShowErrorMessage(null)} className="ml-2 text-red-600 hover:text-red-800 font-bold">×</button>
        </div>
      )}
      
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

