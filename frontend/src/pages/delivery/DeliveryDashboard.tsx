import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import axios from 'axios';
import { useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function DeliveryDashboard() {
  const { user, session } = useAuth();

  const { data: deliveryPartner } = useQuery({
    queryKey: ['delivery-partner', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: orders, refetch } = useQuery({
    queryKey: ['delivery-orders', deliveryPartner?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users(full_name, email, phone),
          order_items(
            id,
            quantity,
            price,
            products(name, description, images)
          )
        `)
        .eq('delivery_partner_id', deliveryPartner?.id)
        .in('status', ['assigned', 'out_for_delivery'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!deliveryPartner?.id,
  });

  // Fetch delivered orders
  const { data: completedOrders } = useQuery({
    queryKey: ['delivered-orders', deliveryPartner?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users(full_name, email),
          order_items(
            id,
            quantity,
            products(name)
          )
        `)
        .eq('delivery_partner_id', deliveryPartner?.id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!deliveryPartner?.id,
  });

  // Real-time subscription for order updates
  useEffect(() => {
    if (!deliveryPartner?.id) return;

    const subscription = supabase
      .channel('delivery-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `delivery_partner_id=eq.${deliveryPartner.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [deliveryPartner?.id, refetch]);

  const markDelivered = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await axios.post(
        `${SUPABASE_URL}/functions/v1/mark-delivered`,
        { order_id: orderId },
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  if (!deliveryPartner || !deliveryPartner.allowed) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600">
            Your delivery partner account is pending admin approval. You will receive an email once
            your account is approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Dashboard</h1>
        <p className="text-gray-600">Manage your assigned deliveries</p>
      </div>

      {/* Active Orders */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Orders</h2>
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-bold text-lg text-gray-900">Order #{order.id.slice(0, 8)}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'out_for_delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status === 'assigned' ? 'READY FOR PICKUP' : 'OUT FOR DELIVERY'}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Customer Details</h4>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Name:</strong> {order.users?.full_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Phone:</strong> {order.address?.phone || order.users?.phone || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Email:</strong> {order.users?.email || 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Building:</strong> {order.address?.apartment || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Block:</strong> {order.address?.block_no || 'N/A'} | <strong>Flat:</strong> {order.address?.flat_no || 'N/A'}
                        </p>
                        {order.address?.note && (
                          <p className="text-sm text-gray-700">
                            <strong>Note:</strong> {order.address.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-primary-50 rounded-xl p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              {item.products?.name} × {item.quantity}
                            </span>
                            <span className="font-semibold text-gray-900">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-primary-200 mt-3 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total Amount</span>
                          <span className="font-bold text-primary-600 text-lg">₹{order.total_amount}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Order placed: {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col justify-center items-center lg:items-end gap-4">
                    {order.status === 'assigned' && (
                      <button
                        onClick={() => markDelivered.mutate(order.id)}
                        disabled={markDelivered.isPending}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {markDelivered.isPending ? 'Processing...' : 'Mark as Delivered'}
                      </button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <div className="text-center">
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl text-sm font-semibold mb-2">
                          ⏳ Waiting for customer confirmation
                        </div>
                        <p className="text-xs text-gray-500">Customer will confirm delivery receipt</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Orders</h3>
            <p className="text-gray-600">You don't have any orders assigned to you at the moment.</p>
          </div>
        )}
      </div>

      {/* Delivered Orders */}
      {completedOrders && completedOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Deliveries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedOrders.map((order) => (
              <div key={order.id} className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">#{order.id.slice(0, 8)}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    ✓ DELIVERED
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{order.users?.full_name}</p>
                <p className="text-sm font-semibold text-gray-900 mb-2">₹{order.total_amount}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

