"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  FileText,
  CreditCard,
  Wallet,
  QrCode,
  Download,
} from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import Loading from "@/components/Loading";
import { generateSalesReportPDF } from "@/lib/generateSalesReportPDF";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  productsSold: number;
  lowStockProducts: Array<{ id: string; name: string; stock: number }>;
  topProducts: Array<{ product: any; quantitySold: number }>;
  dailySales: Array<{ date: string; amount: number }>;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  category: string | null;
  image: string | null;
}

interface SalesReport {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  totalProductsSold: number;
  totalRevenue: number;
  revenueByMethod: {
    CASH: number;
    QRIS: number;
    EDC: number;
  };
  productSales: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    totalRevenue: number;
  }>;
  dailyRevenue: Array<{ date: string; amount: number }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    category: "",
  });

  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchSalesReport();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats?period=month", {
        credentials: "include", // Include cookies for authentication
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Failed to fetch stats:", res.status, errorData);

        // Handle different error statuses
        if (res.status === 401) {
          console.error("Unauthorized - Please login again");
          router.push("/login");
          return;
        }

        if (res.status === 403) {
          console.error("Forbidden - Admin access required");
          setError("Access denied. Admin privileges required.");
        } else {
          setError(
            `Failed to load stats: ${errorData.error || "Unknown error"}`
          );
        }

        // Set default stats on error but don't throw
        setStats({
          totalSales: 0,
          totalOrders: 0,
          productsSold: 0,
          lowStockProducts: [],
          topProducts: [],
          dailySales: [],
        });
        return;
      }

      const data = await res.json();
      // Clear any previous errors
      setError(null);
      // Ensure all required fields have default values
      setStats({
        totalSales: data.totalSales || 0,
        totalOrders: data.totalOrders || 0,
        productsSold: data.productsSold || 0,
        lowStockProducts: data.lowStockProducts || [],
        topProducts: data.topProducts || [],
        dailySales: data.dailySales || [],
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      setError("Network error. Please check your connection.");
      // Set default stats on error
      setStats({
        totalSales: 0,
        totalOrders: 0,
        productsSold: 0,
        lowStockProducts: [],
        topProducts: [],
        dailySales: [],
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    try {
      const res = await fetch("/api/dashboard/sales-report", {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to fetch sales report:", res.status);
        setSalesReport(null);
        return;
      }

      const data = await res.json();
      setSalesReport(data);
    } catch (error) {
      console.error("Error fetching sales report:", error);
      setSalesReport(null);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      if (res.ok) {
        setShowProductForm(false);
        setEditingProduct(null);
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          image: "",
          category: "",
        });
        fetchProducts();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image || "",
      category: product.category || "",
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Dashboard" />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">⚠️ {error}</p>
          </div>
        )}
        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-orange-600">
                    Rp {(stats.totalSales || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <DollarSign size={32} className="text-orange-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalOrders || 0}
                  </p>
                </div>
                <ShoppingCart size={32} className="text-blue-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Products Sold</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.productsSold || 0}
                  </p>
                </div>
                <Package size={32} className="text-green-600" />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.lowStockProducts?.length || 0}
                  </p>
                </div>
                <TrendingDown size={32} className="text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Sales Report Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Laporan Penjualan</h2>
            <div className="flex gap-2">
              {showSalesReport && salesReport && (
                <button
                  onClick={() => {
                    generateSalesReportPDF(salesReport);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-all hover:scale-105 active:scale-95"
                >
                  <Download size={20} />
                  Download PDF
                </button>
              )}
              <button
                onClick={() => {
                  setShowSalesReport(!showSalesReport);
                  if (!showSalesReport && !salesReport) {
                    fetchSalesReport();
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
              >
                <FileText size={20} />
                {showSalesReport ? "Sembunyikan Laporan" : "Tampilkan Laporan"}
              </button>
            </div>
          </div>

          {showSalesReport && salesReport && (
            <div className="space-y-6">
              {/* Period Info */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Periode:</span>{" "}
                  {new Date(salesReport.period.startDate).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}{" "}
                  -{" "}
                  {new Date(salesReport.period.endDate).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}{" "}
                  ({salesReport.period.days} hari terakhir)
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow-md border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Produk Terjual</p>
                      <p className="text-2xl font-bold text-green-600">
                        {salesReport.totalProductsSold.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Package size={32} className="text-green-600" />
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-orange-600">
                        Rp{" "}
                        {salesReport.totalRevenue.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <DollarSign size={32} className="text-orange-600" />
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Cash</p>
                      <p className="text-2xl font-bold text-blue-600">
                        Rp{" "}
                        {salesReport.revenueByMethod.CASH.toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <Wallet size={32} className="text-blue-600" />
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">QRIS</p>
                      <p className="text-2xl font-bold text-purple-600">
                        Rp{" "}
                        {salesReport.revenueByMethod.QRIS.toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <QrCode size={32} className="text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold">
                  Pendapatan per Metode Pembayaran
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <Wallet size={24} className="text-blue-600" />
                      <span className="font-medium">Cash</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Rp{" "}
                        {salesReport.revenueByMethod.CASH.toLocaleString(
                          "id-ID"
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {salesReport.totalRevenue > 0
                          ? (
                              (salesReport.revenueByMethod.CASH /
                                salesReport.totalRevenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        % dari total
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <QrCode size={24} className="text-purple-600" />
                      <span className="font-medium">QRIS</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Rp{" "}
                        {salesReport.revenueByMethod.QRIS.toLocaleString(
                          "id-ID"
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {salesReport.totalRevenue > 0
                          ? (
                              (salesReport.revenueByMethod.QRIS /
                                salesReport.totalRevenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        % dari total
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard size={24} className="text-green-600" />
                      <span className="font-medium">EDC</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Rp{" "}
                        {salesReport.revenueByMethod.EDC.toLocaleString(
                          "id-ID"
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {salesReport.totalRevenue > 0
                          ? (
                              (salesReport.revenueByMethod.EDC /
                                salesReport.totalRevenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        % dari total
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Sales Breakdown */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold">
                  Detail Produk Terjual
                </h3>
                {salesReport.productSales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            No
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            Nama Produk
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                            Jumlah Terjual
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                            Total Pendapatan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salesReport.productSales.map((item, index) => (
                          <tr key={item.productId} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                              {index + 1}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                              {item.productName}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600">
                              {item.quantitySold.toLocaleString("id-ID")} pcs
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-gray-900">
                              Rp {item.totalRevenue.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Belum ada data penjualan produk
                  </p>
                )}
              </div>
            </div>
          )}

          {showSalesReport && !salesReport && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800">
                Memuat laporan penjualan...
              </p>
            </div>
          )}
        </div>

        <div className="mb-8 flex justify-between">
          <h2 className="text-2xl font-bold">Products</h2>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: "",
                description: "",
                price: "",
                stock: "",
                image: "",
                category: "",
              });
              setShowProductForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {showProductForm && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <form
              onSubmit={handleSubmitProduct}
              className="grid gap-4 md:grid-cols-2"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="MAKANAN">Makanan</option>
                  <option value="MINUMAN">Minuman</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                >
                  {editingProduct ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium">
                    {product.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {product.category ? (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    Rp {(product.price || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {product.stock}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="rounded-lg border border-gray-300 p-2 transition-all hover:bg-gray-50 hover:scale-110 active:scale-95"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-lg border border-red-300 p-2 text-red-600 transition-all hover:bg-red-50 hover:scale-110 active:scale-95"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
