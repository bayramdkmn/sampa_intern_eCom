"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton } from "@mui/material";
import { Product } from "@/types/api";
import { getRecentlyViewedIds } from "@/lib/recentlyViewed";
import { useCart } from "@/contexts/CartContext";
import { showToast } from "@/utils/toast";

interface ProductsSliderComponentProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
}

const ProductsSliderComponent = ({
  products,
  loading = false,
  error = null,
}: ProductsSliderComponentProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    setRecentIds(getRecentlyViewedIds());
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollPosition =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  const normalizedProducts = useMemo(() => {
    const all = (products || []).map((p) => ({
      id: String(p.id),
      name: p.name,
      image: p.image ?? "/sampa-logo.png",
      brand: p.brand ?? "",
      priceNumber: Number.parseFloat(p.discount_price ?? p.price ?? "0") || 0,
      slug: p.slug,
      description: p.description ?? "",
    }));

    if (!recentIds.length) return all;

    const setIds = new Set(recentIds);
    const filtered = all.filter((p) => setIds.has(p.id));
    const order: Record<string, number> = Object.fromEntries(
      recentIds.map((id, idx) => [id, idx])
    );
    filtered.sort((a, b) => (order[a.id] ?? 0) - (order[b.id] ?? 0));
    return filtered.length > 1 ? filtered : all;
  }, [products, recentIds]);

  return (
    <div className="w-full py-8 px-4 md:px-6">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Popular Items</h2>

            <div className="hidden md:flex gap-2">
              <IconButton
                onClick={() => scroll("left")}
                size="small"
                sx={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  "&:hover": { backgroundColor: "#f3f4f6" },
                }}
              >
                <ChevronLeftIcon sx={{ color: "#2563eb", fontSize: 20 }} />
              </IconButton>
              <IconButton
                onClick={() => scroll("right")}
                size="small"
                sx={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  "&:hover": { backgroundColor: "#f3f4f6" },
                }}
              >
                <ChevronRightIcon sx={{ color: "#2563eb", fontSize: 20 }} />
              </IconButton>
            </div>
          </div>
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            See All
          </Link>
        </div>

        {loading && (
          <div className="text-sm text-gray-600 py-8">
            Ürünler yükleniyor...
          </div>
        )}
        {error && !loading && (
          <div className="text-sm text-red-600 py-8">{error}</div>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {!loading &&
            !error &&
            normalizedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-xl transition-all min-w-[280px] max-w-[280px] flex-shrink-0"
              >
                <Link href={`/products/${product.id}`} className="block mb-3">
                  <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-3"
                    />
                  </div>
                </Link>

                <div className="flex-1 flex flex-col">
                  <Link
                    href={`/products/${product.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 mb-2 mt-auto truncate"
                    title={product.name}
                  >
                    {product.name}
                  </Link>

                  <div
                    className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2 truncate"
                    title={product.brand}
                  >
                    {product.brand}
                  </div>

                  {product.description && (
                    <p
                      className="text-xs text-gray-700 mb-3 line-clamp-2"
                      title={product.description}
                    >
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <div className="text-xs text-gray-600 mb-1">
                      Single Net Price
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      €{product.priceNumber.toFixed(2)}
                    </div>
                    <button
                      className="mt-3 w-full bg-blue-500 hover:bg-blue-700 hover:scale-95 text-white font-semibold rounded-lg py-2 px-1 transition-all cursor-pointer shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.priceNumber,
                          image: product.image ?? "",
                          color: "",
                          quantity: 1,
                        });
                        showToast.success("Ürün sepete eklendi!");
                      }}
                    >
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductsSliderComponent;
