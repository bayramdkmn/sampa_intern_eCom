import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Modal,
} from "react-native";
import tw from "twrnc";
import {
  useCartStore,
  useOrderStore,
  useAddressStore,
  usePaymentStore,
} from "../store";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store";

const CartScreen: React.FC = () => {
  const { items, total, updateQuantity, removeFromCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { addresses, fetchAddresses } = useAddressStore();
  const { paymentMethods, fetchPaymentMethods } = usePaymentStore();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchAddresses();
    fetchPaymentMethods();
  }, []);

  const calculateFinalTotal = () => {
    return total;
  };

  const handleCheckout = () => {
    navigation.navigate("AddressInfo" as never);
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress || !selectedPaymentMethod) {
      Alert.alert("Hata", "Lütfen adres ve ödeme yöntemi seçin.");
      return;
    }

    Alert.alert(
      "Siparişi Onayla",
      `Toplam: ₺${calculateFinalTotal().toLocaleString(
        "tr-TR"
      )}\n\nBu siparişi onaylamak istediğinizden emin misiniz?`,
      [
        {
          text: "Hayır",
          style: "cancel",
        },
        {
          text: "Evet, Onayla",
          style: "default",
          onPress: async () => {
            try {
              setCheckoutModalVisible(false);

              const order = await createOrder(
                selectedAddress,
                selectedPaymentMethod
              );

              const { clearCart } = useCartStore.getState();
              clearCart();

              Alert.alert(
                "Sipariş Oluşturuldu! 🎉",
                `Sipariş #${
                  order.id
                } başarıyla oluşturuldu!\nToplam: ₺${order.finalTotal.toLocaleString(
                  "tr-TR"
                )}\n\nSepetiniz temizlendi.`,
                [
                  {
                    text: "Tamam",
                    onPress: () => {
                      navigation.navigate("MainTabs", { screen: "Home" });
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert("Hata", "Sipariş oluşturulamadı!");
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View
        style={[
          tw`flex-1 items-center justify-center px-6`,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[tw`text-4xl mb-6`, { color: theme.colors.primary }]}>
          🛒
        </Text>
        <Text
          style={[tw`text-xl font-bold mb-2`, { color: theme.colors.text }]}
        >
          Sepetinize erişmek için giriş yapın
        </Text>
        <Text
          style={[tw`text-center mb-8`, { color: theme.colors.textSecondary }]}
        >
          Sepetteki ürünlerinizi ve siparişlerinizi görüntülemek için giriş
          yapmalısınız.
        </Text>
        <View style={tw`flex-row gap-4`}>
          <TouchableOpacity
            style={[
              tw`flex-1 py-4 rounded-xl mr-2`,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[tw`text-white font-bold text-center`]}>
              Giriş Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`flex-1 py-4 rounded-xl ml-2`,
              {
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => navigation.navigate("Register")}
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
        </View>
      </View>
    );
  }
  if (items.length === 0) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
        <View
          style={[
            tw`pt-16 pb-4 px-4`,
            { backgroundColor: theme.colors.headerBackground },
          ]}
        >
          <View style={tw`flex-row justify-between items-center`}>
            <Text
              style={[tw`text-2xl font-bold`, { color: theme.colors.text }]}
            >
              Sepetim
            </Text>
          </View>
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
            onPress={() => (navigation as any).navigate("Categories")}
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
      <View
        style={[
          tw`pt-12 pb-4 px-4`,
          { backgroundColor: theme.colors.barColor },
        ]}
      >
        <View style={tw`flex-row justify-between items-center py-2`}>
          <Text
            style={[tw`text-2xl font-bold`, { color: theme.colors.buttonText }]}
          >
            Sepetim
          </Text>
          <View
            style={[
              tw`px-3 py-1 rounded-full`,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text style={[tw`font-bold`, { color: theme.colors.text }]}>
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
              <View style={tw`flex-row p-3 gap-2`}>
                <Image
                  source={{ uri: item.product.image }}
                  style={[
                    tw`w-28 h-28 rounded-xl`,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      resizeMode: "stretch",
                    },
                  ]}
                  resizeMode="stretch"
                />

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

                  <View style={tw`flex-row items-center justify-between`}>
                    <View
                      style={[
                        tw`flex-row items-center rounded-lg`,
                        { backgroundColor: theme.colors.surfaceVariant },
                      ]}
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
                        <Text
                          style={[
                            tw`text-lg font-bold`,
                            { color: theme.colors.text },
                          ]}
                        >
                          −
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={[
                          tw`font-bold px-3`,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        style={tw`w-8 h-8 items-center justify-center`}
                      >
                        <Text
                          style={[
                            tw`text-lg font-bold`,
                            { color: theme.colors.text },
                          ]}
                        >
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
        <View style={tw`px-4 pb-6`}>
          <View
            style={[
              tw`bg-white rounded-2xl p-4 shadow-sm`,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text
              style={[
                tw`text-gray-800 font-bold text-lg mb-4`,
                { color: theme.colors.text },
              ]}
            >
              Sipariş Özeti
            </Text>

            <View style={tw`gap-3 mb-4`}>
              <View style={tw`flex-row justify-between`}>
                <Text style={[tw`font-semibold`, { color: theme.colors.text }]}>
                  Ara Toplam
                </Text>
                <Text style={[tw`font-semibold`, { color: theme.colors.text }]}>
                  ₺{total.toLocaleString("tr-TR")}
                </Text>
              </View>

              <View style={tw`flex-row justify-between`}>
                <Text style={[tw``, { color: theme.colors.textSecondary }]}>
                  Kargo
                </Text>
                <View style={tw`flex-row items-center`}>
                  <Text
                    style={[
                      tw`font-semibold mr-1`,
                      { color: theme.colors.primary },
                    ]}
                  >
                    ÜCRETSİZ
                  </Text>
                  <Text style={tw`text-xs`}>🎉</Text>
                </View>
              </View>

              <View
                style={[
                  tw`border-t pt-3 mt-1`,
                  { borderTopColor: theme.colors.divider },
                ]}
              >
                <View style={tw`flex-row justify-between items-center`}>
                  <Text
                    style={[
                      tw`font-bold text-lg`,
                      { color: theme.colors.text },
                    ]}
                  >
                    Toplam
                  </Text>
                  <Text
                    style={[
                      tw`font-bold text-2xl`,
                      { color: theme.colors.primary },
                    ]}
                  >
                    ₺{calculateFinalTotal().toLocaleString("tr-TR")}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                tw`py-4 rounded-xl`,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleCheckout}
            >
              <Text
                style={[
                  tw`text-center font-bold text-base`,
                  { color: theme.colors.onPrimary },
                ]}
              >
                Sipariş Ver
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={checkoutModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}
        >
          <View
            style={[
              tw`pt-16 pb-6 px-6`,
              {
                backgroundColor: theme.colors.barColor,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              },
            ]}
          >
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <TouchableOpacity
                onPress={() => setCheckoutModalVisible(false)}
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center`,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <Text
                  style={[tw`text-xl font-bold`, { color: theme.colors.text }]}
                >
                  ←
                </Text>
              </TouchableOpacity>

              <Text
                style={[tw`text-xl font-bold`, { color: theme.colors.text }]}
              >
                Güvenli Ödeme
              </Text>

              <View style={tw`w-10`} />
            </View>

            <View style={tw`flex-row justify-center items-center mb-6`}>
              <View
                style={[
                  tw`w-3 h-3 rounded-full mr-2`,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
              <View
                style={[
                  tw`w-3 h-3 rounded-full mr-2`,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
              <View
                style={[
                  tw`w-3 h-3 rounded-full`,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            </View>
          </View>

          <ScrollView
            style={tw`flex-1 px-6`}
            showsVerticalScrollIndicator={false}
          >
            {/* Teslimat Adresi Section */}
            <View style={tw`mt-8`}>
              <Text
                style={[
                  tw`text-lg font-bold mb-4`,
                  { color: theme.colors.text },
                ]}
              >
                Teslimat Adresi
              </Text>

              {addresses.map((address, index) => (
                <TouchableOpacity
                  key={address.id}
                  onPress={() => setSelectedAddress(address.id)}
                  style={[
                    tw`p-4 rounded-2xl mb-3 border-2`,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor:
                        selectedAddress === address.id
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                >
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-row items-center flex-1`}>
                      <View
                        style={[
                          tw`w-10 h-10 rounded-xl items-center justify-center mr-3`,
                          {
                            backgroundColor:
                              selectedAddress === address.id
                                ? theme.colors.primary
                                : theme.colors.border,
                          },
                        ]}
                      >
                        <Text style={tw`text-lg`}>🏠</Text>
                      </View>
                      <View style={tw`flex-1`}>
                        <Text
                          style={[
                            tw`font-bold text-base mb-1`,
                            { color: theme.colors.text },
                          ]}
                        >
                          {address.title}
                        </Text>
                        <Text
                          style={[
                            tw`text-sm`,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {address.fullAddress}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        tw`w-6 h-6 rounded-full border-2 items-center justify-center`,
                        {
                          borderColor:
                            selectedAddress === address.id
                              ? theme.colors.primary
                              : theme.colors.border,
                          backgroundColor:
                            selectedAddress === address.id
                              ? theme.colors.primary
                              : "transparent",
                        },
                      ]}
                    >
                      {selectedAddress === address.id && (
                        <Text
                          style={[
                            tw`text-xs font-bold`,
                            { color: theme.colors.buttonText },
                          ]}
                        >
                          ✓
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={tw`mt-8`}>
              <Text
                style={[
                  tw`text-lg font-bold mb-4`,
                  { color: theme.colors.text },
                ]}
              >
                Ödeme Yöntemi
              </Text>

              {paymentMethods.map((payment, index) => (
                <TouchableOpacity
                  key={payment.id}
                  onPress={() => setSelectedPaymentMethod(payment.id)}
                  style={[
                    tw`p-4 rounded-2xl mb-3 border-2`,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor:
                        selectedPaymentMethod === payment.id
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                >
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-row items-center flex-1`}>
                      <View
                        style={[
                          tw`w-10 h-10 rounded-xl items-center justify-center mr-3`,
                          {
                            backgroundColor:
                              selectedPaymentMethod === payment.id
                                ? theme.colors.primary
                                : theme.colors.border,
                          },
                        ]}
                      >
                        <Text style={tw`text-lg`}>💳</Text>
                      </View>
                      <View style={tw`flex-1`}>
                        <Text
                          style={[
                            tw`font-bold text-base mb-1`,
                            { color: theme.colors.text },
                          ]}
                        >
                          {payment.cardType} •••• {payment.cardNumber.slice(-4)}
                        </Text>
                        <Text
                          style={[
                            tw`text-sm`,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {payment.cardHolderName}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        tw`w-6 h-6 rounded-full border-2 items-center justify-center`,
                        {
                          borderColor:
                            selectedPaymentMethod === payment.id
                              ? theme.colors.primary
                              : theme.colors.border,
                          backgroundColor:
                            selectedPaymentMethod === payment.id
                              ? theme.colors.primary
                              : "transparent",
                        },
                      ]}
                    >
                      {selectedPaymentMethod === payment.id && (
                        <Text
                          style={[
                            tw`text-xs font-bold`,
                            { color: theme.colors.buttonText },
                          ]}
                        >
                          ✓
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sipariş Özeti Section */}
            <View style={tw`mt-8 mb-6`}>
              <Text
                style={[
                  tw`text-lg font-bold mb-4`,
                  { color: theme.colors.text },
                ]}
              >
                Sipariş Özeti
              </Text>

              <View
                style={[
                  tw`p-6 rounded-2xl`,
                  {
                    backgroundColor: theme.colors.card,
                  },
                ]}
              >
                <View style={tw`mb-4`}>
                  <Text
                    style={[
                      tw`font-semibold mb-3`,
                      { color: theme.colors.text },
                    ]}
                  >
                    Ürünler ({items.length})
                  </Text>
                  {items.slice(0, 3).map((item) => (
                    <View
                      key={item.product.id}
                      style={tw`flex-row justify-between items-center mb-2`}
                    >
                      <Text
                        style={[
                          tw`text-sm flex-1`,
                          { color: theme.colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {item.product.name} x{item.quantity}
                      </Text>
                      <Text
                        key={`price-${item.product.id}`}
                        style={[
                          tw`text-sm font-semibold`,
                          { color: theme.colors.text },
                        ]}
                      >
                        ₺
                        {(item.product.price * item.quantity).toLocaleString(
                          "tr-TR"
                        )}
                      </Text>
                    </View>
                  ))}
                  {items.length > 3 && (
                    <Text
                      style={[
                        tw`text-xs text-center mt-2`,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      +{items.length - 3} ürün daha...
                    </Text>
                  )}
                </View>

                <View style={tw`border-t border-gray-200 pt-4`}>
                  <View style={tw`flex-row justify-between mb-3`}>
                    <Text
                      style={[
                        tw`text-sm`,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Ara Toplam
                    </Text>
                    <Text
                      style={[
                        tw`text-sm font-semibold`,
                        { color: theme.colors.text },
                      ]}
                    >
                      ₺{total.toLocaleString("tr-TR")}
                    </Text>
                  </View>

                  <View style={tw`flex-row justify-between mb-3`}>
                    <Text
                      style={[
                        tw`text-sm`,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Kargo Ücreti
                    </Text>
                    <Text
                      style={[
                        tw`text-sm font-semibold`,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Ücretsiz
                    </Text>
                  </View>

                  <View
                    style={[
                      tw`border-t pt-3 mt-2`,
                      { borderTopColor: theme.colors.border },
                    ]}
                  >
                    <View style={tw`flex-row justify-between items-center`}>
                      <Text
                        style={[
                          tw`text-lg font-bold`,
                          { color: theme.colors.text },
                        ]}
                      >
                        Toplam
                      </Text>
                      <Text
                        style={[
                          tw`text-xl font-bold`,
                          { color: theme.colors.primary },
                        ]}
                      >
                        ₺{calculateFinalTotal().toLocaleString("tr-TR")}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Modern Onay Butonu */}
          <View style={[tw`p-6`, { backgroundColor: theme.colors.barColor }]}>
            <TouchableOpacity
              onPress={handleConfirmOrder}
              disabled={!selectedAddress || !selectedPaymentMethod}
              style={[
                tw`py-4 rounded-2xl flex-row items-center justify-center`,
                {
                  backgroundColor:
                    !selectedAddress || !selectedPaymentMethod
                      ? theme.colors.border
                      : theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-center font-bold text-lg`,
                  {
                    color:
                      !selectedAddress || !selectedPaymentMethod
                        ? theme.colors.textSecondary
                        : theme.colors.buttonText,
                  },
                ]}
              >
                {!selectedAddress || !selectedPaymentMethod
                  ? "Adres ve Ödeme Seçin"
                  : `₺${calculateFinalTotal().toLocaleString(
                      "tr-TR"
                    )} Ödemeyi Tamamla`}
              </Text>
            </TouchableOpacity>

            {(!selectedAddress || !selectedPaymentMethod) && (
              <Text
                style={[
                  tw`text-center text-sm mt-2`,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Lütfen adres ve ödeme yöntemi seçin
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CartScreen;
