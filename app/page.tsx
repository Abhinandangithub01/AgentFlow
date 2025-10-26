'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, Sparkles, Shield, Zap, ArrowRight, CheckCircle, Mail, DollarSign, Search,
  Brain, Database, MessageSquare, Calendar, BarChart3, FileText, Lock, Gauge,
  Workflow, GitBranch, Bell, Eye, Code, Layers, Cloud, Users
} from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">AgentFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/api/auth/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </a>
              <a
                href="/api/auth/login"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary-200">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Powered by Groq Llama 3.3 70B • Production Ready</span>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Build Powerful AI Agents
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">That Actually Work</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Complete AI agent platform with RAG knowledge bases, custom dashboards, 
            app integrations, memory systems, and real-time monitoring. 
            <span className="font-semibold text-gray-900">Everything you need, production-ready.</span>
          </p>

          <div className="flex items-center justify-center space-x-4">
            <a
              href="/api/auth/login"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 flex items-center space-x-2 text-lg"
            >
              <span>Start Building Agents</span>
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#features"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 text-lg"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Demo Screenshot */}
        <div className="mt-20 rounded-xl border-2 border-gray-200 overflow-hidden shadow-2xl">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="text-sm text-gray-600 ml-4">localhost:3000/dashboard</div>
          </div>
          <div className="bg-gray-50 p-8">
            {/* Dashboard Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h2>
              <p className="text-gray-600">Monitor and manage your AI agents</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Active Agents</div>
                <div className="text-3xl font-bold text-gray-900">2</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Actions Today</div>
                <div className="text-3xl font-bold text-gray-900">37</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Time Saved</div>
                <div className="text-3xl font-bold text-gray-900">4.2h</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                <div className="text-3xl font-bold text-gray-900">98%</div>
              </div>
            </div>

            {/* Agent Cards */}
            <div className="space-y-3">
              {/* Email Agent Card */}
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 w-10 h-10 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Email Assistant</h3>
                      <p className="text-sm text-gray-600">Manages inbox and drafts replies</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-success-50 text-success-600">
                    🟢 Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last run: 2 minutes ago</span>
                  <span className="font-medium text-gray-900">34 actions today</span>
                </div>
              </div>

              {/* Invoice Agent Card */}
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-success-100 w-10 h-10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Invoice Tracker</h3>
                      <p className="text-sm text-gray-600">Tracks payments and sends reminders</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-success-50 text-success-600">
                    🟢 Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last run: 1 hour ago</span>
                  <span className="font-medium text-gray-900">3 actions today</span>
                </div>
              </div>

              {/* Research Agent Card */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 opacity-60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                      <Search className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Research Agent</h3>
                      <p className="text-sm text-gray-600">Monitors industry news and trends</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    ⏸️ Paused
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last run: 1 day ago</span>
                  <span className="font-medium text-gray-900">0 actions today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Build AI Agents
            </h2>
            <p className="text-xl text-gray-600">
              Production-ready features, no assembly required
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* RAG System */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                RAG Knowledge Bases
              </h3>
              <p className="text-gray-600 text-sm">
                Upload documents (PDF, DOCX, TXT), automatic chunking, keyword-based retrieval. Your agents know what you teach them.
              </p>
            </div>

            {/* Chat System */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Intelligent Chat
              </h3>
              <p className="text-gray-600 text-sm">
                Powered by Groq Llama 3.3 70B. Context-aware responses with memory, RAG integration, and markdown support.
              </p>
            </div>

            {/* Memory System */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                4-Type Memory System
              </h3>
              <p className="text-gray-600 text-sm">
                Short-term, long-term, episodic, and semantic memory. Your agents remember conversations and learn from interactions.
              </p>
            </div>

            {/* Custom Dashboards */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Custom Dashboards
              </h3>
              <p className="text-gray-600 text-sm">
                Drag-and-drop widgets: Email, Calendar, Tasks, Analytics, Chat. Build the perfect interface for each agent.
              </p>
            </div>

            {/* App Integrations */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                OAuth Integrations
              </h3>
              <p className="text-gray-600 text-sm">
                Connect Gmail, Slack, Google Calendar. Secure OAuth flows with Auth0 Token Vault. Add more integrations easily.
              </p>
            </div>

            {/* Rules Engine */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Rules & Guardrails
              </h3>
              <p className="text-gray-600 text-sm">
                Visual rules editor. Define triggers, conditions, actions, and safety guardrails. Full control over agent behavior.
              </p>
            </div>

            {/* Planning System */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Workflow className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Multi-Step Planning
              </h3>
              <p className="text-gray-600 text-sm">
                Agents break down complex tasks into steps, execute with dependencies, handle errors, and provide detailed execution logs.
              </p>
            </div>

            {/* Real-time Monitoring */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Real-time Monitoring
              </h3>
              <p className="text-gray-600 text-sm">
                Live activity feeds, execution history, error tracking, performance metrics. Know exactly what your agents are doing.
              </p>
            </div>

            {/* Notifications */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Toast Notifications
              </h3>
              <p className="text-gray-600 text-sm">
                Beautiful toast notifications for success, errors, warnings, and info. Keep users informed with elegant alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-gray-600">
              Production-grade stack for reliability and performance
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <Code className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Next.js 14</h4>
              <p className="text-sm text-gray-600">App Router, Server Components</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Groq AI</h4>
              <p className="text-sm text-gray-600">Llama 3.3 70B Versatile</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Auth0</h4>
              <p className="text-sm text-gray-600">Authentication & Token Vault</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <Cloud className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">AWS</h4>
              <p className="text-sm text-gray-600">DynamoDB, S3, Lambda</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              From idea to autonomous agent in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account with Auth0 secure authentication
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Connect Services</h3>
              <p className="text-gray-600">
                Link Gmail, Slack, or any service via secure OAuth
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Create Agent</h3>
              <p className="text-gray-600">
                Tell us what you want - we configure the agent for you
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Watch It Work</h3>
              <p className="text-gray-600">
                Agent runs autonomously while you stay in control
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Deploy Your First Agent?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join the future of autonomous AI with enterprise-grade security
          </p>
          <a
            href="/api/auth/login"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 inline-flex items-center space-x-2 text-lg"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">AgentFlow</span>
            </div>
            <p className="text-gray-600">
              Built for Auth0 AI Challenge 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
