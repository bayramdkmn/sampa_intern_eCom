"use client";

import { User } from "@/app/types/User";
import React, { useState } from "react";
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

interface Address {
  id: string;
  street: string;
  city: string;
  country: string;
  zipCode: string;
  isPrimary: boolean;
}

const ShippingAdressesInformation = ({ user }: { user: User }) => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      street: "123 Main St",
      city: "Anytown",
      country: "USA",
      zipCode: "12345",
      isPrimary: true,
    },
    {
      id: "2",
      street: "456 Oak Ave",
      city: "Somecity",
      country: "USA",
      zipCode: "67890",
      isPrimary: false,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrimaryWarningOpen, setIsPrimaryWarningOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    country: "",
    zipCode: "",
    isPrimary: false,
  });
  const [pendingSave, setPendingSave] = useState<"add" | "edit" | null>(null);

  const handleEdit = (address: Address) => {
    setSelectedAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      country: address.country,
      zipCode: address.zipCode,
      isPrimary: address.isPrimary,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (address: Address) => {
    setSelectedAddress(address);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAddress) {
      setAddresses(addresses.filter((addr) => addr.id !== selectedAddress.id));
      setIsDeleteDialogOpen(false);
      setSelectedAddress(null);
    }
  };

  const handleAddNew = () => {
    setFormData({
      street: "",
      city: "",
      country: "",
      zipCode: "",
      isPrimary: false,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNew = () => {
    if (formData.isPrimary) {
      const existingPrimary = addresses.find((addr) => addr.isPrimary);
      if (existingPrimary) {
        setPendingSave("add");
        setIsPrimaryWarningOpen(true);
        return;
      }
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData,
    };
    setAddresses([...addresses, newAddress]);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = () => {
    if (!selectedAddress) return;

    if (formData.isPrimary && !selectedAddress.isPrimary) {
      const existingPrimary = addresses.find(
        (addr) => addr.isPrimary && addr.id !== selectedAddress.id
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
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
      };
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
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-gray-300 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {address.street}, {address.city}, {address.country}{" "}
                  {address.zipCode}
                </p>
                {address.isPrimary && (
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
              {selectedAddress?.street}, {selectedAddress?.city}
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
