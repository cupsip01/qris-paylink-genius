
export interface Payment {
  id: string;
  amount: number;
  note?: string;
  buyerName?: string;
  bankSender?: string;
  createdAt: string;
  status: 'pending' | 'paid';
  qrImageUrl?: string;
  useCustomQr?: boolean;
  originalMerchantQrImage?: string;
  formattedAmount?: string; // Added for Indonesian currency formatting
}
