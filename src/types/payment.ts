
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
  originalMerchantQrImage?: string; // Added to store the original merchant QR image
}
