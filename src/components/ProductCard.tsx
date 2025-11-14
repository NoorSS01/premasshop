import { Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price

  return (
    <div className="bg-white rounded-lg border hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-t-lg"
        />
        {product.discount && (
          <Badge className="absolute top-2 left-2 bg-red-500">
            -{product.discount}%
          </Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-muted-foreground">{product.rating}</span>
        </div>
        
        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">${discountedPrice.toFixed(2)}</span>
            {product.discount && (
              <span className="text-xs text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className="h-8 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
