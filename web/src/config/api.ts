const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: [
      `${API_BASE_URL}/users/register/`,
    ],
    LOGIN: [
      `${API_BASE_URL}/users/login/`,
    ],
    LOGOUT: `${API_BASE_URL}/users/logout/`,
    REFRESH: `${API_BASE_URL}/users/refresh/`,
  },
  USER: {
    PROFILE: `${API_BASE_URL}/user/profile/`,
    UPDATE: `${API_BASE_URL}/user/update/`,
    ADDRESSES: `${API_BASE_URL}/users/addresses/`,
    ADDRESS_DETAIL: (id: string | number) => `${API_BASE_URL}/users/addresses/${id}/`,
    CARDS: `${API_BASE_URL}/users/cards/`,
    CARD_DETAIL: (id: string | number) => `${API_BASE_URL}/users/cards/${id}/`,
    CHANGE_PASSWORD: `${API_BASE_URL}/users/password/change/`,
  },
  PRODUCTS: {
    LIST: `${API_BASE_URL}/products/products/`,
    DETAIL: (id: string) => `${API_BASE_URL}/products/products/${id}/`,
  },
  ORDERS: {
    LIST: `${API_BASE_URL}/orders/`,
    CREATE: `${API_BASE_URL}/orders/`,
    DETAIL: (id: string) => `${API_BASE_URL}/orders/${id}/`,
  },
};

export default API_BASE_URL;
