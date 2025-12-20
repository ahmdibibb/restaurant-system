'use client'

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
  return (
    <div
      className="group overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:scale-105"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
        opacity: 0,
      }}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={product.image || getPlaceholderImage(product.category, product.name)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = getPlaceholderImage(product.category, product.name)
          }}
        />
        {product.category && (
          <div className="absolute top-2 right-2 rounded-full bg-orange-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {product.category}
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white">
              Stok Habis
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 transition-colors group-hover:text-orange-600">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-orange-600">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-500">
              Stok: {product.stock}
            </p>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition-all hover:bg-orange-700 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {product.stock <= 0 ? 'Stok Habis' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}

