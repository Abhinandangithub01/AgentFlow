'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Brain, 
  Database, 
  Settings, 
  Zap, 
  Play,
  Save,
  Sparkles,
  Plus,
  ChevronRight,
  Code,
  MessageSquare,
  Calendar,
  Mail,
  FileText,
  Shield,
  Activity
} from 'lucide-react';

type BuilderTab = 'overview' | 'knowledge' | 'memory' | 'rules' | 'tools' | 'settings';

export default function AgentBuilderPage() {
  const [activeTab, setActiveTab] = useState<BuilderTab>('overview');
  const [agentName, setAgentName] = useState('My AI Agent');
  const [isDeployed, setIsDeployed] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Bot },
    { id: 'knowledge', label: 'Knowledge', icon: Database },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'rules', label: 'Rules', icon: Shield },
    { id: 'tools', label: 'Tools', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bot className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 -ml-2"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">AI Agent Builder</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsDeployed(!isDeployed)}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                  isDeployed
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/50'
                }`}
              >
                {isDeployed ? (
                  <>
                    <Activity className="w-4 h-4" />
                    Active
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Deploy Agent
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sticky top-24"
            >
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as BuilderTab)}
                      whileHover={{ x: 4 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Knowledge Bases</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Active Rules</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Connected Tools</span>
                    <span className="font-semibold">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Executions Today</span>
                    <span className="font-semibold text-green-600">47</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'knowledge' && <KnowledgeTab />}
                {activeTab === 'memory' && <MemoryTab />}
                {activeTab === 'rules' && <RulesTab />}
                {activeTab === 'tools' && <ToolsTab />}
                {activeTab === 'settings' && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Build Your AI Agent</h2>
          </div>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl">
            Create powerful autonomous agents with knowledge bases, memory, custom rules, and seamless tool integrations.
          </p>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-xl transition-shadow"
            >
              Quick Start Guide
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              View Examples
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-2 gap-4">
        <CapabilityCard
          icon={Database}
          title="Knowledge Bases"
          description="Add documents, databases, and APIs for your agent to reference"
          color="blue"
        />
        <CapabilityCard
          icon={Brain}
          title="Intelligent Memory"
          description="Short-term and long-term memory for context retention"
          color="purple"
        />
        <CapabilityCard
          icon={Shield}
          title="Custom Rules"
          description="Define triggers, conditions, and guardrails for safe operation"
          color="green"
        />
        <CapabilityCard
          icon={Zap}
          title="Tool Integration"
          description="Connect Gmail, Slack, Calendar, and custom APIs"
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Processed 12 emails', time: '2 minutes ago', status: 'success' },
            { action: 'Updated knowledge base', time: '15 minutes ago', status: 'success' },
            { action: 'Executed scheduled task', time: '1 hour ago', status: 'success' },
            { action: 'Rule triggered: Priority email', time: '2 hours ago', status: 'info' },
          ].map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <span className="font-medium">{activity.action}</span>
              </div>
              <span className="text-sm text-slate-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Capability Card Component
function CapabilityCard({ icon: Icon, title, description, color }: {
  icon: any;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
    </motion.div>
  );
}

// Placeholder tabs (we'll build these next)
function KnowledgeTab() {
  return <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
    <h2 className="text-2xl font-bold mb-4">Knowledge Bases</h2>
    <p className="text-slate-600 dark:text-slate-400">Knowledge base manager coming up next...</p>
  </div>;
}

function MemoryTab() {
  return <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
    <h2 className="text-2xl font-bold mb-4">Agent Memory</h2>
    <p className="text-slate-600 dark:text-slate-400">Memory dashboard coming up next...</p>
  </div>;
}

function RulesTab() {
  return <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
    <h2 className="text-2xl font-bold mb-4">Rules & Guardrails</h2>
    <p className="text-slate-600 dark:text-slate-400">Rules editor coming up next...</p>
  </div>;
}

function ToolsTab() {
  return <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
    <h2 className="text-2xl font-bold mb-4">Connected Tools</h2>
    <p className="text-slate-600 dark:text-slate-400">Tools manager coming up next...</p>
  </div>;
}

function SettingsTab() {
  return <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
    <h2 className="text-2xl font-bold mb-4">Agent Settings</h2>
    <p className="text-slate-600 dark:text-slate-400">Settings panel coming up next...</p>
  </div>;
}
