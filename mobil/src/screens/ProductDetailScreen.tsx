import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList, Product } from "../types";
import { useCartStore, useProductStore } from "../store";
import { useFavoriteStore } from "../store/favoriteStore";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store";
import { Alert } from "react-native";
import {
  FadeInView,
  SlideInView,
  ScaleInView,
} from "../components/AnimatedViews";

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

const FALLBACK_PRODUCT: Product = {
  id: "fallback",
  name: "Ürün Bulunamadı",
  description: "Bu ürün bulunamadı.",
  price: 0,
  image: "https://via.placeholder.com/400",
  category: "Genel",
  rating: 0,
  inStock: false,
};

const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { addToCart } = useCartStore();
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoriteStore();
  const { products, fetchProducts, isLoading } = useProductStore();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { productId } = route.params;

  const { isAuthenticated } = useAuthStore();

  const product = products.find((p) => p.id === productId) || FALLBACK_PRODUCT;

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const isProductFavorite = isFavorite(product.id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Giriş Yapmalısınız",
        "Sepete ürün eklemek için önce giriş yapmanız gerekiyor.",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Giriş Yap",
            style: "default",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product, quantity);
      alert(`${quantity} adet "${product.name}" sepete eklendi! 🎉`);
    } catch (error) {
      alert("Ürün sepete eklenemedi");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = () => {
    if (isProductFavorite) {
      removeFromFavorites(product.id);
      alert("Favorilerden çıkarıldı 💔");
    } else {
      addToFavorites(product);
      alert("Favorilere eklendi ❤️");
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <View
        style={[
          tw`flex-1 items-center justify-center`,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[tw`mt-4`, { color: theme.colors.textSecondary }]}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      <SlideInView from="top" duration={400}>
        <View
          style={[
            tw`pt-15 pb-4 px-4 flex-row items-center justify-between`,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center`,
              { backgroundColor: theme.colors.card, opacity: 0.2 },
            ]}
          >
            <Text style={[tw`text-2xl`, { color: theme.colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text
            style={[
              tw`text-lg font-bold flex-1 text-center`,
              { color: theme.colors.text },
            ]}
          >
            Ürün Detayı
          </Text>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={[
              tw`w-8 h-8 bg-white/20 rounded-full items-center justify-center`,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={tw`text-2xl`}>{isProductFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>
      </SlideInView>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 130 : 110,
        }}
      >
        <ScaleInView delay={200}>
          <View style={tw`items-center py-6`}>
            <Image
              source={{ uri: product.image }}
              style={tw`w-80 h-80 rounded-xl`}
            />
          </View>
        </ScaleInView>

        {/* Product Info */}
        <FadeInView delay={400}>
          <View style={tw`p-4`}>
            {/* Title and Price */}
            <View style={tw`mb-4`}>
              <View style={tw`flex-row justify-between items-start mb-2`}>
                <Text
                  style={[
                    tw`text-gray-800 text-2xl font-bold flex-1 mr-4`,
                    { color: theme.colors.text },
                  ]}
                >
                  {product.name}
                </Text>
                <View style={tw`bg-green-100 px-3 py-1 rounded-full`}>
                  <Text style={tw`text-green-700 font-bold text-xs`}>
                    Stokta
                  </Text>
                </View>
              </View>

              <View style={tw`flex-row items-center gap-3`}>
                <Text
                  style={[
                    tw`text-3xl font-bold`,
                    { color: theme.colors.primary },
                  ]}
                >
                  ₺{product.price.toLocaleString("tr-TR")}
                </Text>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <Text style={[tw`text-xl line-through text-gray-500`]}>
                        ₺{product.originalPrice.toLocaleString("tr-TR")}
                      </Text>
                      <Text
                        style={[
                          tw`text-sm bg-red-100 text-red-600 px-2 py-1 rounded`,
                        ]}
                      >
                        %
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )}{" "}
                        İndirim
                      </Text>
                    </>
                  )}
              </View>
            </View>

            <View style={tw`mb-6`}>
              <Text
                style={[
                  tw`font-bold text-lg mb-2`,
                  { color: theme.colors.text },
                ]}
              >
                Ürün Açıklaması
              </Text>
              <Text
                style={[tw`leading-6`, { color: theme.colors.textSecondary }]}
              >
                {product.description || "Ürün açıklaması bulunmamaktadır"}
              </Text>
            </View>
          </View>
        </FadeInView>
      </ScrollView>

      <SlideInView from="bottom" delay={600}>
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

          <TouchableOpacity
            onPress={handleAddToCart}
            style={[
              tw`flex-1 ml-3 py-4 rounded-xl`,
              { backgroundColor: theme.colors.secondary },
            ]}
          >
            <Text
              style={[
                tw`text-center font-bold text-base`,
                { color: theme.colors.onPrimary },
              ]}
            >
              Sepete Ekle - ₺
              {(product.price * quantity).toLocaleString("tr-TR")}
            </Text>
          </TouchableOpacity>
        </View>
      </SlideInView>
    </View>
  );
};

export default ProductDetailScreen;
