import { describe, it, expect } from 'vitest';
import { filterAndSortProducts, Product } from './products';

const base: Product[] = [
  { id: '1', name: 'Apple', description: 'Fresh fruit', price: 100, created_at: '2025-01-01', status: 'active', category: 'fruits_vegetables' },
  { id: '2', name: 'Milk', description: 'Dairy product', price: 60, created_at: '2025-02-01', status: 'active', category: 'dairy' },
  { id: '3', name: 'Chips', description: 'Snack', price: 30, created_at: '2025-03-01', status: 'coming_soon', category: 'snacks' },
];

describe('filterAndSortProducts', () => {
  it('filters by search query', () => {
    const out = filterAndSortProducts(base, 'milk', 'all', 'newest', 'all');
    expect(out.map((p) => p.id)).toEqual(['2']);
  });

  it('filters by status', () => {
    const out = filterAndSortProducts(base, '', 'active', 'newest', 'all');
    expect(out.length).toBe(2);
  });

  it('filters by category', () => {
    const out = filterAndSortProducts(base, '', 'all', 'newest', 'snacks');
    expect(out.map((p) => p.id)).toEqual(['3']);
  });

  it('sorts by price low to high', () => {
    const out = filterAndSortProducts(base, '', 'all', 'price_low', 'all');
    expect(out.map((p) => p.price)).toEqual([30, 60, 100]);
  });

  it('sorts by name', () => {
    const out = filterAndSortProducts(base, '', 'all', 'name', 'all');
    expect(out.map((p) => p.name)).toEqual(['Apple', 'Chips', 'Milk']);
  });
});


