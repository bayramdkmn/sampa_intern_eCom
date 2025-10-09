"use client";

import { User } from "@/app/types/User";
import React, { useState } from "react";
import {
  IconButton,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "@/contexts/AuthContext";

const countryCodes = [
  { code: "+90", country: "🇹🇷 Turkey", flag: "🇹🇷" },
  { code: "+1", country: "🇺🇸 USA", flag: "🇺🇸" },
  { code: "+44", country: "🇬🇧 UK", flag: "🇬🇧" },
  { code: "+49", country: "🇩🇪 Germany", flag: "🇩🇪" },
  { code: "+33", country: "🇫🇷 France", flag: "🇫🇷" },
  { code: "+91", country: "🇮🇳 India", flag: "🇮🇳" },
];

const PersonalInformation = ({ user }: { user: User }) => {
  const { login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const parsePhoneNumber = (fullPhone: string | undefined) => {
    if (!fullPhone) return { code: "+90", number: "" };
    const parts = fullPhone.trim().split(" ");
    if (parts.length > 1) {
      return { code: parts[0], number: parts.slice(1).join(" ") };
    }
    return { code: "+90", number: fullPhone };
  };

  const initialPhone = parsePhoneNumber(user.phoneNumber);
  const [countryCode, setCountryCode] = useState(initialPhone.code);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: initialPhone.number,
  });

  const handleEdit = () => {
    if (user.phoneNumber) {
      const parts = user.phoneNumber.trim().split(" ");
      if (parts.length > 1) {
        setCountryCode(parts[0]);
        setFormData({
          ...formData,
          phoneNumber: parts.slice(1).join(" "),
        });
      }
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    let phoneOnly = "";
    if (user.phoneNumber) {
      const parts = user.phoneNumber.trim().split(" ");
      if (parts.length > 1) {
        setCountryCode(parts[0]);
        phoneOnly = parts.slice(1).join(" ");
      }
    }

    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: phoneOnly,
    });
    setIsEditing(false);
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(
        6
      )}`;
    } else {
      return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(
        6,
        8
      )} ${numbers.slice(8, 10)}`;
    }
  };

  const handleSave = () => {
    const cleanNumber = formData.phoneNumber.replace(/\s/g, "");
    const fullPhoneNumber = cleanNumber
      ? `${countryCode} ${formatPhoneNumber(cleanNumber)}`
      : "";

    const updatedUser: User = {
      ...user,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: fullPhoneNumber,
    };

    login(updatedUser);

    console.log("Saving:", { ...formData, fullPhoneNumber });

    setShowSuccessMessage(true);
    setIsEditing(false);
  };

  const handleCloseSnackbar = () => {
    setShowSuccessMessage(false);
  };

  return (
    <div className="w-full px-10">
      <div className="text-2xl font-semibold text-black">
        Personal Information
      </div>
      <div className="border-b mt-1 mb-3 border-gray-300 w-full"></div>
      <div className="flex flex-row justify-between items-center w-full gap-10">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
        )}
        <div className="text-black flex flex-row justify-between items-center w-full">
          <div className="flex-1">
            <div className="mb-3">
              <div className="text-gray-600 font-semibold mb-1">
                Name and Surname
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="text-xl font-semibold border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="text-xl font-semibold border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-semibold">
                  {user.firstName} {user.lastName}
                </h2>
              )}
            </div>

            <div className="mb-3">
              <div className="text-gray-600 font-semibold mb-1">Email</div>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="text-xl font-bold border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="Email"
                />
              ) : (
                <div className="text-black text-xl font-bold">{user.email}</div>
              )}
            </div>

            {/* Phone Number */}
            {(isEditing || user.phoneNumber) && (
              <div>
                <div className="text-gray-600 font-semibold mb-1">
                  Phone Number
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <TextField
                      select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      sx={{ width: 140 }}
                      size="small"
                    >
                      {countryCodes.map((option) => (
                        <MenuItem key={option.code} value={option.code}>
                          {option.flag} {option.code}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          const formatted = formatPhoneNumber(value);
                          setFormData({ ...formData, phoneNumber: formatted });
                        }
                      }}
                      placeholder="5XX XXX XX XX"
                      size="small"
                      fullWidth
                      helperText={`${
                        formData.phoneNumber.replace(/\s/g, "").length
                      }/10 digits`}
                    />
                  </div>
                ) : (
                  <div className="text-black text-xl font-bold">
                    {user.phoneNumber}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <IconButton
                  onClick={handleSave}
                  sx={{ color: "#22c55e" }}
                  size="small"
                >
                  <SaveIcon />
                </IconButton>
                <IconButton
                  onClick={handleCancel}
                  sx={{ color: "#ef4444" }}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </>
            ) : (
              <IconButton
                onClick={handleEdit}
                sx={{ color: "#6b7280" }}
                size="small"
              >
                <EditIcon />
              </IconButton>
            )}
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
          Bilgileriniz başarıyla güncellendi!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PersonalInformation;
