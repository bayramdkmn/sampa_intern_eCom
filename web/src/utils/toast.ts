import { toast } from "react-toastify";


export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  error: (message: string) => {
    toast.error(message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  warning: (message: string) => {
    toast.warning(message, {
      position: "bottom-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  info: (message: string) => {
    toast.info(message, {
      position: "bottom-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
};


export const toastMessages = {
  loginSuccess: "Giriş başarılı! Hoş geldiniz.",
  registerSuccess: "Kayıt başarılı! Hesabınız oluşturuldu.",
  logoutSuccess: "Başarıyla çıkış yapıldı.",
  saveSuccess: "Bilgiler başarıyla kaydedildi.",
  deleteSuccess: "Başarıyla silindi.",
  updateSuccess: "Başarıyla güncellendi.",


  loginError: "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.",
  registerError: "Kayıt işlemi başarısız. Lütfen tekrar deneyin.",
  networkError: "Ağ bağlantısı hatası. Lütfen tekrar deneyin.",
  serverError: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
  validationError: "Lütfen tüm alanları doğru şekilde doldurun.",
  unauthorizedError: "Bu işlem için giriş yapmanız gerekiyor.",


  unsavedChanges: "Kaydedilmemiş değişiklikler var.",
  sessionExpired: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",


  loading: "İşlem gerçekleştiriliyor...",
  savedDraft: "Taslak olarak kaydedildi.",
};
