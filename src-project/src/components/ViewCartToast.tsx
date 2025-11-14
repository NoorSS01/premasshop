import { ShoppingCart, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ViewCartToastProps {
  onClose: () => void;
  productName: string;
  quantity: number;
}

export function ViewCartToast({ onClose, productName, quantity }: ViewCartToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-sm animate-in slide-in-from-right duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Added to cart!</p>
            <p className="text-sm text-gray-600">{productName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Quantity: <span className="font-medium text-gray-900">{quantity}</span>
        </p>
        <Link
          to="/cart"
          onClick={onClose}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}
