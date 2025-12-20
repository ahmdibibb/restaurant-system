'use client'

import { Utensils, Coffee } from 'lucide-react'

type Category = 'ALL' | 'MAKANAN' | 'MINUMAN'

interface CategoryNavbarProps {
  selectedCategory: Category
  onCategoryChange: (category: Category) => void
}

export default function CategoryNavbar({ selectedCategory, onCategoryChange }: CategoryNavbarProps) {
  return (
    <div className="sticky top-[73px] z-40 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onCategoryChange('ALL')}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
              selectedCategory === 'ALL'
                ? 'bg-orange-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
            }`}
          >
            <Utensils size={20} />
            Semua Menu
          </button>
          <button
            onClick={() => onCategoryChange('MAKANAN')}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
              selectedCategory === 'MAKANAN'
                ? 'bg-orange-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
            }`}
          >
            <Utensils size={20} />
            Makanan
          </button>
          <button
            onClick={() => onCategoryChange('MINUMAN')}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
              selectedCategory === 'MINUMAN'
                ? 'bg-orange-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
            }`}
          >
            <Coffee size={20} />
            Minuman
          </button>
        </div>
      </div>
    </div>
  )
}

