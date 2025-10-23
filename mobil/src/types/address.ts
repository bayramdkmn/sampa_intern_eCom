export interface Address {
  id: string;
  title: string; 
  city: string;
  district: string;
  fullAddress: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export interface AddressFormProps {
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  fullAddress: string;
  postalCode: string;
  isDefault: boolean;
  onTitleChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onFullAddressChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onIsDefaultChange: (value: boolean) => void;
}

export interface AddressFormModalProps {
  visible: boolean;
  editingAddress: Address | null;
  onClose: () => void;
}
