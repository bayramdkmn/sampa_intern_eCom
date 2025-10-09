import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import tw from "twrnc";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useProductStore, useAuthStore } from "../store";
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
  const { theme } = useTheme();

  // Component mount olduğunda ürünleri ve kategorileri çek
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleProductPress = (productId: string) => {
    navigation.navigate("ProductDetail", { productId });
  };

  // Loading durumu
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
        style={[tw`pt-12 pb-6 px-4`, { backgroundColor: theme.colors.primary }]}
      >
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <Text
            style={[tw`text-2xl font-bold`, { color: theme.colors.onPrimary }]}
          >
            Sampa Shop
          </Text>
        </View>

        {/* Search Bar */}
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

      {/* Auth Banner veya Promo Banner */}
      {!isAuthenticated ? (
        <View style={tw`mx-4 mt-4 rounded-2xl overflow-hidden`}>
          <View style={[tw`p-6`, { backgroundColor: theme.colors.primary }]}>
            <Text
              style={[
                tw`text-2xl font-bold mb-2`,
                { color: theme.colors.onPrimary },
              ]}
            >
              Hoş Geldiniz! 👋
            </Text>
            <Text
              style={[
                tw`mb-4`,
                { color: theme.colors.onPrimary, opacity: 0.8 },
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
                  { backgroundColor: theme.colors.card, opacity: 0.2 },
                ]}
              >
                <Text
                  style={[
                    tw`font-bold text-center`,
                    { color: theme.colors.onPrimary },
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
          <View style={[tw`p-6`, { backgroundColor: theme.colors.secondary }]}>
            <Text
              style={[
                tw`text-2xl font-bold mb-2`,
                { color: theme.colors.onSecondary },
              ]}
            >
              Kış İndirimleri! 🎉
            </Text>
            <Text
              style={[
                tw`mb-4`,
                { color: theme.colors.onSecondary, opacity: 0.8 },
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
              <Text style={[tw`font-bold`, { color: theme.colors.secondary }]}>
                Keşfet
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Categories */}
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

      {/* Featured Products */}
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
              <Image
                source={{ uri: product.image }}
                style={[
                  tw`w-28 h-28`,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
              <View style={tw`flex-1 p-4 justify-between`}>
                <View>
                  <Text
                    style={[
                      tw`font-bold text-base mb-1`,
                      { color: theme.colors.text },
                    ]}
                  >
                    {product.name}
                  </Text>
                  <Text
                    style={[
                      tw`text-sm mb-2`,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {product.description}
                  </Text>
                </View>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text
                    style={[
                      tw`font-bold text-lg`,
                      { color: theme.colors.primary },
                    ]}
                  >
                    ₺{product.price.toLocaleString("tr-TR")}
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <Text style={tw`text-yellow-500 mr-1`}>⭐</Text>
                    <Text
                      style={[
                        tw`font-semibold`,
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
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
