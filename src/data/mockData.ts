import { Product, Category } from '@/types'

export const categories: Category[] = [
  { id: '1', name: 'Fruits', icon: '🍎', color: 'bg-red-100' },
  { id: '2', name: 'Vegetables', icon: '🥬', color: 'bg-green-100' },
  { id: '3', name: 'Dairy', icon: '🥛', color: 'bg-blue-100' },
  { id: '4', name: 'Bakery', icon: '🍞', color: 'bg-yellow-100' },
  { id: '5', name: 'Meat', icon: '🥩', color: 'bg-red-50' },
  { id: '6', name: 'Beverages', icon: '🧃', color: 'bg-purple-100' },
]

export const products: Product[] = [
  {
    id: '1',
    name: 'Fresh Apples',
    description: 'Crisp and sweet red apples',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop',
    category: 'Fruits',
    inStock: true,
    rating: 4.5,
    discount: 10
  },
  {
    id: '2',
    name: 'Organic Bananas',
    description: 'Ripe organic bananas',
    price: 3.49,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop',
    category: 'Fruits',
    inStock: true,
    rating: 4.3
  },
  {
    id: '3',
    name: 'Fresh Tomatoes',
    description: 'Juicy ripe tomatoes',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1546470427-e92b2c9c09d6?w=300&h=300&fit=crop',
    category: 'Vegetables',
    inStock: true,
    rating: 4.6
  },
  {
    id: '4',
    name: 'Whole Milk',
    description: 'Fresh whole milk 1L',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop',
    category: 'Dairy',
    inStock: true,
    rating: 4.4
  },
  {
    id: '5',
    name: 'Whole Wheat Bread',
    description: 'Fresh baked whole wheat bread',
    price: 2.49,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop',
    category: 'Bakery',
    inStock: true,
    rating: 4.2
  },
  {
    id: '6',
    name: 'Chicken Breast',
    description: 'Fresh chicken breast 500g',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1586962434213-cee7e4fe3b56?w=300&h=300&fit=crop',
    category: 'Meat',
    inStock: true,
    rating: 4.7,
    discount: 15
  },
  {
    id: '7',
    name: 'Orange Juice',
    description: 'Fresh squeezed orange juice 1L',
    price: 4.49,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop',
    category: 'Beverages',
    inStock: true,
    rating: 4.5
  },
  {
    id: '8',
    name: 'Fresh Carrots',
    description: 'Crunchy organic carrots',
    price: 1.99,
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300&h=300&fit=crop',
    category: 'Vegetables',
    inStock: true,
    rating: 4.1
  }
]
