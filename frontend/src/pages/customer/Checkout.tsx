import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import axios from 'axios';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface AddressForm {
  apartment: string;
  block_no: string;
  flat_no: string;
  phone: string;
  note: string;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [address, setAddress] = useState<AddressForm>({
    apartment: '',
    block_no: '',
    flat_no: '',
    phone: '',
    note: '',
  });

  const { data: hasPayU } = useQuery({
    queryKey: ['payu-config'],
    queryFn: async () => {
      // Check if PayU is configured by trying to initiate a test payment
      // In production, this would check environment variables
      return false; // Placeholder - will be set based on env vars
    },
  });

  const createOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });

  const initiatePayment = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await axios.post(
        `${SUPABASE_URL}/functions/v1/payment-initiate`,
        {
          order_id: orderId,
          amount: total + 20,
          customer_email: user?.email,
          customer_phone: address.phone,
          customer_name: user?.user_metadata?.full_name || 'Customer',
          product_info: `Order from Prema's Shop - ${items.length} items`,
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Validate address
    if (!address.apartment || !address.block_no || !address.flat_no || !address.phone) {
      alert('Please fill in all required address fields');
      return;
    }

    try {
      // Create order
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        qty: item.quantity,
        price: item.price,
        cost_price: 0, // Will be fetched from product
      }));

      const order = await createOrder.mutateAsync({
        user_id: user.id,
        items: orderItems,
        total_amount: total + 20,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'COD' ? 'pending' : 'pending',
        status: 'pending',
        address: {
          apartment: address.apartment,
          block_no: address.block_no,
          flat_no: address.flat_no,
          phone: address.phone,
          note: address.note,
        },
      });

      if (paymentMethod === 'UPI') {
        if (!hasPayU) {
          alert('UPI payments are not configured. Please use Cash on Delivery.');
          return;
        }

        // Initiate PayU payment
        const paymentData = await initiatePayment.mutateAsync(order.id);

        if (paymentData.prototype) {
          alert('This is a prototype. PayU credentials are not configured.');
          return;
        }

        // Redirect to PayU payment page
        // In production, you would submit the form to PayU
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentData.payu_url;

        Object.entries(paymentData.payu_form_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        // COD - order created, redirect to confirmation
        clearCart();
        navigate(`/order/${order.id}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to create order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Your cart is empty.</p>
        <Link to="/catalog" className="btn-primary inline-block mt-4">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Delivery Address */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apartment/Complex *
              </label>
              <select
                value={address.apartment}
                onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select apartment</option>
                <option value="apartment-1">Apartment Complex 1</option>
                <option value="apartment-2">Apartment Complex 2</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block No. *
                </label>
                <input
                  type="text"
                  value={address.block_no}
                  onChange={(e) => setAddress({ ...address, block_no: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flat No. *
                </label>
                <input
                  type="text"
                  value={address.flat_no}
                  onChange={(e) => setAddress({ ...address, flat_no: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Note (Optional)
              </label>
              <textarea
                value={address.note}
                onChange={(e) => setAddress({ ...address, note: e.target.value })}
                className="input-field"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Payment Method</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="w-5 h-5 text-primary-600"
              />
              <div>
                <span className="font-semibold">Cash on Delivery (COD)</span>
                <p className="text-sm text-gray-600">Pay when you receive your order</p>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="UPI"
                checked={paymentMethod === 'UPI'}
                onChange={() => setPaymentMethod('UPI')}
                className="w-5 h-5 text-primary-600"
                disabled={!hasPayU}
              />
              <div>
                <span className="font-semibold">UPI Payment</span>
                <p className="text-sm text-gray-600">
                  {!hasPayU && (
                    <span className="text-yellow-600">
                      (Prototype mode - PayU not configured)
                    </span>
                  )}
                  Pay securely via UPI
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹20.00</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{(total + 20).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Estimated Delivery:</strong> We're preparing your order — you'll receive it shortly.
          </p>
        </div>

        <button
          type="submit"
          disabled={createOrder.isPending || initiatePayment.isPending}
          className="btn-primary w-full"
        >
          {createOrder.isPending || initiatePayment.isPending
            ? 'Processing...'
            : paymentMethod === 'COD'
            ? 'Place Order'
            : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
}

