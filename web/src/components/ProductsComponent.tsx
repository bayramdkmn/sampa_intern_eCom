"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useCart } from "@/contexts/CartContext";
import { addRecentlyViewedId } from "@/lib/recentlyViewed";
import { useProducts } from "@/contexts/ProductContext";

interface ProductProps {
  id: string;
}

export default function ProductsComponent({ id }: ProductProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { fetchProduct } = useProducts();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specifications" | "reviews">(
    "specifications"
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [product, setProduct] = useState({
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
    images: ["/sampa-logo.png"],
    description:
      "The Serenity Sofa is the perfect centerpiece for any modern living space. Its clean lines, plush cushions, and durable fabric upholstery provide both style and unparalleled comfort. Crafted with a solid wood frame, this sofa is built to last. Available in a variety of colors to perfectly match your decor.",
    specifications: {
      dimensions: '85" W x 38" D x 34" H',
      weight: "150 lbs",
      materials: "Solid wood frame, polyester blend fabric, foam cushions",
      assembly: "Partial assembly required (legs)",
      care: "Spot clean with a damp cloth",
    },
  });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) return;
      addRecentlyViewedId(id);
      try {
        const p = await fetchProduct(id);
        if (p && isMounted) {
          const priceNumber =
            Number.parseFloat(p.discount_price ?? p.price ?? "0") || 0;
          setProduct((prev) => ({
            ...prev,
            name: p.name ?? prev.name,
            price: priceNumber || prev.price,
            images: [p.image ?? "/sampa-logo.png", ...prev.images.slice(1)],
            description: p.description ?? prev.description,
          }));
        }
      } catch (e) {}
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id, fetchProduct]);

  const handleAddToCart = () => {
    addToCart({
      id: id,
      name: product.name,
      price: product.price,
      color: product.colors[selectedColor].name,
      image: product.images[0],
      quantity: quantity,
    });

    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/basket");
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
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
              Quantity
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border-2 border-gray-300">
                <button
                  onClick={decreaseQuantity}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <RemoveIcon className="text-gray-600" />
                </button>
                <span className="px-6 py-2 font-semibold text-gray-900 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <AddIcon className="text-gray-600" />
                </button>
              </div>
              <span className="text-sm text-gray-600">In Stock</span>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-green-800">
                Ürün sepete eklendi!
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
            >
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
