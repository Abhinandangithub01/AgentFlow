'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Activity, TrendingUp, Clock, CheckCircle2
} from 'lucide-react';
import { 
  EmailIcon, InvoiceIcon, ResearchIcon, 
  ActiveIcon, CheckIcon, AlertIcon, EditIcon 
} from '@/components/icons/CustomIcons';

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();

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
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-success-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-sm text-gray-600">Actions Today</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-warning-50 rounded-lg">
                  <Clock className="h-5 w-5 text-warning-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">0h</div>
              <div className="text-sm text-gray-600">Time Saved</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">--</div>
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
                  <p className="text-sm text-gray-600 mt-0.5">No activity yet</p>
                </div>
              </div>
              
              <div className="p-12 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-600 mb-6">Create an agent to start seeing activity</p>
                <button
                  onClick={() => router.push('/agents')}
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
                >
                  Create Your First Agent
                </button>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              {/* Today's Stats */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Stats</h2>
                </div>
                <div className="p-6 text-center py-12">
                  <p className="text-gray-600">No stats available yet</p>
                  <p className="text-sm text-gray-500 mt-2">Create an agent to start tracking</p>
                </div>
              </div>

              {/* Connected Services */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Connected Services</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No services connected</p>
                    <button 
                      onClick={() => router.push('/integrations')}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Connect Services →
                    </button>
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
