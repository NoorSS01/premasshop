import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import axios from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function AdminOrders() {
  const { user, session } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [autoAssign, setAutoAssign] = useState(true);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'auto_assign_orders')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: orders, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(full_name, email), delivery_partners(id)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: deliveryPartners } = useQuery({
    queryKey: ['delivery-partners-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('*, users(full_name, email)')
        .eq('status', 'approved')
        .eq('allowed', true);
      if (error) throw error;
      return data;
    },
  });

  const assignOrder = useMutation({
    mutationFn: async ({ orderId, partnerId }: { orderId: string; partnerId: string | null }) => {
      const response = await axios.post(
        `${SUPABASE_URL}/functions/v1/assign-order`,
        {
          order_id: orderId,
          delivery_partner_id: partnerId,
        },
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
      setSelectedOrder(null);
    },
  });

  const toggleAutoAssign = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase.from('settings').upsert({
        key: 'auto_assign_orders',
        value: enabled,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => {
                setAutoAssign(e.target.checked);
                toggleAutoAssign.mutate(e.target.checked);
              }}
              className="w-5 h-5"
            />
            <span>Auto-assign orders</span>
          </label>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold">Customer</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Payment</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                  <td className="py-3 px-4">
                    {order.users?.full_name || 'N/A'}
                    <br />
                    <span className="text-xs text-gray-500">{order.users?.email}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold">₹{order.total_amount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {order.payment_method} - {order.payment_status}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View/Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) &&
                    selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.name || `Product ${idx + 1}`} × {item.qty}
                        </span>
                        <span>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p className="text-sm text-gray-700">
                  {selectedOrder.address?.apartment} - Block{' '}
                  {selectedOrder.address?.block_no}, Flat {selectedOrder.address?.flat_no}
                </p>
                <p className="text-sm text-gray-700">Phone: {selectedOrder.address?.phone}</p>
              </div>

              {selectedOrder.status === 'pending' && (
                <div>
                  <h3 className="font-semibold mb-2">Assign Delivery Partner</h3>
                  <select
                    onChange={(e) => {
                      assignOrder.mutate({
                        orderId: selectedOrder.id,
                        partnerId: e.target.value || null,
                      });
                    }}
                    className="input-field"
                    defaultValue={selectedOrder.delivery_partner_id || ''}
                  >
                    <option value="">Select partner</option>
                    {deliveryPartners?.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.users?.full_name || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

