export interface Payment {
  id: string;
  amount: number;
  buyerName?: string;
  bankSender?: string;
  note?: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
  qrImageUrl: string;
  merchantName?: string;
  qrisNmid?: string;
  qrisRequestDate?: string;
  formattedAmount: string;
}

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
  merchantName?: string; // Merchant name extracted from QRIS
  taxType?: 'p' | 'r'; // Tax type (percentage or rupiah)
  fee?: string; // Fee amount
  qrisId?: string; // QRIS ID type (01 or A01)
}

export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  preferences?: {
    adminWhatsApp?: string;
    whatsAppMessage?: string;
    defaultQrImage?: string;
    theme?: string;
    language?: string;
  };
}
