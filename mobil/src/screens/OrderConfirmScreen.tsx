import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import tw from "twrnc";
import { useCartStore, useOrderStore } from "../store";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const OrderConfirmScreen: React.FC = () => {
  const { items, total, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [agreementChecked, setAgreementChecked] = useState(false);

  const handleCompletePayment = async () => {
    if (!agreementChecked) {
      Alert.alert("Hata", "Lütfen sözleşmeyi onaylayın.");
      return;
    }

    try {
      await useCartStore.getState().syncCartToBackend();

      const order = await createOrder("default-address-id");

      Alert.alert(
        "Sipariş Oluşturuldu! 🎉",
        `Sipariş #${order.id} başarıyla oluşturuldu!`,
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
      console.error("Sipariş oluşturma hatası:", error);
      Alert.alert("Hata", "Sipariş oluşturulamadı!");
    }
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          tw`pt-12 pb-4 px-4`,
          { backgroundColor: theme.colors.barColor },
        ]}
      >
        <View style={tw`flex-row items-center justify-between my-4`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text
              style={[
                tw`text-xl font-bold`,
                { color: theme.colors.buttonText },
              ]}
            >
              ←
            </Text>
          </TouchableOpacity>
          <Text
            style={[tw`text-xl font-bold`, { color: theme.colors.buttonText }]}
          >
            Siparişi Onayla
          </Text>
          <View style={tw`w-6`} />
        </View>
      </View>

      <ScrollView style={tw`flex-1 px-4`}>
        <View style={tw`mt-6`}>
          <View
            style={[
              tw`p-4 rounded-2xl`,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center flex-1`}>
                <View
                  style={[
                    tw`w-10 h-10 rounded-xl items-center justify-center mr-3`,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={tw`text-lg`}>📍</Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`font-bold text-base mb-1`,
                      { color: theme.colors.text },
                    ]}
                  >
                    Ev Adresi, Cadde, Sokak No, İlçe/İl
                  </Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text
                  style={[
                    tw`text-sm font-bold`,
                    { color: theme.colors.primary },
                  ]}
                >
                  Değiştir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={tw`mt-4`}>
          <View
            style={[
              tw`p-4 rounded-2xl`,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center flex-1`}>
                <View
                  style={[
                    tw`w-10 h-10 rounded-xl items-center justify-center mr-3`,
                    { backgroundColor: theme.colors.primary },
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
                    Visa **** 1234
                  </Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text
                  style={[
                    tw`text-sm font-bold`,
                    { color: theme.colors.primary },
                  ]}
                >
                  Değiştir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={tw`mt-6`}>
          <Text
            style={[tw`text-lg font-bold mb-4`, { color: theme.colors.text }]}
          >
            Sipariş Özeti
          </Text>

          {items.map((item) => (
            <View
              key={item.product.id}
              style={[
                tw`p-4 rounded-2xl mb-3`,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={tw`flex-row items-center gap-4`}>
                <Image
                  source={{ uri: item.product.image }}
                  style={[tw`w-20 h-20 rounded-xl`]}
                  resizeMode="stretch"
                />
                <View style={tw`flex-1`}>
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
                    style={[tw`text-sm`, { color: theme.colors.textSecondary }]}
                  >
                    {item.quantity} Adet
                  </Text>
                </View>
                <Text
                  style={[
                    tw`font-bold text-base`,
                    { color: theme.colors.text },
                  ]}
                >
                  ₺
                  {(item.product.price * item.quantity).toLocaleString("tr-TR")}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Özet */}
        <View style={tw`mt-6 mb-6`}>
          <View
            style={[
              tw`p-4 rounded-2xl`,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={tw`space-y-2`}>
              <View style={tw`flex-row justify-between`}>
                <Text style={[tw`text-base`, { color: theme.colors.text }]}>
                  Ara Toplam
                </Text>
                <Text style={[tw`text-base`, { color: theme.colors.text }]}>
                  ₺{total.toLocaleString("tr-TR")}
                </Text>
              </View>
              <View style={tw`flex-row justify-between`}>
                <Text style={[tw`text-base`, { color: theme.colors.text }]}>
                  Kargo Ücreti
                </Text>
                <Text style={[tw`text-base`, { color: theme.colors.primary }]}>
                  Ücretsiz
                </Text>
              </View>
              <View style={tw`flex-row justify-between mt-2 pt-2 border-t`}>
                <Text
                  style={[tw`text-lg font-bold`, { color: theme.colors.text }]}
                >
                  Toplam
                </Text>
                <Text
                  style={[tw`text-lg font-bold`, { color: theme.colors.text }]}
                >
                  ₺{total.toLocaleString("tr-TR")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sözleşme */}
        <View style={tw`mb-6`}>
          <TouchableOpacity
            onPress={() => setAgreementChecked(!agreementChecked)}
            style={tw`flex-row items-start`}
          >
            <View
              style={[
                tw`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-1`,
                {
                  borderColor: agreementChecked
                    ? theme.colors.primary
                    : theme.colors.border,
                  backgroundColor: agreementChecked
                    ? theme.colors.primary
                    : "transparent",
                },
              ]}
            >
              {agreementChecked && (
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
            <Text style={[tw`text-sm leading-5`, { color: theme.colors.text }]}>
              Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ni okudum,
              onaylıyorum.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[tw`p-4 pb-8`, { backgroundColor: theme.colors.barColor }]}>
        <TouchableOpacity
          onPress={handleCompletePayment}
          style={[
            tw`py-4 rounded-2xl`,
            {
              backgroundColor: theme.mode === "light" ? "#3B82F6" : "#232323",
            },
          ]}
        >
          <Text
            style={[
              tw`text-center font-bold text-lg`,
              { color: theme.colors.buttonText },
            ]}
          >
            ₺{total.toLocaleString("tr-TR")} Ödemeyi Tamamla
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderConfirmScreen;
