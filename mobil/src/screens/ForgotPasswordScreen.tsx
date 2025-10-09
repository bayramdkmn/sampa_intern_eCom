import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useAuthStore } from "../store";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { resetPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setEmailError("E-posta adresi gereklidir");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Geçerli bir e-posta adresi girin");
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  if (success) {
    return (
      <View style={tw`flex-1 bg-white px-6 justify-center`}>
        <View style={tw`items-center mb-8`}>
          <View
            style={tw`w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4`}
          >
            <Text style={tw`text-4xl`}>✉️</Text>
          </View>
          <Text style={tw`text-gray-800 text-2xl font-bold mb-2 text-center`}>
            E-posta Gönderildi!
          </Text>
          <Text style={tw`text-gray-500 text-center mb-8`}>
            Şifre sıfırlama bağlantısı {email} adresine gönderildi. Lütfen
            e-postanızı kontrol edin.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={tw`bg-blue-600 py-4 rounded-xl mb-3`}
        >
          <Text style={tw`text-white font-bold text-center text-base`}>
            Giriş Sayfasına Dön
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSuccess(false)} style={tw`py-4`}>
          <Text style={tw`text-blue-600 font-semibold text-center`}>
            E-posta Almadım, Tekrar Gönder
          </Text>
        </TouchableOpacity>

        <View style={tw`mt-6 bg-yellow-50 rounded-xl p-4`}>
          <View style={tw`flex-row items-start`}>
            <Text style={tw`text-xl mr-3`}>💡</Text>
            <View style={tw`flex-1`}>
              <Text style={tw`text-yellow-800 font-semibold mb-1`}>İpucu</Text>
              <Text style={tw`text-yellow-700 text-sm`}>
                E-postayı bulamadıysanız spam/gereksiz klasörünü kontrol edin.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1 bg-white`}
    >
      <ScrollView
        contentContainerStyle={tw`flex-1`}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`flex-1 px-6`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`mt-12 mb-8`}
          >
            <Text style={tw`text-2xl`}>←</Text>
          </TouchableOpacity>

          <View style={tw`items-center mb-8`}>
            <View
              style={tw`w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4`}
            >
              <Text style={tw`text-4xl`}>🔒</Text>
            </View>
            <Text style={tw`text-gray-800 text-3xl font-bold mb-2`}>
              Şifrenizi mi Unuttunuz?
            </Text>
            <Text style={tw`text-gray-500 text-center`}>
              E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim
            </Text>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-700 font-semibold mb-2`}>E-posta</Text>
            <TextInput
              style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 ${
                emailError ? "border-2 border-red-500" : ""
              }`}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            {emailError ? (
              <Text style={tw`text-red-500 text-sm mt-1`}>{emailError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={isLoading}
            style={tw`bg-blue-600 py-4 rounded-xl mb-4 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-white font-bold text-center text-base`}>
                Sıfırlama Bağlantısı Gönder
              </Text>
            )}
          </TouchableOpacity>

          <View style={tw`flex-row items-center my-6`}>
            <View style={tw`flex-1 h-px bg-gray-300`} />
            <Text style={tw`mx-4 text-gray-500`}>veya</Text>
            <View style={tw`flex-1 h-px bg-gray-300`} />
          </View>

          <View style={tw`flex-row justify-center items-center`}>
            <Text style={tw`text-gray-600`}>Şifrenizi hatırladınız mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={tw`text-blue-600 font-bold`}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`mt-8 bg-blue-50 rounded-xl p-4`}>
            <View style={tw`flex-row items-start`}>
              <Text style={tw`text-xl mr-3`}>🔐</Text>
              <View style={tw`flex-1`}>
                <Text style={tw`text-blue-800 font-semibold mb-1`}>
                  Güvenlik
                </Text>
                <Text style={tw`text-blue-600 text-sm`}>
                  Sıfırlama bağlantısı 1 saat geçerlidir ve tek kullanımlıktır.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
