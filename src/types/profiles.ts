
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  username: string | null;
  full_name: string | null;
  is_admin?: boolean;
  unlimited_access?: boolean;
  daily_usage?: {
    count: number;
    last_reset: string;
  };
  preferences?: {
    adminWhatsApp?: string;
    whatsappNumber?: string;
    whatsAppMessage?: string;
    defaultQrImage?: string;
    theme?: string;
    language?: string;
    whatsappEnabled?: boolean;
    qrCodeSettings?: {
      showLogo?: boolean;
      logoSize?: string;
      borderStyle?: string;
    };
    syncInterval?: string;
    [key: string]: any;
  };
}
