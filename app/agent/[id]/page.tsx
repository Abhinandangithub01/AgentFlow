'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bot, ArrowLeft, Mail, CheckCircle, Edit, Trash2, 
  Play, Pause, Settings, Activity, Clock, TrendingUp,
  ExternalLink, ThumbsUp, ThumbsDown, MoreHorizontal
} from 'lucide-react';

interface AgentActivity {
  id: string;
  type: 'success' | 'warning' | 'info' | 'action_required';
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  details?: any;
  aiInsights?: {
    category: string;
    priority: string;
    recommendation: string;
    suggestedActions: string[];
    estimatedResponseTime: string;
  };
}

export default function AgentDetailPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const agentId = params.id;

  const [agent, setAgent] = useState<any>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [isPausing, setIsPausing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  const [activities, setActivities] = useState<AgentActivity[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading]);

  // Fetch agent data
  useEffect(() => {
    if (!user || !agentId) return;

    const fetchAgent = async () => {
      setLoadingAgent(true);
      try {
        console.log('[Agent Detail] Fetching agent:', agentId, 'Attempt:', fetchAttempts + 1);
        const res = await fetch(`/api/agents/${agentId}`);
        console.log('[Agent Detail] Response status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('[Agent Detail] Fetched agent:', data);
          setAgent(data.agent);
          setFetchAttempts(0); // Reset on success
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('[Agent Detail] Failed to fetch agent:', res.status, errorData);
          
          // Retry once after 1 second if first attempt fails
          if (fetchAttempts === 0) {
            console.log('[Agent Detail] Retrying in 1 second...');
            setFetchAttempts(1);
            setTimeout(() => {
              fetchAgent();
            }, 1000);
            return;
          }
          
          alert(`Agent not found (${res.status}). This may be a persistence issue. Redirecting to agents list...`);
          router.push('/agents');
        }
      } catch (error) {
        console.error('[Agent Detail] Error fetching agent:', error);
        
        // Retry once if first attempt fails
        if (fetchAttempts === 0) {
          console.log('[Agent Detail] Retrying after error in 1 second...');
          setFetchAttempts(1);
          setTimeout(() => {
            fetchAgent();
          }, 1000);
          return;
        }
        
        alert('Error loading agent. Redirecting to agents list...');
        router.push('/agents');
      } finally {
        setLoadingAgent(false);
      }
    };

    fetchAgent();
  }, [user, agentId, fetchAttempts]);

  // Fetch activities from API
  useEffect(() => {
    if (!user || !agentId || !agent) return; // Wait for agent to load first

    let isMounted = true; // Prevent state updates after unmount

    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await fetch(`/api/agents/${agentId}/activity`);
        if (res.ok && isMounted) {
          const data = await res.json();
          console.log('[Agent Detail] Fetched activities:', data);
          setActivities(data.activities || []);
        } else if (!isMounted) {
          console.log('[Agent Detail] Component unmounted, skipping activity update');
        } else {
          console.error('[Agent Detail] Failed to fetch activities');
        }
      } catch (error) {
        if (isMounted) {
          console.error('[Agent Detail] Error fetching activities:', error);
        }
      } finally {
        if (isMounted) {
          setLoadingActivities(false);
        }
      }
    };

    fetchActivities();
    
    // Refresh activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    
    return () => {
      isMounted = false; // Cleanup on unmount
      clearInterval(interval);
    };
  }, [user, agentId, agent]);

  const handlePause = async () => {
    setIsPausing(true);
    try {
      const newStatus = agent.status === 'active' ? 'paused' : 'active';
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setAgent(data.agent);
        alert(`Agent ${newStatus === 'active' ? 'resumed' : 'paused'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      alert('Failed to update agent status');
    } finally {
      setIsPausing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Agent deleted successfully!');
        router.push('/agents');
      } else {
        throw new Error('Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent');
      setIsDeleting(false);
    }
  };

  if (isLoading || loadingAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !agent) {
    return null;
  }

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success-50 border-success-200';
      case 'warning': return 'bg-warning-50 border-warning-200';
      case 'info': return 'bg-primary-50 border-primary-200';
      case 'action_required': return 'bg-danger-50 border-danger-200';
      default: return 'bg-gray-50 border-gray-200';
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
                onClick={() => router.push('/agents')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Bot className="h-8 w-8 text-primary-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900">{agent.name}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    agent.status === 'active' 
                      ? 'bg-success-50 text-success-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {agent.status === 'active' ? '🟢 Active' : '⏸️ Paused'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{agent.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePause}
                disabled={isPausing}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                {isPausing ? (
                  <span>Loading...</span>
                ) : agent.status === 'active' ? (
                  <><Pause className="h-4 w-4 inline mr-1" />Pause</>
                ) : (
                  <><Play className="h-4 w-4 inline mr-1" />Resume</>
                )}
              </button>
              <button 
                onClick={() => router.push(`/agent/${agentId}/settings`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="h-4 w-4 inline mr-1" />
                Settings
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-danger-600 hover:bg-danger-50 rounded-lg disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 inline mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">Activity Feed</h2>
                  <span className="text-sm text-gray-600">Live Updates</span>
                </div>
                <p className="text-sm text-gray-600">
                  {agent.status === 'active' ? 'Active' : 'Paused'} • {activities.length} actions completed
                </p>
              </div>

              <div className="p-6 space-y-6">
                {loadingActivities ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🤖</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                    <p className="text-gray-600">Your agent will start working once you connect services and activate it.</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`border-2 rounded-xl p-5 ${getActivityBgColor(activity.type)} animate-slide-up`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl flex-shrink-0">{activity.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {activity.title}
                            </h3>
                            <p className="text-sm text-gray-700">
                              {activity.description}
                            </p>
                          </div>
                          <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
                            {activity.timestamp}
                          </span>
                        </div>

                        {/* AI Insights */}
                        {activity.aiInsights && (
                          <div className="mt-3 space-y-2">
                            <div className="p-3 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
                              <div className="flex items-start space-x-2">
                                <Bot className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-primary-900 mb-1">AI Recommendation</p>
                                  <p className="text-xs text-gray-700">{activity.aiInsights.recommendation}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                                {activity.aiInsights.category}
                              </span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                {activity.aiInsights.priority}
                              </span>
                              <span className="text-gray-600">
                                ⏱️ {activity.aiInsights.estimatedResponseTime}
                              </span>
                            </div>
                            
                            {activity.aiInsights.suggestedActions && activity.aiInsights.suggestedActions.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {activity.aiInsights.suggestedActions.slice(0, 4).map((action: string, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      console.log('[AI Action]', action, 'for email:', activity.title);
                                      alert(`AI Action: ${action}\n\nThis will ${action.toLowerCase()} for:\n${activity.title}`);
                                    }}
                                    className="px-3 py-1 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors"
                                  >
                                    {action}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {activity.type === 'action_required' && (
                          <div className="mt-4 flex items-center space-x-2">
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                              View Email
                            </button>
                            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                              Mark Handled
                            </button>
                          </div>
                        )}

                        {activity.type === 'info' && (
                          <div className="mt-4 flex items-center space-x-2">
                            <button className="px-4 py-2 bg-success-600 text-white rounded-lg text-sm font-medium hover:bg-success-700">
                              ✓ Approve & Send
                            </button>
                            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                              ✏️ Edit
                            </button>
                            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                              ✕ Discard
                            </button>
                          </div>
                        )}

                        {activity.type === 'success' && activity.details && (
                          <div className="mt-3 flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">
                              <span className="font-medium text-danger-600">
                                {activity.details.urgent} urgent
                              </span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              <span className="font-medium text-primary-600">
                                {activity.details.client} client
                              </span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              <span className="font-medium text-gray-600">
                                {activity.details.newsletter} newsletters
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  ))
                )}

                {!loadingActivities && activities.length > 0 && (
                  <div className="text-center py-4">
                    <button className="text-primary-600 font-medium text-sm hover:text-primary-700">
                      Load More Activity
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Stats & Info */}
          <div className="space-y-6">
            {/* Agent Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Today's Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Actions Completed</span>
                  <span className="text-2xl font-bold text-gray-900">{activities.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min((activities.length / 50) * 100, 100)}%` }}></div>
                </div>
                <p className="text-xs text-gray-600">{Math.min(Math.round((activities.length / 50) * 100), 100)}% of daily target (50 actions)</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Emails Processed</span>
                  <span className="text-lg font-semibold text-gray-900">{activities.filter(a => a.icon === '📧').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Drafts Created</span>
                  <span className="text-lg font-semibold text-gray-900">{activities.filter(a => a.icon === '✏️').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Urgent Flags</span>
                  <span className="text-lg font-semibold text-danger-600">{activities.filter(a => a.type === 'action_required').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Saved</span>
                  <span className="text-lg font-semibold text-success-600">{(activities.length * 0.05).toFixed(1)}h</span>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border border-primary-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-5 w-5 text-primary-600" />
                <h3 className="font-bold text-gray-900">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-primary-100">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">🎯</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Auto-categorize emails</p>
                      <p className="text-xs text-gray-600 mt-1">Let AI organize your inbox by priority and topic</p>
                      <button 
                        onClick={() => alert('✅ Auto-categorization is already enabled!\n\nAll emails are automatically categorized by:\n• Career\n• Newsletter\n• Security\n• Product\n• Personal\n\nCheck the activity feed to see AI categories.')}
                        className="mt-2 text-xs font-medium text-success-600 hover:text-success-700"
                      >
                        ✓ Enabled
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-primary-100">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">✍️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Smart reply suggestions</p>
                      <p className="text-xs text-gray-600 mt-1">AI drafts contextual responses for your review</p>
                      <button 
                        onClick={() => alert('✅ Smart replies are enabled!\n\nAI analyzes each email and provides:\n• Context-aware recommendations\n• Suggested actions\n• Response time estimates\n\nClick any action button in the activity feed to use them.')}
                        className="mt-2 text-xs font-medium text-success-600 hover:text-success-700"
                      >
                        ✓ Enabled
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-primary-100">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">⚡</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Priority alerts</p>
                      <p className="text-xs text-gray-600 mt-1">Get notified only for urgent emails</p>
                      <button 
                        onClick={() => alert('✅ Priority alerts are enabled!\n\nAI detects priority levels:\n• Urgent - Within 2 hours\n• High - Within 24 hours\n• Normal - Within 3 days\n\nUrgent emails are highlighted in red in the activity feed.')}
                        className="mt-2 text-xs font-medium text-success-600 hover:text-success-700"
                      >
                        ✓ Enabled
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-primary-100">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">📊</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Email insights</p>
                      <p className="text-xs text-gray-600 mt-1">Analyze patterns and suggest improvements</p>
                      <button 
                        onClick={() => alert('✅ Email insights are enabled!\n\nAI provides:\n• Category analysis (career, newsletter, security, etc.)\n• Response time recommendations\n• Action suggestions\n• Time saved metrics\n\nView insights in the activity feed and stats sidebar.')}
                        className="mt-2 text-xs font-medium text-success-600 hover:text-success-700"
                      >
                        ✓ Enabled
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-sm font-semibold text-success-600">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">User Approval</span>
                    <span className="text-sm font-semibold text-primary-600">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
