export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
  rating: number
  discount?: number
}

export interface CartItem extends Product {
  quantity: number
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
}
