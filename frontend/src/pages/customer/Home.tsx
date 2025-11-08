import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export default function Home() {
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Welcome to Prema's Shop
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Premium quality essentials delivered fresh to your doorstep. Quick, reliable, and friendly service.
        </p>
        <Link to="/catalog" className="btn-primary inline-block">
          Shop Now
        </Link>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <p className="text-2xl font-bold text-primary-600">₹{product.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-12 bg-white rounded-xl mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick delivery to your doorstep</p>
          </div>
          <div>
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
            <p className="text-gray-600">Handpicked fresh products</p>
          </div>
          <div>
            <div className="text-4xl mb-4">💳</div>
            <h3 className="font-semibold text-lg mb-2">Easy Payments</h3>
            <p className="text-gray-600">UPI or Cash on Delivery</p>
          </div>
        </div>
      </section>
    </div>
  );
}

