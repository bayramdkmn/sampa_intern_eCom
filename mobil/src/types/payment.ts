export interface PaymentMethod {
  id: string;
  cardNumber: string; 
  cardHolderName: string;
  expiryDate: string; 
  cardType: "visa" | "mastercard" | "amex" | "other";
  isDefault?: boolean;
}

export interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export interface PaymentMethodFormProps {
  onSubmit: (paymentMethod: Omit<PaymentMethod, "id">) => void;
  onCancel: () => void;
}
