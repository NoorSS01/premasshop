import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Product = Database['public']['Tables']['products']['Row'];
type CartItem = Database['public']['Tables']['cart_items']['Row'];

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export function useCart(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return (data as any[]).map((item) => ({
        ...item,
        product: item.product,
      })) as CartItemWithProduct[];
    },
    enabled: !!userId,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!userId) throw new Error('User not logged in');

      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update quantity
        const { error } = await (supabase
          .from('cart_items') as any)
          .update({ quantity: (existing as any).quantity + quantity })
          .eq('id', (existing as any).id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await (supabase
          .from('cart_items') as any)
          .insert({ user_id: userId, product_id: productId, quantity });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('cart_items') as any)
          .update({ quantity })
          .eq('id', itemId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not logged in');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return {
    cartItems,
    isLoading,
    cartTotal,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
