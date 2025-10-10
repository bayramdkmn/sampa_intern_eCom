import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import tw from "twrnc";
import { AddressFormProps } from "../types";

const AddressForm: React.FC<AddressFormProps> = ({
  title,
  fullName,
  phone,
  city,
  district,
  fullAddress,
  isDefault,
  onTitleChange,
  onFullNameChange,
  onPhoneChange,
  onCityChange,
  onDistrictChange,
  onFullAddressChange,
  onIsDefaultChange,
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Address Title */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-gray-700 font-semibold mb-2`}>
          Adres Başlığı *
        </Text>
        <TextInput
          style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
          value={title}
          onChangeText={onTitleChange}
          placeholder="Örn: Ev, İş, Ofis"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Full Name */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-gray-700 font-semibold mb-2`}>Ad Soyad *</Text>
        <TextInput
          style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
          value={fullName}
          onChangeText={onFullNameChange}
          placeholder="Alıcı adı soyadı"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Phone */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-gray-700 font-semibold mb-2`}>Telefon *</Text>
        <TextInput
          style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
          value={phone}
          onChangeText={onPhoneChange}
          placeholder="+90 555 123 45 67"
          keyboardType="phone-pad"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* City & District */}
      <View style={tw`flex-row gap-3 mb-4`}>
        <View style={tw`flex-1`}>
          <Text style={tw`text-gray-700 font-semibold mb-2`}>İl *</Text>
          <TextInput
            style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
            value={city}
            onChangeText={onCityChange}
            placeholder="İstanbul"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={tw`flex-1`}>
          <Text style={tw`text-gray-700 font-semibold mb-2`}>İlçe *</Text>
          <TextInput
            style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
            value={district}
            onChangeText={onDistrictChange}
            placeholder="Kadıköy"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Full Address */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-gray-700 font-semibold mb-2`}>Açık Adres *</Text>
        <TextInput
          style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800`}
          value={fullAddress}
          onChangeText={onFullAddressChange}
          placeholder="Mahalle, cadde, sokak, bina no, daire no"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Default Address Checkbox */}
      <TouchableOpacity
        onPress={() => onIsDefaultChange(!isDefault)}
        style={tw`flex-row items-center mb-6`}
      >
        <View
          style={tw`w-6 h-6 rounded border-2 ${
            isDefault ? "bg-blue-600 border-blue-600" : "border-gray-300"
          } items-center justify-center mr-3`}
        >
          {isDefault && <Text style={tw`text-white text-xs`}>✓</Text>}
        </View>
        <Text style={tw`text-gray-700 text-base`}>
          Varsayılan adres olarak kaydet
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddressForm;
