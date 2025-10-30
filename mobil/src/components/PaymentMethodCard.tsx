import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import { PaymentMethodCardProps } from "../types";
import { useTheme } from "../context/ThemeContext";

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onDelete,
  onSetDefault,
}) => {
  const { theme } = useTheme();
  const handleDelete = () => {
    Alert.alert(
      "Kartı Sil",
      "Bu ödeme yöntemini silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => onDelete(paymentMethod.id),
        },
      ]
    );
  };

  const getCardColor = () => {
    switch (paymentMethod.cardType) {
      case "visa":
        return theme.mode === "dark" ? "bg-neutral-800" : "bg-blue-500";
      case "mastercard":
        return "bg-orange-600";
      case "amex":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  const getCardTypeName = () => {
    switch (paymentMethod.cardType) {
      case "visa":
        return "VISA";
      case "mastercard":
        return "MASTERCARD";
      case "amex":
        return "AMERICAN EXPRESS";
      default:
        return "KART";
    }
  };

  return (
    <View style={tw`mb-4`}>
      <View style={tw`${getCardColor()} rounded-2xl p-5 shadow-lg`}>
        <View style={tw`flex-row justify-between items-start mb-8`}>
          <View>
            <Text style={tw`text-white text-xs opacity-80 mb-1`}>
              Kart Türü
            </Text>
            <Text style={tw`text-white font-bold text-base`}>
              {getCardTypeName()}
            </Text>
          </View>
          {paymentMethod.isDefault && (
            <View style={tw`bg-white/20 px-3 py-1 rounded-full`}>
              <Text style={tw`text-white text-xs font-semibold`}>
                Varsayılan
              </Text>
            </View>
          )}
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-white text-xs opacity-80 mb-1`}>
            Kart Numarası
          </Text>
          <Text style={tw`text-white font-mono text-xl tracking-wider`}>
            {paymentMethod.cardNumber}
          </Text>
        </View>

        <View style={tw`flex-row justify-between items-end`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-white text-xs opacity-80 mb-1`}>
              Kart Sahibi
            </Text>
            <Text style={tw`text-white font-semibold text-sm`}>
              {paymentMethod.cardHolderName}
            </Text>
          </View>
          <View>
            <Text style={tw`text-white text-xs opacity-80 mb-1`}>
              Son Kullanma
            </Text>
            <Text style={tw`text-white font-semibold text-sm`}>
              {paymentMethod.expiryDate}
            </Text>
          </View>
        </View>
      </View>

      {/* Aksiyon Butonları */}
      <View style={tw`flex-row gap-3 mt-3`}>
        {!paymentMethod.isDefault && (
          <TouchableOpacity
            onPress={() => onSetDefault(paymentMethod.id)}
            style={tw`flex-1 bg-blue-50 py-3 rounded-xl flex-row items-center justify-center`}
          >
            <Text style={tw`text-blue-600 font-semibold text-sm mr-1`}>⭐</Text>
            <Text style={tw`text-blue-600 font-semibold text-sm`}>
              Varsayılan Yap
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleDelete}
          style={tw`${
            paymentMethod.isDefault ? "flex-1" : "flex-1"
          } bg-red-50 py-3 rounded-xl flex-row items-center justify-center`}
        >
          <Text style={tw`text-red-600 font-semibold text-sm mr-1`}>🗑️</Text>
          <Text style={tw`text-red-600 font-semibold text-sm`}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentMethodCard;
