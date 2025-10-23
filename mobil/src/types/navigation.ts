import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ProductDetail: { productId: string };
  Orders: undefined;
  Favorites: undefined;
  Addresses: undefined;
  PaymentMethods: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  WelcomeSuccess: { userName: string };
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Profile: undefined;
};
