"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ShippingFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  nameOnCard: string;
}

type ShippingMethod = "standard" | "express";
type PaymentMethod = "credit" | "paypal" | "google";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface CheckOutComponentProps {
  initialOrderItems?: OrderItem[];
  userAddresses?: any[];
  userCards?: any[];
}

export default function CheckOutComponent({
  initialOrderItems = [],
  userAddresses = [],
  userCards = [],
}: CheckOutComponentProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Tüm hook'ları component'in başında tanımla
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");

  const [formData, setFormData] = useState<ShippingFormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    nameOnCard: "",
  });

  // Props'tan gelen veya varsayılan sipariş ürünleri
  const [orderItems] = useState<OrderItem[]>(
    initialOrderItems.length > 0
      ? initialOrderItems
      : [
          {
            id: 1,
            name: "Eco-Friendly Water Bottle",
            quantity: 2,
            price: 30.0,
          },
          { id: 2, name: "Organic Cotton T-Shirt", quantity: 1, price: 25.0 },
          { id: 3, name: "Reusable Shopping Bag", quantity: 3, price: 15.0 },
        ]
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-600">Checkout yükleniyor...</div>
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Postal code için sadece rakam kabul et
    if (name === "zipCode") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        [name]: numericValue,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Kredi kartı numarası formatı: 4'er 4'er
    if (name === "cardNumber") {
      const numericValue = value.replace(/\D/g, "");
      const formattedValue = numericValue
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .substring(0, 19); // 16 rakam + 3 boşluk
      setPaymentData({
        ...paymentData,
        [name]: formattedValue,
      });
      return;
    }

    // CVC sadece 3 rakam
    if (name === "cvc") {
      const numericValue = value.replace(/\D/g, "").substring(0, 3);
      setPaymentData({
        ...paymentData,
        [name]: numericValue,
      });
      return;
    }

    // Expiry date formatı: MM / YY
    if (name === "expiryDate") {
      const numericValue = value.replace(/\D/g, "");
      let formattedValue = numericValue;
      if (numericValue.length >= 2) {
        formattedValue =
          numericValue.substring(0, 2) + " / " + numericValue.substring(2, 4);
      }
      setPaymentData({
        ...paymentData,
        [name]: formattedValue,
      });
      return;
    }

    setPaymentData({
      ...paymentData,
      [name]: value,
    });
  };

  const validateShippingForm = () => {
    // Email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email || !emailPattern.test(formData.email)) {
      alert("Lütfen geçerli bir email adresi girin!");
      return false;
    }

    if (!formData.firstName || !formData.lastName) {
      alert("Lütfen adınızı ve soyadınızı girin!");
      return false;
    }

    if (!formData.address || !formData.city || !formData.state) {
      alert("Lütfen adres bilgilerini eksiksiz doldurun!");
      return false;
    }

    if (!formData.zipCode || formData.zipCode.length < 5) {
      alert("Lütfen geçerli bir posta kodu girin!");
      return false;
    }

    return true;
  };

  const validatePaymentForm = () => {
    if (paymentMethod === "credit") {
      // Kart numarası kontrolü (16 rakam)
      const cardNumberDigits = paymentData.cardNumber.replace(/\s/g, "");
      if (!cardNumberDigits || cardNumberDigits.length !== 16) {
        alert("Lütfen geçerli bir kart numarası girin! (16 rakam)");
        return false;
      }

      // Expiry date kontrolü
      if (!paymentData.expiryDate || paymentData.expiryDate.length < 7) {
        alert("Lütfen geçerli bir son kullanma tarihi girin! (MM / YY)");
        return false;
      }

      // CVC kontrolü (3 rakam)
      if (!paymentData.cvc || paymentData.cvc.length !== 3) {
        alert("Lütfen geçerli bir CVC kodu girin! (3 rakam)");
        return false;
      }

      // Kart üzerindeki isim kontrolü
      if (!paymentData.nameOnCard || paymentData.nameOnCard.trim().length < 3) {
        alert("Lütfen kart üzerindeki ismi girin!");
        return false;
      }

      return true;
    }
    return true; // PayPal ve Google Pay için form validasyonu yok
  };

  const handleContinueToPayment = () => {
    if (!validateShippingForm()) {
      return;
    }
    console.log("Shipping Data:", formData);
    console.log("Shipping Method:", shippingMethod);
    setCurrentStep(2);
  };

  const handleContinueToReview = () => {
    if (!validatePaymentForm()) {
      return;
    }
    console.log("Payment Data:", paymentData);
    console.log("Payment Method:", paymentMethod);
    setCurrentStep(3);
  };

  const handleConfirmOrder = () => {
    console.log("Order Confirmed!");
    setShowSuccessModal(true);

    // 3 saniye sonra ana sayfaya yönlendir
    setTimeout(() => {
      router.push("/");
    }, 3000);
  };

  const handleStepClick = (stepNumber: number) => {
    // Sadece tamamlanmış adımlara geri dönebilir
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const getShippingCost = () => {
    return shippingMethod === "standard" ? 0 : 15.0;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.075;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + getShippingCost() + calculateTax();
  };

  const steps = [
    { number: 1, label: "Shipping" },
    { number: 2, label: "Payment" },
    { number: 3, label: "Review" },
  ];

  return (
    <div className="w-full py-6 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 md:mb-12 text-center text-3xl md:text-4xl font-bold text-gray-900">
          Checkout
        </h1>

        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div
                  className="flex items-center cursor-pointer group"
                  onClick={() => handleStepClick(step.number)}
                >
                  <div
                    className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full text-sm md:text-base font-semibold transition-all ${
                      step.number <= currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    } ${
                      step.number < currentStep
                        ? "hover:bg-blue-700 cursor-pointer"
                        : ""
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`ml-2 md:ml-3 text-sm md:text-base font-medium ${
                      step.number <= currentStep
                        ? "text-blue-600"
                        : "text-gray-500"
                    } ${
                      step.number < currentStep
                        ? "group-hover:text-blue-700"
                        : ""
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 md:mx-4 h-0.5 w-16 md:w-32 ${
                      step.number < currentStep ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Shipping */}
        {currentStep === 1 && (
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-xl md:text-2xl font-bold text-gray-900">
                Shipping Information
              </h2>

              <div className="space-y-4 md:space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="state"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      State / Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="zipCode"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      ZIP / Postal code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-6 text-xl md:text-2xl font-bold text-gray-900">
                Shipping Method
              </h2>

              <div className="space-y-4">
                <div
                  onClick={() => setShippingMethod("standard")}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    shippingMethod === "standard"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex items-center pt-0.5">
                      <input
                        type="radio"
                        id="standard"
                        name="shipping"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="h-5 w-5 cursor-pointer border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <label
                      htmlFor="standard"
                      className="ml-3 flex-1 cursor-pointer"
                    >
                      <div className="font-semibold text-gray-900">
                        Standard Shipping
                      </div>
                      <div className="text-sm text-gray-600">
                        4-10 business days - $5.00
                      </div>
                    </label>
                  </div>
                </div>

                <div
                  onClick={() => setShippingMethod("express")}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    shippingMethod === "express"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex items-center pt-0.5">
                      <input
                        type="radio"
                        id="express"
                        name="shipping"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="h-5 w-5 cursor-pointer border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <label
                      htmlFor="express"
                      className="ml-3 flex-1 cursor-pointer"
                    >
                      <div className="font-semibold text-gray-900">
                        Express Shipping
                      </div>
                      <div className="text-sm text-gray-600">
                        2-5 business days - $15.00
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinueToPayment}
                className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 text-sm text-gray-600">
              Orders / Order #12345
            </div>

            <h2 className="mb-8 text-2xl md:text-3xl font-bold text-gray-900">
              Payment
            </h2>

            <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-gray-900">
                Payment method
              </h3>

              {/* Payment Method Options */}
              <div className="mb-8 space-y-3">
                {/* Credit Card */}
                <div
                  onClick={() => setPaymentMethod("credit")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === "credit"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === "credit"}
                      onChange={() => setPaymentMethod("credit")}
                      className="h-5 w-5 cursor-pointer text-blue-600"
                    />
                    <span className="ml-3 font-medium text-gray-900">
                      Credit card
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-2xl">💳</div>
                  </div>
                </div>

                {/* PayPal */}
                <div
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === "paypal"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                      className="h-5 w-5 cursor-pointer text-blue-600"
                    />
                    <span className="ml-3 font-medium text-gray-900">
                      PayPal
                    </span>
                  </div>
                </div>

                {/* Google Pay */}
                <div
                  onClick={() => setPaymentMethod("google")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === "google"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === "google"}
                      onChange={() => setPaymentMethod("google")}
                      className="h-5 w-5 cursor-pointer text-blue-600"
                    />
                    <span className="ml-3 font-medium text-gray-900">
                      Google Pay
                    </span>
                  </div>
                </div>
              </div>

              {/* Credit Card Form */}
              {paymentMethod === "credit" && (
                <div className="space-y-5">
                  {/* Card Number */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Card number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handlePaymentInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        💳
                      </div>
                    </div>
                  </div>

                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Expiry date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handlePaymentInputChange}
                        placeholder="MM / YY"
                        maxLength={7}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        CVC / CVV
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cvc"
                          value={paymentData.cvc}
                          onChange={handlePaymentInputChange}
                          placeholder="123"
                          maxLength={3}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          🔒
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Name on card
                    </label>
                    <input
                      type="text"
                      name="nameOnCard"
                      value={paymentData.nameOnCard}
                      onChange={handlePaymentInputChange}
                      placeholder="John Doe"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              {/* Privacy Policy */}
              <p className="mt-6 text-center text-xs text-gray-600">
                Your personal data will be used to process your order and for
                other purposes described in our privacy policy.
              </p>

              {/* Continue Button */}
              <button
                onClick={handleContinueToReview}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span>🔒</span>
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              Orders / Review Order
            </div>

            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-gray-900">
              Review Your Order
            </h2>
            <p className="mb-8 text-gray-600">
              Please review your order details before final confirmation.
            </p>

            <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
              {/* Left Column - Order Items & Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Order Items
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm font-medium text-gray-500">
                          <th className="pb-3">ITEM</th>
                          <th className="pb-3 text-center">QUANTITY</th>
                          <th className="pb-3 text-right">PRICE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-4 font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="py-4 text-center text-gray-600">
                              {item.quantity}
                            </td>
                            <td className="py-4 text-right text-gray-900">
                              ${item.price.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shipping & Payment Methods */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Shipping Method */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                      Shipping Method
                    </h3>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <span className="text-2xl">🚚</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {shippingMethod === "standard"
                            ? "Standard Shipping"
                            : "Express Shipping"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {shippingMethod === "standard"
                            ? "3-5 business days (Free)"
                            : "2-5 business days ($15.00)"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                      Payment Method
                    </h3>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {paymentMethod === "credit"
                            ? "Credit Card"
                            : paymentMethod === "paypal"
                            ? "PayPal"
                            : "Google Pay"}
                        </div>
                        {paymentMethod === "credit" && (
                          <div className="text-sm text-gray-600">
                            Ending in **** 4242
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Total */}
              <div className="lg:col-span-1">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-6 text-lg font-bold text-gray-900">
                    Order Total
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">
                        ${calculateSubtotal().toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="font-semibold">
                        {getShippingCost() === 0
                          ? "Free"
                          : `$${getShippingCost().toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-700">
                      <span>Tax (7.5%)</span>
                      <span className="font-semibold">
                        ${calculateTax().toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span>🔒</span>
                    Confirm Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                Ödeme Alındı!
              </h3>

              {/* Message */}
              <p className="mb-6 text-gray-600">
                Siparişiniz başarıyla oluşturuldu. Kısa süre içinde ana sayfaya
                yönlendirileceksiniz.
              </p>

              {/* Order Number */}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Sipariş Numarası</p>
                <p className="text-lg font-bold text-gray-900">#12345</p>
              </div>

              {/* Loading Indicator */}
              <div className="mt-6">
                <div className="mx-auto h-1 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full w-full animate-[loading_3s_ease-in-out] bg-green-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
