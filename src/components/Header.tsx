import { Search, ShoppingCart, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'

interface HeaderProps {
  onCartClick: () => void
  onSearchChange: (query: string) => void
}

export default function Header({ onCartClick, onSearchChange }: HeaderProps) {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full"
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          {/* User Account */}
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <User className="h-5 w-5" />
          </Button>
          
          {/* Shopping Cart */}
          <Button variant="ghost" size="icon" className="h-10 w-10 relative" onClick={onCartClick}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
