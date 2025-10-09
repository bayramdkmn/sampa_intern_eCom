import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import tw from "twrnc";
import { User } from "../types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import {
  useFavoriteStore,
  useAddressStore,
  usePaymentStore,
  useAuthStore,
} from "../store";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const USER: User = {
  id: "1",
  name: "Ahmet Yılmaz",
  email: "ahmet.yilmaz@example.com",
  phone: "+90 555 123 45 67",
  avatar: "https://via.placeholder.com/150",
};

const SETTINGS_ITEMS = [
  { id: "1", icon: "🔔", title: "Bildirimler" },
  { id: "2", icon: "🌙", title: "Karanlık Mod" },
  { id: "3", icon: "🌍", title: "Dil Seçimi" },
  { id: "4", icon: "🔒", title: "Gizlilik ve Güvenlik" },
  { id: "5", icon: "❓", title: "Yardım ve Destek" },
  { id: "6", icon: "📄", title: "Kullanım Koşulları" },
];

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { favorites } = useFavoriteStore();
  const { addresses } = useAddressStore();
  const { paymentMethods } = usePaymentStore();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  // Fallback to mock user if not authenticated
  const currentUser = user || USER;

  // Profile Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedEmail, setEditedEmail] = useState(currentUser.email);
  const [editedPhone, setEditedPhone] = useState(currentUser.phone || "");

  const MENU_ITEMS = [
    {
      id: "1",
      icon: "📦",
      title: "Siparişlerim",
      description: "Geçmiş siparişlerinizi görüntüleyin",
      badge: "3",
    },
    {
      id: "2",
      icon: "❤️",
      title: "Favorilerim",
      description: "Beğendiğiniz ürünler",
      badge: favorites.length > 0 ? favorites.length.toString() : undefined,
    },
    {
      id: "3",
      icon: "📍",
      title: "Adreslerim",
      description: "Teslimat adreslerinizi yönetin",
      badge: addresses.length > 0 ? addresses.length.toString() : undefined,
    },
    {
      id: "4",
      icon: "💳",
      title: "Ödeme Yöntemlerim",
      description: "Kayıtlı kartlarınız",
      badge:
        paymentMethods.length > 0
          ? paymentMethods.length.toString()
          : undefined,
    },
  ];

  const handleMenuPress = (itemId: string) => {
    if (itemId === "1") {
      // Siparişlerim
      navigation.navigate("Orders");
    } else if (itemId === "2") {
      // Favorilerim
      navigation.navigate("Favorites");
    } else if (itemId === "3") {
      // Adreslerim
      navigation.navigate("Addresses");
    } else if (itemId === "4") {
      // Ödeme Yöntemlerim
      navigation.navigate("PaymentMethods");
    } else {
      alert(`${itemId} menüsüne tıklandı`);
    }
  };

  const handleSettingsPress = (itemId: string) => {
    const settingsItems: { [key: string]: string } = {
      "1": "Bildirimler",
      "2": "Karanlık Mod",
      "3": "Dil Seçimi",
      "4": "Gizlilik ve Güvenlik",
      "5": "Yardım ve Destek",
      "6": "Kullanım Koşulları",
    };

    const itemName = settingsItems[itemId];
    alert(`${itemName} ayarı yakında eklenecek`);
  };

  const handleEditPress = () => {
    setEditedName(currentUser.name);
    setEditedEmail(currentUser.email);
    setEditedPhone(currentUser.phone || "");
    setModalVisible(true);
  };

  const handleSave = () => {
    if (isAuthenticated && updateUser) {
      updateUser({
        name: editedName,
        email: editedEmail,
        phone: editedPhone,
      });
    }
    setModalVisible(false);
    alert("Profil bilgileriniz güncellendi!");
  };

  const handleLogout = () => {
    const { logout } = useAuthStore.getState();
    logout();
    alert("Çıkış yapıldı!");
  };

  return (
    <>
      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`flex-1`}
        >
          <View style={tw`flex-1 justify-end bg-black/50`}>
            <View
              style={tw`bg-white rounded-t-3xl p-6 ${
                Platform.OS === "ios" ? "pb-10" : "pb-6"
              }`}
            >
              {/* Header */}
              <View style={tw`flex-row items-center justify-between mb-6`}>
                <Text style={tw`text-gray-800 text-xl font-bold`}>
                  Profili Düzenle
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={tw`text-gray-400 text-2xl`}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={tw`mb-4`}>
                <Text style={tw`text-gray-700 font-semibold mb-2`}>
                  Ad Soyad
                </Text>
                <TextInput
                  style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Ad Soyad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={tw`mb-4`}>
                <Text style={tw`text-gray-700 font-semibold mb-2`}>
                  E-posta
                </Text>
                <TextInput
                  style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                  placeholder="E-posta"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-700 font-semibold mb-2`}>
                  Telefon
                </Text>
                <TextInput
                  style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
                  value={editedPhone}
                  onChangeText={setEditedPhone}
                  placeholder="Telefon"
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Action Buttons */}
              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={tw`flex-1 bg-gray-200 py-4 rounded-xl`}
                >
                  <Text
                    style={tw`text-gray-700 font-bold text-center text-base`}
                  >
                    İptal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={tw`flex-1 bg-blue-600 py-4 rounded-xl`}
                >
                  <Text style={tw`text-white font-bold text-center text-base`}>
                    Kaydet
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView
        style={tw`flex-1 bg-gray-50`}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 110 : 90,
        }}
      >
        {/* Header */}
        <View style={tw`bg-blue-600 pt-12 pb-8 px-4`}>
          <Text style={tw`text-white text-2xl font-bold mb-6`}>Profilim</Text>

          {isAuthenticated ? (
            // Authenticated User Info Card
            <View style={tw`bg-white/10 rounded-2xl p-4 flex-row items-center`}>
              <Image
                source={{ uri: currentUser.avatar }}
                style={tw`w-20 h-20 rounded-full bg-white/20 mr-4`}
              />
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-xl font-bold mb-1`}>
                  {currentUser.name}
                </Text>
                <Text style={tw`text-blue-100 text-sm mb-1`}>
                  {currentUser.email}
                </Text>
                {currentUser.phone && (
                  <Text style={tw`text-blue-100 text-sm`}>
                    {currentUser.phone}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={handleEditPress}>
                <Text style={tw`text-white text-2xl`}>✏️</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Guest User - Login/Register Card
            <View style={tw`bg-white/10 rounded-2xl p-6`}>
              <View style={tw`items-center mb-4`}>
                <Text style={tw`text-white text-lg font-bold mb-2`}>
                  Hesabınıza Giriş Yapın
                </Text>
                <Text style={tw`text-blue-100 text-center text-sm`}>
                  Siparişlerinizi takip edin ve özel fırsatlardan yararlanın
                </Text>
              </View>
              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  style={tw`flex-1 bg-white py-3 rounded-xl`}
                >
                  <Text style={tw`text-blue-600 font-bold text-center`}>
                    Giriş Yap
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                  style={tw`flex-1 bg-white/20 py-3 rounded-xl`}
                >
                  <Text style={tw`text-white font-bold text-center`}>
                    Kayıt Ol
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View style={tw`px-4 -mt-6 mb-4`}>
          <View style={tw`bg-white rounded-2xl shadow-md p-4 flex-row`}>
            <View style={tw`flex-1 items-center border-r border-gray-200`}>
              <Text style={tw`text-blue-600 text-2xl font-bold mb-1`}>12</Text>
              <Text style={tw`text-gray-500 text-xs`}>Sipariş</Text>
            </View>
            <View style={tw`flex-1 items-center border-r border-gray-200`}>
              <Text style={tw`text-blue-600 text-2xl font-bold mb-1`}>8</Text>
              <Text style={tw`text-gray-500 text-xs`}>Beklemede</Text>
            </View>
            <View style={tw`flex-1 items-center`}>
              <Text style={tw`text-blue-600 text-2xl font-bold mb-1`}>4</Text>
              <Text style={tw`text-gray-500 text-xs`}>Teslim Edildi</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={tw`px-4 mb-4`}>
          <Text style={tw`text-gray-800 font-bold text-lg mb-3`}>Hesabım</Text>
          <View style={tw`bg-white rounded-2xl overflow-hidden shadow-sm`}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleMenuPress(item.id)}
                style={[
                  tw`p-4 flex-row items-center`,
                  index < MENU_ITEMS.length - 1 && tw`border-b border-gray-100`,
                ]}
              >
                <View
                  style={tw`w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3`}
                >
                  <Text style={tw`text-2xl`}>{item.icon}</Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-800 font-semibold text-base`}>
                    {item.title}
                  </Text>
                  <Text style={tw`text-gray-500 text-sm`}>
                    {item.description}
                  </Text>
                </View>
                {item.badge && (
                  <View
                    style={tw`bg-red-500 rounded-full w-6 h-6 items-center justify-center mr-2`}
                  >
                    <Text style={tw`text-white font-bold text-xs`}>
                      {item.badge}
                    </Text>
                  </View>
                )}
                <Text style={tw`text-gray-400 text-xl`}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={tw`px-4 mb-4`}>
          <Text style={tw`text-gray-800 font-bold text-lg mb-3`}>Ayarlar</Text>
          <View style={tw`bg-white rounded-2xl overflow-hidden shadow-sm`}>
            {SETTINGS_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSettingsPress(item.id)}
                style={[
                  tw`p-4 flex-row items-center justify-between`,
                  index < SETTINGS_ITEMS.length - 1 &&
                    tw`border-b border-gray-100`,
                ]}
              >
                <View style={tw`flex-row items-center flex-1`}>
                  <Text style={tw`text-2xl mr-3`}>{item.icon}</Text>
                  <Text style={tw`text-gray-800 font-semibold`}>
                    {item.title}
                  </Text>
                </View>
                <Text style={tw`text-gray-400 text-xl`}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button - Only for authenticated users */}
        {isAuthenticated && (
          <View style={tw`px-4 pb-8`}>
            <TouchableOpacity
              onPress={handleLogout}
              style={tw`bg-white border-2 border-red-500 py-4 rounded-xl flex-row items-center justify-center`}
            >
              <Text style={tw`text-2xl mr-2`}>🚪</Text>
              <Text style={tw`text-red-500 font-bold text-base`}>
                Çıkış Yap
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Version */}
        <View style={tw`items-center pb-6`}>
          <Text style={tw`text-gray-400 text-sm`}>Sampa Shop v1.0.0</Text>
        </View>
      </ScrollView>
    </>
  );
};

export default ProfileScreen;
