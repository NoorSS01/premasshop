import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import axios from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: '📦' },
  { key: 'assigned', label: 'Order Assigned', icon: '👤' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link to="/orders" className="btn-primary">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const needsConfirmation =
    order.status === 'out_for_delivery' &&
    order.delivery_confirmation_requested_at &&
    !order.user_confirmed_delivery;

  const currentStepIndex = statusSteps.findIndex((step) => step.key === order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <Link to="/orders" className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-gray-600 mt-1">
          Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy • hh:mm a')}
        </p>
      </div>

      {/* Delivery Confirmation Request */}
      {needsConfirmation && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Confirmation Required</h2>
              <p className="text-gray-700 mb-4">
                Your delivery partner has marked this order as delivered. Have you received your order?
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => confirmDelivery.mutate(true)}
                  disabled={confirmDelivery.isPending}
                  className="btn-primary"
                >
                  {confirmDelivery.isPending ? 'Confirming...' : 'Yes, I received it'}
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
          </div>
        </div>
      )}

      {/* Order Status Timeline */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
        <div className="relative">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentStepIndex && !isCancelled;
            const isCurrent = index === currentStepIndex && !isCancelled && !isDelivered;

            return (
              <div key={step.key} className="flex items-start gap-4 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                      isActive
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : isCurrent
                        ? 'bg-primary-100 border-primary-600 text-primary-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-full min-h-[3rem] ${
                        isActive ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-grow pt-2">
                  <h3
                    className={`font-semibold text-lg mb-1 ${
                      isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h3>
                  {isCurrent && (
                    <p className="text-sm text-primary-600 font-medium">In progress...</p>
                  )}
                  {isActive && !isCurrent && index < currentStepIndex && (
                    <p className="text-sm text-gray-600">Completed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Status */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Payment Status</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                order.payment_status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : order.payment_status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {order.payment_method} • {order.payment_status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
        <div className="space-y-4">
          {Array.isArray(order.items) &&
            order.items.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0"></div>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900">{item.name || `Product ${index + 1}`}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                </div>
                <p className="font-bold text-lg text-gray-900">₹{item.price * item.qty}</p>
              </div>
            ))}
        </div>

        {/* Price Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span className="font-semibold">₹{(order.total_amount - 20).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Delivery Fee</span>
            <span className="font-semibold">₹20.00</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-primary-600">₹{order.total_amount}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary-100 w-10 h-10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
        </div>
        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Apartment:</span> {order.address?.apartment}
          </p>
          <p>
            <span className="font-semibold">Block:</span> {order.address?.block_no}
          </p>
          <p>
            <span className="font-semibold">Flat:</span> {order.address?.flat_no}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {order.address?.phone}
          </p>
          {order.address?.note && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="font-semibold mb-1">Delivery Note:</p>
              <p className="text-gray-600">{order.address.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
