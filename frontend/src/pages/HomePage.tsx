import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/Button';
import { formatCurrency } from '../lib/utils';
import { ViewCartToast } from '../components/ViewCartToast';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Package,
  Search,
  MapPin,
  Star,
  Clock,
  Shield,
  Truck,
  Sparkles,
  TrendingUp,
  Grid3x3
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Database } from '../types/database';

type Product = Database['public']['Tables']['products']['Row'];

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart(user?.id);
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState<{ name: string; quantity: number } | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data as Product[];
    },
  });

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    
    try {
      // Get current quantity before adding
      const previousQuantity = getCartItemQuantity(product.id);
      const newQuantity = previousQuantity + 1;
      
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: 1
      });
      
      // Show custom toast with the new quantity
      setToastProduct({ name: product.name, quantity: newQuantity });
      setShowToast(true);
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const getCartItemQuantity = (productId: string) => {
    const item = cartItems?.find(item => item.product_id === productId);
    return item?.quantity || 0;
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="bg-green-600 text-white">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <p className="text-lg font-bold">Premas Shop</p>
              </div>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 text-white"
                onClick={() => window.location.href = '/cart'}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems && cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
      </header>

      {/* Promotional Banner */}
      <section className="px-4 py-4">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold mb-1">30% OFF</h2>
              <p className="text-sm opacity-90">On your first order</p>
              <p className="text-xs opacity-75 mt-1">Valid till 31st Dec</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-2">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {[
            { name: 'All', icon: Grid3x3 },
            { name: 'Fruits', icon: Package },
            { name: 'Vegetables', icon: Package },
            { name: 'Dairy', icon: Package },
            { name: 'Snacks', icon: Package },
            { name: 'Beverages', icon: Package },
          ].map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={index}
                className="flex flex-col items-center space-y-2 min-w-fit"
              >
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-700 font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">All Products</h2>
          <p className="text-sm text-gray-600">{products.length} items</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-sm text-gray-600">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => {
              const quantity = getCartItemQuantity(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full"
                >
                  <div className="relative">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    {product.cost_price && product.cost_price > product.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((product.cost_price - product.price) / product.cost_price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-base font-bold text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                        {product.cost_price && product.cost_price > product.price && (
                          <span className="text-xs text-gray-500 line-through ml-1">
                            {formatCurrency(product.cost_price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">4.5</span>
                      </div>
                    </div>

                    {quantity > 0 ? (
                      <div className="flex items-center justify-between bg-green-50 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addToCart.mutate({ productId: product.id, quantity: -1 })}
                          disabled={addToCart.isPending}
                          className="text-green-600 hover:bg-green-100 h-7 w-7 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium text-gray-900 text-sm">{quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
                          disabled={addToCart.isPending}
                          className="text-green-600 hover:bg-green-100 h-7 w-7 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm"
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={addToCart.isPending}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    
    {/* Custom View Cart Toast */}
    {showToast && toastProduct && (
      <ViewCartToast
        onClose={() => setShowToast(false)}
        productName={toastProduct.name}
        quantity={toastProduct.quantity}
      />
    )}
    </div>
  );
}
