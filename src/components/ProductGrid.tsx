import { products } from '@/data/mockData'
import ProductCard from './ProductCard'
import { Product } from '@/types'

interface ProductGridProps {
  selectedCategory: string
  searchQuery: string
  onAddToCart: (product: Product) => void
}

export default function ProductGrid({ selectedCategory, searchQuery, onAddToCart }: ProductGridProps) {
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-semibold mb-3">
        {selectedCategory === 'All' ? 'All Products' : selectedCategory}
        <span className="text-sm text-muted-foreground ml-2">({filteredProducts.length})</span>
      </h2>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}
