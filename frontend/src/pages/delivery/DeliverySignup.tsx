import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import PasswordInput from '../../components/PasswordInput';

export default function DeliverySignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    vehicleInfo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createDeliveryPartner = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('delivery_partners')
        .insert({
          user_id: userId,
          status: 'pending',
          allowed: false,
          vehicle_info: formData.vehicleInfo,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: formData.fullName,
        phone: formData.phone,
        role: 'delivery',
      });

      if (profileError) throw profileError;

      // Create delivery partner record
      await createDeliveryPartner.mutateAsync(authData.user.id);

      alert(
        'Your signup request has been submitted! An admin will review and approve your account. You will receive an email once approved.'
      );
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to submit signup request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-accent-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Delivery Partner</h1>
            <p className="text-gray-600">Join our delivery team and earn with every delivery</p>
          </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="input-field"
              required
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              required
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              required
              placeholder="Enter your mobile number"
              pattern="[0-9]{10}"
              minLength={10}
              maxLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vehicle Information
            </label>
            <input
              type="text"
              value={formData.vehicleInfo}
              onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
              className="input-field"
              placeholder="e.g., Bike - ABC1234"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <PasswordInput
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Create a password"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
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
                Submitting...
              </span>
            ) : (
              'Submit Application'
            )}
          </button>
        </form>

        <div className="mt-6 bg-primary-50 border border-primary-200 rounded-xl p-4">
          <p className="text-sm text-primary-800">
            <strong>Note:</strong> Your application will be reviewed by an admin. You will receive
            an email notification once your account is approved.
          </p>
        </div>
      </div>
    </div>
  );
}

