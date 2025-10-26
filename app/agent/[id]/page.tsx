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
        const res = await fetch(`/api/agents/${agentId}`);
        if (res.ok) {
          const data = await res.json();
          console.log('[Agent Detail] Fetched:', data);
          setAgent(data.agent);
        } else {
          console.error('[Agent Detail] Failed to fetch agent');
          router.push('/agents');
        }
      } catch (error) {
        console.error('[Agent Detail] Error:', error);
        router.push('/agents');
      } finally {
        setLoadingAgent(false);
      }
    };

    fetchAgent();
  }, [user, agentId]);

  // Fetch activities from API
  useEffect(() => {
    if (!user || !agentId) return;

    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await fetch(`/api/agents/${agentId}/activity`);
        if (res.ok) {
          const data = await res.json();
          console.log('[Agent Detail] Fetched activities:', data);
          setActivities(data.activities || []);
        } else {
          console.error('[Agent Detail] Failed to fetch activities');
        }
      } catch (error) {
        console.error('[Agent Detail] Error fetching activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
    
    // Refresh activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [user, agentId]);

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

                        {activity.details && activity.type === 'info' && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-gray-600">Confidence</span>
                              <span className="font-medium text-primary-600">
                                {activity.details.confidence}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Tone</span>
                              <span className="font-medium text-gray-900">
                                {activity.details.tone}
                              </span>
                            </div>
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

            {/* Connected Services */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Connected Services</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                      <Mail className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gmail</p>
                      <p className="text-xs text-gray-600">Read, Send</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-success-600">✓ Connected</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Slack</p>
                      <p className="text-xs text-gray-600">Post Messages</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-success-600">✓ Connected</span>
                </div>

                <button className="w-full py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg border-2 border-dashed border-primary-300">
                  + Add Service
                </button>
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
