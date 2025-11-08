import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface UseRealTimeSyncOptions {
  table: string;
  queryKeys: string[][];
  filter?: string;
  enabled?: boolean;
}

export function useRealTimeSync({ table, queryKeys, filter, enabled = true }: UseRealTimeSyncOptions) {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(() => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queryClient, queryKeys]);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-${table}${filter ? `-${filter}` : ''}`;
    
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter || undefined,
        },
        (payload) => {
          console.log(`Real-time update on ${table}:`, payload);
          invalidateQueries();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, filter, enabled, invalidateQueries]);

  return { invalidateQueries };
}

// Specialized hooks for different entities
export function useOrderSync(enabled = true) {
  return useRealTimeSync({
    table: 'orders',
    queryKeys: [
      ['admin-orders'],
      ['delivery-orders'],
      ['user-orders'],
      ['system-stats'],
    ],
    enabled,
  });
}

export function useProductSync(enabled = true) {
  return useRealTimeSync({
    table: 'products',
    queryKeys: [
      ['products'],
      ['admin-products'],
      ['featured-products'],
      ['category-stats'],
    ],
    enabled,
  });
}

export function useUserSync(enabled = true) {
  return useRealTimeSync({
    table: 'users',
    queryKeys: [
      ['users'],
      ['system-stats'],
    ],
    enabled,
  });
}

export function useDeliveryPartnerSync(enabled = true) {
  return useRealTimeSync({
    table: 'delivery_partners',
    queryKeys: [
      ['delivery-partners'],
      ['delivery-partners-all'],
      ['system-stats'],
    ],
    enabled,
  });
}

export function useMaliciousActivitySync(enabled = true) {
  return useRealTimeSync({
    table: 'malicious_activities',
    queryKeys: [
      ['malicious-activities'],
    ],
    enabled,
  });
}

// Global sync hook for critical updates
export function useGlobalSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel('global-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          // Invalidate all order-related queries
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
          queryClient.invalidateQueries({ queryKey: ['system-stats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          // Invalidate all product-related queries
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          queryClient.invalidateQueries({ queryKey: ['featured-products'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_partners',
        },
        () => {
          // Invalidate delivery partner queries
          queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
          queryClient.invalidateQueries({ queryKey: ['system-stats'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);
}

// Hook for optimistic updates
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const updateOrderStatus = useCallback((orderId: string, newStatus: string) => {
    // Optimistically update order status across all relevant queries
    ['admin-orders', 'delivery-orders', 'user-orders'].forEach(queryKey => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((order: any) => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
      });
    });
  }, [queryClient]);

  const updateProductStock = useCallback((productId: string, newStock: number) => {
    // Optimistically update product stock
    ['products', 'admin-products'].forEach(queryKey => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((product: any) => 
          product.id === productId ? { ...product, stock: newStock } : product
        );
      });
    });
  }, [queryClient]);

  return {
    updateOrderStatus,
    updateProductStock,
  };
}
