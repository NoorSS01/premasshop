import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Home, Package, ShoppingCart, User } from 'lucide-react';

export function BottomNavigation() {
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems } = useCart(user?.id);

  const isActive = (path: string) => location.pathname === path;

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 py-2">
        <Link to="/" className="flex flex-col items-center space-y-1 py-2">
          <Home className={`w-5 h-5 ${isActive('/') ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={`text-xs ${isActive('/') ? 'text-green-600 font-medium' : 'text-gray-400'}`}>Home</span>
        </Link>
        <Link to="/orders" className="flex flex-col items-center space-y-1 py-2">
          <Package className={`w-5 h-5 ${isActive('/orders') ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={`text-xs ${isActive('/orders') ? 'text-green-600 font-medium' : 'text-gray-400'}`}>Orders</span>
        </Link>
        <Link to="/cart" className="flex flex-col items-center space-y-1 py-2 relative">
          <ShoppingCart className={`w-5 h-5 ${isActive('/cart') ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={`text-xs ${isActive('/cart') ? 'text-green-600 font-medium' : 'text-gray-400'}`}>Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-1 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        <Link to="/profile" className="flex flex-col items-center space-y-1 py-2">
          <User className={`w-5 h-5 ${isActive('/profile') ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={`text-xs ${isActive('/profile') ? 'text-green-600 font-medium' : 'text-gray-400'}`}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
