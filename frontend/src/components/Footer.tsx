import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Prema's Shop</h3>
            <p className="text-gray-400">
              Your premium quick-commerce destination for fresh essentials delivered to your doorstep.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/catalog" className="hover:text-white">Shop</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white">Order History</Link>
              </li>
              <li>
                <Link to="/delivery/signup" className="hover:text-white">Become a Delivery Partner</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400">
              We're here to help! Reach out to us for any questions or support.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Prema's Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

