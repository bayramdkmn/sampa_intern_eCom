import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import tw from "twrnc";
import { Address } from "../types";
import { useAddressStore } from "../store";
import AddressForm from "./AddressForm";

interface AddressFormModalProps {
  visible: boolean;
  editingAddress: Address | null;
  onClose: () => void;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  visible,
  editingAddress,
  onClose,
}) => {
  const { addresses, addAddress, updateAddress } = useAddressStore();

  const [title, setTitle] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingAddress) {
        setTitle(editingAddress.title);
        setFullName(editingAddress.fullName);
        setPhone(editingAddress.phone);
        setCity(editingAddress.city);
        setDistrict(editingAddress.district);
        setFullAddress(editingAddress.fullAddress);
        setIsDefault(editingAddress.isDefault || false);
      } else {
        setTitle("");
        setFullName("");
        setPhone("");
        setCity("");
        setDistrict("");
        setFullAddress("");
        setIsDefault(addresses.length === 0);
      }
    }
  }, [visible, editingAddress, addresses.length]);

  const handleSave = () => {
    if (!title || !fullName || !phone || !city || !district || !fullAddress) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    if (editingAddress) {
      updateAddress(editingAddress.id, {
        title,
        fullName,
        phone,
        city,
        district,
        fullAddress,
        isDefault,
      });
      alert("Adres güncellendi! 📍");
    } else {
      addAddress({
        title,
        fullName,
        phone,
        city,
        district,
        fullAddress,
        isDefault,
      });
      alert("Yeni adres eklendi! 📍");
    }

    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View
            style={tw`bg-white rounded-t-3xl p-6 ${
              Platform.OS === "ios" ? "pb-10" : "pb-6"
            } max-h-[90%]`}
          >
            {/* Header */}
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <Text style={tw`text-gray-800 text-xl font-bold`}>
                {editingAddress ? "Adresi Düzenle" : "Yeni Adres Ekle"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={tw`text-gray-400 text-2xl`}>✕</Text>
              </TouchableOpacity>
            </View>

            <AddressForm
              title={title}
              fullName={fullName}
              phone={phone}
              city={city}
              district={district}
              fullAddress={fullAddress}
              isDefault={isDefault}
              onTitleChange={setTitle}
              onFullNameChange={setFullName}
              onPhoneChange={setPhone}
              onCityChange={setCity}
              onDistrictChange={setDistrict}
              onFullAddressChange={setFullAddress}
              onIsDefaultChange={setIsDefault}
            />

            {/* Action Buttons */}
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                onPress={onClose}
                style={tw`flex-1 bg-gray-200 py-4 rounded-xl`}
              >
                <Text style={tw`text-gray-700 font-bold text-center text-base`}>
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
  );
};

export default AddressFormModal;
