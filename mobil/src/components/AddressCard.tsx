import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { AddressCardProps } from "../types";
import { useTheme } from "../context/ThemeContext";

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const { theme } = useTheme();
  const widths = address.isDefault ? ["50%", "50%"] : ["40%", "32%", "26%"];
  return (
    <View
      style={[
        tw`rounded-xl p-4 mb-3`,
        { backgroundColor: theme.colors.card },
        address.isDefault && tw`border-2 border-blue-500`,
      ]}
    >
      <View style={tw`flex-row items-start justify-between mb-2`}>
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Text
              style={[
                tw`font-bold text-base mr-2`,
                { color: theme.colors.text },
              ]}
            >
              {address.title}
            </Text>
            {address.isDefault && (
              <View style={tw`bg-blue-500 px-2 py-1 rounded-full ml-1`}>
                <Text
                  style={tw`text-white text-xs font-bold`}
                  numberOfLines={1}
                >
                  Varsayılan
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[tw`text-sm mb-1`, { color: theme.colors.textSecondary }]}
          >
            {address.city} / {address.district}
          </Text>
          <Text style={[tw`text-sm`, { color: theme.colors.textSecondary }]}>
            {address.fullAddress}
          </Text>
        </View>
      </View>

      <View style={tw`flex-row gap-2 mt-3`}>
        {!address.isDefault && (
          <TouchableOpacity
            onPress={onSetDefault}
            style={[
              tw`bg-blue-100 justify-center rounded-lg py-2`,
              { width: widths[0] },
            ]}
          >
            <Text
              style={tw`text-blue-600 font-semibold text-center text-sm`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              ⭐ Varsayılan Yap
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onEdit}
          style={[
            tw`bg-gray-200 py-2 justify-center rounded-lg`,
            { width: address.isDefault ? widths[0] : widths[1] },
          ]}
        >
          <Text style={tw`text-gray-700 font-semibold text-center text-sm`}>
            ✏️ Düzenle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          style={[
            tw`bg-red-100 py-2 justify-center rounded-lg`,
            { width: address.isDefault ? widths[1] : widths[2] },
          ]}
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
