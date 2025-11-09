import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log('Navbar: Sign out button clicked');
      await signOut();
      // Don't navigate here, signOut function handles redirect
    } catch (error) {
      console.error('Navbar: Error signing out:', error);
      // Force redirect even if error
      window.location.replace('/');
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary-600 p-2 rounded-xl group-hover:bg-primary-700 transition-colors">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Prema's Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {/* Show navigation for all logged-in users, don't wait for profile */}
                <Link
                  to="/catalog"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Shop
                </Link>
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Cart
                  </span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Profile
                </Link>
                {profile?.role === 'delivery' && (
                  <Link
                    to="/delivery/dashboard"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/catalog"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Shop
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {user ? (
              <div className="space-y-3">
                <Link
                  to="/catalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Shop
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Profile
                </Link>
                {profile?.role === 'delivery' && (
                  <Link
                    to="/delivery/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/catalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Shop
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
