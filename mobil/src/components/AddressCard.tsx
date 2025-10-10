import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { AddressCardProps } from "../types";

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  return (
    <View
      style={tw`bg-gray-50 rounded-xl p-4 mb-3 ${
        address.isDefault ? "border-2 border-blue-500" : ""
      }`}
    >
      <View style={tw`flex-row items-start justify-between mb-2`}>
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Text style={tw`text-gray-800 font-bold text-base mr-2`}>
              {address.title}
            </Text>
            {address.isDefault && (
              <View style={tw`bg-blue-500 px-2 py-1 rounded-full`}>
                <Text style={tw`text-white text-xs font-bold`}>Varsayılan</Text>
              </View>
            )}
          </View>
          <Text style={tw`text-gray-700 mb-1`}>{address.fullName}</Text>
          <Text style={tw`text-gray-600 text-sm mb-1`}>{address.phone}</Text>
          <Text style={tw`text-gray-600 text-sm mb-1`}>
            {address.city} / {address.district}
          </Text>
          <Text style={tw`text-gray-600 text-sm`}>{address.fullAddress}</Text>
        </View>
      </View>

      <View style={tw`flex-row gap-2 mt-3`}>
        {!address.isDefault && (
          <TouchableOpacity
            onPress={onSetDefault}
            style={tw`flex-1 bg-blue-100 py-2 rounded-lg`}
          >
            <Text style={tw`text-blue-600 font-semibold text-center text-sm`}>
              ⭐ Varsayılan Yap
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onEdit}
          style={tw`flex-1 bg-gray-200 py-2 rounded-lg`}
        >
          <Text style={tw`text-gray-700 font-semibold text-center text-sm`}>
            ✏️ Düzenle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          style={tw`flex-1 bg-red-100 py-2 rounded-lg`}
        >
          <Text style={tw`text-red-600 font-semibold text-center text-sm`}>
            🗑️ Sil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddressCard;
