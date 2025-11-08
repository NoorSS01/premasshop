import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import axios from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const { user, session } = useAuth();

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const confirmDelivery = useMutation({
    mutationFn: async (confirmed: boolean) => {
      const response = await axios.post(
        `${SUPABASE_URL}/functions/v1/confirm-delivery`,
        {
          order_id: id,
          confirmed,
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
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Order not found.</p>
      </div>
    );
  }

  const needsConfirmation =
    order.status === 'out_for_delivery' &&
    order.delivery_confirmation_requested_at &&
    !order.user_confirmed_delivery;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Details</h1>

      {/* Order Status */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Order Status</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status</span>
            <span
              className={`px-4 py-2 rounded-full font-semibold ${
                order.status === 'delivered'
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment</span>
            <span className="font-semibold">
              {order.payment_method} - {order.payment_status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Order Date</span>
            <span>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Delivery Confirmation Request */}
      {needsConfirmation && (
        <div className="card mb-6 bg-yellow-50 border-yellow-200">
          <h2 className="text-xl font-bold mb-4">Delivery Confirmation</h2>
          <p className="text-gray-700 mb-4">
            Your delivery partner has marked this order as delivered. Have you received your order?
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => confirmDelivery.mutate(true)}
              disabled={confirmDelivery.isPending}
              className="btn-primary"
            >
              Yes, I received it
            </button>
            <button
              onClick={() => confirmDelivery.mutate(false)}
              disabled={confirmDelivery.isPending}
              className="btn-secondary"
            >
              No, I didn't receive it
            </button>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Order Items</h2>
        <div className="space-y-4">
          {Array.isArray(order.items) &&
            order.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                  <p className="font-semibold">{item.name || `Product ${index + 1}`}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                </div>
                <p className="font-bold">₹{item.price * item.qty}</p>
              </div>
            ))}
          <div className="pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.total_amount - 20}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹20.00</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Apartment:</strong> {order.address?.apartment}
          </p>
          <p>
            <strong>Block:</strong> {order.address?.block_no}
          </p>
          <p>
            <strong>Flat:</strong> {order.address?.flat_no}
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
      </div>
    </div>
  );
}

