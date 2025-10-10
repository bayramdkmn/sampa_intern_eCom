// Theme Types
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  homePageCatalogCard: string;
  
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  primary: string;
  primaryVariant: string;
  onPrimary: string;
  barColor: string;
  
  secondary: string;
  secondaryVariant: string;
  onSecondary: string;
  
  success: string;
  warning: string;
  error: string;
  info: string;
  
  border: string;
  divider: string;
  
  card: string;
  shadow: string;
  
  inputBackground: string;
  inputBorder: string;
  inputFocus: string;
  
  buttonPrimary: string;
  buttonSecondary: string;
  buttonText: string;
  
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  
  headerBackground: string;
  headerText: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

// Light Theme Colors
export const lightTheme: ThemeColors = {
  // Background colors
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#F1F3F4',
  homePageCatalogCard: '#4CAF50',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Primary colors
  primary: '#3B82F6',
  primaryVariant: '#2563EB',
  onPrimary: '#FFFFFF',
  
  // Secondary colors
  secondary: '#10B981',
  secondaryVariant: '#059669',
  onSecondary: '#FFFFFF',
  barColor: '#2563EB',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Border and divider colors
  border: '#E5E7EB',
  divider: '#F3F4F6',
  
  // Card and shadow colors
  card: '#E8E8E8',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Input colors
  inputBackground: '#F8F9FA',
  inputBorder: '#D1D5DB',
  inputFocus: '#3B82F6',
  
  // Button colors
  buttonPrimary: '#3B82F6',
  buttonSecondary: '#E5E7EB',
  buttonText: '#FFFFFF',
  
  // Tab bar colors
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#9CA3AF',
  
  // Header colors
  headerBackground: '#F8F9FA',
  headerText: '#1A1A1A',
};

// Dark Theme Colors
export const darkTheme: ThemeColors = {
  // Background colors
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceVariant: '#262626',
  homePageCatalogCard: '#262626',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textTertiary: '#737373',
  
  // Primary colors
  primary: '#60A5FA',
  primaryVariant: '#3B82F6',
  onPrimary: '#000000',
  barColor: '#333333',
  
  // Secondary colors
  secondary: '#34D399',
  secondaryVariant: '#10B981',
  onSecondary: '#000000',
  
  // Status colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Border and divider colors
  border: '#404040',
  divider: '#262626',
  
  // Card and shadow colors
  card: '#1A1A1A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Input colors
  inputBackground: '#262626',
  inputBorder: '#404040',
  inputFocus: '#60A5FA',
  
  // Button colors
  buttonPrimary: '#60A5FA',
  buttonSecondary: '#262626',
  buttonText: '#FFFFFF',
  
  // Tab bar colors
  tabBarBackground: '#1A1A1A',
  tabBarActive: '#60A5FA',
  tabBarInactive: '#737373',
  
  // Header colors
  headerBackground: '#1A1A1A',
  headerText: '#FFFFFF',
};
