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
  FormControlLabel,
  Checkbox,
  DialogContentText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { authService } from "@/services/authService";
import Link from "next/link";
import { Address } from "@/types/api";

interface ShippingAdressesInformationProps {
  user: User;
  initialAddresses?: Address[];
  onAddressesUpdate?: (addresses: Address[]) => void;
}

const ShippingAdressesInformation = ({
  user,
  initialAddresses = [],
  onAddressesUpdate,
}: ShippingAdressesInformationProps) => {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Eğer initialAddresses varsa API çağrısı yapma
    if (initialAddresses.length > 0) {
      return;
    }

    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);

      // User kontrolü - eğer user yoksa zaten ProfileComponent'te render edilmez
      if (!user) {
        if (mounted) {
          setError("Adresleri görmek için lütfen giriş yapın.");
          setLoading(false);
        }
        return;
      }

      // Token kontrolü - logout sırasında API çağrısı yapma
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.log("⚠️ No token available, skipping address fetch");
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await authService.getAddresses();
        if (!mounted) return;

        const normalized = (res || []).map((a: any) => ({
          id: String(a.id ?? a.pk ?? crypto.randomUUID?.() ?? Date.now()),
          title: a.title || "",
          street: a.street || a.address_line_1 || a.line1 || "",
          city: a.city || "",
          district: a.district || "",
          country: a.country || "",
          zipCode: a.zipCode || a.postal_code || a.zip || "",
          isPrimary: Boolean(a.is_primary || a.isPrimary),
        }));

        setAddresses(normalized as any);
      } catch (e: any) {
        console.error("Address loading error:", e);
        const msg =
          e?.status === 401
            ? "Adresleri görmek için giriş yapmalısınız."
            : e?.message || "Adresler alınamadı";
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrimaryWarningOpen, setIsPrimaryWarningOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    street: "",
    city: "",
    district: "",
    country: "",
    zipCode: "",
    isPrimary: false,
  });
  const [pendingSave, setPendingSave] = useState<"add" | "edit" | null>(null);

  const handleEdit = (address: Address) => {
    setSelectedAddress(address);
    setFormData({
      title: (address as any).title || "",
      street:
        (address as any).street ||
        (address as any).address_line_1 ||
        (address as any).address_line ||
        "",
      city: (address as any).city || "",
      district: (address as any).district || "",
      country: (address as any).country || "",
      zipCode: (address as any).zipCode || (address as any).postal_code || "",
      isPrimary: Boolean(
        (address as any).isPrimary || (address as any).is_primary
      ),
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (address: Address) => {
    setSelectedAddress(address);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAddress) return;
    try {
      await authService.deleteAddress(selectedAddress.id);
      const res = await authService.getAddresses();
      const normalized = (res || []).map((a: any) => ({
        id: String(a.id ?? a.pk ?? crypto.randomUUID?.() ?? Date.now()),
        title: a.title || "",
        street: a.street || a.address_line || a.line1 || "",
        city: a.city || "",
        district: a.district || "",
        country: a.country || "",
        zipCode: a.zipCode || a.postal_code || a.zip || "",
        isPrimary: Boolean(a.is_primary || a.isPrimary),
      }));
      setAddresses(normalized as any);
      setIsDeleteDialogOpen(false);
      setSelectedAddress(null);
    } catch (e: any) {
      setError(e?.message || "Adres silinemedi");
    }
  };

  const handleAddNew = () => {
    setFormData({
      title: "",
      street: "",
      city: "",
      district: "",
      country: "",
      zipCode: "",
      isPrimary: false,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNew = async () => {
    if (formData.isPrimary) {
      const existingPrimary = addresses.find((addr) => (addr as any).isPrimary);
      if (existingPrimary) {
        setPendingSave("add");
        setIsPrimaryWarningOpen(true);
        return;
      }
    }

    if (!formData.district) {
      setError("District alanı zorunludur.");
      return;
    }

    try {
      // Backend beklenen payload formatı
      const payload = {
        title: formData.title,
        address_line: formData.street,
        city: formData.city,
        district: formData.district,
        postal_code: formData.zipCode,
        country: formData.country,
      };
      await authService.createAddress(payload);
      // Başarı sonrası listeyi yeniden çek
      const res = await authService.getAddresses();
      const normalized = (res || []).map((a: any) => ({
        id: String(a.id ?? a.pk ?? crypto.randomUUID?.() ?? Date.now()),
        title: a.title || "",
        street: a.street || a.address_line || a.line1 || "",
        city: a.city || "",
        district: a.district || "",
        country: a.country || "",
        zipCode: a.zipCode || a.postal_code || a.zip || "",
        isPrimary: Boolean(a.is_primary || a.isPrimary),
      }));
      setAddresses(normalized as any);
      setIsAddModalOpen(false);
    } catch (e: any) {
      setError(e?.message || "Adres kaydedilemedi");
    }
  };

  const handleSaveEdit = () => {
    if (!selectedAddress) return;

    if (formData.isPrimary && !(selectedAddress as any).isPrimary) {
      const existingPrimary = addresses.find(
        (addr) => (addr as any).isPrimary && addr.id !== selectedAddress.id
      );
      if (existingPrimary) {
        setPendingSave("edit");
        setIsPrimaryWarningOpen(true);
        return;
      }
    }

    setAddresses(
      addresses.map((addr) =>
        addr.id === selectedAddress.id ? { ...addr, ...formData } : addr
      )
    );
    setIsEditModalOpen(false);
    setSelectedAddress(null);
  };

  const handleConfirmPrimaryChange = () => {
    if (pendingSave === "add") {
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isPrimary: false,
      }));
      const newAddress = {
        id: Date.now().toString(),
        ...formData,
      } as any;
      setAddresses([...updatedAddresses, newAddress]);
      setIsAddModalOpen(false);
    } else if (pendingSave === "edit" && selectedAddress) {
      const updatedAddresses = addresses.map((addr) =>
        addr.id === selectedAddress.id
          ? { ...addr, ...formData }
          : { ...addr, isPrimary: false }
      );
      setAddresses(updatedAddresses);
      setIsEditModalOpen(false);
      setSelectedAddress(null);
    }
    setIsPrimaryWarningOpen(false);
    setPendingSave(null);
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    if (field === "zipCode" && typeof value === "string") {
      if (!/^\d*$/.test(value)) {
        return;
      }
    }
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 text-black w-full">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-2xl font-bold">Shipping Addresses</h2>
        <p className="text-gray-600">Manage your shipping addresses.</p>
      </div>

      <div className="border-t border-gray-200 pt-6">
        {loading && (
          <div className="text-sm text-gray-600 py-4">
            Adresler yükleniyor...
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
            addresses.map((address) => (
              <div
                key={address.id}
                className="border border-gray-300 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {(address as any).title
                      ? (address as any).title + " – "
                      : ""}
                    {(address as any).street}, {(address as any).city}
                    {(address as any).district
                      ? `, ${(address as any).district}`
                      : ""}
                    , {(address as any).country} {(address as any).zipCode}
                  </p>
                  {(address as any).isPrimary && (
                    <span className="text-sm text-gray-600 mt-1 inline-block">
                      Primary Address
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(address)}
                    sx={{ color: "#6b7280" }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(address)}
                    sx={{ color: "#6b7280" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAddNew}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Add New Address
          </button>
        </div>
      </div>

      <Dialog
        open={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isAddModalOpen ? "Add New Address" : "Edit Address"}
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
            <TextField
              label="Street Address"
              fullWidth
              value={formData.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="City"
                fullWidth
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
              <TextField
                label="Zip Code"
                fullWidth
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                required
              />
            </div>
            <TextField
              label="District"
              fullWidth
              value={formData.district}
              onChange={(e) => handleInputChange("district", e.target.value)}
            />
            <TextField
              label="Country"
              fullWidth
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isPrimary}
                  onChange={(e) =>
                    handleInputChange("isPrimary", e.target.checked)
                  }
                />
              }
              label="Set as primary address"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
            }}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={isAddModalOpen ? handleSaveNew : handleSaveEdit}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#2563eb",
              "&:hover": { backgroundColor: "#1d4ed8" },
            }}
          >
            {isAddModalOpen ? "Add Address" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="error" />
          Delete Address
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this address?
            <br />
            <strong>
              {(selectedAddress as any)?.street},{" "}
              {(selectedAddress as any)?.city}
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

      <Dialog
        open={isPrimaryWarningOpen}
        onClose={() => {
          setIsPrimaryWarningOpen(false);
          setPendingSave(null);
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Change Primary Address
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You already have a primary address. Setting this address as primary
            will remove the primary status from your current primary address.
            <br />
            <br />
            Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setIsPrimaryWarningOpen(false);
              setPendingSave(null);
            }}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPrimaryChange}
            variant="contained"
            color="warning"
            sx={{ textTransform: "none" }}
          >
            Yes, Change Primary
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ShippingAdressesInformation;
