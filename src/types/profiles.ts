
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  username: string | null;
  full_name: string | null;
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
    isAdmin?: boolean;
    isUnlimited?: boolean;
    pendingUnlimitedRequest?: boolean;
    usage?: {
      count?: number;
      lastDate?: string;
    };
    [key: string]: any;
  };
}
