import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Prema's Shop" className="h-10 w-auto" />
            <span className="text-xl font-bold text-primary-600">Prema's Shop</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {profile?.role === 'customer' && (
                  <>
                    <Link to="/catalog" className="text-gray-700 hover:text-primary-600">
                      Shop
                    </Link>
                    <Link to="/cart" className="relative text-gray-700 hover:text-primary-600">
                      Cart
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/orders" className="text-gray-700 hover:text-primary-600">
                      Orders
                    </Link>
                  </>
                )}
                {profile?.role === 'delivery' && (
                  <Link to="/delivery/dashboard" className="text-gray-700 hover:text-primary-600">
                    Dashboard
                  </Link>
                )}
                {profile?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-primary-600">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

