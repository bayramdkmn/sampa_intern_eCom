"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import OrdersTable from "./orders/OrdersTable";
import OrderDetailModal from "./orders/OrderDetailModal";
import CancelOrderDialog from "./orders/CancelOrderDialog";
import { Order } from "./orders/types";
import { mockOrders } from "./orders/mockData";
import { Order as ApiOrder } from "@/types/api";
import { clientApi } from "@/services/ClientApi";

interface OrdersComponentProps {
  initialOrders: ApiOrder[];
  loading?: boolean;
  error?: string | null;
}

const OrdersComponent = ({
  initialOrders,
  loading = false,
  error = null,
}: OrdersComponentProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const mapApiToUi = (apiOrder: ApiOrder): Order => ({
    id: apiOrder.id.toString(),
    orderNumber: `ORD-${apiOrder.id}`,
    date: new Date(apiOrder.created_at).toLocaleDateString(),
    status: ((): Order["status"] => {
      const s = String((apiOrder as any).status || "").toLowerCase();
      if (s === "shipped") return "Shipped";
      if (s === "delivered" || s === "completed") return "Delivered";
      if (s === "cancelled") return "Cancelled";
      return "Processing";
    })(),
    total:
      typeof apiOrder.total_amount === "string"
        ? parseFloat(apiOrder.total_amount)
        : ((apiOrder as any).total_amount ??
            parseFloat((apiOrder as any).total_price as any)) ||
          0,
    products: ((apiOrder as any).items || []).map((it: any) => ({
      id: String(it.product ?? it.id),
      name: it.product_name || (it.product?.name ?? "Ürün"),
      image: "/sampa-logo.png",
      color: "-",
      size: undefined,
      quantity: Number(it.quantity || 0),
      price: parseFloat(
        String(it.price || it.unit_price || it.total_price || 0)
      ),
    })),
    shippingAddress: {
      name:
        `${apiOrder.shipping_address?.first_name ?? ""} ${
          apiOrder.shipping_address?.last_name ?? ""
        }`.trim() || "-",
      street: apiOrder.shipping_address?.address_line_1 ?? "-",
      city: apiOrder.shipping_address?.city ?? "-",
      postalCode: apiOrder.shipping_address?.postal_code ?? "-",
      country: apiOrder.shipping_address?.country ?? "-",
    },
    paymentMethod:
      (apiOrder as any)?.payment_method?.brand ||
      (apiOrder as any)?.payment_method ||
      "-",
  });

  const [orders, setOrders] = useState<Order[]>(
    initialOrders.length > 0 ? initialOrders.map(mapApiToUi) : mockOrders
  );

  useEffect(() => {
    setOrders(
      initialOrders.length > 0 ? initialOrders.map(mapApiToUi) : mockOrders
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrders]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-600">Siparişler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Hata: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="text-gray-600">Giriş yapmanız gerekiyor...</div>
      </div>
    );
  }

  const handleViewOrder = async (order: Order) => {
    try {
      const apiOrder = initialOrders.find((o) => o.id.toString() === order.id);
      if (!apiOrder) {
        setSelectedOrder(order);
        setIsModalOpen(true);
        return;
      }

      const totalRaw =
        (apiOrder as any).total_price ?? (apiOrder as any).total_amount;
      const items: any[] = (apiOrder as any).items || [];

      const detailed: Order = {
        id: apiOrder.id.toString(),
        orderNumber: (apiOrder as any).order_number || `ORD-${apiOrder.id}`,
        date: new Date(apiOrder.created_at).toLocaleDateString(),
        status: ((): Order["status"] => {
          const s = String((apiOrder as any).status || "").toLowerCase();
          if (s === "shipped") return "Shipped";
          if (s === "delivered" || s === "completed") return "Delivered";
          if (s === "cancelled") return "Cancelled";
          return "Processing";
        })(),
        total:
          typeof totalRaw === "string"
            ? parseFloat(totalRaw)
            : Number(totalRaw || 0),
        products: items.map((it) => ({
          id: String(it.product ?? it.id),
          name: it.product_name || (it.product?.name ?? "Ürün"),
          image: "/sampa-logo.png",
          color: "-",
          size: undefined,
          quantity: Number(it.quantity || 0),
          price: parseFloat(
            String(it.price || it.unit_price || it.total_price || 0)
          ),
        })),
        shippingAddress: {
          name:
            `${(apiOrder as any).shipping_address?.first_name ?? ""} ${
              (apiOrder as any).shipping_address?.last_name ?? ""
            }`.trim() || "-",
          street: (apiOrder as any).shipping_address?.address_line_1 ?? "-",
          city: (apiOrder as any).shipping_address?.city ?? "-",
          postalCode: (apiOrder as any).shipping_address?.postal_code ?? "-",
          country: (apiOrder as any).shipping_address?.country ?? "-",
        },
        paymentMethod:
          (apiOrder as any)?.payment_method?.brand ||
          (apiOrder as any)?.payment_method ||
          "-",
      };

      setSelectedOrder(detailed);
      setIsModalOpen(true);
    } catch (e) {
      console.error("Sipariş detayı hazırlanamadı:", e);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenCancelDialog = (orderId: string) => {
    setOrderToCancel(orderId);
    setIsCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setIsCancelDialogOpen(false);
    setOrderToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      await clientApi.cancelOrder(orderToCancel);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToCancel ? { ...o, status: "Cancelled" } : o
        )
      );
      if (selectedOrder && selectedOrder.id === orderToCancel) {
        setSelectedOrder({ ...selectedOrder, status: "Cancelled" });
      }
      handleCloseCancelDialog();
    } catch (e) {
      console.error("Sipariş iptal edilemedi:", e);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

      <OrdersTable
        orders={orders}
        onViewOrder={handleViewOrder}
        onCancelOrder={handleOpenCancelDialog}
      />

      <OrderDetailModal
        open={isModalOpen}
        order={selectedOrder}
        onClose={handleCloseModal}
        onCancelOrder={handleOpenCancelDialog}
      />

      <CancelOrderDialog
        open={isCancelDialogOpen}
        orderNumber={orderToCancel}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default OrdersComponent;
