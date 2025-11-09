import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function DatabaseTest() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Basic connection
      console.log('Testing basic connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('products')
        .select('count')
        .limit(1);
      
      results.connection = {
        success: !connectionError,
        error: connectionError?.message,
        data: connectionTest
      };

      // Test 2: Get products
      console.log('Testing products query...');
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(5);
      
      results.products = {
        success: !productsError,
        error: productsError?.message,
        count: products?.length || 0,
        data: products
      };

      // Test 3: Get current user
      console.log('Testing auth...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      results.auth = {
        success: !userError,
        error: userError?.message,
        user: user ? { id: user.id, email: user.email } : null
      };

      // Test 4: Test settings
      console.log('Testing settings...');
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*');
      
      results.settings = {
        success: !settingsError,
        error: settingsError?.message,
        count: settings?.length || 0,
        data: settings
      };

    } catch (error: any) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Database Connection Test</h2>
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Running connection tests...</p>
        </div>
      )}

      {!loading && Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          {/* Connection Test */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${testResults.connection?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Basic Connection
            </h3>
            {testResults.connection?.success ? (
              <p className="text-green-600">✅ Connection successful!</p>
            ) : (
              <p className="text-red-600">❌ Connection failed: {testResults.connection?.error}</p>
            )}
          </div>

          {/* Products Test */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${testResults.products?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Products Query
            </h3>
            {testResults.products?.success ? (
              <div>
                <p className="text-green-600">✅ Products loaded: {testResults.products.count} items</p>
                {testResults.products.data && testResults.products.data.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Sample products:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {testResults.products.data.slice(0, 3).map((product: any) => (
                        <li key={product.id}>{product.name} - ₹{product.price}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-600">❌ Products query failed: {testResults.products?.error}</p>
            )}
          </div>

          {/* Auth Test */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${testResults.auth?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Authentication
            </h3>
            {testResults.auth?.success ? (
              <div>
                {testResults.auth.user ? (
                  <p className="text-green-600">✅ User logged in: {testResults.auth.user.email}</p>
                ) : (
                  <p className="text-yellow-600">⚠️ No user logged in (this is normal)</p>
                )}
              </div>
            ) : (
              <p className="text-red-600">❌ Auth check failed: {testResults.auth?.error}</p>
            )}
          </div>

          {/* Settings Test */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${testResults.settings?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Settings
            </h3>
            {testResults.settings?.success ? (
              <p className="text-green-600">✅ Settings loaded: {testResults.settings.count} items</p>
            ) : (
              <p className="text-red-600">❌ Settings query failed: {testResults.settings?.error}</p>
            )}
          </div>

          {/* Overall Status */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold text-lg mb-2">Overall Status</h3>
            {testResults.connection?.success && testResults.products?.success ? (
              <p className="text-green-600 font-semibold">🎉 Database is properly connected and working!</p>
            ) : (
              <p className="text-red-600 font-semibold">⚠️ There are connection issues that need to be resolved.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
