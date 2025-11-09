import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'delivery' | 'customer';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Since loading is always false, this will never show
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but profile is still loading, allow access with basic user info
  // This prevents infinite loading when profile fetch fails
  if (!profile) {
    console.warn('Profile not loaded, but user exists - allowing access');
  }

  if (requiredRole && profile?.role !== requiredRole) {
    if (profile?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (profile?.role === 'delivery') {
      return <Navigate to="/delivery/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

