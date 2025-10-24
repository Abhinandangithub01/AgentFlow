'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bot, ArrowLeft, Mail, DollarSign, Search, TrendingUp, Calendar, MessageSquare, Sparkles } from 'lucide-react';

interface AgentTemplate {
  id: string;
  name: string;
  icon: any;
  type: string;
  description: string;
  features: string[];
  services: string[];
}

const agentTemplates: AgentTemplate[] = [
  {
    id: 'email-assistant',
    name: 'Email Assistant',
    icon: Mail,
    type: 'email',
    description: 'Automatically manages your inbox, categorizes emails, and drafts replies',
    features: [
      'Smart email categorization',
      'Auto-draft professional replies',
      'Urgent message flagging',
      'Daily digest reports'
    ],
    services: ['Gmail', 'Slack']
  },
  {
    id: 'invoice-tracker',
    name: 'Invoice Tracker',
    icon: DollarSign,
    type: 'finance',
    description: 'Tracks payments, sends reminders, and monitors your cash flow',
    features: [
      'Payment status monitoring',
      'Automated reminders',
      'Overdue alerts',
      'Revenue reporting'
    ],
    services: ['FreshBooks', 'Gmail', 'Slack']
  },
  {
    id: 'research-agent',
    name: 'Research Agent',
    icon: Search,
    type: 'research',
    description: 'Monitors industry news, competitors, and trends relevant to you',
    features: [
      'Daily news digests',
      'Competitor monitoring',
      'Trend analysis',
      'Custom alerts'
    ],
    services: ['Web Search', 'Slack']
  },
  {
    id: 'calendar-assistant',
    name: 'Calendar Assistant',
    icon: Calendar,
    type: 'productivity',
    description: 'Manages meetings, schedules, and coordinates with your team',
    features: [
      'Smart scheduling',
      'Meeting coordination',
      'Conflict resolution',
      'Reminder management'
    ],
    services: ['Google Calendar', 'Zoom', 'Slack']
  },
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    icon: MessageSquare,
    type: 'marketing',
    description: 'Schedules posts, monitors engagement, and manages your social presence',
    features: [
      'Content scheduling',
      'Engagement tracking',
      'Reply suggestions',
      'Analytics reports'
    ],
    services: ['Twitter', 'LinkedIn', 'Slack']
  },
  {
    id: 'custom-agent',
    name: 'Custom Agent',
    icon: Sparkles,
    type: 'custom',
    description: 'Build your own agent with custom capabilities and integrations',
    features: [
      'Flexible configuration',
      'Custom prompts',
      'Any service integration',
      'Your use case'
    ],
    services: ['Configure as needed']
  }
];

export default function CreateAgentPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [step, setStep] = useState(1);
  const [agentName, setAgentName] = useState('');
  const [agentSchedule, setAgentSchedule] = useState('hourly');
  const [connectedServices, setConnectedServices] = useState<Record<string, boolean>>({});
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleConnectService = async (service: string) => {
    setIsConnecting(service);
    
    try {
      // Simulate OAuth connection
      const response = await fetch('/api/services/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service })
      });
      
      if (response.ok) {
        setConnectedServices(prev => ({ ...prev, [service]: true }));
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Failed to connect ${service}. Please try again.`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleCreateAgent = async () => {
    if (!selectedTemplate || !agentName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          type: selectedTemplate.type,
          description: selectedTemplate.description,
          config: {
            schedule: agentSchedule,
            services: Object.keys(connectedServices).filter(s => connectedServices[s]),
            template: selectedTemplate.id
          }
        })
      });
      
      if (response.ok) {
        // Show success message
        alert(`🎉 ${agentName} created successfully!`);
        router.push('/dashboard');
      } else {
        throw new Error('Failed to create agent');
      }
    } catch (error) {
      console.error('Creation error:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Bot className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">AgentFlow - Create Agent</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Choose Template</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Configure</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 3 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Deploy</span>
            </div>
          </div>
        </div>

        {/* Step 1: Choose Template */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose an Agent Template</h2>
              <p className="text-gray-600">Select a pre-configured agent or build your own from scratch</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {agentTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`bg-white p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary-600 shadow-lg' 
                        : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary-600' : 'bg-primary-100'
                      }`}>
                        <Icon className={`h-7 w-7 ${isSelected ? 'text-white' : 'text-primary-600'}`} />
                      </div>
                      {isSelected && (
                        <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {template.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700">
                          <span className="text-success-600 mr-2">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-2">Integrations:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.services.map((service, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedTemplate}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && selectedTemplate && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure Your Agent</h2>
              <p className="text-gray-600">Customize settings for your {selectedTemplate.name}</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder={selectedTemplate.name}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-sm text-gray-600 mt-1">Give your agent a unique name</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Run Schedule
                  </label>
                  <select
                    value={agentSchedule}
                    onChange={(e) => setAgentSchedule(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="realtime">Real-time (Continuous)</option>
                    <option value="15min">Every 15 minutes</option>
                    <option value="hourly">Every hour</option>
                    <option value="daily">Daily at 9 AM</option>
                    <option value="weekly">Weekly on Mondays</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-1">How often should the agent run?</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connected Services
                  </label>
                  <div className="space-y-3">
                    {selectedTemplate.services.map((service, idx) => {
                      const isConnected = connectedServices[service.toLowerCase()];
                      const isLoading = isConnecting === service.toLowerCase();
                      
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">{service}</span>
                            {isConnected && (
                              <span className="text-xs bg-success-50 text-success-600 px-2 py-1 rounded-full font-medium">
                                ✓ Connected
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => !isConnected && handleConnectService(service.toLowerCase())}
                            disabled={isConnected || isLoading}
                            className={`text-sm font-medium px-4 py-2 rounded-lg ${
                              isConnected 
                                ? 'bg-success-100 text-success-700 cursor-not-allowed' 
                                : 'text-primary-600 hover:bg-primary-50'
                            }`}
                          >
                            {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Connect'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {Object.keys(connectedServices).length > 0 
                      ? '✓ Services will be authorized via Auth0 Token Vault' 
                      : 'Click Connect to authorize services via Auth0'}
                  </p>
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-primary-600 mt-0.5">🔒</div>
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-1">Secure by Default</h4>
                      <p className="text-sm text-primary-800">
                        All credentials are stored in Auth0 Token Vault. Your agent gets only the permissions it needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between max-w-2xl mx-auto">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!agentName.trim()}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Deploy */}
        {step === 3 && selectedTemplate && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Ready to Deploy!</h2>
              <p className="text-gray-600">Review your agent configuration</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  {(() => {
                    const Icon = selectedTemplate.icon;
                    return (
                      <div className="bg-primary-100 w-16 h-16 rounded-lg flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary-600" />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {agentName || selectedTemplate.name}
                    </h3>
                    <p className="text-gray-600">{selectedTemplate.type}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Schedule</span>
                    <span className="font-medium text-gray-900 capitalize">{agentSchedule}</span>
                  </div>
                  
                  <div className="py-3 border-b border-gray-100">
                    <span className="text-gray-600 block mb-2">Features</span>
                    <div className="space-y-1">
                      {selectedTemplate.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700">
                          <span className="text-success-600 mr-2">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="py-3">
                    <span className="text-gray-600 block mb-2">Services</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.services.map((service, idx) => (
                        <span key={idx} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-sm font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-success-50 border border-success-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="text-success-600 text-2xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-success-900 mb-2">Everything looks good!</h4>
                    <p className="text-sm text-success-800 mb-3">
                      Your agent will start working immediately after deployment. You can pause or modify it anytime.
                    </p>
                    <ul className="text-sm text-success-800 space-y-1">
                      <li>• Agent will run on your selected schedule</li>
                      <li>• All actions require your approval initially</li>
                      <li>• You'll see real-time activity updates</li>
                      <li>• Credentials are securely stored in Auth0</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  disabled={isCreating}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateAgent}
                  disabled={isCreating}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Agent...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Deploy Agent</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
