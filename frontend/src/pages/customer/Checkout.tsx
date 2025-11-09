import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import axios from 'axios';

// const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';
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
  const { user, session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [address, setAddress] = useState<AddressForm>({
    apartment: '',
    block_no: '',
    flat_no: '',
    phone: profile?.phone || '',
    note: '',
  });
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      // Store current location to redirect back after login
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [user, loading, navigate, location.pathname]);

  const { data: hasPayU } = useQuery({
    queryKey: ['payu-config'],
    queryFn: async () => {
      return false; // Placeholder
    },
  });

  const createOrder = useMutation({
    mutationFn: async (orderData: any) => {
      // First create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status,
          status: orderData.status,
          address: orderData.address, // This is the correct field name
          notes: orderData.notes
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Then create order items
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.name
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
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
          customer_name: profile?.full_name || 'Customer',
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
    setOrderError('');

    if (!user) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    if (items.length === 0) {
      setOrderError('Your cart is empty. Please add items before checkout.');
      return;
    }

    if (!address.apartment || !address.block_no || !address.flat_no || !address.phone) {
      setOrderError('Please fill in all required address fields.');
      return;
    }

    if (address.phone.length !== 10) {
      setOrderError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setOrderLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
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
        notes: address.note,
      });

      if (paymentMethod === 'UPI') {
        if (!hasPayU) {
          alert('UPI payments are not configured. Please use Cash on Delivery.');
          return;
        }

        const paymentData = await initiatePayment.mutateAsync(order.id);

        if (paymentData.prototype) {
          alert('This is a prototype. PayU credentials are not configured.');
          return;
        }

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
        clearCart();
        navigate(`/order/${order.id}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setOrderError(error.message || 'Failed to create order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add items to your cart to proceed with checkout.</p>
          <Link to="/catalog" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = 20;
  const finalTotal = total + deliveryFee;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Error Display */}
      {orderError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {orderError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apartment/Complex <span className="text-red-500">*</span>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Block No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.block_no}
                      onChange={(e) => setAddress({ ...address, block_no: e.target.value })}
                      className="input-field"
                      required
                      placeholder="e.g., A, B, C"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Flat No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.flat_no}
                      onChange={(e) => setAddress({ ...address, flat_no: e.target.value })}
                      className="input-field"
                      required
                      placeholder="e.g., 101, 202"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="input-field"
                    required
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    minLength={10}
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={address.note}
                    onChange={(e) => setAddress({ ...address, note: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-100 w-10 h-10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 w-5 h-5 text-primary-600"
                  />
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-900 mb-1">Cash on Delivery (COD)</div>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                  <div className="text-2xl">💵</div>
                </label>
                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!hasPayU ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="mt-1 w-5 h-5 text-primary-600"
                    disabled={!hasPayU}
                  />
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-900 mb-1">UPI Payment</div>
                    <p className="text-sm text-gray-600">
                      {!hasPayU ? (
                        <span className="text-yellow-600">(Not available - Prototype mode)</span>
                      ) : (
                        'Pay securely via UPI'
                      )}
                    </p>
                  </div>
                  <div className="text-2xl">📱</div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={orderLoading || createOrder.isPending || initiatePayment.isPending}
              className="btn-primary w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {orderLoading || createOrder.isPending || initiatePayment.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : paymentMethod === 'COD' ? (
                'Place Order'
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* Items List */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-primary-600">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span className="font-semibold">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-primary-900 mb-1">Estimated Delivery</p>
                  <p className="text-xs text-primary-700">We're preparing your order — you'll receive it shortly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
