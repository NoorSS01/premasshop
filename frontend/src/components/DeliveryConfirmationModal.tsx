import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface DeliveryConfirmationModalProps {
  orderId: string;
  orderDetails: {
    id: string;
    total_amount: number;
    order_items?: Array<{
      quantity: number;
      products: {
        name: string;
      };
    }>;
  };
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeliveryConfirmationModal({
  orderId,
  orderDetails,
  onClose,
  onConfirm,
}: DeliveryConfirmationModalProps) {
  const { session } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmDelivery = useMutation({
    mutationFn: async (confirmed: boolean) => {
      const response = await axios.post(
        `${SUPABASE_URL}/functions/v1/confirm-delivery`,
        { order_id: orderId, confirmed },
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
      onConfirm();
      onClose();
    },
    onError: (error) => {
      console.error('Failed to confirm delivery:', error);
      alert('Failed to process confirmation. Please try again.');
    },
  });

  const handleConfirm = (confirmed: boolean) => {
    setIsConfirming(true);
    confirmDelivery.mutate(confirmed);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Confirmation</h2>
            <p className="text-gray-600">Please confirm if you have received your order</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order #{orderDetails.id.slice(0, 8)}</h3>
            <div className="space-y-2">
              {orderDetails.order_items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.products.name} × {item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span className="text-primary-600">₹{orderDetails.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Question */}
          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Have you received this order?
            </p>
            <p className="text-sm text-gray-600">
              Please confirm only if you have physically received all items in good condition.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleConfirm(false)}
              disabled={isConfirming || confirmDelivery.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConfirming ? 'Processing...' : 'No, I didn\'t receive it'}
            </button>
            <button
              onClick={() => handleConfirm(true)}
              disabled={isConfirming || confirmDelivery.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConfirming ? 'Processing...' : 'Yes, I received it'}
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isConfirming || confirmDelivery.isPending}
            className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
