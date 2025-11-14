import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/Header'
import CategoryGrid from '@/components/CategoryGrid'
import ProductGrid from '@/components/ProductGrid'
import ShoppingCart from '@/components/ShoppingCart'
import BottomNavigation from '@/components/BottomNavigation'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const navigate = useNavigate()
  const { addItem } = useCart()

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'cart') {
      setIsCartOpen(true)
    } else if (tab === 'orders') {
      navigate('/orders')
    } else if (tab === 'account') {
      navigate('/account')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onCartClick={() => setIsCartOpen(true)}
        onSearchChange={handleSearchChange}
      />
      
      <main className="pb-20">
        <CategoryGrid 
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />
        
        <ProductGrid 
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onAddToCart={handleAddToCart}
        />
      </main>

      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <ShoppingCart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  )
}
