import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import axios from 'axios';

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
        .select('*')
        .eq('delivery_partner_id', deliveryPartner?.id)
        .in('status', ['assigned', 'out_for_delivery'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!deliveryPartner?.id,
  });

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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Delivery Dashboard</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-grow">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === 'out_for_delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Created: {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                  <div className="text-sm text-gray-700">
                    <p>
                      <strong>Address:</strong> {order.address?.apartment} - Block{' '}
                      {order.address?.block_no}, Flat {order.address?.flat_no}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.address?.phone}
                    </p>
                    {order.address?.note && (
                      <p>
                        <strong>Note:</strong> {order.address.note}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-primary-600 mt-2">₹{order.total_amount}</p>
                </div>
                <div className="flex-shrink-0">
                  {order.status === 'assigned' && (
                    <button
                      onClick={() => markDelivered.mutate(order.id)}
                      disabled={markDelivered.isPending}
                      className="btn-primary"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <p className="text-sm text-gray-600">
                      Waiting for customer confirmation
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Assigned Orders</h2>
          <p className="text-gray-600">You don't have any orders assigned to you at the moment.</p>
        </div>
      )}
    </div>
  );
}

