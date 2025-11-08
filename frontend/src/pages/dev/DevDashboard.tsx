import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: any;
  timestamp: string;
  source: string;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  created_at: string;
}

export default function DevDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'features' | 'monitoring'>('overview');
  const [logLevel, setLogLevel] = useState<string>('all');

  // System Overview Data
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const [ordersResult, usersResult, productsResult, deliveryResult] = await Promise.all([
        supabase.from('orders').select('status, created_at').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('users').select('role, created_at').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('products').select('status'),
        supabase.from('delivery_partners').select('status, allowed'),
      ]);

      return {
        orders: {
          total: ordersResult.data?.length || 0,
          pending: ordersResult.data?.filter(o => o.status === 'pending').length || 0,
          completed: ordersResult.data?.filter(o => o.status === 'delivered').length || 0,
        },
        users: {
          total: usersResult.data?.length || 0,
          customers: usersResult.data?.filter(u => u.role === 'customer').length || 0,
          delivery: usersResult.data?.filter(u => u.role === 'delivery').length || 0,
        },
        products: {
          total: productsResult.data?.length || 0,
          active: productsResult.data?.filter(p => p.status === 'active').length || 0,
          inactive: productsResult.data?.filter(p => p.status !== 'active').length || 0,
        },
        delivery: {
          total: deliveryResult.data?.length || 0,
          approved: deliveryResult.data?.filter(d => d.allowed).length || 0,
          pending: deliveryResult.data?.filter(d => !d.allowed).length || 0,
        },
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // System Logs (Mock data - in real implementation, this would come from logging service)
  const { data: systemLogs } = useQuery({
    queryKey: ['system-logs', logLevel],
    queryFn: async () => {
      // Mock logs - in production, this would fetch from a logging service
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          level: 'info',
          message: 'User authentication successful',
          details: { userId: 'user123', method: 'email' },
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          source: 'auth-service',
        },
        {
          id: '2',
          level: 'warning',
          message: 'High memory usage detected',
          details: { usage: '85%', threshold: '80%' },
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          source: 'system-monitor',
        },
        {
          id: '3',
          level: 'error',
          message: 'Payment processing failed',
          details: { orderId: 'order456', error: 'Gateway timeout' },
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          source: 'payment-service',
        },
      ];

      return logLevel === 'all' ? mockLogs : mockLogs.filter(log => log.level === logLevel);
    },
  });

  // Feature Flags
  const { data: featureFlags, refetch: refetchFlags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      // Mock feature flags - in production, this would be stored in database
      const mockFlags: FeatureFlag[] = [
        {
          id: '1',
          name: 'new_checkout_flow',
          description: 'Enable new streamlined checkout process',
          enabled: false,
          environment: 'development',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'real_time_notifications',
          description: 'Enable real-time push notifications',
          enabled: true,
          environment: 'development',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'advanced_analytics',
          description: 'Enable advanced analytics dashboard',
          enabled: false,
          environment: 'development',
          created_at: new Date().toISOString(),
        },
      ];
      return mockFlags;
    },
  });

  const toggleFeatureFlag = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      // Mock toggle - in production, this would update the database
      console.log(`Toggling feature flag ${id} to ${enabled}`);
      return { success: true };
    },
    onSuccess: () => {
      refetchFlags();
    },
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
            DEV ONLY
          </span>
        </div>
        <p className="text-gray-600">System monitoring, logs, and development tools</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'System Overview', icon: '📊' },
            { id: 'logs', name: 'System Logs', icon: '📝' },
            { id: 'features', name: 'Feature Flags', icon: '🚩' },
            { id: 'monitoring', name: 'Monitoring', icon: '📈' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Orders (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats?.orders.total || 0}</p>
                </div>
              </div>
              <div className="mt-4 flex text-sm">
                <span className="text-green-600">✓ {systemStats?.orders.completed || 0} completed</span>
                <span className="ml-4 text-yellow-600">⏳ {systemStats?.orders.pending || 0} pending</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">New Users (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats?.users.total || 0}</p>
                </div>
              </div>
              <div className="mt-4 flex text-sm">
                <span className="text-blue-600">👤 {systemStats?.users.customers || 0} customers</span>
                <span className="ml-4 text-purple-600">🚚 {systemStats?.users.delivery || 0} delivery</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Products</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats?.products.total || 0}</p>
                </div>
              </div>
              <div className="mt-4 flex text-sm">
                <span className="text-green-600">✅ {systemStats?.products.active || 0} active</span>
                <span className="ml-4 text-gray-600">⏸️ {systemStats?.products.inactive || 0} inactive</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Delivery Partners</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats?.delivery.total || 0}</p>
                </div>
              </div>
              <div className="mt-4 flex text-sm">
                <span className="text-green-600">✅ {systemStats?.delivery.approved || 0} approved</span>
                <span className="ml-4 text-yellow-600">⏳ {systemStats?.delivery.pending || 0} pending</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">API Status</span>
                <span className="text-green-600 font-semibold">🟢 Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Database</span>
                <span className="text-green-600 font-semibold">🟢 Healthy</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                <span className="text-yellow-600 font-semibold">🟡 85%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
            <select
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="space-y-3">
            {systemLogs?.map((log) => (
              <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">{log.source}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-2">{log.message}</p>
                    {log.details && (
                      <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Feature Flags</h3>
            <span className="text-sm text-gray-500">Development Environment</span>
          </div>

          <div className="space-y-4">
            {featureFlags?.map((flag) => (
              <div key={flag.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{flag.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {flag.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{flag.description}</p>
                    <p className="text-sm text-gray-500">
                      Created: {format(new Date(flag.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFeatureFlag.mutate({ id: flag.id, enabled: !flag.enabled })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      flag.enabled
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {flag.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Monitoring</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Response Times</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API Average</span>
                  <span className="text-green-600 font-semibold">145ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database Queries</span>
                  <span className="text-green-600 font-semibold">23ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Page Load</span>
                  <span className="text-yellow-600 font-semibold">1.2s</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Error Rates</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">4xx Errors</span>
                  <span className="text-green-600 font-semibold">0.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">5xx Errors</span>
                  <span className="text-green-600 font-semibold">0.05%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Timeout Errors</span>
                  <span className="text-green-600 font-semibold">0.02%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Deployments</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">v1.2.3</span>
                  <span className="ml-2 text-sm text-gray-600">Enhanced mobile UX</span>
                </div>
                <span className="text-sm text-green-600">✅ Deployed 2h ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">v1.2.2</span>
                  <span className="ml-2 text-sm text-gray-600">Bug fixes and improvements</span>
                </div>
                <span className="text-sm text-gray-600">✅ Deployed 1d ago</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
