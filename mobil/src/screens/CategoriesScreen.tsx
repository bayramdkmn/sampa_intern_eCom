import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Modal,
} from "react-native";
import tw from "twrnc";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Category, Product } from "../types";
import { useTheme } from "../context/ThemeContext";

type CategoriesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MainTabs"
>;

interface Props {
  navigation: CategoriesScreenNavigationProp;
}

const CATEGORIES: Category[] = [
  { id: "all", name: "Tümü", icon: "🛍️", productCount: 8000 },
  { id: "1", name: "Elektronik", icon: "📱", productCount: 1245 },
  { id: "2", name: "Moda", icon: "👔", productCount: 3542 },
  { id: "3", name: "Ev & Yaşam", icon: "🏠", productCount: 892 },
  { id: "4", name: "Spor", icon: "⚽", productCount: 567 },
  { id: "5", name: "Kitap", icon: "📚", productCount: 2341 },
  { id: "6", name: "Oyuncak", icon: "🧸", productCount: 445 },
  { id: "7", name: "Kozmetik", icon: "💄", productCount: 723 },
];

const PRODUCTS_BY_CATEGORY: Product[] = [
  {
    id: "1",
    name: "Kablosuz Kulaklık",
    description: "Aktif gürültü önleme özellikli",
    price: 899,
    image: "https://via.placeholder.com/150",
    category: "Elektronik",
    rating: 4.7,
    inStock: true,
  },
  {
    id: "2",
    name: "Bluetooth Hoparlör",
    description: "Su geçirmez taşınabilir hoparlör",
    price: 549,
    image: "https://via.placeholder.com/150",
    category: "Elektronik",
    rating: 4.5,
    inStock: true,
  },
  {
    id: "3",
    name: "Şarj Adaptörü",
    description: "Hızlı şarj özellikli",
    price: 199,
    image: "https://via.placeholder.com/150",
    category: "Elektronik",
    rating: 4.3,
    inStock: true,
  },
  {
    id: "4",
    name: "USB Kablo",
    description: "3m uzunluğunda dayanıklı kablo",
    price: 89,
    image: "https://via.placeholder.com/150",
    category: "Elektronik",
    rating: 4.6,
    inStock: true,
  },
  {
    id: "5",
    name: "Laptop",
    description: "16GB RAM, 512GB SSD",
    price: 18999,
    image: "https://via.placeholder.com/150",
    category: "Elektronik",
    rating: 4.9,
    inStock: true,
  },
  {
    id: "6",
    name: "Telefon Kılıfı",
    description: "Darbe emici koruma",
    price: 149,
    image: "https://via.placeholder.com/150",
    category: "Elektronik",
    rating: 4.4,
    inStock: true,
  },
];

const PRICE_RANGES = [
  { id: "1", label: "0 - 500 ₺", min: 0, max: 500 },
  { id: "2", label: "500 - 1.000 ₺", min: 500, max: 1000 },
  { id: "3", label: "1.000 - 5.000 ₺", min: 1000, max: 5000 },
  { id: "4", label: "5.000 - 10.000 ₺", min: 5000, max: 10000 },
  { id: "5", label: "10.000 ₺ ve üzeri", min: 10000, max: 999999 },
];

const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
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

  const handleProductPress = (productId: string) => {
    navigation.navigate("ProductDetail", { productId });
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
  };

  const getFilteredProducts = () => {
    let filtered = PRODUCTS_BY_CATEGORY;

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Kategori filtresi
    if (!selectedCategories.includes("all")) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(
          CATEGORIES.find((c) => c.name === product.category)?.id || ""
        )
      );
    }

    // Fiyat filtresi
    if (selectedPriceRange) {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        filtered = filtered.filter(
          (product) => product.price >= range.min && product.price <= range.max
        );
      }
    }

    // Sıralama
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const activeFilterCount =
    (selectedCategories.includes("all") ? 0 : selectedCategories.length) +
    (selectedPriceRange ? 1 : 0) +
    (sortBy !== "default" ? 1 : 0);

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[tw`pt-12 pb-4 px-4`, { backgroundColor: theme.colors.primary }]}
      >
        <Text
          style={[
            tw`text-2xl font-bold mb-4`,
            { color: theme.colors.onPrimary },
          ]}
        >
          Ürünler
        </Text>

        {/* Search Bar */}
        <View
          style={[
            tw`rounded-xl px-4 py-3 flex-row items-center`,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Text style={tw`text-xl mr-2`}>🔍</Text>
          <TextInput
            placeholder="Ürün ara..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[tw`flex-1`, { color: theme.colors.text }]}
          />
        </View>
      </View>

      {/* Quick Categories Scroll */}
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
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => toggleCategory(category.id)}
                style={[
                  tw`px-4 py-2 rounded-full flex-row items-center`,
                  selectedCategories.includes(category.id)
                    ? { backgroundColor: theme.colors.primary }
                    : { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text style={tw`text-base mr-1`}>{category.icon}</Text>
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
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Filter & Sort Bar */}
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

      {/* Products Grid */}
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 110 : 90,
        }}
      >
        <View style={tw`p-4 flex-row flex-wrap gap-3`}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => handleProductPress(product.id)}
              style={[
                tw`rounded-2xl overflow-hidden shadow-sm w-[48%]`,
                {
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.shadow,
                },
              ]}
            >
              <Image
                source={{ uri: product.image }}
                style={[
                  tw`w-full h-48`,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
              <View style={tw`p-3`}>
                <Text
                  style={[
                    tw`font-bold text-sm mb-1`,
                    { color: theme.colors.text },
                  ]}
                  numberOfLines={2}
                >
                  {product.name}
                </Text>
                <Text
                  style={[
                    tw`text-xs mb-2`,
                    { color: theme.colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {product.description}
                </Text>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text
                    style={[
                      tw`font-bold text-base`,
                      { color: theme.colors.primary },
                    ]}
                  >
                    ₺{product.price.toLocaleString("tr-TR")}
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <Text style={tw`text-yellow-500 text-xs mr-1`}>⭐</Text>
                    <Text
                      style={[
                        tw`text-xs font-semibold`,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {product.rating}
                    </Text>
                  </View>
                </View>
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
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-white rounded-t-3xl h-[80%]`}>
            {/* Modal Header */}
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
              {/* Kategoriler */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-800 font-bold text-lg mb-3`}>
                  Kategoriler
                </Text>
                <View style={tw`flex-row flex-wrap gap-2`}>
                  {CATEGORIES.map((category) => (
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
                  ))}
                </View>
              </View>

              {/* Fiyat Aralığı */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-800 font-bold text-lg mb-3`}>
                  Fiyat Aralığı
                </Text>
                {PRICE_RANGES.map((range) => (
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
                ))}
              </View>

              {/* Sıralama */}
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

            {/* Apply Button */}
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
