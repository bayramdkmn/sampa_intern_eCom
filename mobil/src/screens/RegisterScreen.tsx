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
import { useTheme } from "../context/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register, isLoading } = useAuthStore();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!name.trim()) {
      newErrors.name = "Ad Soyad gereklidir";
      valid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = "Ad Soyad en az 3 karakter olmalıdır";
      valid = false;
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Şifre tekrarı gereklidir";
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(name.trim(), email, password);
      // Başarı ekranına yönlendir
      navigation.navigate("WelcomeSuccess", { userName: name.trim() });
    } catch (error) {
      alert("Kayıt başarısız. Lütfen tekrar deneyin.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={tw`flex-grow`}
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
            <Text
              style={[
                tw` text-3xl font-bold mb-2`,
                { color: theme.colors.text },
              ]}
            >
              Hesap Oluştur 🎉
            </Text>
            <Text style={tw`text-gray-500 text-base`}>
              Hemen üye olun ve alışverişe başlayın
            </Text>
          </View>

          <View style={tw`mb-4`}>
            <Text
              style={[tw`font-semibold mb-2`, { color: theme.colors.text }]}
            >
              Ad Soyad
            </Text>
            <TextInput
              style={[
                tw`rounded-xl px-4 py-3 text-base`,
                {
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                  borderWidth: errors.name ? 2 : 0,
                  borderColor: errors.name
                    ? theme.colors.error
                    : theme.colors.inputBorder,
                },
              ]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: "" });
              }}
              placeholder="Adınız ve Soyadınız"
              placeholderTextColor="#9CA3AF"
            />
            {errors.name ? (
              <Text style={tw`text-red-500 text-sm mt-1`}>{errors.name}</Text>
            ) : null}
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
                tw`rounded-xl px-4 py-3 text-base`,
                {
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                  borderWidth: errors.email ? 2 : 0,
                  borderColor: errors.email
                    ? theme.colors.error
                    : theme.colors.inputBorder,
                },
              ]}
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

          <View style={tw`mb-4`}>
            <Text
              style={[tw`font-semibold mb-2`, { color: theme.colors.text }]}
            >
              Şifre
            </Text>
            <View style={tw`relative`}>
              <TextInput
                style={[
                  tw`rounded-xl px-4 py-3 text-base`,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                    borderWidth: errors.password ? 2 : 0,
                    borderColor: errors.password
                      ? theme.colors.error
                      : theme.colors.inputBorder,
                  },
                ]}
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

          <View style={tw`mb-6`}>
            <Text
              style={[tw`font-semibold mb-2`, { color: theme.colors.text }]}
            >
              Şifre Tekrar
            </Text>
            <View style={tw`relative`}>
              <TextInput
                style={[
                  tw`rounded-xl px-4 py-3 text-base`,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                    borderWidth: errors.confirmPassword ? 2 : 0,
                    borderColor: errors.confirmPassword
                      ? theme.colors.error
                      : theme.colors.inputBorder,
                  },
                ]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors({ ...errors, confirmPassword: "" });
                }}
                placeholder="••••••••"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={tw`absolute right-4 top-3`}
              >
                <Text style={tw`text-xl`}>
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={tw`text-red-500 text-sm mt-1`}>
                {errors.confirmPassword}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={tw`bg-blue-600 py-4 rounded-xl mb-4 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-white font-bold text-center text-base`}>
                Kayıt Ol
              </Text>
            )}
          </TouchableOpacity>

          <View style={tw`flex-row items-center my-6`}>
            <View style={tw`flex-1 h-px bg-gray-300`} />
            <Text style={tw`mx-4 text-gray-500`}>veya</Text>
            <View style={tw`flex-1 h-px bg-gray-300`} />
          </View>

          <View style={tw`flex-row justify-center items-center mb-6`}>
            <Text style={[{ color: theme.colors.text }]}>
              Zaten hesabınız var mı?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={tw`text-blue-600 font-bold`}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
