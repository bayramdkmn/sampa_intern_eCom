"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useCart } from "@/contexts/CartContext";
import { addRecentlyViewedId } from "@/lib/recentlyViewed";
import { Product } from "@/types/api";
import { showToast } from "@/utils/toast";

interface ProductDetailComponentProps {
  product: Product;
  loading?: boolean;
  error?: string | null;
}

export default function ProductDetailComponent({
  product,
  loading = false,
  error = null,
}: ProductDetailComponentProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specifications" | "reviews">(
    "specifications"
  );

  // Product ID'yi URL'den al
  useEffect(() => {
    if (product?.id) {
      addRecentlyViewedId(product.id.toString());
    }
  }, [product?.id]);

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

  // API'den gelen ürün verilerini component state'ine dönüştür
  const productPrice =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;
  const discountPrice = product.discount_price
    ? typeof product.discount_price === "string"
      ? parseFloat(product.discount_price)
      : product.discount_price
    : null;

  const displayPrice = discountPrice || productPrice;

  // Varsayılan renk seçenekleri (API'de yoksa)
  const defaultColors = [
    { name: "Siyah", value: "#000000" },
    { name: "Beyaz", value: "#FFFFFF" },
    { name: "Gri", value: "#6B7280" },
  ];

  // Varsayılan resimler
  const defaultImages = [product.image || "/sampa-logo.png"];

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: displayPrice,
      color: defaultColors[selectedColor].name,
      image: defaultImages[0],
      quantity: quantity,
    });

    showToast.success("Ürün sepete eklendi!");
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
              src={defaultImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain p-8"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {defaultImages.map((image, index) => (
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
            <p className="text-lg text-gray-600 mt-2">
              {product.description || "Kaliteli ve güvenilir ürün"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, index) =>
                index < 4 ? (
                  <StarIcon key={index} className="text-yellow-400 text-xl" />
                ) : (
                  <StarBorderIcon
                    key={index}
                    className="text-yellow-400 text-xl"
                  />
                )
              )}
            </div>
            <span className="text-gray-600">(4.0 değerlendirme)</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gray-900">
              ₺{displayPrice.toFixed(2)}
            </div>
            {discountPrice && (
              <div className="text-2xl text-gray-500 line-through">
                ₺{productPrice.toFixed(2)}
              </div>
            )}
            {discountPrice && (
              <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                %
                {Math.round(
                  ((productPrice - discountPrice) / productPrice) * 100
                )}{" "}
                İndirim
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
              Miktar
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
              <span className="text-sm text-gray-600">
                Stok: {product.stock || 0}
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Sepete Ekle
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Hemen Satın Al
            </button>
          </div>

          <div className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Ürün Açıklaması
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {product.description ||
                "Bu ürün hakkında detaylı açıklama mevcut değil."}
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
              Özellikler
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-base font-semibold transition-colors ${
                activeTab === "reviews"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Müşteri Yorumları
            </button>
          </div>
        </div>

        <div className="py-8">
          {activeTab === "specifications" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Kategori</h3>
                  <p className="text-gray-700">
                    {product.category || "Belirtilmemiş"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Marka</h3>
                  <p className="text-gray-700">
                    {product.brand || "Belirtilmemiş"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Stok Durumu
                  </h3>
                  <p className="text-gray-700">
                    {product.stock || 0} adet mevcut
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Ürün Kodu
                  </h3>
                  <p className="text-gray-700">#{product.id}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Henüz yorum yapılmamış. Bu ürün için ilk yorumu siz yapın!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
