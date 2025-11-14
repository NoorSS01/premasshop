import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { formatCurrency } from '../lib/utils';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package,
  ArrowLeft,
  CheckCircle,
  Truck,
  Shield,
  Clock,
  MapPin,
  Plus as AddIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Database } from '../types/database';

type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  product: Database['public']['Tables']['products']['Row'];
};

type UserAddress = Database['public']['Tables']['users']['Row']['address'];

type SavedAddress = (UserAddress & {
  apartment?: string;
  block?: string;
  room?: string;
  phone?: string;
}) & {
  id: string;
  is_default: boolean;
};

export function CartPage() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCheckout, setIsCheckout] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  
  // New address form
  const [apartment, setApartment] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  // Get saved addresses from user profile
  const savedAddresses: SavedAddress[] = profile?.address ? 
    (Array.isArray(profile.address) ? profile.address : [profile.address]).map((addr, index) => ({
      ...addr,
      id: `address_${index}`,
      is_default: index === 0
    })) : [];

  // Auto-fill phone number when saved address is selected
  useEffect(() => {
    if (selectedAddressId) {
      const selectedAddr = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddr?.phone) {
        setPhoneNumber(selectedAddr.phone);
      }
    }
  }, [selectedAddressId, savedAddresses]);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!user,
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await (supabase
          .from('cart_items') as any)
          .delete()
          .eq('id', itemId);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('cart_items') as any)
          .update({ quantity })
          .eq('id', itemId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('Item removed from cart');
    },
  });

  const placeOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const { data: order, error: orderError } = await (supabase
        .from('orders') as any)
        .insert({
          user_id: user!.id,
          total_amount: orderData.totalAmount,
          address: {
            ...orderData.address,
            phone: orderData.phone
          },
          payment_method: 'cash_on_delivery',
          payment_status: 'pending',
          status: 'pending',
          order_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Failed to create order');

      // Add order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
        product_name: item.product.name,
      }));

      const { error: itemsError } = await (supabase
        .from('order_items') as any)
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: async (order) => {
      // Clear cart
      await (supabase
        .from('cart_items') as any)
        .delete()
        .eq('user_id', user!.id);

      // Save address if it's new
      if (showAddAddress && apartment && blockNumber && roomNumber) {
        const newAddress = {
          apartment,
          block: blockNumber,
          room: roomNumber,
          street: `${apartment}, Block ${blockNumber}, Room ${roomNumber}`,
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
        };

        const currentAddresses = Array.isArray(profile?.address) ? profile?.address : 
          (profile?.address ? [profile.address] : []);
        
        await updateProfile({
          address: [...currentAddresses, newAddress]
        });
      }

      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
      
      toast.success('Order placed successfully!');
      navigate('/orders');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place order');
    },
  });

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!selectedAddressId && !showAddAddress) {
      toast.error('Please select or add a delivery address');
      return;
    }

    let deliveryAddress;
    let orderPhone;

    if (selectedAddressId) {
      const selectedAddr = savedAddresses.find(addr => addr.id === selectedAddressId);
      deliveryAddress = {
        full_name: profile?.full_name || '',
        phone: selectedAddr?.phone || phoneNumber || profile?.phone || '',
        street: selectedAddr?.street || '',
        city: selectedAddr?.city || '',
        state: selectedAddr?.state || '',
        pincode: selectedAddr?.pincode || '',
        landmark: selectedAddr?.landmark || '',
      };
      orderPhone = selectedAddr?.phone || phoneNumber || profile?.phone || '';
    } else {
      // New address
      if (!phoneNumber) {
        toast.error('Please enter your phone number');
        return;
      }
      deliveryAddress = {
        full_name: profile?.full_name || '',
        phone: phoneNumber,
        street: `${apartment}, Block ${blockNumber}, Room ${roomNumber}`,
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        landmark: apartment,
      };
      orderPhone = phoneNumber;
    }

    if (!orderPhone) {
      toast.error('Please enter your phone number');
      return;
    }

    placeOrder.mutate({
      totalAmount: cartTotal,
      address: deliveryAddress,
      phone: orderPhone,
    });
  };

  const handleAddAddress = () => {
    if (!apartment || !blockNumber || !roomNumber) {
      toast.error('Please fill all address fields');
      return;
    }
    setShowAddAddress(true);
    setSelectedAddressId('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link to="/">
            <Button className="bg-green-600 hover:bg-green-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isCheckout) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setIsCheckout(false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Address */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
              
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Select a saved address:</p>
                  <div className="space-y-3">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id}
                        className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={(e) => {
                            setSelectedAddressId(e.target.value);
                            setShowAddAddress(false);
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {address.apartment}
                            {address.is_default && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Address */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-700">Or add a new address:</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddAddress(!showAddAddress);
                      setSelectedAddressId('');
                    }}
                  >
                    <AddIcon className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                </div>

                {showAddAddress && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apartment</label>
                      <select
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select Apartment</option>
                        <option value="VBHC Vaibhava">VBHC Vaibhava</option>
                        <option value="Symphony">Symphony</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Block Number</label>
                        <Input
                          type="text"
                          value={blockNumber}
                          onChange={(e) => setBlockNumber(e.target.value)}
                          placeholder="e.g., A-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                        <Input
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder="e.g., 101"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCheckout}
                  disabled={placeOrder.isPending}
                >
                  {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600">{cartItems.length} items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            {cartItems.map((item) => (
              <div key={item.id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.product.description}</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                      disabled={updateQuantity.isPending}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      disabled={updateQuantity.isPending}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart.mutate(item.id)}
                      disabled={removeFromCart.isPending}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cart Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span className="text-green-600">FREE</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => setIsCheckout(true)}
            >
              Proceed to Checkout
            </Button>

            <Link to="/" className="block mt-4">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
