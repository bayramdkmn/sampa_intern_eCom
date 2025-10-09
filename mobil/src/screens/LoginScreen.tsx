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

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "E-posta adresi gereklidir";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Şifre gereklidir";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
      navigation.navigate("MainTabs");
    } catch (error) {
      alert("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    }
  };

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

          <View style={tw`mb-8`}>
            <Text style={tw`text-gray-800 text-3xl font-bold mb-2`}>
              Hoş Geldiniz! 👋
            </Text>
            <Text style={tw`text-gray-500 text-base`}>
              Hesabınıza giriş yapın
            </Text>
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-700 font-semibold mb-2`}>E-posta</Text>
            <TextInput
              style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 ${
                errors.email ? "border-2 border-red-500" : ""
              }`}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: "" });
              }}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            {errors.email ? (
              <Text style={tw`text-red-500 text-sm mt-1`}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={tw`mb-2`}>
            <Text style={tw`text-gray-700 font-semibold mb-2`}>Şifre</Text>
            <View style={tw`relative`}>
              <TextInput
                style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 ${
                  errors.password ? "border-2 border-red-500" : ""
                }`}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: "" });
                }}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={tw`absolute right-4 top-3`}
              >
                <Text style={tw`text-xl`}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={tw`text-red-500 text-sm mt-1`}>
                {errors.password}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={tw`self-end mb-6`}
          >
            <Text style={tw`text-blue-600 font-semibold`}>
              Şifremi Unuttum?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={tw`bg-blue-600 py-4 rounded-xl mb-4 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-white font-bold text-center text-base`}>
                Giriş Yap
              </Text>
            )}
          </TouchableOpacity>

          <View style={tw`flex-row items-center my-6`}>
            <View style={tw`flex-1 h-px bg-gray-300`} />
            <Text style={tw`mx-4 text-gray-500`}>veya</Text>
            <View style={tw`flex-1 h-px bg-gray-300`} />
          </View>

          <View style={tw`flex-row justify-center items-center`}>
            <Text style={tw`text-gray-600`}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={tw`text-blue-600 font-bold`}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
