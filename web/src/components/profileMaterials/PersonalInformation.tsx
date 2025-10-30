"use client";

import { User } from "@/app/types/User";
import React, { useState, useRef, useEffect } from "react";
import {
  IconButton,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import CropIcon from "@mui/icons-material/Crop";
import { useAuth } from "@/contexts/AuthContext";
import { clientApi } from "@/services/ClientApi";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

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
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Profil fotoğrafı URL'sini oluştur
  const getProfileImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;

    // Eğer tam URL ise olduğu gibi döndür
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Eğer /media/ ile başlıyorsa base URL ile birleştir (api kısmını çıkar)
    if (imagePath.startsWith("/media/")) {
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      // API URL'den /api kısmını çıkar
      const cleanBaseURL = baseURL.replace("/api", "");
      return `${cleanBaseURL}${imagePath}`;
    }

    return imagePath;
  };

  const initialProfileImage = getProfileImageUrl(user.profileImage);

  const [profileImage, setProfileImage] = useState<string | null>(
    initialProfileImage || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Crop modal için state'ler
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 60,
    height: 90,
    x: 20,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [tempFileName, setTempFileName] = useState<string>("");

  // Telefon numarasını parse et
  const parsePhoneNumber = (fullPhone: string | undefined) => {
    if (!fullPhone) return { code: "+90", number: "" };
    const parts = fullPhone.trim().split(" ");
    if (parts.length > 1) {
      return { code: parts[0], number: parts.slice(1).join(" ") };
    }
    return { code: "+90", number: fullPhone };
  };

  useEffect(() => {
    const updatedProfileImage = getProfileImageUrl(user.profileImage);
    setProfileImage(updatedProfileImage);

    const initialPhone = parsePhoneNumber(user.phoneNumber);
    setCountryCode(initialPhone.code);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: initialPhone.number || "",
    });
  }, [
    user.firstName,
    user.lastName,
    user.email,
    user.phoneNumber,
    user.profileImage,
  ]);

  const initialPhone = parsePhoneNumber(user.phoneNumber);
  const [countryCode, setCountryCode] = useState(initialPhone.code);
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phoneNumber: initialPhone.number || "",
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

    // Profil fotoğrafı ve seçilen dosyayı sıfırla
    setProfileImage(getProfileImageUrl(user.profileImage) || null);
    setSelectedFile(null);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Dosya boyutunu kontrol et (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Dosya boyutu 5MB'dan küçük olmalıdır");
        setShowErrorMessage(true);
        return;
      }

      // Dosya tipini kontrol et
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Sadece resim dosyaları yüklenebilir");
        setShowErrorMessage(true);
        return;
      }

      // Kırpma için dosyayı oku
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target?.result as string);
        setTempFileName(file.name);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<File> => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context not found");
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Canvas is empty");
        }
        const file = new File([blob], tempFileName, { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg");
    });
  };

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedFile = await getCroppedImg(imgRef.current, completedCrop);
        setSelectedFile(croppedFile);

        // Önizleme için URL oluştur
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileImage(e.target?.result as string);
        };
        reader.readAsDataURL(croppedFile);

        setShowCropModal(false);
      } catch (error) {
        console.error("Kırpma hatası:", error);
        setErrorMessage("Resim kırpılırken bir hata oluştu");
        setShowErrorMessage(true);
      }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const cleanNumber = formData.phoneNumber.replace(/\s/g, "");
      const fullPhoneNumber = cleanNumber
        ? `${countryCode} ${formatPhoneNumber(cleanNumber)}`
        : "";

      const profileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: fullPhoneNumber,
      };

      let response;
      if (selectedFile) {
        response = await clientApi.updateUserProfileWithPhoto(
          profileData,
          selectedFile
        );
      } else {
        response = await clientApi.updateUserProfile(profileData);
      }

      const updatedUser: User = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: user.email,
        phoneNumber: fullPhoneNumber,
        profileImage:
          getProfileImageUrl(response.pro_photo || response.profile_image) ||
          profileImage ||
          user.profileImage,
      };

      login(updatedUser);

      setSelectedFile(null);

      setShowSuccessMessage(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);

      let errorMsg = "Profil güncellenirken bir hata oluştu";
      if (error && typeof error === "object" && "message" in error) {
        errorMsg = (error as any).message || errorMsg;
      }

      setErrorMessage(errorMsg);
      setShowErrorMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccessMessage(false);
  };

  return (
    <div className="w-full px-4 md:px-10">
      <div className="text-xl md:text-2xl font-semibold text-black">
        Personal Information
      </div>
      <div className="border-b mt-1 mb-3 border-gray-300 w-full"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 md:gap-10">
        {/* Profil Fotoğrafı */}
        <div className="relative flex-shrink-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover"
              onError={(e) => {
                console.error("❌ Profil fotoğrafı yüklenemedi:", profileImage);
                console.error("❌ Hata detayı:", e);
                setProfileImage(null);
              }}
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
              {(user.firstName?.charAt(0) || "").toUpperCase()}
              {(user.lastName?.charAt(0) || "").toUpperCase()}
            </div>
          )}

          {isEditing && (
            <div className="absolute -bottom-2 -right-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-image-upload"
              />
              <label
                htmlFor="profile-image-upload"
                className="bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-center"
                title="Profil fotoğrafı değiştir"
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </label>
            </div>
          )}
        </div>

        {/* Bilgiler ve Butonlar */}
        <div className="text-black flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
          <div className="flex-1 w-full">
            {/* Ad Soyad */}
            <div className="mb-3">
              <div className="text-gray-600 font-semibold mb-1 text-sm md:text-base">
                Name and Surname
              </div>
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="text-lg md:text-xl font-semibold border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="text-lg md:text-xl font-semibold border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <h2 className="text-xl md:text-2xl font-semibold break-words">
                  {user.firstName} {user.lastName}
                </h2>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <div className="text-gray-600 font-semibold mb-1 text-sm md:text-base">
                Email
              </div>
              <div className="text-black text-base md:text-xl font-bold bg-gray-100 px-3 py-1 rounded border border-gray-200 break-all">
                {user.email}
              </div>
              {isEditing && (
                <div className="text-xs md:text-sm text-gray-500 mt-1">
                  Email adresi değiştirilemez
                </div>
              )}
            </div>

            {/* Phone Number */}
            {(isEditing || user.phoneNumber) && (
              <div>
                <div className="text-gray-600 font-semibold mb-1 text-sm md:text-base">
                  Phone Number
                </div>
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <TextField
                      select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      sx={{ width: "100%", maxWidth: { sm: 140 } }}
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
                  <div className="text-black text-base md:text-xl font-bold break-all">
                    {user.phoneNumber}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 self-end md:self-auto">
            {isEditing ? (
              <>
                <IconButton
                  onClick={handleSave}
                  disabled={isLoading}
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

      {/* Crop Modal */}
      <Dialog
        open={showCropModal}
        onClose={() => setShowCropModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2">
          <CropIcon /> Profil Fotoğrafını Kırp
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center gap-4 py-4">
            {imageToCrop && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imageToCrop}
                  alt="Crop preview"
                  style={{ maxHeight: "60vh", maxWidth: "100%" }}
                />
              </ReactCrop>
            )}
            <div className="text-sm text-gray-600 text-center">
              Fotoğrafınızı istediğiniz gibi kırpın ve kaydedin
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCropModal(false)} color="error">
            İptal
          </Button>
          <Button
            onClick={handleCropComplete}
            variant="contained"
            color="primary"
          >
            Kırpıp Kaydet
          </Button>
        </DialogActions>
      </Dialog>

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

      <Snackbar
        open={showErrorMessage}
        autoHideDuration={5000}
        onClose={() => setShowErrorMessage(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setShowErrorMessage(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PersonalInformation;
