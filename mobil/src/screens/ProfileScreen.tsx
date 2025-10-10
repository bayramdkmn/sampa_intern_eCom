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
import { useTheme } from "../context/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const USER: User = {
  id: "1",
  name: "Bayram Dikmen",
  email: "bayramdikmenn@gmail.com",
  phone: "+90 555 123 45 67",
  avatar: "https://via.placeholder.com/150",
};

const SETTINGS_ITEMS = [
  { id: "1", icon: "🔔", title: "Bildirimler" },
  { id: "2", icon: "🌙", title: "Tema Değiştir" },
  { id: "3", icon: "🔒", title: "Gizlilik ve Güvenlik" },
  { id: "4", icon: "❓", title: "Yardım ve Destek" },
  { id: "5", icon: "📄", title: "Kullanım Koşulları" },
];

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { favorites } = useFavoriteStore();
  const { addresses } = useAddressStore();
  const { paymentMethods } = usePaymentStore();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

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
      navigation.navigate("Orders");
    } else if (itemId === "2") {
      navigation.navigate("Favorites");
    } else if (itemId === "3") {
      navigation.navigate("Addresses");
    } else if (itemId === "4") {
      navigation.navigate("PaymentMethods");
    } else {
      alert(`${itemId} menüsüne tıklandı`);
    }
  };

  const handleSettingsPress = (itemId: string) => {
    if (itemId === "2") {
      // Tema değiştirme butonu
      toggleTheme();
      return;
    }

    const settingsItems: { [key: string]: string } = {
      "1": "Bildirimler",
      "2": "Gizlilik ve Güvenlik",
      "3": "Yardım ve Destek",
      "4": "Kullanım Koşulları",
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
              style={[
                tw`bg-white rounded-t-3xl p-6 ${
                  Platform.OS === "ios" ? "pb-10" : "pb-6"
                }`,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={tw`flex-row items-center justify-between mb-6`}>
                <Text
                  style={[
                    tw`text-gray-800 text-xl font-bold`,
                    { color: theme.colors.text },
                  ]}
                >
                  Profili Düzenle
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={tw`text-gray-400 text-2xl`}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={tw`mb-4`}>
                <Text
                  style={[
                    tw`text-gray-700 font-semibold mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Ad Soyad
                </Text>
                <TextInput
                  style={[
                    tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceVariant,
                    },
                  ]}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Ad Soyad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={tw`mb-4`}>
                <Text
                  style={[
                    tw`text-gray-700 font-semibold mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  E-posta
                </Text>
                <TextInput
                  style={[
                    tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceVariant,
                    },
                  ]}
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                  placeholder="E-posta"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={tw`mb-6`}>
                <Text
                  style={[
                    tw`text-gray-700 font-semibold mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Telefon
                </Text>
                <TextInput
                  style={[
                    tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceVariant,
                    },
                  ]}
                  value={editedPhone}
                  onChangeText={setEditedPhone}
                  placeholder="Telefon"
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

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
        style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 110 : 90,
        }}
      >
        {/* Header */}
        <View
          style={[
            tw`pt-12 pb-8 px-4`,
            { backgroundColor: theme.mode === "dark" ? "#0F0F0F" : "#F5F5F5" },
          ]}
        >
          <Text
            style={[tw`text-2xl font-bold mb-6`, { color: theme.colors.text }]}
          >
            Profilim
          </Text>

          {isAuthenticated ? (
            <View
              style={[
                tw`rounded-2xl p-4 flex-row items-center`,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Image
                source={{ uri: currentUser.avatar }}
                style={[
                  tw`w-20 h-20 rounded-full mr-4`,
                  { backgroundColor: theme.colors.card },
                ]}
              />
              <View style={tw`flex-1`}>
                <Text
                  style={[
                    tw`text-xl font-bold mb-1`,
                    { color: theme.colors.headerText },
                  ]}
                >
                  {currentUser.name}
                </Text>
                <Text
                  style={[tw`text-sm mb-1`, { color: theme.colors.headerText }]}
                >
                  {currentUser.email}
                </Text>
                {currentUser.phone && (
                  <Text
                    style={[tw`text-sm`, { color: theme.colors.headerText }]}
                  >
                    {currentUser.phone}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={handleEditPress}>
                <Text
                  style={[tw`text-2xl`, { color: theme.colors.buttonText }]}
                >
                  ✏️
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                tw`rounded-2xl p-6`,
                { backgroundColor: theme.colors.card, opacity: 0.85 },
              ]}
            >
              <View style={tw`items-center mb-4`}>
                <Text
                  style={[
                    tw`text-lg font-bold mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Hesabınıza Giriş Yapın
                </Text>
                <Text
                  style={[
                    tw`text-center text-sm`,
                    { color: theme.colors.text, opacity: 0.8 },
                  ]}
                >
                  Siparişlerinizi takip edin ve özel fırsatlardan yararlanın
                </Text>
              </View>
              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  style={[
                    tw`flex-1 py-3 rounded-xl`,
                    theme.mode === "light"
                      ? { backgroundColor: "#F5F5F5" }
                      : { backgroundColor: "#262626" },
                  ]}
                >
                  <Text
                    style={[
                      tw`font-bold text-center`,
                      { color: theme.colors.text },
                    ]}
                  >
                    Giriş Yap
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                  style={[
                    tw`flex-1 py-3 rounded-xl`,
                    theme.mode === "light"
                      ? { backgroundColor: "#F5F5F5" }
                      : { backgroundColor: "#262626" },
                  ]}
                >
                  <Text
                    style={[
                      tw`font-bold text-center`,
                      { color: theme.colors.text },
                    ]}
                  >
                    Kayıt Ol
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View style={tw`px-4 -mt-6 mb-4`}>
          <View
            style={[
              tw`rounded-2xl shadow-md p-4 flex-row`,
              {
                backgroundColor: theme.colors.card,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <View
              style={[
                tw`flex-1 items-center`,
                { borderRightWidth: 1, borderRightColor: theme.colors.divider },
              ]}
            >
              <Text
                style={[
                  tw`text-2xl font-bold mb-1`,
                  { color: theme.colors.primary },
                ]}
              >
                12
              </Text>
              <Text
                style={[tw`text-xs`, { color: theme.colors.textSecondary }]}
              >
                Sipariş
              </Text>
            </View>
            <View
              style={[
                tw`flex-1 items-center`,
                { borderRightWidth: 1, borderRightColor: theme.colors.divider },
              ]}
            >
              <Text
                style={[
                  tw`text-2xl font-bold mb-1`,
                  { color: theme.colors.primary },
                ]}
              >
                8
              </Text>
              <Text
                style={[tw`text-xs`, { color: theme.colors.textSecondary }]}
              >
                Beklemede
              </Text>
            </View>
            <View style={tw`flex-1 items-center`}>
              <Text
                style={[
                  tw`text-2xl font-bold mb-1`,
                  { color: theme.colors.primary },
                ]}
              >
                4
              </Text>
              <Text
                style={[tw`text-xs`, { color: theme.colors.textSecondary }]}
              >
                Teslim Edildi
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`px-4 mb-4`}>
          <Text
            style={[tw`font-bold text-lg mb-3`, { color: theme.colors.text }]}
          >
            Hesabım
          </Text>
          <View
            style={[
              tw`rounded-2xl overflow-hidden shadow-sm`,
              {
                backgroundColor: theme.colors.card,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
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
                  style={[
                    tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
                    {
                      backgroundColor:
                        theme.mode === "light" ? "#F5F5F5" : "#262626",
                      color: theme.colors.text,
                    },
                  ]}
                >
                  <Text style={tw`text-2xl`}>{item.icon}</Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`text-gray-800 font-semibold text-base`,
                      { color: theme.colors.text },
                    ]}
                  >
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

        <View style={tw`px-4 mb-4`}>
          <Text
            style={[tw`font-bold text-lg mb-3`, { color: theme.colors.text }]}
          >
            Ayarlar
          </Text>
          <View
            style={[
              tw`rounded-2xl overflow-hidden shadow-sm`,
              {
                backgroundColor: theme.colors.card,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            {SETTINGS_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSettingsPress(item.id)}
                style={[
                  tw`p-4 flex-row items-center justify-between`,
                  index < SETTINGS_ITEMS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.divider,
                  },
                ]}
              >
                <View style={tw`flex-row items-center flex-1`}>
                  <Text style={tw`text-2xl mr-3`}>{item.icon}</Text>
                  <Text
                    style={[tw`font-semibold`, { color: theme.colors.text }]}
                  >
                    {item.title}
                  </Text>
                </View>
                <Text
                  style={[tw`text-xl`, { color: theme.colors.textTertiary }]}
                >
                  ›
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isAuthenticated && (
          <View style={tw`px-4 pb-8`}>
            <TouchableOpacity
              onPress={handleLogout}
              style={[
                tw`bg-white border-2 border-red-500 py-4 rounded-xl flex-row items-center justify-center`,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text style={tw`text-2xl mr-2`}>🚪</Text>
              <Text style={tw`text-red-500 font-bold text-base`}>
                Çıkış Yap
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={tw`items-center pb-6`}>
          <Text style={tw`text-gray-400 text-sm`}>Sampa Shop v1.0.0</Text>
        </View>
      </ScrollView>
    </>
  );
};

export default ProfileScreen;
