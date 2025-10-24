'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Widget from '@/components/widgets/Widget';
import { 
  Activity, TrendingUp, Clock, CheckCircle2, 
  Play, Pause, MoreVertical 
} from 'lucide-react';
import { 
  EmailIcon, InvoiceIcon, ResearchIcon, 
  ActiveIcon, CheckIcon, AlertIcon, EditIcon 
} from '@/components/icons/CustomIcons';

export default function DashboardNew() {
  const { user, isLoading } = useUser();
  const router = useRouter();

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Monitor your AI agents in real-time</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-2 text-sm">
                <ActiveIcon className="h-3 w-3 text-success-600" />
                <span className="text-gray-700">Active</span>
              </span>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Pause All
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg">
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="p-8 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Activity className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-xs text-success-600 font-medium">+12%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">2</div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-success-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success-600" />
                </div>
                <span className="text-xs text-success-600 font-medium">+8%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">37</div>
              <div className="text-sm text-gray-600">Actions Today</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-warning-50 rounded-lg">
                  <Clock className="h-5 w-5 text-warning-600" />
                </div>
                <span className="text-xs text-success-600 font-medium">+2.1h</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">4.2h</div>
              <div className="text-sm text-gray-600">Time Saved</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-xs text-success-600 font-medium">+2%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">98%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Activity Feed - Spans 2 columns */}
            <div className="col-span-2 bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
                  <p className="text-sm text-gray-600 mt-0.5">Active for 2 hours • 34 actions completed</p>
                </div>
                <span className="text-xs text-primary-600 font-medium">Live Updates</span>
              </div>
              
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {/* Activity Item 1 */}
                <div className="flex items-start space-x-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <EmailIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">Read 12 new emails from Gmail</h3>
                        <p className="text-sm text-gray-700 mt-1">
                          8 categorized as client work, 3 as newsletters, 1 flagged as urgent
                        </p>
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap ml-4">2 min ago</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-danger-600 font-medium">1 urgent</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-primary-600 font-medium">8 client</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">3 newsletters</span>
                    </div>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <EditIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">Drafted reply to client@company.com</h3>
                        <p className="text-sm text-gray-700 mt-1 italic">
                          "Hi John, regarding the invoice for Project X..."
                        </p>
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap ml-4">5 min ago</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <span className="text-xs text-gray-600">Confidence: <span className="font-semibold text-primary-600">95%</span></span>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-gray-600">Tone: <span className="font-semibold">Professional</span></span>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <button className="px-3 py-1.5 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-700">
                        Approve & Send
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                        Discard
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex items-start space-x-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <AlertIcon className="h-5 w-5 text-danger-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">Needs Your Attention</h3>
                        <p className="text-sm text-gray-700 mt-1">
                          Found urgent email from VIP client about deadline change
                        </p>
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap ml-4">8 min ago</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <button className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                        View Email
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                        Mark Handled
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activity Item 4 */}
                <div className="flex items-start space-x-4 p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <CheckIcon className="h-5 w-5 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Posted summary to #work-updates</h3>
                        <p className="text-sm text-gray-700 mt-1">Daily email digest shared with team</p>
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap ml-4">15 min ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              {/* Today's Stats */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Stats</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Actions Completed</span>
                      <span className="text-2xl font-bold text-gray-900">34</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">68% of daily target (50 actions)</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Emails Processed</span>
                      <span className="text-lg font-semibold text-gray-900">47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Drafts Created</span>
                      <span className="text-lg font-semibold text-gray-900">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Urgent Flags</span>
                      <span className="text-lg font-semibold text-danger-600">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Time Saved</span>
                      <span className="text-lg font-semibold text-success-600">2.1h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Services */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Connected Services</h2>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                        <EmailIcon className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Gmail</p>
                        <p className="text-xs text-gray-600">Read, Send</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-success-600">Connected</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Slack</p>
                        <p className="text-xs text-gray-600">Post Messages</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-success-600">Connected</span>
                  </div>

                  <button className="w-full py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg border-2 border-dashed border-primary-300">
                    + Add Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
