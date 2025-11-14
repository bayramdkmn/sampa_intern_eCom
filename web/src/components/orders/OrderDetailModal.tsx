"use client";

import React from "react";
import { Modal, Box, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";
import { Order } from "./types";

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onCancelOrder: (orderId: string) => void;
}

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "Shipped":
      return "bg-blue-100 text-blue-700";
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Processing":
      return "bg-yellow-100 text-yellow-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  open,
  order,
  onClose,
  onCancelOrder,
}) => {
  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="order-detail-modal">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "90%", md: 700 },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 0,
        }}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sipariş Detayı</h2>
            <p className="text-sm text-gray-600 mt-1">
              {order.orderNumber} • {order.date}
            </p>
          </div>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">
          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>

          {/* Products */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ürünler
            </h3>
            <div className="space-y-4">
              {order.products.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 bg-gray-50 rounded-lg p-4"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Renk: {product.color}
                      {product.size && ` • Beden: ${product.size}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Adet: {product.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₺{product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Teslimat Adresi
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.name}
              </p>
              <p className="text-gray-700 mt-1">
                {order.shippingAddress.street}
              </p>
              <p className="text-gray-700">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-700">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ödeme Bilgisi
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Toplam Tutar
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ₺{order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
          {order.status === "Processing" && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => {
                onCancelOrder(order.id);
                onClose();
              }}
              sx={{ textTransform: "none" }}
            >
              Siparişi İptal Et
            </Button>
          )}
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              textTransform: "none",
              backgroundColor: "#2563eb",
              "&:hover": { backgroundColor: "#1d4ed8" },
            }}
          >
            Kapat
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default OrderDetailModal;
