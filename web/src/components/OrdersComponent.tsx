"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import OrdersTable from "./orders/OrdersTable";
import OrderDetailModal from "./orders/OrderDetailModal";
import CancelOrderDialog from "./orders/CancelOrderDialog";
import { Order } from "./orders/types";
import { mockOrders } from "./orders/mockData";

const OrdersComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Sadece loading bittikten sonra ve hala authenticate değilse yönlendir
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading state - AuthContext yüklenene kadar bekle
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-600">Siparişler yükleniyor...</div>
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const orders = mockOrders;

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
