'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  Zap,
  Loader2,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  tasksCompleted: number;
  tasksCompletedChange: number;
  successRate: number;
  successRateChange: number;
  avgResponseTime: number;
  avgResponseTimeChange: number;
  actionsToday: number;
  actionsChange: number;
  chartData: Array<{
    time: string;
    actions: number;
  }>;
}

export default function AnalyticsWidget({ agentId }: { agentId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadAnalytics();
  }, [agentId, timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        tasksCompleted: 47,
        tasksCompletedChange: 12,
        successRate: 98,
        successRateChange: 2,
        avgResponseTime: 1.2,
        avgResponseTimeChange: -0.3,
        actionsToday: 34,
        actionsChange: 8,
        chartData: [
          { time: '00:00', actions: 5 },
          { time: '04:00', actions: 3 },
          { time: '08:00', actions: 12 },
          { time: '12:00', actions: 18 },
          { time: '16:00', actions: 15 },
          { time: '20:00', actions: 8 },
        ],
      };

      setTimeout(() => {
        setData(mockData);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">Analytics</span>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
        >
          <option value="24h">24 Hours</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard
          icon={CheckCircle}
          label="Tasks"
          value={data.tasksCompleted}
          change={data.tasksCompletedChange}
          color="blue"
        />
        <MetricCard
          icon={TrendingUp}
          label="Success"
          value={`${data.successRate}%`}
          change={data.successRateChange}
          color="green"
        />
        <MetricCard
          icon={Clock}
          label="Avg Time"
          value={`${data.avgResponseTime}s`}
          change={data.avgResponseTimeChange}
          color="purple"
        />
        <MetricCard
          icon={Zap}
          label="Actions"
          value={data.actionsToday}
          change={data.actionsChange}
          color="orange"
        />
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <div className="h-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="actions"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorActions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  change: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(change)}</span>
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
    </motion.div>
  );
}
