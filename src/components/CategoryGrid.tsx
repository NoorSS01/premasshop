import { categories } from '@/data/mockData'

interface CategoryGridProps {
  onCategorySelect: (category: string) => void
  selectedCategory: string
}

export default function CategoryGrid({ onCategorySelect, selectedCategory }: CategoryGridProps) {
  const allCategories = [{ id: 'all', name: 'All', icon: '🛒', color: 'bg-gray-100' }, ...categories]
  
  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-semibold mb-3">Categories</h2>
      <div className="grid grid-cols-3 gap-3">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.name)}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
              selectedCategory === category.name
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className={`text-2xl mb-1 p-2 rounded-full ${category.color}`}>
              {category.icon}
            </div>
            <span className="text-xs font-medium text-center">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
