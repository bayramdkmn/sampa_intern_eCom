import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { usePaymentStore } from "../store";
import { useTheme } from "../context/ThemeContext";
import PaymentMethodCard from "../components/PaymentMethodCard";
import PaymentMethodForm from "../components/PaymentMethodForm";
import { PaymentMethod } from "../types";

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    paymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    fetchPaymentMethods,
    isLoading,
  } = usePaymentStore();
  const { theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);

  // Ekran yüklendiğinde ödeme yöntemlerini çek
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const handleAddPaymentMethod = (paymentMethod: Omit<PaymentMethod, "id">) => {
    addPaymentMethod(paymentMethod);
    setModalVisible(false);
  };

  const handleDeletePaymentMethod = (id: string) => {
    deletePaymentMethod(id);
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setDefaultPaymentMethod(id);
  };

  return (
    <>
      {/* Add Payment Method Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 bg-black/50`}>
          <View
            style={tw`flex-1 bg-white rounded-t-3xl mt-20 ${
              Platform.OS === "ios" ? "pb-10" : "pb-6"
            }`}
          >
            <PaymentMethodForm
              onSubmit={handleAddPaymentMethod}
              onCancel={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View
          style={[
            tw`pt-12 pb-6 px-4`,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <View style={tw`flex-row items-center mb-2`}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={tw`mr-4`}
            >
              <Text style={[tw`text-2xl`, { color: theme.colors.onPrimary }]}>
                ←
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                tw`text-2xl font-bold flex-1`,
                { color: theme.colors.onPrimary },
              ]}
            >
              Ödeme Yöntemlerim
            </Text>
          </View>
          <Text style={tw`text-blue-100 text-sm ml-12`}>
            Kayıtlı kartlarınızı yönetin
          </Text>
        </View>

        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: Platform.OS === "ios" ? 110 : 90,
          }}
        >
          {isLoading ? (
            // Loading State
            <View style={tw`items-center justify-center py-16`}>
              <Text style={tw`text-4xl mb-4`}>⏳</Text>
              <Text style={tw`text-gray-600 text-lg font-semibold`}>
                Ödeme yöntemleri yükleniyor...
              </Text>
            </View>
          ) : paymentMethods.length === 0 ? (
            // Boş State
            <View style={tw`items-center justify-center py-16`}>
              <Text style={tw`text-6xl mb-4`}>💳</Text>
              <Text style={tw`text-gray-800 text-xl font-bold mb-2`}>
                Henüz Kart Eklenmemiş
              </Text>
              <Text style={tw`text-gray-500 text-center mb-6 px-8`}>
                Hızlı ve güvenli alışveriş için kredi kartınızı ekleyin
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={tw`bg-blue-600 px-8 py-3 rounded-xl`}
              >
                <Text style={tw`text-white font-bold text-base`}>
                  İlk Kartı Ekle
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Kart Listesi
            <>
              {paymentMethods.map((paymentMethod) => (
                <PaymentMethodCard
                  key={paymentMethod.id}
                  paymentMethod={paymentMethod}
                  onDelete={handleDeletePaymentMethod}
                  onSetDefault={handleSetDefaultPaymentMethod}
                />
              ))}

              {/* Yeni Kart Ekle Butonu */}
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={tw`bg-white border-2 border-dashed border-blue-400 rounded-2xl p-6 items-center justify-center mt-2`}
              >
                <Text style={tw`text-4xl mb-2`}>+</Text>
                <Text style={tw`text-blue-600 font-bold text-base`}>
                  Yeni Kart Ekle
                </Text>
                <Text style={tw`text-gray-500 text-sm mt-1`}>
                  Başka bir ödeme yöntemi ekleyin
                </Text>
              </TouchableOpacity>

              {/* Bilgilendirme */}
              <View style={tw`bg-yellow-50 rounded-xl p-4 mt-6`}>
                <View style={tw`flex-row items-start`}>
                  <Text style={tw`text-xl mr-3`}>ℹ️</Text>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-yellow-800 font-semibold mb-1`}>
                      Güvenlik İpucu
                    </Text>
                    <Text style={tw`text-yellow-700 text-sm`}>
                      Kart bilgileriniz şifrelenmiş olarak saklanır ve üçüncü
                      kişilerle paylaşılmaz.
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Sabit Alt Buton (Kart varsa) */}
        {paymentMethods.length > 0 && (
          <View
            style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 ${
              Platform.OS === "ios" ? "pb-8 pt-4" : "py-4"
            }`}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={tw`bg-blue-600 py-4 rounded-xl flex-row items-center justify-center`}
            >
              <Text style={tw`text-white text-xl mr-2`}>+</Text>
              <Text style={tw`text-white font-bold text-base`}>
                Yeni Kart Ekle
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

export default PaymentMethodsScreen;
