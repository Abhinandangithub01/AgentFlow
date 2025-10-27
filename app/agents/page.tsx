'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, X } from 'lucide-react';
import { EmailIcon, InvoiceIcon, ResearchIcon, CalendarIcon, SocialIcon, CustomAgentIcon } from '@/components/icons/CustomIcons';

interface AgentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: any;
  features: string[];
  services: string[];
}

const templates: AgentTemplate[] = [
  {
    id: 'email',
    name: 'Email Assistant',
    type: 'email_assistant',
    description: 'Automatically manages your inbox, categorizes emails, and drafts replies',
    icon: EmailIcon,
    features: ['Smart email categorization', 'Auto-draft professional replies', 'Urgent message flagging'],
    services: ['Gmail', 'Slack']
  },
  {
    id: 'invoice',
    name: 'Invoice Tracker',
    type: 'invoice_tracker',
    description: 'Tracks payments, sends reminders, and monitors your cash flow',
    icon: InvoiceIcon,
    features: ['Payment status monitoring', 'Automated reminders', 'Overdue alerts'],
    services: ['FreshBooks', 'Gmail', 'Slack']
  },
  {
    id: 'research',
    name: 'Research Agent',
    type: 'research_agent',
    description: 'Monitors industry news, competitors, and trends relevant to you',
    icon: ResearchIcon,
    features: ['Daily news digests', 'Competitor monitoring', 'Trend analysis'],
    services: ['Web Search', 'Slack']
  },
  {
    id: 'calendar',
    name: 'Calendar Assistant',
    type: 'calendar_assistant',
    description: 'Manages meetings, schedules, and coordinates with your team',
    icon: CalendarIcon,
    features: ['Smart scheduling', 'Meeting coordination', 'Reminder management'],
    services: ['Google Calendar', 'Gmail', 'Slack']
  },
  {
    id: 'social',
    name: 'Social Media Manager',
    type: 'social_media_manager',
    description: 'Schedules posts, monitors engagement, and manages your social presence',
    icon: SocialIcon,
    features: ['Post scheduling', 'Engagement tracking', 'Content suggestions'],
    services: ['Twitter', 'LinkedIn']
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    type: 'custom',
    description: 'Build your own agent with custom capabilities and integrations',
    icon: CustomAgentIcon,
    features: ['Custom workflows', 'Flexible integrations', 'Tailored automation'],
    services: ['Choose your own']
  }
];

export default function AgentsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [connectedServices, setConnectedServices] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [agentName, setAgentName] = useState('');
  const [agentSchedule, setAgentSchedule] = useState('realtime');
  const [isCreating, setIsCreating] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading]);

  // Fetch connected services
  useEffect(() => {
    if (!user) return;

    const fetchConnections = async () => {
      try {
        const res = await fetch('/api/connections');
        if (res.ok) {
          const data = await res.json();
          const services = data.connections?.map((conn: any) => conn.service) || [];
          setConnectedServices(services);
        }
      } catch (error) {
        console.error('Failed to fetch connections:', error);
      }
    };

    fetchConnections();
  }, [user]);

  // Fetch agents
  useEffect(() => {
    if (!user) return;

    const fetchAgents = async () => {
      setLoadingAgents(true);
      try {
        const res = await fetch('/api/agents');
        if (res.ok) {
          const data = await res.json();
          console.log('[Agents] Fetched:', data);
          setAgents(data.agents || []);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, [user]);

  // Auto-populate services when template is selected
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id !== 'custom') {
      // For template agents, use template services (lowercase for API consistency)
      const templateServices = selectedTemplate.services.map(s => s.toLowerCase());
      setSelectedServices(templateServices);
      console.log('[Template Selected] Auto-populated services:', templateServices);
    } else if (selectedTemplate?.id === 'custom') {
      // For custom agents, start with empty selection
      setSelectedServices([]);
    }
  }, [selectedTemplate]);

  const handleCreateAgent = async () => {
    console.log('[Agent Creation]', {
      agentName,
      selectedServices,
      template: selectedTemplate?.type,
      canCreate: agentName.trim() && selectedServices.length > 0
    });

    if (!agentName.trim() || selectedServices.length === 0) {
      console.log('[Agent Creation] Validation failed:', {
        hasName: !!agentName.trim(),
        hasServices: selectedServices.length > 0
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          type: selectedTemplate?.type || 'custom',
          description: selectedTemplate?.description || 'Custom agent',
          config: {
            schedule: agentSchedule,
            services: selectedServices,
            template: selectedTemplate?.id
          }
        })
      });

      if (response.ok) {
        const newAgent = await response.json();
        console.log('[Agent Created]', newAgent);
        
        // Add new agent to the list
        setAgents(prev => [...prev, newAgent.agent || newAgent]);
        
        alert('🎉 Agent created successfully!');
        setShowCreateModal(false);
        setSelectedTemplate(null);
        setAgentName('');
        setSelectedServices([]);
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
              <p className="text-sm text-gray-600 mt-1">Manage all your AI agents</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Agent</span>
            </button>
          </div>
        </div>

        <div className="p-8">
          {loadingAgents ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : agents.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No agents yet</h2>
                <p className="text-gray-600 mb-6">
                  Create your first AI agent to get started with automation
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
                >
                  Create Your First Agent
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent: any) => (
                <div 
                  key={agent.id} 
                  onClick={() => router.push(`/agent/${agent.id}`)}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <p className="text-xs text-gray-500">{agent.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      agent.status === 'active' 
                        ? 'bg-success-100 text-success-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {agent.status || 'active'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {agent.description}
                  </p>
                  
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.config?.services?.map((service: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Schedule: {agent.config?.schedule || 'realtime'}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/agent/${agent.id}`);
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedTemplate ? 'Configure Agent' : 'Choose an Agent Template'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTemplate 
                      ? 'Customize settings for your ' + selectedTemplate.name
                      : 'Select a pre-configured agent or build your own from scratch'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {!selectedTemplate ? (
                  // Template Selection
                  <div className="grid grid-cols-3 gap-6">
                    {templates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer"
                        >
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                            <Icon className="h-6 w-6 text-primary-600" />
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            {template.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-700">
                                <svg className="h-4 w-4 text-success-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
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
                ) : (
                  // Configuration Form
                  <div className="max-w-2xl mx-auto">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agent Name
                        </label>
                        <input
                          type="text"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                          placeholder={selectedTemplate.name}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-600 mt-1">Give your agent a unique name</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Run Schedule
                        </label>
                        <select
                          value={agentSchedule}
                          onChange={(e) => setAgentSchedule(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="realtime">Real-time (Continuous)</option>
                          <option value="15min">Every 15 minutes</option>
                          <option value="hourly">Every hour</option>
                          <option value="daily">Daily at 9 AM</option>
                          <option value="weekly">Weekly on Mondays</option>
                        </select>
                        <p className="text-sm text-gray-600 mt-1">How often should the agent run?</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Services for Agent
                        </label>
                        {connectedServices.length === 0 ? (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800 mb-2">
                              No services connected yet. Connect services first to use them with agents.
                            </p>
                            <button
                              onClick={() => {
                                setShowCreateModal(false);
                                router.push('/integrations');
                              }}
                              className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                              Go to Integrations →
                            </button>
                          </div>
                        ) : selectedTemplate?.type === 'custom' ? (
                          // Custom Agent: Multi-select dropdown
                          <div className="space-y-3">
                            <select
                              multiple
                              value={selectedServices}
                              onChange={(e) => {
                                const values = Array.from(e.target.selectedOptions, option => option.value);
                                setSelectedServices(values);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px]"
                            >
                              {connectedServices.map((service) => (
                                <option key={service} value={service}>
                                  {service.charAt(0).toUpperCase() + service.slice(1)}
                                </option>
                              ))}
                            </select>
                            <p className="text-sm text-gray-600">
                              Hold Ctrl/Cmd to select multiple services. Selected: {selectedServices.length}
                            </p>
                            {selectedServices.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {selectedServices.map(service => (
                                  <span key={service} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                                    {service.charAt(0).toUpperCase() + service.slice(1)}
                                    <button
                                      onClick={() => setSelectedServices(prev => prev.filter(s => s !== service))}
                                      className="ml-2 text-primary-600 hover:text-primary-800"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Template Agent: Show required services
                          <div className="space-y-3">
                            {selectedTemplate?.services.map((service, idx) => {
                              const serviceLower = service.toLowerCase();
                              const isConnected = connectedServices.includes(serviceLower);
                              
                              return (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-900">{service}</span>
                                    {isConnected && (
                                      <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full">✓ Connected</span>
                                    )}
                                  </div>
                                  {!isConnected && (
                                    <button 
                                      onClick={() => {
                                        setShowCreateModal(false);
                                        router.push('/integrations');
                                      }}
                                      className="text-sm font-medium text-primary-600 hover:text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-50"
                                    >
                                      Connect
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            <p className="text-sm text-gray-600">
                              {selectedTemplate?.services.every(s => connectedServices.includes(s.toLowerCase()))
                                ? '✓ All required services are connected'
                                : '⚠ Connect missing services to proceed'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-primary-600 mt-0.5">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-primary-900 mb-1">Secure by Default</h4>
                            <p className="text-sm text-primary-800">
                              All credentials are stored in Auth0 Token Vault. Your agent gets only the permissions it needs.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setSelectedTemplate(null);
                            setAgentName('');
                            setSelectedServices([]);
                          }}
                          className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleCreateAgent}
                          disabled={(() => {
                            const hasName = agentName.trim().length > 0;
                            const hasServices = selectedServices.length > 0;
                            const isDisabled = isCreating || !hasName || !hasServices;
                            console.log('[Button State]', { hasName, hasServices, isCreating, isDisabled, agentName, selectedServices });
                            return isDisabled;
                          })()}
                          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {isCreating ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Creating...</span>
                            </>
                          ) : (
                            <span>Create Agent</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
