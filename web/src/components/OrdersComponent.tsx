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

  // Tüm hook'ları component'in başında tanımla
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    // Sadece loading bittikten sonra ve hala authenticate değilse yönlendir
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading state - AuthContext yüklenene kadar bekle
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

  // AuthContext yüklendi ama user yoksa (login değilse)
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="text-gray-600">Giriş yapmanız gerekiyor...</div>
      </div>
    );
  }

  // API'den gelen siparişleri mock data formatına çevir
  const orders =
    initialOrders.length > 0
      ? initialOrders.map(
          (apiOrder): Order => ({
            id: apiOrder.id.toString(),
            orderNumber: `ORD-${apiOrder.id}`,
            date: new Date(apiOrder.created_at).toLocaleDateString(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status: apiOrder.status as any,
            total:
              typeof apiOrder.total_amount === "string"
                ? parseFloat(apiOrder.total_amount)
                : apiOrder.total_amount || 0,
            items: [],
          })
        )
      : mockOrders;

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenCancelDialog = (orderNumber: string) => {
    setOrderToCancel(orderNumber);
    setIsCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setIsCancelDialogOpen(false);
    setOrderToCancel(null);
  };

  const handleConfirmCancel = () => {
    if (orderToCancel) {
      console.log("Sipariş iptal ediliyor:", orderToCancel);
      alert(`Sipariş ${orderToCancel} iptal edildi!`);
      handleCloseCancelDialog();
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
