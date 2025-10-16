"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton } from "@mui/material";
import { Product } from "@/types/api";
import { getRecentlyViewedIds } from "@/lib/recentlyViewed";

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
    return filtered;
  }, [products, recentIds]);

  return (
    <div className="w-full py-8 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Recently Viewed Items
            </h2>

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
                className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-lg transition-shadow min-w-[280px] max-w-[280px] flex-shrink-0"
              >
                <Link href={`/products/${product.id}`} className="block mb-3">
                  <div className="w-full h-full max-h-60 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-w-full max-h-full object-cover p-2 rounded-2xl"
                    />
                  </div>
                </Link>

                <div className="flex-1 flex flex-col">
                  <Link
                    href={`/products/${product.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 mb-2 mt-auto "
                  >
                    {product.name}
                  </Link>

                  <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
                    {product.brand}
                  </div>

                  <div className="mt-auto">
                    <div className="text-xs text-gray-600 mb-1">
                      Single Net Price
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      €{product.priceNumber.toFixed(2)}
                    </div>
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
      `}</style>
    </div>
  );
};

export default ProductsSliderComponent;
