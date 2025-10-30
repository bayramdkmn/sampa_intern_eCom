import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import tw from "twrnc";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Category } from "../types";
import { useProductStore, useAuthStore, useCartStore } from "../store";
import { useTheme } from "../context/ThemeContext";

// Kategori ikonları mapping
const CATEGORY_ICONS: { [key: string]: string } = {
  Elektronik: "📱",
  Moda: "👔",
  "Ev & Yaşam": "🏠",
  Spor: "⚽",
  Kitap: "📚",
  Oyuncak: "🧸",
  Kozmetik: "💄",
  Giyim: "👕",
  Ayakkabı: "👟",
  Saat: "⌚",
  Mücevher: "💍",
  Ev: "🏡",
  Bahçe: "🌱",
  "Spor & Outdoor": "🏃",
  Bilgisayar: "💻",
  Telefon: "📞",
  default: "🛍️",
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MainTabs"
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  // 🎯 Zustand Store'dan veri al
  const { products, categories, fetchProducts, fetchCategories, isLoading } =
    useProductStore();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { theme } = useTheme();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Ürünlerden dinamik kategori listesi oluştur
  const getDynamicCategories = (): Category[] => {
    const categoryMap = new Map<string, number>();

    // Her ürünün kategorisini say
    products.forEach((product) => {
      if (product.category) {
        const count = categoryMap.get(product.category) || 0;
        categoryMap.set(product.category, count + 1);
      }
    });

    // Kategori listesi oluştur
    const dynamicCategories: Category[] = [];

    // Her kategoriden bir tane ekle
    categoryMap.forEach((count, categoryName) => {
      dynamicCategories.push({
        id: categoryName.toLowerCase().replace(/\s+/g, "-"),
        name: categoryName,
        icon: CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default,
        productCount: count,
      });
    });

    return dynamicCategories;
  };

  const dynamicCategories = getDynamicCategories();

  const handleCategoryPress = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null); // Aynı kategoriye tekrar tıklanırsa filtreyi kaldır
    } else {
      setSelectedCategory(categoryName);
    }
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate("ProductDetail", { productId });
  };

  // Filtrelenmiş ürünleri al
  const getFilteredProducts = () => {
    if (!selectedCategory) {
      return products.slice(0, 5); // Tüm ürünlerden ilk 5'i
    }
    return products
      .filter((product) => product.category === selectedCategory)
      .slice(0, 5);
  };

  const filteredProducts = getFilteredProducts();

  const handleAddToCart = async (product: any, e: any) => {
    e.stopPropagation(); // Parent TouchableOpacity'yi tetikleme

    try {
      setAddingToCart(product.id);
      await addToCart(product, 1);
    } catch (error) {
      Alert.alert("❌ Hata", "Ürün sepete eklenemedi");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBuyNow = async (product: any, e: any) => {
    e.stopPropagation(); // Parent TouchableOpacity'yi tetikleme

    try {
      setAddingToCart(product.id);
      await addToCart(product, 1);
      navigation.navigate("MainTabs", { screen: "Cart" });
    } catch (error) {
      Alert.alert("❌ Hata", "Ürün sepete eklenemedi");
    } finally {
      setAddingToCart(null);
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
    <ScrollView
      style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "ios" ? 110 : 90,
      }}
    >
      <View
        style={[
          tw`pt-12 pb-6 px-4`,
          { backgroundColor: theme.colors.barColor },
        ]}
      >
        <View style={tw`flex-row items-center justify-between mb-4 pt-4`}>
          <Text
            style={[tw`text-2xl font-bold`, { color: theme.colors.buttonText }]}
          >
            Sampa Shop
          </Text>
        </View>

        <View
          style={[
            tw`rounded-xl px-4 py-3 flex-row items-center`,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Text style={tw`text-xl mr-2`}>🔍</Text>
          <TextInput
            placeholder="Ürün, kategori veya marka ara..."
            placeholderTextColor={theme.colors.textTertiary}
            style={[tw`flex-1`, { color: theme.colors.text }]}
          />
        </View>
      </View>

      {!isAuthenticated ? (
        <View style={tw`mx-4 mt-4 rounded-2xl overflow-hidden`}>
          <View style={[tw`p-6`, { backgroundColor: theme.colors.barColor }]}>
            <Text
              style={[
                tw`text-2xl font-bold mb-2`,
                { color: theme.colors.buttonText },
              ]}
            >
              Hoş Geldiniz! 👋
            </Text>
            <Text
              style={[
                tw`mb-4`,
                { color: theme.colors.buttonText, opacity: 0.8 },
              ]}
            >
              Üye olun ve özel indirimlerden faydalanın
            </Text>
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                style={[
                  tw`px-6 py-3 rounded-xl flex-1`,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <Text
                  style={[
                    tw`font-bold text-center`,
                    { color: theme.colors.primary },
                  ]}
                >
                  Kayıt Ol
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={[
                  tw`px-6 py-3 rounded-xl flex-1`,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <Text
                  style={[
                    tw`font-bold text-center`,
                    { color: theme.colors.primary },
                  ]}
                >
                  Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={tw`mx-4 mt-4 rounded-2xl overflow-hidden`}>
          <View
            style={[
              tw`p-6`,
              { backgroundColor: theme.colors.homePageCatalogCard },
            ]}
          >
            <Text
              style={[
                tw`text-2xl font-bold mb-2`,
                { color: theme.colors.buttonText },
              ]}
            >
              Hoş Geldiniz! 🎉
            </Text>
            <Text
              style={[
                tw`mb-4`,
                { color: theme.colors.buttonText, opacity: 0.8 },
              ]}
            >
              Tüm ürünlere göz atın...
            </Text>
            <TouchableOpacity
              style={[
                tw`px-6 py-3 rounded-xl self-start`,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text style={[tw`font-bold`, { color: theme.colors.text }]}>
                Keşfet
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={tw`mt-6 px-4`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={[tw`text-lg font-bold`, { color: theme.colors.text }]}>
            Kategoriler
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={tw`flex-row gap-2`}>
            {dynamicCategories.slice(0, 8).map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category.name)}
                style={[
                  tw`rounded-xl px-3 py-3 items-center shadow-sm min-w-20`,
                  {
                    backgroundColor:
                      selectedCategory === category.name
                        ? theme.colors.primary
                        : theme.colors.card,
                    shadowColor: theme.colors.shadow,
                  },
                ]}
              >
                <Text style={tw`text-2xl mb-1`}>{category.icon}</Text>
                <Text
                  style={[
                    tw`text-xs font-semibold text-center`,
                    {
                      color:
                        selectedCategory === category.name
                          ? theme.colors.buttonText
                          : theme.colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={tw`mt-6 px-4 pb-6`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={[tw`text-lg font-bold`, { color: theme.colors.text }]}>
            {selectedCategory
              ? `${selectedCategory} Ürünleri`
              : "Öne Çıkan Ürünler"}
          </Text>
          {selectedCategory && (
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={[
                tw`px-3 py-1 rounded-full`,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-semibold`,
                  { color: theme.colors.buttonText },
                ]}
              >
                Tümünü Göster
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={tw`gap-3`}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => handleProductPress(product.id)}
              style={[
                tw`rounded-2xl overflow-hidden shadow-sm flex-row`,
                {
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.shadow,
                },
              ]}
            >
              <View
                style={{
                  width: "30%",
                  height: "100%",
                  borderRadius: 10,
                  overflow: "hidden",
                  padding: 5,
                }}
              >
                <Image
                  source={{ uri: product.image }}
                  defaultSource={require("../../assets/icon.png")}
                  style={[tw`w-full h-40 p-2 rounded-xl`]}
                  resizeMode="stretch"
                />
              </View>

              <View style={[tw`p-4 justify-between`, { width: "70%" }]}>
                <Text
                  numberOfLines={1}
                  style={[
                    tw`font-bold text-base mb-1`,
                    { color: theme.colors.text },
                  ]}
                >
                  {product.name}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[
                    tw`text-xs leading-4 mb-3`,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {product.description || "Ürün açıklaması bulunmamaktadır"}
                </Text>

                <View style={tw`flex-row items-center gap-2 mb-2`}>
                  <Text
                    style={[
                      tw`font-bold text-lg`,
                      { color: theme.colors.primary },
                    ]}
                  >
                    ₺{product.price.toLocaleString("tr-TR")}
                  </Text>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <>
                        <Text style={[tw`text-sm line-through text-gray-500`]}>
                          ₺{product.originalPrice.toLocaleString("tr-TR")}
                        </Text>
                        <Text
                          style={[
                            tw`text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded`,
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

                <View style={tw`flex-row gap-2`}>
                  <TouchableOpacity
                    onPress={(e) => handleBuyNow(product, e)}
                    disabled={addingToCart === product.id}
                    style={[
                      tw`flex-1 h-10 rounded-lg border items-center justify-center flex-row`,
                      {
                        borderColor: theme.colors.buttonPrimary,
                        backgroundColor: "transparent",
                        opacity: addingToCart === product.id ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-sm font-semibold`,
                        { color: theme.colors.buttonPrimary },
                      ]}
                    >
                      {addingToCart === product.id ? "..." : "Satın Al"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={(e) => handleAddToCart(product, e)}
                    disabled={addingToCart === product.id}
                    style={[
                      tw`flex-1 h-10 rounded-lg border items-center justify-center flex-row`,
                      {
                        borderColor: theme.colors.buttonPrimary,
                        backgroundColor: "transparent",
                        opacity: addingToCart === product.id ? 0.5 : 1,
                      },
                    ]}
                  >
                    {addingToCart === product.id ? (
                      <Text
                        style={[
                          tw`text-sm font-semibold`,
                          { color: theme.colors.buttonPrimary },
                        ]}
                      >
                        ...
                      </Text>
                    ) : (
                      <>
                        <Text
                          style={[
                            tw`mr-1`,
                            { color: theme.colors.buttonPrimary },
                          ]}
                        >
                          🛒
                        </Text>
                        <Text
                          style={[
                            tw`text-sm font-semibold`,
                            { color: theme.colors.buttonPrimary },
                          ]}
                        >
                          Ekle
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
