import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import tw from "twrnc";
import { PaymentMethodFormProps } from "../types";

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted;
  };

  const detectCardType = (
    number: string
  ): "visa" | "mastercard" | "amex" | "other" => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "visa";
    if (cleaned.startsWith("5")) return "mastercard";
    if (cleaned.startsWith("3")) return "amex";
    return "other";
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    if (cleaned.length <= 16) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const handleExpiryDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 4) {
      setExpiryDate(formatExpiryDate(cleaned));
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 4) {
      setCvv(cleaned);
    }
  };

  const handleSubmit = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 13) {
      alert("Lütfen geçerli bir kart numarası girin");
      return;
    }
    if (!cardHolderName) {
      alert("Lütfen kart sahibi adını girin");
      return;
    }
    if (!expiryDate || expiryDate.length < 5) {
      alert("Lütfen geçerli bir son kullanma tarihi girin");
      return;
    }
    if (!cvv || cvv.length < 3) {
      alert("Lütfen geçerli bir CVV girin");
      return;
    }

    const cleaned = cardNumber.replace(/\s/g, "");
    const last4 = cleaned.slice(-4);
    const maskedCardNumber = `**** **** **** ${last4}`;

    onSubmit({
      cardNumber: maskedCardNumber,
      cardHolderName: cardHolderName.toUpperCase(),
      expiryDate,
      cardType: detectCardType(cardNumber),
      isDefault,
    });
  };

  const getPreviewColor = () => {
    const cardType = detectCardType(cardNumber);
    switch (cardType) {
      case "visa":
        return "bg-blue-600";
      case "mastercard":
        return "bg-orange-600";
      case "amex":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1`}
    >
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-6`}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`flex-row items-center justify-between mb-6`}>
          <Text style={tw`text-gray-800 text-xl font-bold`}>
            Yeni Kart Ekle
          </Text>
          <TouchableOpacity onPress={onCancel}>
            <Text style={tw`text-gray-400 text-2xl`}>✕</Text>
          </TouchableOpacity>
        </View>

        <View
          style={tw`${getPreviewColor()} rounded-2xl p-5 mb-8 shadow-lg min-h-48`}
        >
          <View style={tw`flex-row justify-between items-start mb-8`}>
            <Text style={tw`text-white text-2xl`}>💳</Text>
            <Text style={tw`text-white text-xs opacity-80`}>
              {detectCardType(cardNumber).toUpperCase() || "KART"}
            </Text>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-white text-xs opacity-80 mb-1`}>
              Kart Numarası
            </Text>
            <Text style={tw`text-white font-mono text-xl tracking-wider`}>
              {cardNumber || "**** **** **** ****"}
            </Text>
          </View>

          <View style={tw`flex-row justify-between items-end`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-white text-xs opacity-80 mb-1`}>
                Kart Sahibi
              </Text>
              <Text style={tw`text-white font-semibold text-sm`}>
                {cardHolderName.toUpperCase() || "AD SOYAD"}
              </Text>
            </View>
            <View>
              <Text style={tw`text-white text-xs opacity-80 mb-1`}>
                Son Kullanma
              </Text>
              <Text style={tw`text-white font-semibold text-sm`}>
                {expiryDate || "MM/YY"}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-700 font-semibold mb-2`}>
            Kart Numarası
          </Text>
          <TextInput
            style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 font-mono`}
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            placeholderTextColor="#9CA3AF"
            maxLength={19}
          />
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-700 font-semibold mb-2`}>
            Kart Üzerindeki İsim
          </Text>
          <TextInput
            style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
            value={cardHolderName}
            onChangeText={setCardHolderName}
            placeholder="AD SOYAD"
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={tw`flex-row gap-3 mb-4`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-gray-700 font-semibold mb-2`}>
              Son Kullanma Tarihi
            </Text>
            <TextInput
              style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 font-mono`}
              value={expiryDate}
              onChangeText={handleExpiryDateChange}
              placeholder="MM/YY"
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
              maxLength={5}
            />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-gray-700 font-semibold mb-2`}>CVV</Text>
            <TextInput
              style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 font-mono`}
              value={cvv}
              onChangeText={handleCvvChange}
              placeholder="123"
              keyboardType="number-pad"
              secureTextEntry
              placeholderTextColor="#9CA3AF"
              maxLength={4}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsDefault(!isDefault)}
          style={tw`flex-row items-center mb-6`}
        >
          <View
            style={tw`w-6 h-6 rounded-md border-2 ${
              isDefault ? "bg-blue-600 border-blue-600" : "border-gray-300"
            } items-center justify-center mr-3`}
          >
            {isDefault && <Text style={tw`text-white text-xs`}>✓</Text>}
          </View>
          <Text style={tw`text-gray-700 font-medium`}>
            Varsayılan ödeme yöntemi olarak ayarla
          </Text>
        </TouchableOpacity>

        <View style={tw`bg-blue-50 rounded-xl p-4 mb-6`}>
          <View style={tw`flex-row items-start`}>
            <Text style={tw`text-xl mr-3`}>🔒</Text>
            <View style={tw`flex-1`}>
              <Text style={tw`text-blue-800 font-semibold mb-1`}>
                Güvenli Ödeme
              </Text>
              <Text style={tw`text-blue-600 text-sm`}>
                Kart bilgileriniz 256-bit SSL şifrelemesi ile korunmaktadır.
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`flex-row gap-3 pb-6`}>
          <TouchableOpacity
            onPress={onCancel}
            style={tw`flex-1 bg-gray-200 py-4 rounded-xl`}
          >
            <Text style={tw`text-gray-700 font-bold text-center text-base`}>
              İptal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            style={tw`flex-1 bg-blue-600 py-4 rounded-xl`}
          >
            <Text style={tw`text-white font-bold text-center text-base`}>
              Kartı Ekle
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PaymentMethodForm;
