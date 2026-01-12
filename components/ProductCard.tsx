'use client'

import { Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: string | null
  stock: number
  isActive: boolean
}

interface ProductCardProps {
  product: Product
  index: number
  onAddToCart: (product: Product) => void
  getPlaceholderImage: (category: string | null, name: string) => string
}

export default function ProductCard({ product, index, onAddToCart, getPlaceholderImage }: ProductCardProps) {
  // Get initials from product name
  const getInitials = (name: string) => {
    const words = name.split(' ')
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s forwards`,
        opacity: 0,
      }}
    >
      {/* Stock Badge */}
      {product.stock <= 5 && product.stock > 0 && (
        <div className="absolute top-3 left-3 z-10 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
          {product.stock}
        </div>
      )}

      {product.stock === 0 && (
        <div className="absolute top-3 left-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
          0
        </div>
      )}

      {/* Product Initial/Image */}
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
        {product.image ? (
          <img
            src={product.image || getPlaceholderImage(product.category, product.name)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = getPlaceholderImage(product.category, product.name)
            }}
          />
        ) : (
          <div className="text-6xl font-bold text-gray-400">
            {getInitials(product.name)}
          </div>
        )}

        {/* Overlay on out of stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="text-sm font-bold text-white">Stok Habis</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="mb-1 text-base font-bold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-lg font-bold text-gray-900">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Star Rating (decorative) */}
          <div className="flex items-center gap-0.5">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Add to Cart Button - Always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white to-transparent">
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock <= 0}
          className="w-full rounded-lg bg-orange-600 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {product.stock <= 0 ? 'Habis' : '+ Tambah'}
        </button>
      </div>
    </div>
  )
}
