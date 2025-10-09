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
} from "react-native";
import tw from "twrnc";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useProductStore, useAuthStore } from "../store";

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
      <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={tw`text-gray-600 mt-4`}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={tw`flex-1 bg-gray-50`}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "ios" ? 110 : 90,
      }}
    >
      <View style={tw`bg-blue-600 pt-12 pb-6 px-4`}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <Text style={tw`text-white text-2xl font-bold`}>Sampa Shop</Text>
        </View>

        {/* Search Bar */}
        <View style={tw`bg-white rounded-xl px-4 py-3 flex-row items-center`}>
          <Text style={tw`text-xl mr-2`}>🔍</Text>
          <TextInput
            placeholder="Ürün, kategori veya marka ara..."
            placeholderTextColor="#9CA3AF"
            style={tw`flex-1 text-gray-800`}
          />
        </View>
      </View>

      {/* Auth Banner veya Promo Banner */}
      {!isAuthenticated ? (
        <View style={tw`mx-4 mt-4 rounded-2xl overflow-hidden`}>
          <View style={tw`bg-blue-600 p-6`}>
            <Text style={tw`text-white text-2xl font-bold mb-2`}>
              Hoş Geldiniz! 👋
            </Text>
            <Text style={tw`text-blue-100 mb-4`}>
              Üye olun ve özel indirimlerden faydalanın
            </Text>
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                style={tw`bg-white px-6 py-3 rounded-xl flex-1`}
              >
                <Text style={tw`text-blue-600 font-bold text-center`}>
                  Kayıt Ol
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={tw`bg-white/20 px-6 py-3 rounded-xl flex-1`}
              >
                <Text style={tw`text-white font-bold text-center`}>
                  Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={tw`mx-4 mt-4 rounded-2xl overflow-hidden`}>
          <View style={tw`bg-purple-600 p-6`}>
            <Text style={tw`text-white text-2xl font-bold mb-2`}>
              Kış İndirimleri! 🎉
            </Text>
            <Text style={tw`text-purple-100 mb-4`}>
              Tüm kategorilerde %50'ye varan indirimler
            </Text>
            <TouchableOpacity
              style={tw`bg-white px-6 py-3 rounded-xl self-start`}
            >
              <Text style={tw`text-purple-600 font-bold`}>Keşfet</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Categories */}
      <View style={tw`mt-6 px-4`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={tw`text-gray-800 text-lg font-bold`}>Kategoriler</Text>
          <TouchableOpacity>
            <Text style={tw`text-blue-600 font-semibold`}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={tw`flex-row gap-3`}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={tw`bg-white rounded-2xl px-5 py-4 items-center shadow-sm min-w-24`}
              >
                <Text style={tw`text-3xl mb-2`}>{category.icon}</Text>
                <Text
                  style={tw`text-gray-700 text-xs font-semibold text-center`}
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
          <Text style={tw`text-gray-800 text-lg font-bold`}>
            Öne Çıkan Ürünler
          </Text>
          <TouchableOpacity>
            <Text style={tw`text-blue-600 font-semibold`}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        <View style={tw`gap-3`}>
          {products.slice(0, 5).map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => handleProductPress(product.id)}
              style={tw`bg-white rounded-2xl overflow-hidden shadow-sm flex-row`}
            >
              <Image
                source={{ uri: product.image }}
                style={tw`w-28 h-28 bg-gray-200`}
              />
              <View style={tw`flex-1 p-4 justify-between`}>
                <View>
                  <Text style={tw`text-gray-800 font-bold text-base mb-1`}>
                    {product.name}
                  </Text>
                  <Text style={tw`text-gray-500 text-sm mb-2`}>
                    {product.description}
                  </Text>
                </View>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-blue-600 font-bold text-lg`}>
                    ₺{product.price.toLocaleString("tr-TR")}
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <Text style={tw`text-yellow-500 mr-1`}>⭐</Text>
                    <Text style={tw`text-gray-600 font-semibold`}>
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
