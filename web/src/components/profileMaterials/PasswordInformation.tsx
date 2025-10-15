"use client";

import React, { useState } from "react";
import { TextField, Button, Snackbar, Alert } from "@mui/material";
import { authService } from "@/services/authService";

const PasswordInformation = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrorMessage("");
  };

  const handleChangePassword = async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setErrorMessage("Lütfen tüm alanları doldurun");
      return;
    }

    if (formData.newPassword.length < 8) {
      setErrorMessage("Yeni şifre en az 8 karakter olmalıdır");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("Yeni şifreler eşleşmiyor");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await authService.changePassword({
        old_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirm: formData.confirmPassword,
      });

      setShowSuccessMessage(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Şifre değiştirme hatası:", error);
      if (error?.data?.detail) {
        setErrorMessage(error.data.detail);
      } else if (
        error?.data?.old_password &&
        Array.isArray(error.data.old_password)
      ) {
        setErrorMessage(error.data.old_password[0]);
      } else if (
        error?.data?.new_password &&
        Array.isArray(error.data.new_password)
      ) {
        setErrorMessage(error.data.new_password[0]);
      } else if (
        error?.data?.new_password_confirm &&
        Array.isArray(error.data.new_password_confirm)
      ) {
        setErrorMessage(error.data.new_password_confirm[0]);
      } else {
        setErrorMessage("Şifre değiştirme sırasında bir hata oluştu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccessMessage(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 text-black w-full">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-2xl font-bold">Password</h2>
      </div>

      <div className="border-t border-gray-200 flex justify-end w-full pt-6">
        <div className="flex flex-col gap-6 w-full">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <TextField
              type="password"
              fullWidth
              value={formData.currentPassword}
              onChange={(e) => handleChange("currentPassword", e.target.value)}
              placeholder="Enter current password"
              size="medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <TextField
              type="password"
              fullWidth
              value={formData.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              placeholder="Enter new password"
              size="medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <TextField
              type="password"
              fullWidth
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Re-enter new password"
              size="medium"
            />
          </div>

          {errorMessage && (
            <div className="text-red-600 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={isLoading}
              sx={{
                textTransform: "none",
                backgroundColor: "#2563eb",
                "&:hover": { backgroundColor: "#1d4ed8" },
                paddingX: 4,
                paddingY: 1.5,
                fontSize: "1rem",
              }}
            >
              {isLoading ? "Değiştiriliyor..." : "Change Password"}
            </Button>
          </div>
        </div>
      </div>

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Şifreniz başarıyla değiştirildi!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PasswordInformation;
