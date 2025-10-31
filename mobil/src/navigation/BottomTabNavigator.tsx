import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types";
import HomeScreen from "../screens/HomeScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { View, Text, Platform } from "react-native";
import { useCartStore } from "../store";
import { useTheme } from "../context/ThemeContext";

const Tab = createBottomTabNavigator<MainTabParamList>();

const BottomTabNavigator: React.FC = () => {
  const itemCount = useCartStore((state) => state.itemCount);
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 85 : 70,
          backgroundColor: theme.colors.tabBarBackground,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 10,
          paddingHorizontal: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Ana Sayfa",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: focused
                  ? theme.colors.surfaceVariant
                  : "transparent",
              }}
            >
              <Text style={{ fontSize: 26 }}>{focused ? "🏠" : "🏡"}</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: "Kategoriler",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: focused
                  ? theme.colors.surfaceVariant
                  : "transparent",
              }}
            >
              <Text style={{ fontSize: 26 }}>{focused ? "📱" : "📲"}</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Sepetim",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: focused
                  ? theme.colors.surfaceVariant
                  : "transparent",
                position: "relative",
              }}
            >
              <Text style={{ fontSize: 26 }}>{focused ? "🛒" : "🛍️"}</Text>
              {itemCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    backgroundColor: theme.colors.error,
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 5,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  >
                    {itemCount}
                  </Text>
                </View>
              )}
            </View>
          ),
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profilim",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: focused
                  ? theme.colors.surfaceVariant
                  : "transparent",
              }}
            >
              <Text style={{ fontSize: 26 }}>{focused ? "👤" : "👥"}</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
