export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  created_at: string;
  status: 'active' | 'coming_soon';
  category?: string | null;
};

export type ProductStatusFilter = 'all' | 'active' | 'coming_soon';
export type ProductSort = 'newest' | 'price_low' | 'price_high' | 'name';

export function filterAndSortProducts(
  products: Product[],
  searchQuery: string,
  statusFilter: ProductStatusFilter,
  sortBy: ProductSort,
  category: string,
): Product[] {
  const cleanedQuery = (searchQuery || '').toLowerCase().trim();
  const filtered = (products || []).filter((product) => {
    const matchesSearch =
      !cleanedQuery ||
      product.name.toLowerCase().includes(cleanedQuery) ||
      (product.description || '').toLowerCase().includes(cleanedQuery);
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return filtered;
}


