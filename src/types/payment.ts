
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
  merchantName?: string; // Merchant name extracted from QRIS
  taxType?: 'p' | 'r'; // Tax type (percentage or rupiah)
  fee?: string; // Fee amount
  qrisId?: string; // QRIS ID type (01 or A01)
  
  // Added fields for OCR and merchant data
  ocrResult?: string; // Raw OCR result text
  merchantInfo?: any; // Merchant information extracted from the QR code
  
  // Additional fields from database
  static_qris_content?: string;
  ocr_result?: string;
  merchant_info?: any;
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
