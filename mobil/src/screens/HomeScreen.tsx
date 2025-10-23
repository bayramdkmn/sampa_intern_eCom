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
import { RootStackParamList } from "../types";
import { useProductStore, useAuthStore, useCartStore } from "../store";
import { useTheme } from "../context/ThemeContext";

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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleProductPress = (productId: string) => {
    navigation.navigate("ProductDetail", { productId });
  };

  const handleAddToCart = async (product: any, e: any) => {
    e.stopPropagation(); // Parent TouchableOpacity'yi tetikleme

    try {
      setAddingToCart(product.id);
      await addToCart(product, 1);
      Alert.alert("✅ Başarılı", `${product.name} sepete eklendi!`);
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
        <View style={tw`flex-row items-center justify-between mb-4`}>
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
              Kış İndirimleri! 🎉
            </Text>
            <Text
              style={[
                tw`mb-4`,
                { color: theme.colors.buttonText, opacity: 0.8 },
              ]}
            >
              Tüm kategorilerde %50'ye varan indirimler
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
          <View style={tw`flex-row gap-3`}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  tw`rounded-2xl px-5 py-4 items-center shadow-sm min-w-24`,
                  {
                    backgroundColor: theme.colors.card,
                    shadowColor: theme.colors.shadow,
                  },
                ]}
              >
                <Text style={tw`text-3xl mb-2`}>{category.icon}</Text>
                <Text
                  style={[
                    tw`text-xs font-semibold text-center`,
                    { color: theme.colors.textSecondary },
                  ]}
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
            Öne Çıkan Ürünler
          </Text>
        </View>

        <View style={tw`gap-3`}>
          {products.slice(0, 5).map((product) => (
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
              <View style={{ width: "30%", height: "100%" }}>
                <Image
                  source={{ uri: product.image }}
                  style={[tw`w-full h-44`, { resizeMode: "stretch" }]}
                />
              </View>

              <View style={[tw`p-4 justify-between`, { width: "70%" }]}>
                {/* Başlık */}
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

                {/* Fiyat */}
                <Text
                  style={[
                    tw`font-bold text-lg mb-2`,
                    { color: theme.colors.primary },
                  ]}
                >
                  ₺{product.price.toLocaleString("tr-TR")}
                </Text>

                {/* Butonlar */}
                <View style={tw`flex-row gap-2`}>
                  <TouchableOpacity
                    onPress={(e) => handleBuyNow(product, e)}
                    disabled={addingToCart === product.id}
                    style={[
                      tw`flex-1 py-2 rounded-lg`,
                      {
                        backgroundColor: theme.colors.primary,
                        opacity: addingToCart === product.id ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={tw`text-white text-xs font-semibold text-center`}
                    >
                      {addingToCart === product.id ? "..." : "Satın Al"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={(e) => handleAddToCart(product, e)}
                    disabled={addingToCart === product.id}
                    style={[
                      tw`flex-1 py-2 rounded-lg border`,
                      {
                        borderColor: theme.colors.primary,
                        opacity: addingToCart === product.id ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-xs font-semibold text-center`,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {addingToCart === product.id ? "..." : "🛒 Ekle"}
                    </Text>
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
