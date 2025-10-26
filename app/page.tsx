'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, Sparkles, Shield, Zap, ArrowRight, CheckCircle, Mail, DollarSign, Search } from 'lucide-react';

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
          <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Auth0 for AI Agents</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Deploy Autonomous AI Agents
            <br />
            <span className="text-primary-600">With Beautiful Transparency</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Create AI agents that work for you 24/7. Manage emails, track invoices, 
            monitor systems - all with secure access and crystal-clear visibility.
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

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why AgentFlow?
            </h2>
            <p className="text-xl text-gray-600">
              The first AI agent platform built for transparency and control
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Truly Autonomous
              </h3>
              <p className="text-gray-600">
                Not just chatbots. Agents run continuously, make decisions, 
                and take actions on your behalf - all with your approval.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="bg-success-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Secure by Default
              </h3>
              <p className="text-gray-600">
                Auth0 Token Vault manages all credentials. Your agents get 
                exactly the permissions they need, nothing more.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="bg-warning-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-warning-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Beautiful UI
              </h3>
              <p className="text-gray-600">
                See exactly what your agents are doing in real-time. 
                Clear activity feeds, actionable insights, zero confusion.
              </p>
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
