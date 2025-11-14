"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Product } from "@/types/api";
import { useCart } from "@/contexts/CartContext";
import { showToast } from "@/utils/toast";

interface ProductsListComponentProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  initialSearchQuery?: string;
  showNewArrivals?: boolean;
}

export default function ProductsListComponent({
  products,
  loading = false,
  error = null,
  initialSearchQuery = "",
  showNewArrivals = false,
}: ProductsListComponentProps) {
  const { addToCart } = useCart();
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 10000]);
  const [minInput, setMinInput] = useState<string>("10");
  const [maxInput, setMaxInput] = useState<string>("10000");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    setCurrentPage(1);
  }, [initialSearchQuery]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Hata: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const categories = [...new Set(products.map((p) => p.category || "Diğer"))];
  const brands = [...new Set(products.map((p) => p.brand || "Diğer"))];

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredProducts = products.filter((product) => {
    const price =
      typeof product.price === "string"
        ? parseFloat(product.price)
        : product.price;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category || "Diğer");
    const matchesBrand =
      selectedBrands.length === 0 ||
      selectedBrands.includes(product.brand || "Diğer");
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesNewArrivals = (() => {
      if (!showNewArrivals) return true;
      const refDate = product.stock_updated_at || product.created_at;
      if (!refDate) return false;
      const created = new Date(refDate).getTime();
      if (Number.isNaN(created)) return false;
      const now = Date.now();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      return now - created <= THIRTY_DAYS;
    })();

    return (
      matchesPrice &&
      matchesCategory &&
      matchesBrand &&
      matchesSearch &&
      matchesNewArrivals
    );
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-3/4 mx-auto px-4 py-8 select-none">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Min
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={minInput}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "");
                        setMinInput(digitsOnly);
                        if (digitsOnly === "") return;
                        const num = Number(digitsOnly);
                        const clamped = Math.max(
                          10,
                          Math.min(num, priceRange[1])
                        );
                        setPriceRange([clamped, priceRange[1]]);
                      }}
                      onBlur={() => {
                        const raw = Number(minInput);
                        if (Number.isNaN(raw)) {
                          setMinInput(String(priceRange[0]));
                          return;
                        }
                        const clamped = Math.max(
                          10,
                          Math.min(raw, priceRange[1])
                        );
                        setPriceRange([clamped, priceRange[1]]);
                        setMinInput(String(clamped));
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 select-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Max
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={maxInput}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "");
                        setMaxInput(digitsOnly);
                        if (digitsOnly === "") return;
                        const num = Number(digitsOnly);
                        const clamped = Math.max(
                          priceRange[0],
                          Math.min(num, 10000)
                        );
                        setPriceRange([priceRange[0], clamped]);
                      }}
                      onBlur={() => {
                        const raw = Number(maxInput);
                        if (Number.isNaN(raw)) {
                          setMaxInput(String(priceRange[1]));
                          return;
                        }
                        const clamped = Math.max(
                          priceRange[0],
                          Math.min(raw, 10000)
                        );
                        setPriceRange([priceRange[0], clamped]);
                        setMaxInput(String(clamped));
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 select-text"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Brand</h3>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="w-full lg:w-3/4">
          <div className="mb-6">
            <div className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 text-black/60 flex-shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-3.5-3.5" />
              </svg>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => {
                  e.target.style.color = "black";
                  setSearchQuery(e.target.value);
                }}
                className="w-full text-black bg-transparent outline-none text-sm placeholder:text-black/50 select-text"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {showNewArrivals ? "New Arrivals" : "Featured Products"} (
            {filteredProducts.length} ürün)
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-3">
            {paginatedProducts.map((product) => {
              const price = parseFloat(
                product.discount_price || product.price || "0"
              );
              const originalPrice = parseFloat(product.price || "0");
              const hasDiscount =
                product.discount_price && price < originalPrice;

              return (
                <div
                  key={String(product.id)}
                  className="group bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all flex flex-col h-full"
                >
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="aspect-square w-full bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={product.image || "/sampa-logo.png"}
                        alt={product.name}
                        className="w-full h-full object-contain max-h-full transition-transform duration-200 group-hover:scale-95 mx-auto"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1 p-4 justify-between">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="text-xs text-gray-500 truncate mb-1">
                      {product.brand}
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {product.description || "Ürün açıklaması"}
                    </p>
                    <div className="flex items-center justify-between mb-2 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-blue-600">
                          ₺{price.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through">
                            ₺{originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        Stok: {product.stock || 0}
                      </span>
                    </div>
                    <button
                      className="w-full mt-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-md py-2 transition-all cursor-pointer shadow-sm hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                      onClick={() => {
                        console.log("🛒 Sepete ekleniyor:", {
                          productId: product.id,
                          name: product.name,
                          originalPrice: product.price,
                          discountPrice: product.discount_price,
                          calculatedPrice: price,
                        });
                        addToCart({
                          id: String(product.id),
                          name: product.name,
                          price: price,
                          image: product.image || "",
                          color: "",
                          quantity: 1,
                        });
                        showToast.success("Ürün sepete eklendi!");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.3 5.2A1 1 0 007.6 20h8.8a1 1 0 00.9-1.3L17 13M17 13l1.3-5.2M5 21a1 1 0 100-2 1 1 0 000 2zm14 0a1 1 0 100-2 1 1 0 000 2z"
                        />
                      </svg>
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-full transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          )}
        </main>
      </div>
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
