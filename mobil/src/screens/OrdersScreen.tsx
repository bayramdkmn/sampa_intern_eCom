import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  Image,
} from "react-native";
import tw from "twrnc";
import { useTheme } from "../context/ThemeContext";
import { StoreOrder } from "../types";
import { useOrderStore } from "../store/orderStore";

const OrdersScreen: React.FC = () => {
  const { orders, fetchOrders } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusConfig = (status: StoreOrder["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "Beklemede",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: "⏳",
        };
      case "processing":
        return {
          label: "Hazırlanıyor",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          icon: "⏳",
        };
      case "shipped":
        return {
          label: "Yolda",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          icon: "🚚",
        };
      case "delivered":
        return {
          label: "Teslim Edildi",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          icon: "✅",
        };
      case "cancelled":
        return {
          label: "İptal Edildi",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          icon: "❌",
        };
      default:
        return {
          label: "Bilinmiyor",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: "❓",
        };
    }
  };

  const handleCancelOrder = async (order: StoreOrder) => {
    Alert.alert(
      "Siparişi İptal Et",
      `${order.id} numaralı siparişi iptal etmek istediğinize emin misiniz?`,
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "İptal Et",
          style: "destructive",
          onPress: async () => {
            try {
              await useOrderStore.getState().cancelOrder(order.id);
              Alert.alert("Başarılı", "Siparişiniz iptal edildi.");
            } catch (error) {
              Alert.alert("Hata", "Sipariş iptal edilemedi.");
            }
          },
        },
      ]
    );
  };

  const handleViewOrder = (order: StoreOrder) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Tarih bilinmiyor";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return `₺${price.toFixed(2)}`;
  };

  const calculateSubtotal = (order: StoreOrder) => {
    if (!order.items || !Array.isArray(order.items)) {
      return 0;
    }
    return order.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const { theme } = useTheme();

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={tw`flex-1 bg-black/50`}>
          <View style={tw`flex-1 mt-20`}>
            <View
              style={[
                tw`flex-1 rounded-t-3xl`,
                {
                  backgroundColor: theme.mode === "dark" ? "#171717" : "#fff",
                },
              ]}
            >
              <View
                style={tw`flex-row items-center justify-between px-6 py-4 border-b border-gray-200 `}
              >
                <View>
                  <Text
                    style={[
                      tw`text-xl font-bold`,
                      { color: theme.colors.text },
                    ]}
                  >
                    Sipariş Detayı
                  </Text>
                  {selectedOrder && (
                    <Text
                      style={[
                        tw`text-sm font-semibold mt-1`,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {selectedOrder.orderNumber}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={tw`w-10 h-10 items-center justify-center`}
                >
                  <Text
                    style={[
                      tw`text-2xl`,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedOrder && (
                <ScrollView
                  style={tw`flex-1`}
                  contentContainerStyle={tw`px-6 py-4`}
                >
                  <View style={tw`mb-4`}>
                    <View style={tw`flex-row items-center mb-2`}>
                      <Text style={tw`text-gray-500 text-sm mr-2`}>📅</Text>
                      <Text style={[tw`text-sm`, { color: theme.colors.text }]}>
                        {formatDate(selectedOrder.date)}
                      </Text>
                    </View>
                    {selectedOrder.address && (
                      <View style={tw`flex-row items-start mb-2`}>
                        <Text style={tw`text-gray-500 text-sm mr-2 mt-0.5`}>
                          📍
                        </Text>
                        <Text
                          style={[
                            tw`text-sm flex-1`,
                            { color: theme.colors.text },
                          ]}
                        >
                          {selectedOrder.address}
                        </Text>
                      </View>
                    )}
                    <View style={tw`flex-row items-center`}>
                      <Text style={tw`text-gray-500 text-sm mr-2`}>📦</Text>
                      {(() => {
                        const statusConfig = getStatusConfig(
                          selectedOrder.status
                        );
                        return (
                          <View
                            style={tw`${statusConfig.bgColor} px-3 py-1 rounded-full flex-row items-center`}
                          >
                            <Text style={tw`mr-1`}>{statusConfig.icon}</Text>
                            <Text
                              style={tw`${statusConfig.textColor} text-xs font-semibold`}
                            >
                              {statusConfig.label}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>
                  </View>

                  <View style={tw`border-t border-gray-200 my-4`} />

                  <View style={tw`mb-4`}>
                    <Text
                      style={[
                        tw`font-bold text-base mb-3`,
                        { color: theme.colors.text },
                      ]}
                    >
                      Ürünler
                    </Text>
                    {selectedOrder.items?.map((item, index) => (
                      <View
                        key={`${item.product.id}-${index}`}
                        style={[
                          tw`flex-row items-center mb-3 rounded-xl p-3`,
                          { backgroundColor: theme.colors.card },
                        ]}
                      >
                        <Image
                          source={{ uri: item.product.image }}
                          style={tw`w-16 h-16 rounded-lg bg-gray-200 mr-3`}
                        />
                        <View style={tw`flex-1`}>
                          <Text
                            style={[
                              tw`font-semibold text-sm mb-1`,
                              { color: theme.colors.text },
                            ]}
                          >
                            {item.product.name}
                          </Text>
                          <Text
                            style={[
                              tw`text-xs`,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {item.quantity} adet
                          </Text>
                        </View>
                        <Text
                          style={[
                            tw`font-bold text-base`,
                            { color: theme.colors.text },
                          ]}
                        >
                          Toplam:{" "}
                          {formatPrice(item.product.price * item.quantity)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={tw`border-t border-gray-200 my-4`} />

                  <View style={tw`mb-4`}>
                    <Text
                      style={[
                        tw`font-bold text-base mb-3`,
                        { color: theme.colors.text },
                      ]}
                    >
                      Özet
                    </Text>
                    <View
                      style={[
                        tw`rounded-xl p-4`,
                        { backgroundColor: theme.colors.card },
                      ]}
                    >
                      <View style={tw`flex-row justify-between mb-2`}>
                        <Text
                          style={[
                            tw`text-sm`,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Ara Toplam
                        </Text>
                        <Text
                          style={[
                            tw`font-semibold text-sm`,
                            { color: theme.colors.text },
                          ]}
                        >
                          {formatPrice(calculateSubtotal(selectedOrder))}
                        </Text>
                      </View>
                      <View style={tw`flex-row justify-between mb-2`}>
                        <Text
                          style={[
                            tw`text-sm`,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Kargo Ücreti
                        </Text>
                        <Text
                          style={[
                            tw`font-semibold text-sm`,
                            { color: theme.colors.text },
                          ]}
                        >
                          {formatPrice(selectedOrder.shippingCost || 0)}
                        </Text>
                      </View>
                      <View
                        style={tw`border-t border-gray-200 mt-2 pt-3 flex-row justify-between`}
                      >
                        <Text
                          style={[
                            tw`font-bold text-base`,
                            { color: theme.colors.text },
                          ]}
                        >
                          Toplam
                        </Text>
                        <Text
                          style={[
                            tw`font-bold text-lg`,
                            { color: theme.colors.primary },
                          ]}
                        >
                          {formatPrice(selectedOrder.total)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}

              <View
                style={tw`px-6 py-4 border-t border-gray-200 ${
                  Platform.OS === "ios" ? "pb-8" : "pb-4"
                }`}
              >
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={[
                    tw`py-4 rounded-xl`,
                    { backgroundColor: theme.colors.barColor },
                  ]}
                >
                  <Text style={tw`text-white font-bold text-center text-base`}>
                    Kapat
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <View
        style={[
          tw`pt-16 pb-6 px-4`,
          { backgroundColor: theme.colors.headerBackground },
        ]}
      >
        <Text style={[tw`text-2xl font-bold`, { color: theme.colors.text }]}>
          Siparişlerim
        </Text>
        <Text
          style={[tw`text-sm mt-1`, { color: theme.colors.text, opacity: 0.8 }]}
        >
          {orders.length} sipariş
        </Text>
      </View>

      <ScrollView
        style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 110 : 90,
          padding: 16,
        }}
      >
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const canCancel = order.status === "pending";

          return (
            <View
              key={order.id}
              style={[
                tw`rounded-2xl p-4 mb-4 shadow-sm`,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={tw`flex-row items-center justify-between mb-3`}>
                <View style={tw`flex-row items-center`}>
                  <Text
                    style={[
                      tw`font-bold text-lg mr-2`,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {order.orderNumber}
                  </Text>
                  <View
                    style={tw`${statusConfig.bgColor} px-3 py-1 rounded-full flex-row items-center`}
                  >
                    <Text style={tw`mr-1`}>{statusConfig.icon}</Text>
                    <Text
                      style={tw`${statusConfig.textColor} text-xs font-semibold`}
                    >
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={tw`mb-3`}>
                <View style={tw`flex-row items-center mb-2`}>
                  <Text style={tw`text-sm mr-2`}>📅</Text>
                  <Text style={[tw`text-sm`, { color: theme.colors.text }]}>
                    {formatDate(order.date)}
                  </Text>
                </View>
                <View style={tw`flex-row items-center mb-2`}>
                  <Text style={tw`text-gray-500 text-sm mr-2`}>📦</Text>
                  <Text
                    style={[tw`text-sm`, { color: theme.colors.textSecondary }]}
                  >
                    {order.items?.length || 0} ürün
                  </Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  <Text style={tw`text-gray-500 text-sm mr-2`}>💰</Text>
                  <Text
                    style={[
                      tw`font-bold text-base`,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {formatPrice(order.total)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  tw`border-t my-3`,
                  { borderTopColor: theme.colors.divider },
                ]}
              />

              <View style={tw`flex-row gap-2`}>
                <TouchableOpacity
                  onPress={() => handleViewOrder(order)}
                  style={[
                    tw`flex-1 py-3 rounded-xl`,
                    {
                      backgroundColor: theme.colors.buttonSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      tw`font-semibold text-center text-sm`,
                      { color: theme.colors.text },
                    ]}
                  >
                    Detayları Gör
                  </Text>
                </TouchableOpacity>

                {canCancel && (
                  <TouchableOpacity
                    onPress={() => handleCancelOrder(order)}
                    style={[
                      tw`flex-1 py-3 rounded-xl`,
                      { backgroundColor: theme.colors.error },
                    ]}
                  >
                    <Text
                      style={[
                        tw`font-semibold text-center text-sm`,
                        { color: theme.colors.onPrimary },
                      ]}
                    >
                      İptal Et
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {orders.length === 0 && (
          <View style={tw`items-center justify-center py-20`}>
            <Text style={tw`text-6xl mb-4`}>📦</Text>
            <Text
              style={[
                tw`text-lg font-semibold mb-2`,
                { color: theme.colors.textSecondary },
              ]}
            >
              Henüz siparişiniz yok
            </Text>
            <Text
              style={[
                tw`text-sm text-center`,
                { color: theme.colors.textTertiary },
              ]}
            >
              Alışverişe başlayın ve siparişlerinizi buradan takip edin
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;
