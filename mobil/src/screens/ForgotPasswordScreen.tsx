import React, { useState, useRef, useEffect } from "react";
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

const CODE_TIMER = 60;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    passwordResetRequest,
    passwordResetConfirm,
    isLoading,
    error,
    passwordResetStep,
    passwordResetEmail,
    passwordResetSuccess,
  } = useAuthStore();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [timer, setTimer] = useState(CODE_TIMER);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [serverCode, setServerCode] = useState("");

  useEffect(() => {
    if (passwordResetStep === "verify" && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, passwordResetStep]);

  useEffect(() => {
    if (passwordResetStep === "verify") setTimer(CODE_TIMER);
  }, [passwordResetStep]);

  const validateEmail = () => {
    if (!email) {
      setEmailError("E-posta adresi gereklidir");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Geçerli bir e-posta adresi girin");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePasswords = () => {
    if (!newPassword || !newPassword2) {
      setPasswordError("Şifre alanları zorunlu");
      return false;
    }
    if (newPassword !== newPassword2) {
      setPasswordError("Şifreler eşleşmiyor");
      return false;
    }
    if (newPassword.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalı");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSendEmail = async () => {
    if (!validateEmail()) return;
    try {
      const response = await passwordResetRequest(email);
      if (response && response.code) {
        setServerCode(response.code);
      }
    } catch {}
  };

  const handleResendCode = async () => {
    setTimer(CODE_TIMER);
    await passwordResetRequest(passwordResetEmail || email);
  };

  const handlePasswordReset = async () => {
    if (!validatePasswords()) return;
    try {
      await passwordResetConfirm({
        email: passwordResetEmail || email,
        code,
        new_password: newPassword,
        new_password2: newPassword2,
      });
    } catch {}
  };

  if (passwordResetStep === "done" || passwordResetSuccess) {
    return (
      <View style={tw`flex-1 bg-white px-6 justify-center`}>
        <View style={tw`items-center mb-8`}>
          <Text style={tw`text-green-700 text-3xl font-bold mb-2`}>✓</Text>
          <Text style={tw`text-gray-800 text-2xl font-bold mb-2 text-center`}>
            Şifre başarıyla değiştirildi!
          </Text>
          <Text style={tw`text-gray-500 text-center mb-8`}>
            Yeni şifreyle giriş yapabilirsin.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={tw`bg-blue-600 py-4 rounded-xl mb-3`}
        >
          <Text style={tw`text-white font-bold text-center text-base`}>
            Girişe Dön
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (passwordResetStep === "verify") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView
          contentContainerStyle={tw`flex-1`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`flex-1 px-6 justify-center`}>
            <View style={tw`items-center mb-8`}>
              <Text style={tw`text-4xl mb-2`}>✉️</Text>
              <Text style={tw`text-gray-800 text-xl font-bold mb-2`}>
                Kod Gönderildi!
              </Text>
              <Text style={tw`text-gray-500 text-center mb-8`}>
                Şifre sıfırlama kodu{" "}
                <Text style={tw`font-semibold text-blue-600`}>
                  {passwordResetEmail || email}
                </Text>{" "}
                adresine gönderildi.
              </Text>
            </View>

            <Text style={tw`text-gray-800 font-semibold mb-1`}>Kodu Girin</Text>
            <TextInput
              style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 mb-2`}
              value={code}
              onChangeText={setCode}
              placeholder="Kodu girin"
              keyboardType="numeric"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            {codeError ? (
              <Text style={tw`text-red-500 text-sm mt-1`}>{codeError}</Text>
            ) : null}

            <TouchableOpacity
              onPress={() => setTimer(CODE_TIMER)}
              style={tw`mb-4`}
              disabled={timer > 0}
            >
              <Text style={tw`text-blue-600 font-semibold text-center`}>
                {timer > 0
                  ? `Kodu tekrar göndermek için ${timer}s`
                  : "Tekrar kod gönder"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={timer > 0}
              style={tw`bg-blue-100 py-3 rounded-xl mb-6`}
            >
              <Text style={tw`text-blue-800 font-bold text-center`}>
                Kod Gönder
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (code === serverCode && code.length > 0) {
                  useAuthStore.setState({ passwordResetStep: "setPassword" });
                  setCodeError("");
                } else {
                  setCodeError("Kod hatalı veya eksik");
                }
              }}
              style={tw`bg-blue-600 py-4 rounded-xl`}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw`text-white font-bold text-center text-base`}>
                  Kodu Doğrula
                </Text>
              )}
            </TouchableOpacity>

            {error ? (
              <Text style={tw`text-red-500 text-sm mt-4`}>{error}</Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (passwordResetStep === "setPassword") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView
          contentContainerStyle={tw`flex-1`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`flex-1 px-6 justify-center`}>
            <View style={tw`items-center mb-8`}>
              <Text style={tw`text-4xl mb-2`}>🔒</Text>
              <Text style={tw`text-gray-800 text-xl font-bold mb-2`}>
                Yeni Şifre Belirle
              </Text>
              <Text style={tw`text-gray-500 text-center mb-8`}>
                Hesabın için yeni şifreyi iki kere gir.
              </Text>
            </View>

            <Text style={tw`text-gray-800 font-semibold mb-1`}>Yeni Şifre</Text>
            <TextInput
              style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 mb-2`}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Yeni şifre"
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={tw`text-gray-800 font-semibold mb-1 mt-2`}>
              Yeni Şifre (Tekrar)
            </Text>
            <TextInput
              style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 mb-4`}
              value={newPassword2}
              onChangeText={setNewPassword2}
              placeholder="Yeni şifre tekrar"
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            {passwordError ? (
              <Text style={tw`text-red-500 text-sm mt-1`}>{passwordError}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handlePasswordReset}
              style={tw`bg-blue-600 py-4 rounded-xl`}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw`text-white font-bold text-center text-base`}>
                  Şifreyi Kaydet
                </Text>
              )}
            </TouchableOpacity>

            {error ? (
              <Text style={tw`text-red-500 text-sm mt-4`}>{error}</Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={tw`flex-1`}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`flex-1 px-6 justify-center`}>
          <View style={tw`items-center mb-8`}>
            <Text style={tw`text-4xl mb-2`}>🔑</Text>
            <Text style={tw`text-gray-800 text-2xl font-bold mb-2`}>
              Şifremi Unuttum
            </Text>
            <Text style={tw`text-gray-500 text-center mb-8`}>
              Şifreni sıfırlamak için e-posta adresini gir.
            </Text>
          </View>
          <Text style={tw`text-gray-800 font-semibold mb-1`}>E-posta</Text>
          <TextInput
            style={tw`bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 mb-6`}
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />
          {emailError ? (
            <Text style={tw`text-red-500 text-sm mt-1`}>{emailError}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleSendEmail}
            disabled={isLoading}
            style={tw`bg-blue-600 py-4 rounded-xl mb-4`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-white font-bold text-center text-base`}>
                Kod Gönder
              </Text>
            )}
          </TouchableOpacity>
          {error ? (
            <Text style={tw`text-red-500 text-sm mt-4`}>{error}</Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
