import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useState } from 'react';

interface MaliciousActivity {
  id: string;
  delivery_partner_id: string;
  user_id: string;
  order_id: string;
  activity_type: 'failed_delivery' | 'rejected_confirmation' | 'multiple_failures' | 'suspicious_behavior';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  resolution_notes?: string;
  delivery_partner?: {
    users: {
      full_name: string;
      email: string;
    };
  };
  user?: {
    full_name: string;
    email: string;
  };
  order?: {
    total_amount: number;
  };
}

export default function AdminMaliciousActivity() {
  const [selectedActivity, setSelectedActivity] = useState<MaliciousActivity | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const { data: activities, refetch } = useQuery({
    queryKey: ['malicious-activities', filterStatus, filterSeverity],
    queryFn: async () => {
      let query = supabase
        .from('malicious_activities')
        .select(`
          *,
          delivery_partner:delivery_partners(
            id,
            users(full_name, email)
          ),
          user:users(full_name, email),
          order:orders(total_amount)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (filterSeverity !== 'all') {
        query = query.eq('severity', filterSeverity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaliciousActivity[];
    },
  });

  const updateActivityStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('malicious_activities')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      setSelectedActivity(null);
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'failed_delivery': return 'Failed Delivery';
      case 'rejected_confirmation': return 'Rejected Confirmation';
      case 'multiple_failures': return 'Multiple Failures';
      case 'suspicious_behavior': return 'Suspicious Behavior';
      default: return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Malicious Activity Monitor</h1>
        <p className="text-gray-600">Track and review suspicious delivery activities</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(activity.severity)}`}>
                      {activity.severity.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(activity.status)}`}>
                      {activity.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {getActivityTypeLabel(activity.activity_type)}
                  </h3>
                  <p className="text-gray-700 mb-4">{activity.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-900">Delivery Partner:</span>
                      <p className="text-gray-600">{activity.delivery_partner?.users?.full_name || 'N/A'}</p>
                      <p className="text-gray-500">{activity.delivery_partner?.users?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Customer:</span>
                      <p className="text-gray-600">{activity.user?.full_name || 'N/A'}</p>
                      <p className="text-gray-500">{activity.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Order:</span>
                      <p className="text-gray-600">#{activity.order_id.slice(0, 8)}</p>
                      <p className="text-gray-500">₹{activity.order?.total_amount || 'N/A'}</p>
                    </div>
                  </div>

                  {activity.resolution_notes && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-900">Resolution Notes:</span>
                      <p className="text-gray-700 mt-1">{activity.resolution_notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 lg:w-48">
                  {activity.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setSelectedActivity(activity)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => updateActivityStatus.mutate({ id: activity.id, status: 'dismissed' })}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                  {activity.status === 'reviewed' && (
                    <button
                      onClick={() => updateActivityStatus.mutate({ id: activity.id, status: 'resolved' })}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-12">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Suspicious Activities</h3>
          <p className="text-gray-600">All deliveries are running smoothly!</p>
        </div>
      )}

      {/* Review Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Review Activity</h2>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="font-semibold text-gray-900">Type:</span>
                  <p className="text-gray-700">{getActivityTypeLabel(selectedActivity.activity_type)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Description:</span>
                  <p className="text-gray-700">{selectedActivity.description}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Severity:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${getSeverityColor(selectedActivity.severity)}`}>
                    {selectedActivity.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => updateActivityStatus.mutate({ 
                    id: selectedActivity.id, 
                    status: 'reviewed',
                    notes: 'Reviewed by admin - requires further investigation'
                  })}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Mark as Reviewed
                </button>
                <button
                  onClick={() => updateActivityStatus.mutate({ 
                    id: selectedActivity.id, 
                    status: 'resolved',
                    notes: 'Issue resolved - no further action needed'
                  })}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Resolve
                </button>
                <button
                  onClick={() => updateActivityStatus.mutate({ 
                    id: selectedActivity.id, 
                    status: 'dismissed',
                    notes: 'False positive - dismissed'
                  })}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
