import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useFavoriteStore } from "../store/favoriteStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { favorites, removeFromFavorites } = useFavoriteStore();

  const handleProductPress = (productId: string) => {
    navigation.navigate("ProductDetail", { productId });
  };

  const handleRemoveFavorite = (productId: string) => {
    removeFromFavorites(productId);
  };

  if (favorites.length === 0) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <View style={tw`bg-blue-600 pt-12 pb-4 px-4 flex-row items-center`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3`}
          >
            <Text style={tw`text-white text-xl`}>←</Text>
          </TouchableOpacity>
          <Text style={tw`text-white text-xl font-bold flex-1`}>
            Favorilerim
          </Text>
        </View>

        <View style={tw`flex-1 justify-center items-center px-8`}>
          <Text style={tw`text-8xl mb-6`}>❤️</Text>
          <Text style={tw`text-gray-800 text-2xl font-bold mb-3 text-center`}>
            Favori Ürününüz Yok
          </Text>
          <Text style={tw`text-gray-500 text-center text-base mb-8`}>
            Beğendiğiniz ürünleri favorilerinize ekleyerek daha sonra kolayca
            ulaşabilirsiniz.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("MainTabs")}
            style={tw`bg-blue-600 px-8 py-4 rounded-xl`}
          >
            <Text style={tw`text-white font-bold text-base`}>
              Alışverişe Başla
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`bg-blue-600 pt-12 pb-4 px-4 flex-row items-center`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3`}
        >
          <Text style={tw`text-white text-xl`}>←</Text>
        </TouchableOpacity>
        <Text style={tw`text-white text-xl font-bold flex-1`}>Favorilerim</Text>
        <View style={tw`bg-white/20 px-3 py-1 rounded-full`}>
          <Text style={tw`text-white font-bold`}>{favorites.length}</Text>
        </View>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 110 : 90,
        }}
      >
        <View style={tw`px-4 pt-2`}>
          {favorites.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => handleProductPress(product.id)}
              style={tw`bg-white rounded-2xl mb-4 overflow-hidden shadow-sm flex-row`}
            >
              <Image
                source={{ uri: product.image }}
                style={tw`w-28 h-28 bg-gray-100`}
              />

              <View style={tw`flex-1 p-3 justify-between`}>
                <View>
                  <Text
                    style={tw`text-gray-800 font-bold text-base mb-1`}
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                  <View style={tw`flex-row items-center mb-2`}>
                    <Text style={tw`text-yellow-500 mr-1`}>⭐</Text>
                    <Text style={tw`text-gray-600 text-sm font-semibold`}>
                      {product.rating}
                    </Text>
                  </View>
                </View>

                <View style={tw`flex-row items-center justify-between`}>
                  <Text style={tw`text-blue-600 font-bold text-lg`}>
                    ₺{product.price.toLocaleString("tr-TR")}
                  </Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(product.id);
                    }}
                    style={tw`bg-red-50 p-2 rounded-lg`}
                  >
                    <Text style={tw`text-xl`}>💔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default FavoritesScreen;
