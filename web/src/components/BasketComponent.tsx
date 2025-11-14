"use client";

import React, { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function BasketComponent() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      removeFromCart(itemToDelete);
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();

  return (
    <div className="w-full py-4 md:py-8">
      <div className="mx-auto px-6 sm:px-8 lg:px-16">
        <h1 className="mb-4 md:mb-8 text-2xl md:text-3xl font-bold text-gray-900">
          Shopping Cart
        </h1>

        {!isAuthenticated ? (
          <div className="rounded-lg bg-white p-8 md:p-12 text-center shadow-sm">
            <p className="mb-4 text-lg text-gray-600">
              Lütfen önce giriş yapın
            </p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700"
            >
              Giriş Yap
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-lg bg-white p-8 md:p-12 text-center shadow-sm">
            <p className="mb-4 text-lg text-gray-600">Sepetiniz boş</p>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Alışverişe Devam Et →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden md:grid grid-cols-12 gap-4 border-b bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Subtotal</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Cart Items */}
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id}>
                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-6 items-center">
                        {/* Product Info */}
                        <div className="col-span-5 flex items-center gap-4">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <img src={item.image} />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Color: {item.color}
                              {item.size ? `, Size: ${item.size}` : ""}
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-center text-gray-700">
                          ₺{item.price.toFixed(2)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="col-span-2 flex justify-center">
                          <div className="flex items-center rounded-md border border-gray-300 bg-white">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="px-3 py-2 text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-12 border-x border-gray-300 text-black py-2 text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min="1"
                            />
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="px-3 py-2 cursor-pointer text-gray-600 hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="col-span-2 text-center font-semibold text-gray-900">
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </div>

                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-gray-400 cursor-pointer transition-colors hover:text-red-600"
                            aria-label="Ürünü sil"
                          >
                            <DeleteOutlineIcon />
                          </button>
                        </div>
                      </div>

                      <div className="md:hidden p-4 space-y-3">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <img src={item.image} />
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {item.color}
                              {item.size ? `, ${item.size}` : ""}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              ₺{item.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-gray-400 transition-colors hover:text-red-600 self-start"
                            aria-label="Ürünü sil"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </button>
                        </div>

                        {/* Quantity and Subtotal */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Qty:</span>
                            <div className="flex items-center rounded-md border border-gray-300 bg-white">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="px-2 py-1 text-gray-600 hover:bg-gray-50 text-sm"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.id,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-10 border-x border-gray-300 py-1 text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min="1"
                              />
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="px-2 py-1 text-gray-600 hover:bg-gray-50 text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Subtotal</p>
                            <p className="text-base font-bold text-gray-900">
                              ₺{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-lg bg-white p-4 md:p-6 shadow-sm">
                <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-bold text-gray-900">
                  Order Summary
                </h2>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between text-sm md:text-base text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ₺{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm md:text-base text-gray-700">
                    <span>Shipping</span>
                    <span className="text-xs md:text-sm text-gray-500">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="flex justify-between text-sm md:text-base text-gray-700">
                    <span>Taxes</span>
                    <span className="text-xs md:text-sm text-gray-500">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="border-t pt-3 md:pt-4">
                    <div className="flex justify-between text-base md:text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₺{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link href={"/checkout"}>
                  <button className="mt-4 md:mt-6 w-full rounded-lg bg-blue-600 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base cursor-pointer font-semibold text-white transition-colors hover:bg-blue-700">
                    Proceed to Checkout
                  </button>
                </Link>

                <div className="mt-3 md:mt-4 text-center">
                  <Link
                    href="/products"
                    className="text-xs md:text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    or Continue Shopping →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity"
            onClick={cancelDelete}
          ></div>

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md transform rounded-2xl bg-white p-5 md:p-6 shadow-2xl transition-all">
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-red-100">
                <DeleteOutlineIcon className="text-red-600" fontSize="small" />
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg md:text-xl font-semibold text-gray-900">
                Ürünü Sepetten Çıkar
              </h3>

              {/* Message */}
              <p className="mb-5 md:mb-6 text-sm md:text-base text-gray-600">
                Bu ürünü sepetinizden çıkarmak istediğinizden emin misiniz?
              </p>

              {/* Buttons */}
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-lg bg-red-600 px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base font-medium text-white transition-colors hover:bg-red-700"
                >
                  Evet, Çıkar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
