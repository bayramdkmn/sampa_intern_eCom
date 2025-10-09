"use client";

import React, { useRef } from "react";
import Link from "next/link";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton } from "@mui/material";

interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  code: string;
  image: string;
  brand: string;
  price: number;
  stock?: number;
  stockStatus?: "in_stock" | "on_request";
}

const ProductsSliderComponent = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const recentlyViewedProducts: Product[] = [
    {
      id: "1",
      name: "Air Spring, Comp. Type w/ Plastic Piston",
      shortDescription: "Short Type",
      code: "SP 559373-KP01",
      image: "/sampa-logo.png",
      brand: "HENDRICKSON | WATSON & CHALIN",
      price: 40.91,
      stock: 1,
      stockStatus: "on_request",
    },
    {
      id: "2",
      name: "U Bolt, Spring Suspension",
      shortDescription: "With Nut",
      code: "010.144/1",
      image: "/sampa-logo.png",
      brand: "MERCEDES",
      price: 3.45,
      stock: 0,
      stockStatus: "on_request",
    },
    {
      id: "3",
      name: "S - Brake Cam Shaft",
      code: "010.1538",
      image: "/sampa-logo.png",
      brand: "MERCEDES | MAN",
      price: 14.54,
      stock: 0,
      stockStatus: "on_request",
    },
    {
      id: "4",
      name: "Cap, Stud",
      code: "050.085",
      image: "/sampa-logo.png",
      brand: "DAF",
      price: 0.1,
      stock: 2020,
      stockStatus: "on_request",
    },
    {
      id: "5",
      name: "Hose, Oil Cooler",
      code: "040.389",
      image: "/sampa-logo.png",
      brand: "SCANIA",
      price: 2.54,
      stock: 9,
      stockStatus: "in_stock",
    },
  ];

  return (
    <div className="w-full py-8 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Recently Viewed Items
            </h2>
            {/* Navigation Arrows */}
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

        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {recentlyViewedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-lg transition-shadow min-w-[280px] max-w-[280px] flex-shrink-0"
              style={{ height: "450px" }}
            >
              <Link href={`/products/${product.id}`} className="block mb-3">
                <div className="w-full h-40 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain p-2"
                  />
                </div>
              </Link>

              <div className="flex-1 flex flex-col">
                <Link
                  href={`/products/${product.id}`}
                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 mb-2 mt-auto line-clamp-2"
                  style={{ minHeight: "2.5rem", maxHeight: "2.5rem" }}
                >
                  {product.name}{" "}
                  {product.shortDescription && (
                    <span className="font-normal italic text-gray-600">
                      {product.shortDescription}
                    </span>
                  )}
                </Link>

                <div className="text-xs text-blue-600 font-medium mb-2">
                  {product.code}
                </div>

                <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">
                  {product.brand}
                </div>

                <div className="mt-auto">
                  <div className="text-xs text-gray-600 mb-1">
                    Single Net Price
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    €{product.price.toFixed(2)}
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
