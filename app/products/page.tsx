"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import CategoryNavbar from "@/components/navbar/CategoryNavbar";
import ProductCard from "@/components/ProductCard";
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
      // Food images from Unsplash - BBQ/Grilled food
      return `https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&q=80`;
    } else if (category?.toUpperCase() === "MINUMAN") {
      // Drink images from Unsplash
      return `https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&h=300&fit=crop&q=80`;
    }
    // Default food image - BBQ ribs
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
      alert("Product out of stock");
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.id);
    let newCart: CartItem[];

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert("Insufficient stock");
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
      alert("Insufficient stock");
      return;
    }

    const newCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading) {
    return <Loading message="Loading menu..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        title="Resto Iga Bakar"
        showCart={true}
        cart={cart}
        sticky={true}
      />
      <CategoryNavbar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-6 text-3xl font-bold text-gray-800">
          {selectedCategory === "ALL"
            ? "Semua Menu"
            : selectedCategory === "MAKANAN"
            ? "Makanan"
            : "Minuman"}
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              Tidak ada produk tersedia untuk kategori ini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onAddToCart={addToCart}
                getPlaceholderImage={getPlaceholderImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
