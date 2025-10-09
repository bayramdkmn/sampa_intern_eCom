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
import { useCartStore, useOrderStore } from "../store";
import { useTheme } from "../context/ThemeContext";

const CartScreen: React.FC = () => {
  // 🎯 Zustand Store'dan veri al
  // Redux'ta: useSelector() ile state çekerdin
  // Zustand'da: direkt store'dan al!
  const { items, total, updateQuantity, removeFromCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { theme } = useTheme();

  const calculateShipping = () => {
    return total > 500 ? 0 : 29.99;
  };

  const calculateFinalTotal = () => {
    return total + calculateShipping();
  };

  const handleCheckout = async () => {
    try {
      const shippingCost = calculateShipping();
      const order = await createOrder(items, total, shippingCost);

      alert(
        `Sipariş oluşturuldu! #${
          order.id
        }\nToplam: ₺${order.finalTotal.toLocaleString("tr-TR")}`
      );

      // TODO: Sipariş başarı sayfasına yönlendir
      // navigation.navigate('OrderSuccess', { orderId: order.id });
    } catch (error) {
      alert("Sipariş oluşturulamadı!");
    }
  };

  if (items.length === 0) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
        <View
          style={[
            tw`pt-12 pb-4 px-4`,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[tw`text-2xl font-bold`, { color: theme.colors.onPrimary }]}
          >
            Sepetim
          </Text>
        </View>

        <View style={tw`flex-1 items-center justify-center px-6`}>
          <Text style={tw`text-8xl mb-4`}>🛒</Text>
          <Text
            style={[tw`text-2xl font-bold mb-2`, { color: theme.colors.text }]}
          >
            Sepetiniz Boş
          </Text>
          <Text
            style={[
              tw`text-center mb-6`,
              { color: theme.colors.textSecondary },
            ]}
          >
            Sepetinizde henüz ürün bulunmuyor. Alışverişe başlamak için
            kategorilere göz atın.
          </Text>
          <TouchableOpacity
            style={[
              tw`px-8 py-4 rounded-xl`,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text
              style={[
                tw`font-bold text-base`,
                { color: theme.colors.onPrimary },
              ]}
            >
              Alışverişe Başla
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[tw`pt-12 pb-4 px-4`, { backgroundColor: theme.colors.primary }]}
      >
        <View style={tw`flex-row justify-between items-center`}>
          <Text
            style={[tw`text-2xl font-bold`, { color: theme.colors.onPrimary }]}
          >
            Sepetim
          </Text>
          <View
            style={[
              tw`px-3 py-1 rounded-full`,
              { backgroundColor: theme.colors.card, opacity: 0.2 },
            ]}
          >
            <Text style={[tw`font-bold`, { color: theme.colors.onPrimary }]}>
              {items.length} Ürün
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 110 : 90,
        }}
      >
        {/* Cart Items */}
        <View style={tw`p-4`}>
          {items.map((item) => (
            <View
              key={item.product.id}
              style={[
                tw`rounded-2xl mb-3 overflow-hidden shadow-sm`,
                {
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.shadow,
                },
              ]}
            >
              <View style={tw`flex-row p-3`}>
                {/* Product Image */}
                <Image
                  source={{ uri: item.product.image }}
                  style={[
                    tw`w-24 h-24 rounded-xl`,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                />

                {/* Product Info */}
                <View style={tw`flex-1 ml-3 justify-between`}>
                  <View>
                    <Text
                      style={[
                        tw`font-bold text-base mb-1`,
                        { color: theme.colors.text },
                      ]}
                      numberOfLines={2}
                    >
                      {item.product.name}
                    </Text>
                    <Text
                      style={[
                        tw`font-bold text-lg`,
                        { color: theme.colors.primary },
                      ]}
                    >
                      ₺{item.product.price.toLocaleString("tr-TR")}
                    </Text>
                  </View>

                  {/* Quantity Controls */}
                  <View style={tw`flex-row items-center justify-between`}>
                    <View
                      style={tw`flex-row items-center bg-gray-100 rounded-lg`}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(
                            item.product.id,
                            Math.max(0, item.quantity - 1)
                          )
                        }
                        style={tw`w-8 h-8 items-center justify-center`}
                      >
                        <Text style={tw`text-gray-600 text-lg font-bold`}>
                          −
                        </Text>
                      </TouchableOpacity>
                      <Text style={tw`text-gray-800 font-bold px-3`}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        style={tw`w-8 h-8 items-center justify-center`}
                      >
                        <Text style={tw`text-gray-600 text-lg font-bold`}>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeFromCart(item.product.id)}
                    >
                      <Text style={tw`text-red-500 text-2xl`}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={tw`px-4 pb-6`}>
          <View style={tw`bg-white rounded-2xl p-4 shadow-sm`}>
            <Text style={tw`text-gray-800 font-bold text-lg mb-4`}>
              Sipariş Özeti
            </Text>

            <View style={tw`gap-3 mb-4`}>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-gray-600`}>Ara Toplam</Text>
                <Text style={tw`text-gray-800 font-semibold`}>
                  ₺{total.toLocaleString("tr-TR")}
                </Text>
              </View>

              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-gray-600`}>Kargo</Text>
                {calculateShipping() === 0 ? (
                  <View style={tw`flex-row items-center`}>
                    <Text style={tw`text-green-600 font-semibold mr-1`}>
                      ÜCRETSİZ
                    </Text>
                    <Text style={tw`text-xs`}>🎉</Text>
                  </View>
                ) : (
                  <Text style={tw`text-gray-800 font-semibold`}>
                    ₺{calculateShipping().toFixed(2)}
                  </Text>
                )}
              </View>

              {calculateShipping() > 0 && (
                <View style={tw`bg-blue-50 rounded-lg p-3`}>
                  <Text style={tw`text-blue-700 text-xs`}>
                    ℹ️ ₺500 üzeri alışverişlerde kargo ücretsiz!
                  </Text>
                </View>
              )}

              <View style={tw`border-t border-gray-200 pt-3 mt-1`}>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-gray-800 font-bold text-lg`}>
                    Toplam
                  </Text>
                  <Text style={tw`text-blue-600 font-bold text-2xl`}>
                    ₺{calculateFinalTotal().toLocaleString("tr-TR")}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={tw`bg-blue-600 py-4 rounded-xl`}
              onPress={handleCheckout}
            >
              <Text style={tw`text-white text-center font-bold text-base`}>
                Sipariş Ver
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CartScreen;
