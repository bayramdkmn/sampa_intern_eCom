import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import tw from "twrnc";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WelcomeSuccessRouteProp = RouteProp<RootStackParamList, "WelcomeSuccess">;

const { width, height } = Dimensions.get("window");

const WelcomeSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WelcomeSuccessRouteProp>();
  const { userName } = route.params;

  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.navigate("MainTabs");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    console.log("Continue button pressed");
    navigation.navigate("MainTabs");
  };

  return (
    <View style={tw`flex-1 bg-blue-600`}>
      <View style={tw`flex-1 items-center justify-center px-8`}>
        <Animated.View
          style={[
            tw`mb-8`,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View
            style={tw`w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-6`}
          >
            <Text style={tw`text-6xl`}>🎉</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            tw`items-center mb-8`,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={tw`text-white text-4xl font-bold mb-4 text-center`}>
            Hoş Geldiniz!
          </Text>
          <Text style={tw`text-white text-2xl font-bold mb-2 text-center`}>
            {userName}
          </Text>
          <Text style={tw`text-blue-100 text-lg text-center leading-6`}>
            Hesabınız başarıyla oluşturuldu.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            tw`mb-8`,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={tw`bg-white/10 rounded-2xl p-6`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Text style={tw`text-2xl mr-3`}>⚡</Text>
              <Text style={tw`text-white font-bold text-lg`}>
                Hızlı Alışveriş
              </Text>
            </View>
            <Text style={tw`text-blue-100 text-sm`}>
              Kayıtlı kartlarınızla tek tıkla ödeme yapın
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            tw`w-full`,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleContinue}
            style={tw`bg-white py-4 rounded-2xl shadow-lg mb-3`}
          >
            <Text style={tw`text-blue-600 font-bold text-center text-lg`}>
              Alışverişe Başla 🛒
            </Text>
          </TouchableOpacity>

          <Text style={tw`text-white/80 text-center text-sm`}>
            Otomatik olarak ana sayfaya yönlendirileceksiniz...
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            tw`absolute bottom-8 items-center`,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={tw`text-white/60 text-xs text-center`}>
            Sampa Shop ailesine hoş geldiniz! 🎊
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default WelcomeSuccessScreen;
