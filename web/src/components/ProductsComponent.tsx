"use client";
import { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface ProductProps {
  id: string;
}

export default function ProductsComponent({ id }: ProductProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeTab, setActiveTab] = useState<"specifications" | "reviews">(
    "specifications"
  );

  const product = {
    name: "The Serenity Sofa",
    subtitle: "Plush comfort meets modern design.",
    price: 1299.0,
    rating: 3,
    reviewCount: 121,
    colors: [
      { name: "Light Gray", value: "#E5E5E5" },
      { name: "Navy Blue", value: "#1E3A8A" },
      { name: "Burgundy", value: "#7C2D12" },
    ],
    images: ["/sampa-logo.png", "/sampa-logo.png", "/sampa-logo.png"],
    description:
      "The Serenity Sofa is the perfect centerpiece for any modern living space. Its clean lines, plush cushions, and durable fabric upholstery provide both style and unparalleled comfort. Crafted with a solid wood frame, this sofa is built to last. Available in a variety of colors to perfectly match your decor.",
    specifications: {
      dimensions: '85" W x 38" D x 34" H',
      weight: "150 lbs",
      materials: "Solid wood frame, polyester blend fabric, foam cushions",
      assembly: "Partial assembly required (legs)",
      care: "Spot clean with a damp cloth",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-[4/3]">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`bg-gray-100 rounded-lg overflow-hidden aspect-[4/3] border-2 transition-all ${
                  selectedImage === index
                    ? "border-blue-600"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{product.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, index) =>
                index < product.rating ? (
                  <StarIcon key={index} className="text-yellow-400 text-xl" />
                ) : (
                  <StarBorderIcon
                    key={index}
                    className="text-yellow-400 text-xl"
                  />
                )
              )}
            </div>
            <span className="text-gray-600">
              ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="text-4xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
              Color
            </h3>
            <div className="flex gap-3">
              {product.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor === index
                      ? "border-gray-900 scale-110"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
              Add to Cart
            </button>
            <button className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
              Buy Now
            </button>
          </div>

          <div className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Product Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("specifications")}
              className={`pb-4 text-base font-semibold transition-colors ${
                activeTab === "specifications"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-base font-semibold transition-colors ${
                activeTab === "reviews"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Customer Reviews
            </button>
          </div>
        </div>

        <div className="py-8">
          {activeTab === "specifications" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Dimensions
                  </h3>
                  <p className="text-gray-700">
                    {product.specifications.dimensions}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Weight</h3>
                  <p className="text-gray-700">
                    {product.specifications.weight}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Materials
                  </h3>
                  <p className="text-gray-700">
                    {product.specifications.materials}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Assembly</h3>
                  <p className="text-gray-700">
                    {product.specifications.assembly}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Care</h3>
                  <p className="text-gray-700">{product.specifications.care}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
