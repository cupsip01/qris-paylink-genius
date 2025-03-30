
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
  formattedAmount?: string; // For Indonesian currency formatting
  qrisContent?: string; // QRIS content string from API
  qrisInvoiceId?: string; // Invoice ID from API
  qrisNmid?: string; // National Merchant ID
  qrisRequestDate?: string; // Request date from API
  cliTrxNumber?: string; // Transaction reference number
  
  // Added fields for static QRIS handling
  staticQrisContent?: string; // The original static QRIS content
  dynamicQrisContent?: string; // The dynamic QRIS with embedded amount
}
