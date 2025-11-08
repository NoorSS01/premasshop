import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useGlobalSync } from './hooks/useRealTimeSync';
import ErrorBoundary from './components/ErrorBoundary';
import { usePerformanceMonitoring, useUserInteractionMonitoring } from './hooks/usePerformanceMonitoring';

// Customer pages
import Home from './pages/customer/Home';
import Catalog from './pages/customer/Catalog';
import ProductPage from './pages/customer/ProductPage';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';
import OrderTracking from './pages/customer/OrderTracking';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Delivery partner pages
import DeliverySignup from './pages/delivery/DeliverySignup';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDeliveryPartners from './pages/admin/AdminDeliveryPartners';
import AdminMaliciousActivity from './pages/admin/AdminMaliciousActivity';

// Developer pages
import DevDashboard from './pages/dev/DevDashboard';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  // Enable global real-time synchronization
  useGlobalSync();
  
  // Enable performance monitoring
  usePerformanceMonitoring();
  useUserInteractionMonitoring();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/delivery/signup" element={<DeliverySignup />} />
              
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/delivery/dashboard"
                element={
                  <ProtectedRoute requiredRole="delivery">
                    <DeliveryDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
                      <Route path="malicious-activity" element={<AdminMaliciousActivity />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Developer Routes - Special Access */}
              <Route
                path="/dev/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Routes>
                      <Route path="dashboard" element={<DevDashboard />} />
                      <Route path="*" element={<Navigate to="/dev/dashboard" replace />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
  );
}

export default App;

