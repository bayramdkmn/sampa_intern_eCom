import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Address } from "../types";
import { useAddressStore } from "../store";
import { useTheme } from "../context/ThemeContext";
import AddressCard from "../components/AddressCard";
import AddressFormModal from "../components/AddressFormModal";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddressesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addresses, deleteAddress, setDefaultAddress } = useAddressStore();
  const { theme } = useTheme();

  const [formVisible, setFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const openAddForm = () => {
    setEditingAddress(null);
    setFormVisible(true);
  };

  const openEditForm = (address: Address) => {
    setEditingAddress(address);
    setFormVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteAddress(id);
    alert("Adres silindi! 🗑️");
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddress(id);
    alert("Varsayılan adres olarak ayarlandı! ⭐");
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          tw`pt-12 pb-4 px-4 flex-row items-center`,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
            { backgroundColor: theme.colors.card, opacity: 0.2 },
          ]}
        >
          <Text style={[tw`text-xl`, { color: theme.colors.onPrimary }]}>
            ←
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            tw`text-xl font-bold flex-1`,
            { color: theme.colors.onPrimary },
          ]}
        >
          Adreslerim
        </Text>
        <View
          style={[
            tw`px-3 py-1 rounded-full`,
            { backgroundColor: theme.colors.card, opacity: 0.2 },
          ]}
        >
          <Text style={[tw`font-bold`, { color: theme.colors.onPrimary }]}>
            {addresses.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 110 : 90,
        }}
      >
        {addresses.length === 0 ? (
          <View style={tw`items-center justify-center py-12 px-8`}>
            <Text style={tw`text-6xl mb-4`}>📍</Text>
            <Text style={tw`text-gray-800 text-xl font-bold mb-2 text-center`}>
              Kayıtlı Adresiniz Yok
            </Text>
            <Text style={tw`text-gray-500 text-center text-base mb-6`}>
              Teslimat adresinizi ekleyerek alışverişe başlayabilirsiniz
            </Text>
          </View>
        ) : (
          <View style={tw`px-4 pt-4`}>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => openEditForm(address)}
                onDelete={() => handleDelete(address.id)}
                onSetDefault={() => handleSetDefault(address.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Address Button */}
      <View
        style={tw`bg-white border-t border-gray-200 px-4 pt-3 pb-8 shadow-lg`}
      >
        <TouchableOpacity
          onPress={openAddForm}
          style={tw`bg-blue-600 py-4 rounded-xl`}
        >
          <Text style={tw`text-white font-bold text-center text-base`}>
            + Yeni Adres Ekle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Address Form Modal */}
      <AddressFormModal
        visible={formVisible}
        editingAddress={editingAddress}
        onClose={() => setFormVisible(false)}
      />
    </View>
  );
};

export default AddressesScreen;
