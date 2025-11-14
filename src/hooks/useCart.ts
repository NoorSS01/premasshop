import { useState, useCallback } from 'react'
import { CartItem, Product } from '@/types'
import { toast } from '@/hooks/use-toast'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      
      if (existingItem) {
        const updatedItems = prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
        toast({
          title: "Cart updated",
          description: `${product.name} quantity updated`,
        })
        return updatedItems
      } else {
        toast({
          title: "Added to cart",
          description: `${product.name} added to cart`,
        })
        return [...prevItems, { ...product, quantity }]
      }
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === productId)
      const updatedItems = prevItems.filter(item => item.id !== productId)
      if (item) {
        toast({
          title: "Removed from cart",
          description: `${item.name} removed from cart`,
        })
      }
      return updatedItems
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
    toast({
      title: "Cart cleared",
      description: "All items removed from cart",
    })
  }, [])

  const total = items.reduce((sum, item) => {
    const price = item.discount ? item.price * (1 - item.discount / 100) : item.price
    return sum + price * item.quantity
  }, 0)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    totalItems,
  }
}
