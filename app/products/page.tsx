"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import CategoryNavbar from "@/components/navbar/CategoryNavbar";
import CartSidebar from "@/components/CartSidebar";
import Loading from "@/components/Loading";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string | null;
  stock: number;
  isActive: boolean;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

type Category = "ALL" | "MAKANAN" | "MINUMAN";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>("ALL");

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?isActive=true");
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category
  useEffect(() => {
    if (selectedCategory === "ALL") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (product) => product.category?.toUpperCase() === selectedCategory
        )
      );
    }
  }, [selectedCategory, products]);

  // Get placeholder image based on category
  const getPlaceholderImage = (category: string | null, name: string) => {
    if (category?.toUpperCase() === "MAKANAN") {
      return `https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&q=80`;
    } else if (category?.toUpperCase() === "MINUMAN") {
      return `https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&h=300&fit=crop&q=80`;
    }
    return `https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=400&h=300&fit=crop&q=80`;
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Produk habis");
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.id);
    let newCart: CartItem[];

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert("Stok tidak cukup");
        return;
      }
      newCart = cart.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    }

    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((item) => item.productId !== productId);
    saveCart(newCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      alert("Stok tidak cukup");
      return;
    }

    const newCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong");
      return;
    }
    router.push("/checkout");
  };

  if (loading) {
    return <Loading message="Memuat menu..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        title="Resto Iga Bakar"
        showCart={false}
        cart={cart}
        sticky={true}
      />
      <CategoryNavbar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Main Content - 2 Column Layout */}
      <div className="flex">
        {/* Left Side - Cart Sidebar (Desktop) */}
        <div className="hidden lg:block lg:w-96 flex-shrink-0">
          <CartSidebar
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Right Side - Products Grid */}
        <div className="flex-1 px-4 py-8 lg:px-8 lg:ml-0">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 lg:text-3xl">
                {selectedCategory === "ALL"
                  ? "Semua Menu"
                  : selectedCategory === "MAKANAN"
                    ? "Makanan"
                    : "Minuman"}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredProducts.length} produk
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">
                  Tidak ada produk tersedia untuk kategori ini
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={product.image || getPlaceholderImage(product.category, product.name)}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">
                            Habis
                          </span>
                        </div>
                      )}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="absolute top-2 right-2">
                          <span className="rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
                            Stok: {product.stock}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-1 p-3">
                      <h3 className="mb-1 text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="mb-3 text-xs text-gray-500 line-clamp-2 min-h-[2rem]">
                          {product.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mt-auto">
                        <p className="mb-2 text-base font-bold text-orange-600 sm:text-lg">
                          Rp {product.price.toLocaleString('id-ID')}
                        </p>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-600"
                        >
                          <ShoppingCart size={18} />
                          <span>Tambah</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart Sidebar */}
        <div className="lg:hidden">
          <CartSidebar
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
