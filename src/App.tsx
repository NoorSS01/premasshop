import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import AccountPage from './pages/AccountPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
