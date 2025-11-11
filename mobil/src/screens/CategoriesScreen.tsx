import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import tw from "twrnc";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Category, Product } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useProductStore, useCartStore, useAuthStore } from "../store";
import {
  FadeInView,
  SlideInView,
  StaggeredList,
} from "../components/AnimatedViews";

type CategoriesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MainTabs"
>;

interface Props {
  navigation: CategoriesScreenNavigationProp;
}

const PRICE_RANGES = [
  { id: "1", label: "0 - 500 ₺", min: 0, max: 500 },
  { id: "2", label: "500 - 1.000 ₺", min: 500, max: 1000 },
  { id: "3", label: "1.000 - 5.000 ₺", min: 1000, max: 5000 },
  { id: "4", label: "5.000 - 10.000 ₺", min: 5000, max: 10000 },
  { id: "5", label: "10.000 ₺ ve üzeri", min: 10000, max: 999999 },
];

const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { products, fetchProducts, fetchCategories, isLoading } =
    useProductStore();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "all",
  ]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<
    "default" | "price-asc" | "price-desc" | "rating"
  >("default");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [useCustomPriceRange, setUseCustomPriceRange] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleProductPress = (productId: string) => {
    navigation.navigate("ProductDetail", { productId });
  };

  const handleAddToCart = async (product: Product) => {
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
      setAddingToCart(product.id);
      await addToCart(product, 1);
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (categoryId === "all") {
      setSelectedCategories(["all"]);
    } else {
      const newCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter((id) => id !== categoryId)
        : [...selectedCategories.filter((id) => id !== "all"), categoryId];
      setSelectedCategories(
        newCategories.length === 0 ? ["all"] : newCategories
      );
    }
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    setSelectedCategories(["all"]);
    setSelectedPriceRange(null);
    setSortBy("default");
    setSearchQuery("");
    setUseCustomPriceRange(false);
    setMinPrice(0);
    setMaxPrice(10000);
    setFilterModalVisible(false);
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (!selectedCategories.includes("all")) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(
          product.category?.toLowerCase().replace(/\s+/g, "-") || ""
        )
      );
    }

    if (useCustomPriceRange) {
      filtered = filtered.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );
    } else if (selectedPriceRange) {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        filtered = filtered.filter(
          (product) => product.price >= range.min && product.price <= range.max
        );
      }
    }

    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const activeFilterCount =
    (selectedCategories.includes("all") ? 0 : selectedCategories.length) +
    (selectedPriceRange ? 1 : 0) +
    (sortBy !== "default" ? 1 : 0);

  const categories: { id: string; name: string; icon: string }[] =
    React.useMemo(() => {
      const arr: { id: string; name: string; icon: string }[] = [];
      const seen = new Set();
      for (const product of products) {
        const cat = product.category?.trim()?.toLowerCase() || "";
        const key = cat.replace(/\s+/g, "-");
        if (key && !seen.has(key)) {
          arr.push({ id: key, name: product.category, icon: "🛍️" });
          seen.add(key);
        }
      }
      return arr;
    }, [products]);

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
      <View
        style={[
          tw`pt-12 pb-4 px-4`,
          { backgroundColor: theme.colors.barColor },
        ]}
      >
        <Text
          style={[
            tw`text-2xl font-bold mb-4`,
            { color: theme.colors.buttonText },
          ]}
        >
          Ürünler
        </Text>

        <View
          style={[
            tw`rounded-2xl px-4 py-3 flex-row items-center`,
            {
              backgroundColor: theme.colors.card,
              shadowColor: theme.colors.shadow,
              shadowOpacity: 0.08,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 8,
              elevation: 3,
            },
          ]}
        >
          <Text style={tw`text-lg mr-3`}>🔍</Text>
          <TextInput
            placeholder="Ürün ara..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[tw`flex-1 text-base`, { color: theme.colors.text }]}
          />
        </View>
      </View>

      <View
        style={[
          tw`py-3`,
          {
            backgroundColor: theme.colors.card,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
          },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={tw`flex-row px-4 gap-2`}>
            {categories.map(
              (category: { id: string; name: string; icon: string }) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}
                  style={[
                    tw`px-4 py-2 rounded-full flex-row items-center`,
                    selectedCategories.includes(category.id)
                      ? {
                          backgroundColor: theme.colors.primary,
                        }
                      : {
                          backgroundColor: theme.colors.surfaceVariant,
                          borderWidth: 1,
                          borderColor: theme.colors.divider,
                        },
                  ]}
                >
                  <Text style={tw`text-base mr-2`}>{category.icon}</Text>
                  <Text
                    style={[
                      tw`font-semibold text-sm`,
                      selectedCategories.includes(category.id)
                        ? { color: theme.colors.onPrimary }
                        : { color: theme.colors.textSecondary },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </ScrollView>
      </View>

      <View
        style={[
          tw`px-4 py-3 flex-row items-center justify-between`,
          {
            backgroundColor: theme.colors.card,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          style={[
            tw`flex-row items-center px-4 py-2 rounded-xl`,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text style={tw`text-lg mr-2`}>🎛️</Text>
          <Text
            style={[tw`font-semibold`, { color: theme.colors.textSecondary }]}
          >
            Filtrele
          </Text>
          {activeFilterCount > 0 && (
            <View
              style={[
                tw`ml-2 rounded-full w-5 h-5 items-center justify-center`,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-bold`,
                  { color: theme.colors.onPrimary },
                ]}
              >
                {activeFilterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={[tw``, { color: theme.colors.textSecondary }]}>
          {filteredProducts.length} ürün
        </Text>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 110 : 90,
        }}
      >
        <StaggeredList staggerDelay={50}>
          <View style={tw`p-4 flex-row flex-wrap gap-3`}>
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => handleProductPress(product.id)}
                style={[
                  tw`rounded-2xl overflow-hidden w-[48%]`,
                  {
                    backgroundColor: theme.colors.card,
                    shadowColor: theme.colors.shadow,
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 12,
                    elevation: 5,
                  },
                ]}
              >
                <View
                  style={{
                    width: "100%",
                    height: 160,
                    backgroundColor: theme.colors.surfaceVariant,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri: product.image }}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "cover",
                    }}
                  />
                </View>
                <View style={tw`p-3`}>
                  <Text
                    style={[
                      tw`font-bold text-base mb-1`,
                      { color: theme.colors.text },
                    ]}
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                  <Text
                    style={[
                      tw`text-xs mb-3`,
                      { color: theme.colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {product.description}
                  </Text>
                  <View style={tw`mb-3`}>
                    <Text
                      style={[
                        tw`font-bold text-lg mb-1`,
                        { color: theme.colors.primary },
                      ]}
                    >
                      ₺{product.price.toLocaleString("tr-TR")}
                    </Text>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <View style={tw`flex-row items-center gap-2`}>
                          <Text
                            style={[
                              tw`text-sm line-through`,
                              { color: theme.colors.textTertiary },
                            ]}
                          >
                            ₺{product.originalPrice.toLocaleString("tr-TR")}
                          </Text>
                          <View
                            style={[
                              tw`px-2 py-0.5 rounded`,
                              { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                            ]}
                          >
                            <Text
                              style={[tw`text-xs font-semibold text-red-600`]}
                            >
                              %
                              {Math.round(
                                ((product.originalPrice - product.price) /
                                  product.originalPrice) *
                                  100
                              )}{" "}
                              İND
                            </Text>
                          </View>
                        </View>
                      )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAddToCart(product)}
                    disabled={addingToCart === product.id}
                    style={[
                      tw`py-2.5 px-3 rounded-xl`,
                      {
                        backgroundColor: theme.colors.buttonPrimary,
                        opacity: addingToCart === product.id ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={tw`text-white text-sm font-semibold text-center`}
                    >
                      {addingToCart === product.id ? "..." : "🛒 Ekle"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filteredProducts.length === 0 && (
            <View style={tw`items-center py-16`}>
              <Text style={tw`text-6xl mb-3`}>🔍</Text>
              <Text
                style={[
                  tw`text-lg font-semibold mb-1`,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Ürün bulunamadı
              </Text>
              <Text style={[tw``, { color: theme.colors.textTertiary }]}>
                Filtrelerinizi değiştirmeyi deneyin
              </Text>
            </View>
          )}
        </StaggeredList>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-white rounded-t-3xl h-[80%]`}>
            <View
              style={tw`flex-row items-center justify-between p-4 border-b border-gray-200`}
            >
              <Text style={tw`text-gray-800 text-xl font-bold`}>Filtrele</Text>
              <View style={tw`flex-row gap-2`}>
                <TouchableOpacity
                  onPress={clearFilters}
                  style={tw`px-4 py-2 bg-gray-100 rounded-xl`}
                >
                  <Text style={tw`text-gray-700 font-semibold`}>Temizle</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Text style={tw`text-gray-500 text-2xl`}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={tw`flex-1 p-4`}>
              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-800 font-bold text-lg mb-3`}>
                  Kategoriler
                </Text>
                <View style={tw`flex-row flex-wrap gap-2`}>
                  {categories.map(
                    (category: { id: string; name: string; icon: string }) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => toggleCategory(category.id)}
                        style={[
                          tw`px-4 py-3 rounded-xl flex-row items-center border-2`,
                          selectedCategories.includes(category.id)
                            ? tw`bg-blue-50 border-blue-600`
                            : tw`bg-white border-gray-200`,
                        ]}
                      >
                        <Text style={tw`text-lg mr-2`}>{category.icon}</Text>
                        <Text
                          style={[
                            tw`font-semibold`,
                            selectedCategories.includes(category.id)
                              ? tw`text-blue-600`
                              : tw`text-gray-700`,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-800 font-bold text-lg mb-3`}>
                  Fiyat Aralığı
                </Text>

                <TouchableOpacity
                  onPress={() => setUseCustomPriceRange(!useCustomPriceRange)}
                  style={[
                    tw`px-4 py-3 rounded-xl mb-3 flex-row items-center justify-between border-2`,
                    useCustomPriceRange
                      ? tw`bg-blue-50 border-blue-600`
                      : tw`bg-white border-gray-200`,
                  ]}
                >
                  <Text
                    style={[
                      tw`font-semibold`,
                      useCustomPriceRange
                        ? tw`text-blue-600`
                        : tw`text-gray-800`,
                    ]}
                  >
                    Özel Fiyat Aralığı
                  </Text>
                  {useCustomPriceRange && (
                    <Text style={tw`text-blue-600 text-xl`}>✓</Text>
                  )}
                </TouchableOpacity>

                {useCustomPriceRange ? (
                  <View style={tw`px-4 py-4 bg-gray-50 rounded-xl`}>
                    <Text style={tw`text-gray-700 font-semibold mb-3`}>
                      ₺{minPrice.toLocaleString("tr-TR")} - ₺
                      {maxPrice.toLocaleString("tr-TR")}
                    </Text>
                    <Slider
                      style={tw`w-full h-8`}
                      minimumValue={0}
                      maximumValue={100000}
                      value={minPrice}
                      onValueChange={(value) => setMinPrice(Math.round(value))}
                      minimumTrackTintColor="#3B82F6"
                      maximumTrackTintColor="#E5E7EB"
                    />
                    <Slider
                      style={tw`w-full h-8 mt-2`}
                      minimumValue={0}
                      maximumValue={100000}
                      value={maxPrice}
                      onValueChange={(value) => setMaxPrice(Math.round(value))}
                      minimumTrackTintColor="#3B82F6"
                      maximumTrackTintColor="#E5E7EB"
                    />
                  </View>
                ) : (
                  PRICE_RANGES.map((range) => (
                    <TouchableOpacity
                      key={range.id}
                      onPress={() =>
                        setSelectedPriceRange(
                          selectedPriceRange === range.id ? null : range.id
                        )
                      }
                      style={[
                        tw`px-4 py-4 rounded-xl mb-2 flex-row items-center justify-between border-2`,
                        selectedPriceRange === range.id
                          ? tw`bg-blue-50 border-blue-600`
                          : tw`bg-white border-gray-200`,
                      ]}
                    >
                      <Text
                        style={[
                          tw`font-semibold`,
                          selectedPriceRange === range.id
                            ? tw`text-blue-600`
                            : tw`text-gray-700`,
                        ]}
                      >
                        {range.label}
                      </Text>
                      {selectedPriceRange === range.id && (
                        <Text style={tw`text-blue-600 text-xl`}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-800 font-bold text-lg mb-3`}>
                  Sıralama
                </Text>
                {[
                  { id: "default", label: "Varsayılan" },
                  { id: "price-asc", label: "Fiyat (Düşük → Yüksek)" },
                  { id: "price-desc", label: "Fiyat (Yüksek → Düşük)" },
                  { id: "rating", label: "Puana Göre" },
                ].map((sort) => (
                  <TouchableOpacity
                    key={sort.id}
                    onPress={() => setSortBy(sort.id as any)}
                    style={[
                      tw`px-4 py-4 rounded-xl mb-2 flex-row items-center justify-between border-2`,
                      sortBy === sort.id
                        ? tw`bg-blue-50 border-blue-600`
                        : tw`bg-white border-gray-200`,
                    ]}
                  >
                    <Text
                      style={[
                        tw`font-semibold`,
                        sortBy === sort.id
                          ? tw`text-blue-600`
                          : tw`text-gray-700`,
                      ]}
                    >
                      {sort.label}
                    </Text>
                    {sortBy === sort.id && (
                      <Text style={tw`text-blue-600 text-xl`}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={tw`p-4 border-t border-gray-200`}>
              <TouchableOpacity
                onPress={applyFilters}
                style={tw`bg-blue-600 py-4 rounded-xl`}
              >
                <Text style={tw`text-white text-center font-bold text-lg`}>
                  Filtreleri Uygula ({filteredProducts.length} ürün)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoriesScreen;
