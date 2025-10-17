"use client";

import { User } from "@/app/types/User";
import React, { useEffect, useState } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  DialogContentText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { authService } from "@/services/authService";
import Link from "next/link";
import { showToast } from "@/utils/toast";
import { PaymentCard } from "@/types/api";

interface PaymentMethodsInformationProps {
  user: User;
  initialCards?: PaymentCard[];
}

interface PaymentMethod {
  id: string;
  cardType: "Visa" | "Mastercard" | "Amex";
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  isPrimary?: boolean;
}

const PaymentMethodsInformation = ({
  user,
  initialCards = [],
}: PaymentMethodsInformationProps) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Eğer initialCards varsa API çağrısı yapma
    if (initialCards.length > 0) {
      return;
    }

    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);

      // User kontrolü - eğer user yoksa zaten ProfileComponent'te render edilmez
      if (!user) {
        if (mounted) {
          setError("Kartları görmek için lütfen giriş yapın.");
          setLoading(false);
        }
        return;
      }

      // Token kontrolü - logout sırasında API çağrısı yapma
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.log("⚠️ No token available, skipping cards fetch");
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await authService.getCards();
        if (!mounted) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized: PaymentMethod[] = (res || []).map((c: any) => ({
          id: String(c.id ?? c.pk ?? crypto.randomUUID?.() ?? Date.now()),
          cardType: (c.card_type ||
            c.brand ||
            "Visa") as PaymentMethod["cardType"],
          lastFourDigits: String(
            c.last4 || c.last_four || c.lastFourDigits || "****"
          ).slice(-4),
          expiryMonth: String(c.exp_month || c.expiry_month || ""),
          expiryYear: String(c.exp_year || c.expiry_year || ""),
          isPrimary: Boolean(c.is_primary || c.isPrimary),
        }));
        setPaymentMethods(normalized);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        const msg =
          e?.status === 401
            ? "Kartları görmek için giriş yapmalısınız."
            : e?.message || "Kartlar alınamadı";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]); // user dependency eklendi

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    cardType: "Visa" as "Visa" | "Mastercard" | "Amex",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const handleDelete = (card: PaymentMethod) => {
    setSelectedCard(card);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCard) return;
    try {
      await authService.deleteCard(selectedCard.id);
      const res = await authService.getCards();
      const normalized: PaymentMethod[] = (res || []).map((c: any) => ({
        id: String(c.id ?? c.pk ?? crypto.randomUUID?.() ?? Date.now()),
        cardType: (c.card_type ||
          c.brand ||
          "Visa") as PaymentMethod["cardType"],
        lastFourDigits: String(
          c.last4 || c.last_four || c.lastFourDigits || "****"
        ).slice(-4),
        expiryMonth: String(c.exp_month || c.expiry_month || ""),
        expiryYear: String(c.exp_year || c.expiry_year || ""),
        isPrimary: Boolean(c.is_primary || c.isPrimary),
      }));
      setPaymentMethods(normalized);
      setIsDeleteDialogOpen(false);
      setSelectedCard(null);
    } catch (e: any) {
      // Kart silme hatası
    }
  };

  const handleAddNew = () => {
    setFormData({
      cardNumber: "",
      cardHolder: "",
      cardType: "Visa",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    });
    setIsAddModalOpen(true);
  };

  const handleSaveCard = async () => {
    const numericCardNumber = formData.cardNumber.replace(/\s/g, "");
    try {
      const payload = {
        card_holder_name: formData.cardHolder,
        card_number: numericCardNumber,
        expiry_month: Number(formData.expiryMonth || 0),
        expiry_year: Number(formData.expiryYear || 0),
        cvv: formData.cvv,
      };
      await authService.createCard(payload);
      const res = await authService.getCards();
      const normalized: PaymentMethod[] = (res || []).map((c: any) => ({
        id: String(c.id ?? c.pk ?? crypto.randomUUID?.() ?? Date.now()),
        cardType: (c.card_type ||
          c.brand ||
          "Visa") as PaymentMethod["cardType"],
        lastFourDigits: String(
          c.last4 || c.last_four || c.lastFourDigits || "****"
        ).slice(-4),
        expiryMonth: String(c.exp_month || c.expiry_month || ""),
        expiryYear: String(c.exp_year || c.expiry_year || ""),
        isPrimary: Boolean(c.is_primary || c.isPrimary),
      }));
      setPaymentMethods(normalized);
      setIsAddModalOpen(false);
    } catch (e) {
      showToast.error(
        "Kart eklenirken bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === "cardNumber") {
      const numericValue = value.replace(/\s/g, "");
      if (!/^\d*$/.test(numericValue) || numericValue.length > 16) return;

      const formatted =
        numericValue.match(/.{1,4}/g)?.join(" ") || numericValue;
      setFormData({ ...formData, [field]: formatted });
      return;
    }
    if (field === "cvv") {
      if (!/^\d*$/.test(value) || value.length > 3) return;
    }
    if (field === "expiryMonth") {
      if (!/^\d*$/.test(value) || value.length > 2) return;
      const month = parseInt(value);
      if (value.length === 2 && (month < 1 || month > 12)) return;
    }
    if (field === "expiryYear") {
      if (!/^\d*$/.test(value) || value.length > 4) return;
    }
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 text-black w-full">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <p className="text-gray-600">Manage your saved payment methods.</p>
      </div>

      <div className="border-t border-gray-200 pt-6">
        {loading && (
          <div className="text-sm text-gray-600 py-4">
            Kartlar yükleniyor...
          </div>
        )}
        {error && !loading && (
          <div className="text-sm text-red-600 py-4">
            {error}{" "}
            {error.includes("giriş") && (
              <>
                {" "}
                <Link href="/login" className="text-blue-600 underline">
                  Giriş Yap
                </Link>
              </>
            )}
          </div>
        )}
        <div className="space-y-4">
          {!loading &&
            !error &&
            paymentMethods.map((method) => (
              <div
                key={method.id}
                className="border border-gray-300 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <CreditCardIcon sx={{ fontSize: 40, color: "#6b7280" }} />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {method.cardType} ending in {method.lastFourDigits}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                </div>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(method)}
                  sx={{ color: "#6b7280" }}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAddNew}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Add New Card
          </button>
        </div>
      </div>

      {/* Add Card Modal */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Card</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <TextField
              select
              label="Card Type"
              fullWidth
              value={formData.cardType}
              onChange={(e) => handleInputChange("cardType", e.target.value)}
            >
              <MenuItem value="Visa">Visa</MenuItem>
              <MenuItem value="Mastercard">Mastercard</MenuItem>
              <MenuItem value="Amex">American Express</MenuItem>
            </TextField>

            <TextField
              label="Card Number"
              fullWidth
              value={formData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              placeholder="1234 5678 9012 3456"
              required
              helperText={`${formData.cardNumber.replace(/\s/g, "").length}/16`}
            />

            <TextField
              label="Card Holder Name"
              fullWidth
              value={formData.cardHolder}
              onChange={(e) => handleInputChange("cardHolder", e.target.value)}
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <TextField
                label="Month"
                fullWidth
                value={formData.expiryMonth}
                onChange={(e) =>
                  handleInputChange("expiryMonth", e.target.value)
                }
                placeholder="MM"
                required
                helperText="01-12"
              />
              <TextField
                label="Year"
                fullWidth
                value={formData.expiryYear}
                onChange={(e) =>
                  handleInputChange("expiryYear", e.target.value)
                }
                placeholder="YYYY"
                required
              />
              <TextField
                label="CVV"
                fullWidth
                value={formData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                placeholder="123"
                required
                type="password"
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsAddModalOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCard}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#2563eb",
              "&:hover": { backgroundColor: "#1d4ed8" },
            }}
            disabled={
              formData.cardNumber.replace(/\s/g, "").length !== 16 ||
              !formData.cardHolder ||
              !formData.expiryMonth ||
              !formData.expiryYear ||
              formData.cvv.length !== 3
            }
          >
            Add Card
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="error" />
          Delete Payment Method
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment method?
            <br />
            <strong>
              {selectedCard?.cardType} ending in {selectedCard?.lastFourDigits}
            </strong>
            <br />
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentMethodsInformation;
