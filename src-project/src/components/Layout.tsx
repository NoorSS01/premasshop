import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Button } from './Button';
import { BottomNavigation } from './BottomNavigation';
import { ShoppingCart, User, Package, LogOut, Home, LayoutDashboard, Truck } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut, isAdmin, isDeliveryPartner } = useAuth();
  const { cartCount } = useCart(user?.id);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = isActive('/');
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Only show header on non-home pages */}
      {!isHomePage && (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Premas Shop</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={isActive('/') ? 'bg-green-50 text-green-600' : ''}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>

                {user && (
                  <>
                    {isAdmin && (
                      <Link to="/admin">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={isActive('/admin') ? 'bg-green-50 text-green-600' : ''}
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Admin
                        </Button>
                      </Link>
                    )}

                    <Link to="/orders">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={isActive('/orders') ? 'bg-green-50 text-green-600' : ''}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        My Orders
                      </Button>
                    </Link>
                  </>
                )}
              </nav>

              {/* Right side actions */}
              <div className="flex items-center space-x-2">
                {user ? (
                  <>
                    <Link to="/cart">
                      <Button variant="ghost" size="sm" className="relative">
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </Button>
                    </Link>

                    <Link to="/profile">
                      <Button variant="ghost" size="sm">
                        <User className="w-5 h-5 mr-2" />
                        <span className="hidden sm:inline">{profile?.full_name}</span>
                      </Button>
                    </Link>

                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="primary" size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={isHomePage ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        {children}
      </main>

      {/* Bottom Navigation on all pages */}
      <BottomNavigation />
    </div>
  );
}
