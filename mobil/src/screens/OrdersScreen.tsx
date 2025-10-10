import React, { useState } from "react";
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

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
  products?: OrderItem[];
  shippingCost?: number;
  address?: string;
}

const ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "#12345",
    date: "2024-01-15",
    total: 150.0,
    status: "shipped",
    items: 3,
    shippingCost: 15.0,
    address: "Atatürk Cad. No:123, Kadıköy/İstanbul",
    products: [
      {
        id: "1",
        name: "Premium Kuru Fasulye",
        image: "https://via.placeholder.com/100",
        price: 45.0,
        quantity: 2,
      },
      {
        id: "2",
        name: "Organik Mercimek",
        image: "https://via.placeholder.com/100",
        price: 30.0,
        quantity: 2,
      },
    ],
  },
  {
    id: "2",
    orderNumber: "#12346",
    date: "2024-02-20",
    total: 200.0,
    status: "delivered",
    items: 5,
    shippingCost: 20.0,
    address: "Bağdat Cad. No:456, Kadıköy/İstanbul",
    products: [
      {
        id: "3",
        name: "Osmanlı Kahvesi",
        image: "https://via.placeholder.com/100",
        price: 60.0,
        quantity: 1,
      },
      {
        id: "4",
        name: "Baharat Seti",
        image: "https://via.placeholder.com/100",
        price: 40.0,
        quantity: 3,
      },
    ],
  },
  {
    id: "3",
    orderNumber: "#12347",
    date: "2024-03-05",
    total: 75.0,
    status: "processing",
    items: 2,
    shippingCost: 10.0,
    address: "İstiklal Cad. No:789, Beyoğlu/İstanbul",
    products: [
      {
        id: "5",
        name: "Antep Fıstığı",
        image: "https://via.placeholder.com/100",
        price: 55.0,
        quantity: 1,
      },
    ],
  },
  {
    id: "4",
    orderNumber: "#12348",
    date: "2024-04-10",
    total: 300.0,
    status: "delivered",
    items: 7,
    shippingCost: 25.0,
    address: "Nişantaşı Mah. No:321, Şişli/İstanbul",
    products: [
      {
        id: "6",
        name: "Premium Zeytinyağı",
        image: "https://via.placeholder.com/100",
        price: 120.0,
        quantity: 2,
      },
      {
        id: "7",
        name: "Kuru Üzüm",
        image: "https://via.placeholder.com/100",
        price: 35.0,
        quantity: 1,
      },
    ],
  },
  {
    id: "5",
    orderNumber: "#12349",
    date: "2024-05-12",
    total: 100.0,
    status: "shipped",
    items: 4,
    shippingCost: 15.0,
    address: "Çamlıca Mah. No:567, Üsküdar/İstanbul",
    products: [
      {
        id: "8",
        name: "Çay",
        image: "https://via.placeholder.com/100",
        price: 25.0,
        quantity: 3,
      },
    ],
  },
];

const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const getStatusConfig = (status: Order["status"]) => {
    switch (status) {
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
    }
  };

  const handleCancelOrder = (order: Order) => {
    Alert.alert(
      "Siparişi İptal Et",
      `${order.orderNumber} numaralı siparişi iptal etmek istediğinize emin misiniz?`,
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "İptal Et",
          style: "destructive",
          onPress: () => {
            setOrders((prevOrders) =>
              prevOrders.map((o) =>
                o.id === order.id ? { ...o, status: "cancelled" as const } : o
              )
            );
            Alert.alert("Başarılı", "Siparişiniz iptal edildi.");
          },
        },
      ]
    );
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString: string) => {
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

  const calculateSubtotal = (order: Order) => {
    if (!order.products) return order.total;
    return order.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
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
            <View style={tw`flex-1 bg-white rounded-t-3xl`}>
              <View
                style={tw`flex-row items-center justify-between px-6 py-4 border-b border-gray-200 `}
              >
                <View>
                  <Text style={tw`text-gray-800 text-xl font-bold`}>
                    Sipariş Detayı
                  </Text>
                  {selectedOrder && (
                    <Text style={tw`text-blue-600 text-sm font-semibold mt-1`}>
                      {selectedOrder.orderNumber}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={tw`w-10 h-10 items-center justify-center`}
                >
                  <Text style={tw`text-gray-400 text-2xl`}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedOrder && (
                <ScrollView
                  style={tw`flex-1`}
                  contentContainerStyle={tw`px-6 py-4`}
                >
                  {/* Order Info */}
                  <View style={tw`mb-4`}>
                    <View style={tw`flex-row items-center mb-2`}>
                      <Text style={tw`text-gray-500 text-sm mr-2`}>📅</Text>
                      <Text style={tw`text-gray-600 text-sm`}>
                        {formatDate(selectedOrder.date)}
                      </Text>
                    </View>
                    {selectedOrder.address && (
                      <View style={tw`flex-row items-start mb-2`}>
                        <Text style={tw`text-gray-500 text-sm mr-2 mt-0.5`}>
                          📍
                        </Text>
                        <Text style={tw`text-gray-600 text-sm flex-1`}>
                          {selectedOrder.address}
                        </Text>
                      </View>
                    )}
                    <View style={tw`flex-row items-center`}>
                      <Text style={tw`text-gray-500 text-sm mr-2`}>📦</Text>
                      <View
                        style={tw`${
                          getStatusConfig(selectedOrder.status).bgColor
                        } px-3 py-1 rounded-full flex-row items-center`}
                      >
                        <Text style={tw`mr-1`}>
                          {getStatusConfig(selectedOrder.status).icon}
                        </Text>
                        <Text
                          style={tw`${
                            getStatusConfig(selectedOrder.status).textColor
                          } text-xs font-semibold`}
                        >
                          {getStatusConfig(selectedOrder.status).label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={tw`border-t border-gray-200 my-4`} />

                  {/* Products */}
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-gray-800 font-bold text-base mb-3`}>
                      Ürünler
                    </Text>
                    {selectedOrder.products?.map((item) => (
                      <View
                        key={item.id}
                        style={tw`flex-row items-center mb-3 bg-gray-50 rounded-xl p-3`}
                      >
                        <Image
                          source={{ uri: item.image }}
                          style={tw`w-16 h-16 rounded-lg bg-gray-200 mr-3`}
                        />
                        <View style={tw`flex-1`}>
                          <Text
                            style={tw`text-gray-800 font-semibold text-sm mb-1`}
                          >
                            {item.name}
                          </Text>
                          <Text style={tw`text-gray-500 text-xs`}>
                            {formatPrice(item.price)} x {item.quantity}
                          </Text>
                        </View>
                        <Text style={tw`text-gray-800 font-bold text-base`}>
                          {formatPrice(item.price * item.quantity)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Divider */}
                  <View style={tw`border-t border-gray-200 my-4`} />

                  {/* Price Summary */}
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-gray-800 font-bold text-base mb-3`}>
                      Özet
                    </Text>
                    <View style={tw`bg-gray-50 rounded-xl p-4`}>
                      <View style={tw`flex-row justify-between mb-2`}>
                        <Text style={tw`text-gray-600 text-sm`}>
                          Ara Toplam
                        </Text>
                        <Text style={tw`text-gray-800 font-semibold text-sm`}>
                          {formatPrice(calculateSubtotal(selectedOrder))}
                        </Text>
                      </View>
                      <View style={tw`flex-row justify-between mb-2`}>
                        <Text style={tw`text-gray-600 text-sm`}>
                          Kargo Ücreti
                        </Text>
                        <Text style={tw`text-gray-800 font-semibold text-sm`}>
                          {formatPrice(selectedOrder.shippingCost || 0)}
                        </Text>
                      </View>
                      <View
                        style={tw`border-t border-gray-200 mt-2 pt-3 flex-row justify-between`}
                      >
                        <Text style={tw`text-gray-800 font-bold text-base`}>
                          Toplam
                        </Text>
                        <Text style={tw`text-blue-600 font-bold text-lg`}>
                          {formatPrice(selectedOrder.total)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}

              {/* Modal Footer */}
              <View
                style={tw`px-6 py-4 border-t border-gray-200 ${
                  Platform.OS === "ios" ? "pb-8" : "pb-4"
                }`}
              >
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={tw`bg-blue-600 py-4 rounded-xl`}
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
          const canCancel = order.status === "processing";

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
                    {order.items} ürün
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
