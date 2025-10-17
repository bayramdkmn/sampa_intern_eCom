"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import { Order } from "./types";

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
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

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onViewOrder,
  onCancelOrder,
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Sipariş Bulunamadı
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Henüz hiç sipariş vermediniz.
        </p>
        <div className="mt-6">
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="hidden md:grid md:grid-cols-5 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Order
        </div>
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Date
        </div>
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Total
        </div>
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Status
        </div>
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider"></div>
      </div>

      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="md:hidden text-sm font-semibold text-gray-600 mr-2">
                Order:
              </span>
              <span className="text-blue-600 font-semibold">
                {order.orderNumber}
              </span>
            </div>

            <div className="flex items-center">
              <span className="md:hidden text-sm font-semibold text-gray-600 mr-2">
                Date:
              </span>
              <span className="text-gray-700">{order.date}</span>
            </div>

            <div className="flex items-center">
              <span className="md:hidden text-sm font-semibold text-gray-600 mr-2">
                Total:
              </span>
              <span className="text-gray-900 font-medium">
                ${order.total.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center">
              <span className="md:hidden text-sm font-semibold text-gray-600 mr-2">
                Status:
              </span>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex items-center justify-start md:justify-end gap-2 mt-2 md:mt-0">
              <Button
                variant="contained"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => onViewOrder(order)}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#2563eb",
                  "&:hover": { backgroundColor: "#1d4ed8" },
                }}
              >
                Göster
              </Button>
              {order.status === "Processing" && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => onCancelOrder(order.id)}
                  sx={{ textTransform: "none" }}
                >
                  İptal
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersTable;
