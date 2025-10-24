'use client';

import { useState } from 'react';
import { Play, Pause, Settings, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'paused' | 'error';
    lastRun: string;
    actionsToday: number;
    description: string;
  };
  icon: any;
}

export default function AgentCard({ agent, icon: Icon }: AgentCardProps) {
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);
  const [status, setStatus] = useState(agent.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-600 bg-success-50';
      case 'paused': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-danger-600 bg-danger-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleExecute = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExecuting(true);
    
    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: agent.id, 
          action: `${agent.type}-scan` 
        })
      });
      
      if (response.ok) {
        // Show success feedback
        alert(`✓ ${agent.name} executed successfully!`);
      }
    } catch (error) {
      console.error('Execution error:', error);
      alert('Failed to execute agent');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = status === 'active' ? 'paused' : 'active';
    setStatus(newStatus);
    
    // In production, call API to update status
    try {
      await fetch(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Status update error:', error);
      setStatus(status); // Revert on error
    }
  };

  return (
    <div
      className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/agent/${agent.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-600">{agent.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(status)}`}>
            {status === 'active' && '🟢 Active'}
            {status === 'paused' && '⏸️ Paused'}
            {status === 'error' && '🔴 Error'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last Run</span>
          <span className="text-sm font-medium text-gray-900">{agent.lastRun}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Actions Today</span>
          <span className="text-sm font-medium text-gray-900">{agent.actionsToday}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-2">
        <button
          onClick={handleExecute}
          disabled={isExecuting || status === 'paused'}
          className="flex-1 flex items-center justify-center space-x-1 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Run Now</span>
            </>
          )}
        </button>
        <button
          onClick={handleToggleStatus}
          className="flex-1 flex items-center justify-center space-x-1 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          {status === 'active' ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Resume</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
