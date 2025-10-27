import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import tw from "twrnc";
import { useAddressStore } from "../store";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const AddressInfoScreen: React.FC = () => {
  const { addresses, fetchAddresses, addAddress } = useAddressStore();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [addressTitle, setAddressTitle] = useState("");
  const [country, setCountry] = useState("Türkiye");
  const [city, setCity] = useState("Ankara");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNo, setBuildingNo] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSaveAddress = async () => {
    if (!addressTitle.trim() || !district.trim() || !street.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      await addAddress({
        title: addressTitle,
        fullAddress: `${street}, ${buildingNo ? `No:${buildingNo}` : ""}`,
        city: city,
        district: district,
        postalCode: "00000",
        country: country,
      });

      Alert.alert("Başarılı", "Adres başarıyla eklendi!");
      setShowAddForm(false);
      setAddressTitle("");
      setDistrict("");
      setStreet("");
      setBuildingNo("");
    } catch (error) {
      Alert.alert("Hata", "Adres eklenirken bir hata oluştu.");
    }
  };

  const handleContinue = () => {
    if (!selectedAddress) {
      Alert.alert("Hata", "Lütfen bir adres seçin.");
      return;
    }
    navigation.navigate("PaymentInfo" as never);
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          tw`pt-12 pb-4 px-4`,
          { backgroundColor: theme.colors.barColor },
        ]}
      >
        <View style={tw`flex-row items-center justify-between my-4`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>
            Teslimat Adresi
          </Text>
          <View style={tw`w-6`} />
        </View>
      </View>

      <ScrollView style={tw`flex-1 px-4`}>
        <View style={tw`mt-6`}>
          <Text
            style={[tw`text-lg font-bold mb-4`, { color: theme.colors.text }]}
          >
            Kayıtlı Adreslerim
          </Text>

          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              onPress={() => setSelectedAddress(address.id)}
              style={[
                tw`p-4 rounded-2xl mb-3 border-2`,
                {
                  backgroundColor: theme.colors.card,
                  borderColor:
                    selectedAddress === address.id
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
            >
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center flex-1`}>
                  <View
                    style={[
                      tw`w-10 h-10 rounded-xl items-center justify-center mr-3`,
                      {
                        backgroundColor:
                          selectedAddress === address.id
                            ? theme.colors.primary
                            : theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={tw`text-lg`}>🏠</Text>
                  </View>
                  <View style={tw`flex-1`}>
                    <Text
                      style={[
                        tw`font-bold text-base mb-1`,
                        { color: theme.colors.text },
                      ]}
                    >
                      {address.title}
                    </Text>
                    <Text
                      style={[
                        tw`text-sm`,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {address.fullAddress}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    tw`w-6 h-6 rounded-full border-2 items-center justify-center`,
                    {
                      borderColor:
                        selectedAddress === address.id
                          ? theme.colors.primary
                          : theme.colors.border,
                      backgroundColor:
                        selectedAddress === address.id
                          ? theme.colors.primary
                          : "transparent",
                    },
                  ]}
                >
                  {selectedAddress === address.id && (
                    <Text
                      style={[
                        tw`text-xs font-bold`,
                        { color: theme.colors.buttonText },
                      ]}
                    >
                      ✓
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => setShowAddForm(!showAddForm)}
            style={[
              tw`p-4 rounded-2xl border-2 border-dashed mb-4`,
              {
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.card,
              },
            ]}
          >
            <View style={tw`flex-row items-center justify-center`}>
              <Text style={[tw`text-lg mr-2`, { color: theme.colors.primary }]}>
                +
              </Text>
              <Text style={[tw`font-bold`, { color: theme.colors.primary }]}>
                Yeni Adres Ekle
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={tw`mt-6`}>
            <Text
              style={[tw`text-lg font-bold mb-4`, { color: theme.colors.text }]}
            >
              Yeni Adres Ekle
            </Text>

            <View style={tw`space-y-4`}>
              <View>
                <Text
                  style={[
                    tw`text-sm font-medium mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Adres Başlığı
                </Text>
                <TextInput
                  value={addressTitle}
                  onChangeText={setAddressTitle}
                  placeholder="Ev, İş Yeri vb."
                  style={[
                    tw`p-4 rounded-2xl border-2`,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />
              </View>

              <View>
                <Text
                  style={[
                    tw`text-sm font-medium mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Ülke
                </Text>
                <View
                  style={[
                    tw`p-4 rounded-2xl border-2 flex-row items-center justify-between`,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[tw`text-base`, { color: theme.colors.text }]}>
                    {country}
                  </Text>
                  <Text
                    style={[tw`text-lg`, { color: theme.colors.textSecondary }]}
                  >
                    ▼
                  </Text>
                </View>
              </View>

              <View>
                <Text
                  style={[
                    tw`text-sm font-medium mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Şehir
                </Text>
                <View
                  style={[
                    tw`p-4 rounded-2xl border-2 flex-row items-center justify-between`,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[tw`text-base`, { color: theme.colors.text }]}>
                    {city}
                  </Text>
                  <Text
                    style={[tw`text-lg`, { color: theme.colors.textSecondary }]}
                  >
                    ▼
                  </Text>
                </View>
              </View>

              <View>
                <Text
                  style={[
                    tw`text-sm font-medium mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  İlçe/Mahalle
                </Text>
                <TextInput
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="Mahallenizi girin"
                  style={[
                    tw`p-4 rounded-2xl border-2`,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />
              </View>

              <View>
                <Text
                  style={[
                    tw`text-sm font-medium mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Sokak/Cadde
                </Text>
                <TextInput
                  value={street}
                  onChangeText={setStreet}
                  placeholder="Sokak ve cadde bilgisi"
                  style={[
                    tw`p-4 rounded-2xl border-2`,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />
              </View>

              <View>
                <Text
                  style={[
                    tw`text-sm font-medium mb-2`,
                    { color: theme.colors.text },
                  ]}
                >
                  Bina No / Daire No
                </Text>
                <TextInput
                  value={buildingNo}
                  onChangeText={setBuildingNo}
                  placeholder="Bina ve daire numarası"
                  style={[
                    tw`p-4 rounded-2xl border-2`,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[tw`p-4 pb-8`, { backgroundColor: theme.colors.barColor }]}>
        <TouchableOpacity
          onPress={showAddForm ? handleSaveAddress : handleContinue}
          style={[
            tw`py-4 rounded-2xl`,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              tw`text-center font-bold text-lg`,
              { color: theme.colors.buttonText },
            ]}
          >
            {showAddForm ? "Adresi Kaydet ve Devam Et" : "Devam Et"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddressInfoScreen;
