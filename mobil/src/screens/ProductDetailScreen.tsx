import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import tw from "twrnc";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList, Product } from "../types";
import { useCartStore } from "../store";
import { useFavoriteStore } from "../store/favoriteStore";
import { useTheme } from "../context/ThemeContext";

type ProductDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProductDetail"
>;

type ProductDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "ProductDetail"
>;

interface Props {
  navigation: ProductDetailScreenNavigationProp;
  route: ProductDetailScreenRouteProp;
}

// Örnek ürün verisi
const PRODUCT: Product = {
  id: "1",
  name: "Premium Kablosuz Kulaklık",
  description:
    "Aktif gürültü önleme teknolojisi ile üstün ses kalitesi. 30 saate kadar pil ömrü ve hızlı şarj desteği.",
  price: 1299,
  image: "https://via.placeholder.com/400",
  category: "Elektronik",
  rating: 4.8,
  inStock: true,
};

const FEATURES = [
  { icon: "🔋", title: "30 Saat Pil", description: "Uzun kullanım süresi" },
  { icon: "🎵", title: "Hi-Fi Ses", description: "Kristal kalitede müzik" },
  { icon: "🎧", title: "ANC", description: "Aktif gürültü önleme" },
  { icon: "📱", title: "Bluetooth 5.0", description: "Hızlı bağlantı" },
];

const REVIEWS = [
  {
    id: "1",
    user: "Ahmet Y.",
    rating: 5,
    comment: "Harika bir ürün! Ses kalitesi mükemmel.",
    date: "2 gün önce",
  },
  {
    id: "2",
    user: "Elif K.",
    rating: 4,
    comment: "Fiyat/performans açısından çok iyi.",
    date: "1 hafta önce",
  },
  {
    id: "3",
    user: "Mehmet S.",
    rating: 5,
    comment: "Gürültü önleme özelliği gerçekten çalışıyor!",
    date: "2 hafta önce",
  },
];

const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCartStore();
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoriteStore();

  const isProductFavorite = isFavorite(PRODUCT.id);

  const handleAddToCart = () => {
    // Zustand store'a ürün ekle
    addToCart(PRODUCT, quantity);
    alert(`${quantity} adet "${PRODUCT.name}" sepete eklendi! 🎉`);
  };

  const handleToggleFavorite = () => {
    if (isProductFavorite) {
      removeFromFavorites(PRODUCT.id);
      alert("Favorilerden çıkarıldı 💔");
    } else {
      addToFavorites(PRODUCT);
      alert("Favorilere eklendi ❤️");
    }
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          tw`pt-12 pb-4 px-4 flex-row items-center justify-between`,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            tw`w-10 h-10 rounded-full items-center justify-center`,
            { backgroundColor: theme.colors.card, opacity: 0.2 },
          ]}
        >
          <Text style={[tw`text-xl`, { color: theme.colors.onPrimary }]}>
            ←
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            tw`text-lg font-bold flex-1 text-center`,
            { color: theme.colors.onPrimary },
          ]}
        >
          Ürün Detayı
        </Text>
        <TouchableOpacity
          onPress={handleToggleFavorite}
          style={tw`w-10 h-10 bg-white/20 rounded-full items-center justify-center`}
        >
          <Text style={tw`text-2xl`}>{isProductFavorite ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 130 : 110,
        }}
      >
        {/* Product Image */}
        <View style={tw`bg-gray-100 items-center py-6`}>
          <Image
            source={{ uri: PRODUCT.image }}
            style={tw`w-80 h-80 rounded-xl`}
          />
        </View>

        {/* Product Info */}
        <View style={tw`p-4`}>
          {/* Title and Price */}
          <View style={tw`mb-4`}>
            <View style={tw`flex-row justify-between items-start mb-2`}>
              <Text style={tw`text-gray-800 text-2xl font-bold flex-1 mr-4`}>
                {PRODUCT.name}
              </Text>
              <View style={tw`bg-green-100 px-3 py-1 rounded-full`}>
                <Text style={tw`text-green-700 font-bold text-xs`}>Stokta</Text>
              </View>
            </View>

            <View style={tw`flex-row items-center mb-3`}>
              <View style={tw`flex-row items-center mr-4`}>
                <Text style={tw`text-yellow-500 text-lg mr-1`}>⭐</Text>
                <Text style={tw`text-gray-700 font-bold`}>
                  {PRODUCT.rating}
                </Text>
                <Text style={tw`text-gray-500 ml-1`}>(234 değerlendirme)</Text>
              </View>
            </View>

            <Text
              style={[tw`text-3xl font-bold`, { color: theme.colors.primary }]}
            >
              ₺{PRODUCT.price.toLocaleString("tr-TR")}
            </Text>
          </View>

          {/* Description */}
          <View style={tw`mb-6`}>
            <Text
              style={[tw`font-bold text-lg mb-2`, { color: theme.colors.text }]}
            >
              Ürün Açıklaması
            </Text>
            <Text
              style={[tw`leading-6`, { color: theme.colors.textSecondary }]}
            >
              {PRODUCT.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          tw`px-4 pb-8 pt-3 flex-row items-center justify-between shadow-lg`,
          {
            backgroundColor: theme.colors.card,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        {/* Quantity Selector */}
        <View
          style={[
            tw`flex-row items-center rounded-xl`,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={tw`w-10 h-10 items-center justify-center`}
          >
            <Text
              style={[
                tw`text-xl font-bold`,
                { color: theme.colors.textSecondary },
              ]}
            >
              −
            </Text>
          </TouchableOpacity>
          <Text
            style={[tw`font-bold text-lg px-4`, { color: theme.colors.text }]}
          >
            {quantity}
          </Text>
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={tw`w-10 h-10 items-center justify-center`}
          >
            <Text
              style={[
                tw`text-xl font-bold`,
                { color: theme.colors.textSecondary },
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          onPress={handleAddToCart}
          style={[
            tw`flex-1 ml-3 py-4 rounded-xl`,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              tw`text-center font-bold text-base`,
              { color: theme.colors.onPrimary },
            ]}
          >
            Sepete Ekle - ₺{(PRODUCT.price * quantity).toLocaleString("tr-TR")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailScreen;
