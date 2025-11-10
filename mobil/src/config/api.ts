export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/users/register/',
    LOGIN: '/users/login/',
    LOGOUT: '/users/logout/',
    REFRESH: '/users/refresh/',
  },
  USER: {
    PROFILE: '/users/me/',
    UPDATE: '/users/me/',
    ADDRESSES: '/users/addresses/',
    ADDRESS_DETAIL: (id: string | number) => `/users/addresses/${id}/`,
    CARDS: '/users/cards/',
    CARD_DETAIL: (id: string | number) => `/users/cards/${id}/`,
    CHANGE_PASSWORD: '/users/password/change/',
  },
  PRODUCTS: {
    LIST: '/products/products/',
    DETAIL: (id: string | number) => `/products/products/${id}/`,
  },
  ORDERS: {
    LIST: '/orders/my-orders/',
    CREATE: '/orders/',
    DETAIL: (id: string) => `/orders/${id}/`,
    CANCEL: (id: string) => `/orders/${id}/cancel/`,
  },
  CART: {
    LIST: '/cart/',
    ADD: '/cart/add/',
    UPDATE: '/cart/update/',
    REMOVE: '/cart/remove/',
  },
};

export const API_CONFIG = {
  TIMEOUT: 30000, 
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, 
};

