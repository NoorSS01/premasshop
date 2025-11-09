import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

export default function OrderHistory() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      console.log('Fetching orders for user:', user?.id);
      
      // Set a timeout for the query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Orders query timeout')), 5000); // 5 second timeout
      });
      
      const queryPromise = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      const result = await Promise.race([queryPromise, timeoutPromise]) as any;
      const { data, error } = result;
      
      if (error) {
        console.error('Orders fetch error:', error);
        throw error;
      }
      console.log('Orders fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!user,
    retry: false, // Don't retry to avoid long waits
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const filteredOrders = orders?.filter((order: any) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'out_for_delivery':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Failed to load orders</p>
          <p className="text-gray-500 text-sm mt-2">Please check your database setup</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage all your orders</p>
      </div>

      {/* Status Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'pending', 'assigned', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              statusFilter === status
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            {status === 'all'
              ? 'All Orders'
              : status
                  .split('_')
                  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                  .join(' ')}
          </button>
        ))}
      </div>

      {filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => (
            <Link
              key={order.id}
              to={`/order/${order.id}`}
              className="block bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-bold text-lg text-gray-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Placed:</span>{' '}
                      {format(new Date(order.created_at), 'MMM dd, yyyy • hh:mm a')}
                    </p>
                    <p>
                      <span className="font-medium">Delivery to:</span>{' '}
                      {order.address?.apartment} - Block {order.address?.block_no}, Flat{' '}
                      {order.address?.flat_no}
                    </p>
                    <p>
                      <span className="font-medium">Items:</span>{' '}
                      {Array.isArray(order.items) ? order.items.length : 0} item
                      {Array.isArray(order.items) && order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="lg:text-right">
                  <p className="text-3xl font-bold text-primary-600 mb-2">₹{order.total_amount}</p>
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-gray-600">
                      {order.payment_method} • {order.payment_status}
                    </span>
                    <span className="text-primary-600 font-medium">View Details →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
          </h2>
          <p className="text-gray-600 mb-8">
            {statusFilter === 'all'
              ? 'Start shopping to see your orders here!'
              : `You don't have any ${statusFilter} orders.`}
          </p>
          <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
