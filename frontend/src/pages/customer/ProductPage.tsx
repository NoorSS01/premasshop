import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    if (product.status !== 'active' || product.stock === 0) {
      alert('This product is not available');
      return;
    }
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity,
    });
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Product not found.</p>
      </div>
    );
  }

  const isAvailable = product.status === 'active' && product.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          {product.status === 'coming_soon' && (
            <span className="inline-block bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Coming Soon
            </span>
          )}
          {!isAvailable && product.status === 'active' && (
            <span className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Out of Stock
            </span>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-primary-600 mb-6">₹{product.price}</p>
          <p className="text-gray-600 mb-8">{product.description}</p>

          {isAvailable && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">
                    {product.stock} available
                  </span>
                </div>
              </div>

              <button onClick={handleAddToCart} className="btn-primary w-full mb-4">
                Add to Cart
              </button>
            </>
          )}

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="font-semibold mb-2">Product Information</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Stock: {product.stock} units</li>
              <li>Status: {product.status === 'active' ? 'Available' : 'Coming Soon'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

