import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import BottomTabNavigator from "./BottomTabNavigator";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import OrdersScreen from "../screens/OrdersScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import AddressesScreen from "../screens/AddressesScreen";
import PaymentMethodsScreen from "../screens/PaymentMethodsScreen";
import AddressInfoScreen from "../screens/AddressInfoScreen";
import PaymentInfoScreen from "../screens/PaymentInfoScreen";
import OrderConfirmScreen from "../screens/OrderConfirmScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import WelcomeSuccessScreen from "../screens/WelcomeSuccessScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="Addresses"
          component={AddressesScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="PaymentMethods"
          component={PaymentMethodsScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="AddressInfo"
          component={AddressInfoScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="PaymentInfo"
          component={PaymentInfoScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="OrderConfirm"
          component={OrderConfirmScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            presentation: "card",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="WelcomeSuccess"
          component={WelcomeSuccessScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
