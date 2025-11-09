import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'coming_soon'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'name'>('newest');

  // Handle category filtering from URL
  useEffect(() => {
    const category = searchParams.get('category');
    if (category === 'water') {
      setSearchQuery('water');
    }
  }, [searchParams]);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products...');
      
      // Set a timeout for the query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 5000); // 5 second timeout
      });
      
      const queryPromise = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      const result = await Promise.race([queryPromise, timeoutPromise]) as any;
      const { data, error } = result;
      
      if (error) {
        console.error('Products fetch error:', error);
        throw error;
      }
      console.log('Products fetched:', data?.length || 0);
      return data || [];
    },
    retry: false, // Don't retry to avoid long waits
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product: any) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = filter === 'all' || product.status === filter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [products, searchQuery, filter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pt-6 pb-4 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-sm sm:text-base text-gray-600">Discover our premium collection</p>
        </div>

        {/* Filters and Sort - Fixed Layout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-sm transition-all"
              />
            </div>
          </div>

          {/* Filter and Sort Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'active'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Available Now
              </button>
              <button
                onClick={() => setFilter('coming_soon')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'coming_soon'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Coming Soon
              </button>
            </div>

            {/* Sort Dropdown - Fixed Alignment */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-sm bg-white min-w-[120px] transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        {(searchQuery || filter !== 'all') && (
          <div className="text-center mb-4">
            <p className="text-xs sm:text-sm text-gray-600">
              {filteredAndSortedProducts.length} result{filteredAndSortedProducts.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="pb-6">
          {error ? (
            <div className="text-center py-16">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">Failed to load products</p>
              <p className="text-gray-500 text-sm mt-2">Please check your database setup</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 btn-primary"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Loading...</p>
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredAndSortedProducts.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden transition-all duration-200"
                >
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {product.status === 'coming_soon' && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Soon
                      </div>
                    )}
                    {product.stock === 0 && product.status === 'active' && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Sold Out
                      </div>
                    )}
                    {product.status === 'active' && product.stock > 0 && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-1">
                      {product.description || 'Premium quality'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg sm:text-xl font-bold text-primary-600">₹{product.price}</p>
                        {product.stock > 0 && (
                          <p className="text-xs text-gray-500">{product.stock} left</p>
                        )}
                      </div>
                      <div className="bg-primary-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        View
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 mx-auto max-w-sm">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : `No products available`}
                </p>
                {(searchQuery || filter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('all');
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
