import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import tw from "twrnc";
import { usePaymentStore, useAddressStore, useCartStore } from "../store";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const PaymentInfoScreen: React.FC = () => {
  const { paymentMethods, fetchPaymentMethods, addPaymentMethod } =
    usePaymentStore();
  const { addresses, fetchAddresses } = useAddressStore();
  const { total } = useCartStore();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  // Card form states
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleAddCard = async () => {
    if (
      !cardHolderName.trim() ||
      !cardNumber.trim() ||
      !expiryMonth.trim() ||
      !expiryYear.trim() ||
      !cvv.trim()
    ) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (cvv.length < 3) {
      Alert.alert("Hata", "Lütfen geçerli bir CVV girin.");
      return;
    }

    try {
      await addPaymentMethod({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardHolderName: cardHolderName,
        expiryDate: `${expiryMonth}/${expiryYear}`,
        cardType: "other",
        cvv: cvv,
        isDefault: false,
      });

      Alert.alert("Başarılı", "Kart başarıyla eklendi!");
      setShowAddCard(false);
      setCardHolderName("");
      setCardNumber("");
      setExpiryMonth("");
      setExpiryYear("");
      setCvv("");
    } catch (error) {
      Alert.alert("Hata", "Kart eklenirken bir hata oluştu.");
    }
  };

  const handleContinue = () => {
    if (!selectedPayment) {
      Alert.alert("Hata", "Lütfen ödeme yöntemi seçin.");
      return;
    }
    // Navigate to confirmation screen
    navigation.navigate("OrderConfirm" as never);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (text: string) => {
    // Sadece rakam girişine izin ver
    const cleaned = text.replace(/\D/g, "");

    if (cleaned.length <= 2) {
      setExpiryMonth(cleaned);
      setExpiryYear("");
    } else if (cleaned.length <= 4) {
      setExpiryMonth(cleaned.slice(0, 2));
      setExpiryYear(cleaned.slice(2, 4));
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 3) {
      setCvv(cleaned);
    }
  };

  const handleCardHolderNameChange = (text: string) => {
    // Sadece harf, boşluk ve Türkçe karakterlere izin ver
    const cleaned = text.replace(/[^a-zA-ZçğıöşüÇĞIİÖŞÜ\s]/g, "");
    setCardHolderName(cleaned);
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
            <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>
            Güvenli Ödeme
          </Text>
          <View style={tw`w-6`} />
        </View>

        <View style={tw`flex-row justify-center items-center`}>
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

      <ScrollView style={tw`flex-1 px-4`}>
        {/* Kayıtlı Kartlarım */}
        <View style={tw`mt-6`}>
          <Text
            style={[tw`text-lg font-bold mb-4`, { color: theme.colors.text }]}
          >
            Kayıtlı Kartlarım
          </Text>

          {paymentMethods.map((payment) => (
            <TouchableOpacity
              key={payment.id}
              onPress={() => setSelectedPayment(payment.id)}
              style={[
                tw`p-4 rounded-2xl mb-3 border-2`,
                {
                  backgroundColor: theme.colors.card,
                  borderColor:
                    selectedPayment === payment.id
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
                          selectedPayment === payment.id
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
                        selectedPayment === payment.id
                          ? theme.colors.primary
                          : theme.colors.border,
                      backgroundColor:
                        selectedPayment === payment.id
                          ? theme.colors.primary
                          : "transparent",
                    },
                  ]}
                >
                  {selectedPayment === payment.id && (
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

          {/* Yeni Kart Ekle Button */}
          <TouchableOpacity
            onPress={() => setShowAddCard(!showAddCard)}
            style={[
              tw`p-4 rounded-2xl border-2 border-dashed mb-4`,
              {
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.card,
              },
            ]}
          >
            <View style={tw`flex-row items-center justify-center`}>
              <Text style={[tw`text-lg mr-2`, { color: theme.colors.primary }]}>
                +
              </Text>
              <Text style={[tw`font-bold`, { color: theme.colors.primary }]}>
                Yeni Kart Ekle
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Yeni Kart Ekle Form */}
        {showAddCard && (
          <View style={tw`mt-8`}>
            <Text
              style={[tw`text-lg font-bold mb-4`, { color: theme.colors.text }]}
            >
              Yeni Kart Ekle
            </Text>

            <View style={tw`space-y-4`}>
              <View>
                <Text
                  style={[
                    tw`text-sm font-medium mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Kart Sahibi Adı
                </Text>
                <TextInput
                  value={cardHolderName}
                  onChangeText={handleCardHolderNameChange}
                  placeholder="Ad Soyad"
                  style={[
                    tw`p-4 rounded-2xl border-2`,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />
              </View>

              <View>
                <Text
                  style={[
                    tw`text-sm font-medium mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Kart Numarası
                </Text>
                <View style={tw`relative`}>
                  <TextInput
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    placeholder="XXXX XXXX XXXX XXXX"
                    keyboardType="numeric"
                    maxLength={19}
                    style={[
                      tw`p-4 rounded-2xl border-2 pr-12`,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                      },
                    ]}
                  />
                  <View style={tw`absolute right-4 top-4`}>
                    <Text style={tw`text-orange-500 text-lg`}>💳</Text>
                  </View>
                </View>
              </View>

              {/* Son Kullanma Tarihi ve CVV */}
              <View style={tw`flex-row space-x-4`}>
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`text-sm font-medium mb-2`,
                      { color: theme.colors.text },
                    ]}
                  >
                    Son Kullanma Tarihi
                  </Text>
                  <TextInput
                    value={`${expiryMonth}${
                      expiryYear ? `/${expiryYear}` : ""
                    }`}
                    onChangeText={handleExpiryDateChange}
                    placeholder="AA/YY"
                    keyboardType="numeric"
                    maxLength={5}
                    style={[
                      tw`p-4 rounded-2xl border-2`,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                      },
                    ]}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`text-sm font-medium mb-2`,
                      { color: theme.colors.text },
                    ]}
                  >
                    CVV
                  </Text>
                  <TextInput
                    value={cvv}
                    onChangeText={handleCvvChange}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={3}
                    style={[
                      tw`p-4 rounded-2xl border-2`,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor:
                          cvv.length > 0 && cvv.length < 3
                            ? "#ef4444"
                            : theme.colors.border,
                        color: theme.colors.text,
                      },
                    ]}
                  />
                  {cvv.length > 0 && cvv.length < 3 && (
                    <Text style={tw`text-red-500 text-xs mt-1`}>
                      Lütfen geçerli bir CVV girin.
                    </Text>
                  )}
                </View>
              </View>

              {/* Save Card Checkbox */}
              <TouchableOpacity
                onPress={() => setSaveCard(!saveCard)}
                style={tw`flex-row items-center mt-4`}
              >
                <View
                  style={[
                    tw`w-6 h-6 rounded border-2 items-center justify-center mr-3`,
                    {
                      borderColor: saveCard
                        ? theme.colors.primary
                        : theme.colors.border,
                      backgroundColor: saveCard
                        ? theme.colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {saveCard && (
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
                <Text style={[tw`text-sm`, { color: theme.colors.text }]}>
                  Sonraki alışverişler için kartımı güvenle sakla
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Özet */}
        <View style={tw`mt-8 mb-6`}>
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
                Kargo
              </Text>
              <Text style={[tw`text-base`, { color: theme.colors.primary }]}>
                Ücretsiz
              </Text>
            </View>
            <View style={tw`flex-row justify-between mt-2`}>
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
      </ScrollView>

      <View style={[tw`p-4 pb-8`, { backgroundColor: theme.colors.barColor }]}>
        <TouchableOpacity
          onPress={handleContinue}
          style={[
            tw`py-4 rounded-2xl`,
            { backgroundColor: theme.colors.primary },
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

export default PaymentInfoScreen;
