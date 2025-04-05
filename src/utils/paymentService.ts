import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabaseClient";
import { Payment } from "@/types/payment";
import { convertStaticToDynamicQRIS, parseQrisData, generateQRImageFromQRIS } from './qrisUtils';
import { extractQRCodeFromImage } from './qrScannerUtils';
import { SettingsService } from './settingsService';

export const createPayment = async (data: {
  amount: number;
  buyer_name?: string;
  bank_sender?: string;
  note?: string;
  static_qris_content?: string;
  ocr_result?: string;
}) => {
  try {
    const paymentId = uuidv4();
    
    // Try to get QRIS settings from user settings first
    let defaultStaticQris = data.static_qris_content;
    let defaultQrImage = "";
    
    if (!defaultStaticQris) {
      try {
        const settings = await SettingsService.getQRISSettings();
        defaultStaticQris = settings.qrisCode;
        defaultQrImage = settings.qrisImage;
      } catch (error) {
        console.error("Error getting QRIS settings:", error);
        // Fallback to localStorage
        defaultStaticQris = localStorage.getItem('defaultStaticQris') || data.static_qris_content;
        defaultQrImage = localStorage.getItem('defaultQrImage') || "";
      }
    }
    
    let qrImageUrl = "";
    let merchantName = "Jedo Store";
    let qrisNmid = "ID10243136428";
    let merchantInfo: any = {};
    
    // If we have a default static QRIS, generate dynamic QRIS from it
    if (defaultStaticQris) {
      try {
        console.log("Found static QRIS code:", defaultStaticQris);
        // Generate dynamic QRIS with the amount
        const dynamicQrisContent = convertStaticToDynamicQRIS(defaultStaticQris, data.amount);
        console.log("Generated dynamic QRIS:", dynamicQrisContent);
        
        // Parse QRIS data to extract merchant info
        const qrisData = parseQrisData(defaultStaticQris);
        merchantName = qrisData.merchantName || "Jedo Store";
        qrisNmid = qrisData.nmid || "ID10243136428";
        merchantInfo = qrisData;
        
        // Generate QR code image URL from the dynamic QRIS
        qrImageUrl = generateQRImageFromQRIS(dynamicQrisContent);
        console.log("Generated QR image URL:", qrImageUrl);
      } catch (err) {
        console.error("Error processing static QRIS:", err);
        // Fallback to default QR code generator
        qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
                    encodeURIComponent(`amount=${data.amount}&id=${paymentId}`);
      }
    } else if (defaultQrImage) {
      // Use the default QR image if available
      qrImageUrl = defaultQrImage;
    } else {
      // Fallback to generated QR
      qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
                  encodeURIComponent(`amount=${data.amount}&id=${paymentId}`);
    }
    
    const currentDate = new Date().toISOString();
    
    // Format for display in Indonesian Rupiah
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(data.amount);
    
    console.log("Creating payment record with QR:", qrImageUrl);
    
    // Prepare record for database
    const paymentRecord = {
      id: paymentId,
      buyer_name: data.buyer_name,
      amount: data.amount,
      bank_sender: data.bank_sender,
      note: data.note,
      dynamic_qris: qrImageUrl, 
      status: 'pending',
      static_qris_content: defaultStaticQris || null,
      ocr_result: data.ocr_result || null,
      merchant_info: merchantInfo,
      user_id: await getCurrentUserId()
    };
    
    // Try to insert into Supabase if user is logged in
    try {
      const { data: record, error } = await supabase
        .from('payments')
        .insert([paymentRecord])
        .select();

      if (error) {
        console.error("Error creating payment in database:", error);
        // Continue without storing in database if there's an error
      } else {
        console.log("Payment created successfully in database:", record);
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      // Continue without storing in database
    }
    
    // Store payment in localStorage as a fallback
    const paymentData = {
      id: paymentId,
      amount: data.amount,
      buyerName: data.buyer_name,
      bankSender: data.bank_sender,
      note: data.note,
      createdAt: currentDate,
      status: 'pending',
      qrImageUrl: qrImageUrl,
      merchantName: merchantName,
      qrisNmid: qrisNmid,
      qrisRequestDate: currentDate,
      formattedAmount,
      staticQrisContent: defaultStaticQris,
      ocrResult: data.ocr_result,
      merchantInfo
    };
    
    // Save to localStorage
    try {
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      existingPayments.push(paymentData);
      localStorage.setItem('payments', JSON.stringify(existingPayments));
      console.log("Payment saved to localStorage");
    } catch (localStorageError) {
      console.error("Failed to save to localStorage:", localStorageError);
    }

    // Return full payment object with all needed data for the UI
    return paymentData as Payment;
  } catch (error: any) {
    console.error("Error creating payment:", error);
    throw new Error(error.message || "Failed to create payment");
  }
};

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export const getPayment = async (id: string): Promise<Payment> => {
  try {
    // First try to get payment from database
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching payment from database:", error);
      // Try from localStorage if database fails
      const localPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const localPayment = localPayments.find((p: any) => p.id === id);
      
      if (localPayment) {
        console.log("Payment found in localStorage:", localPayment);
        return localPayment as Payment;
      }
      
      throw new Error("Payment not found");
    }

    if (!data) {
      throw new Error("Payment not found");
    }

    console.log("Payment found in database:", data);
    
    // Format the amount for display
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(data.amount);

    // Extract merchant info from data
    const merchantInfo = data.merchant_info || {};
    const merchantName = typeof merchantInfo === 'object' && merchantInfo !== null && 'merchantName' in merchantInfo
      ? (merchantInfo as any).merchantName || "Jedo Store" 
      : "Jedo Store";
    const qrisNmid = typeof merchantInfo === 'object' && merchantInfo !== null && 'nmid' in merchantInfo
      ? (merchantInfo as any).nmid || "ID10243136428" 
      : "ID10243136428";

    // Transform the database record into our Payment type
    return {
      id: data.id,
      amount: data.amount,
      buyerName: data.buyer_name,
      bankSender: data.bank_sender,
      note: data.note,
      createdAt: data.created_at || new Date().toISOString(),
      status: data.status as 'pending' | 'paid',
      qrImageUrl: data.dynamic_qris,
      merchantName: merchantName,
      qrisNmid: qrisNmid,
      qrisRequestDate: data.created_at || new Date().toISOString(),
      formattedAmount,
      staticQrisContent: data.static_qris_content,
      ocrResult: data.ocr_result,
      merchantInfo: merchantInfo
    } as Payment;
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    throw new Error(error.message || "Failed to fetch payment");
  }
};

export const updatePaymentStatus = async (id: string, status: string) => {
  try {
    // First update in Supabase
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error updating payment status in database:", error);
    } else {
      console.log("Payment status updated in database:", data);
    }
    
    // Also update in localStorage as a fallback
    try {
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const updatedPayments = existingPayments.map((payment: any) => {
        if (payment.id === id) {
          return { ...payment, status };
        }
        return payment;
      });
      
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
      console.log("Payment status updated in localStorage");
    } catch (localStorageError) {
      console.error("Failed to update payment status in localStorage:", localStorageError);
    }

    return data;
  } catch (error: any) {
    console.error("Error updating payment status:", error);
    throw new Error(error.message || "Failed to update payment status");
  }
};

export const updatePayment = async (id: string, updates: Partial<Payment>) => {
  try {
    // Convert Payment type to database format
    const dbUpdates: any = {};
    
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.buyerName !== undefined) dbUpdates.buyer_name = updates.buyerName;
    if (updates.bankSender !== undefined) dbUpdates.bank_sender = updates.bankSender;
    if (updates.note !== undefined) dbUpdates.note = updates.note;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.staticQrisContent !== undefined) dbUpdates.static_qris_content = updates.staticQrisContent;
    if (updates.ocrResult !== undefined) dbUpdates.ocr_result = updates.ocrResult;
    if (updates.merchantInfo !== undefined) dbUpdates.merchant_info = updates.merchantInfo;
    
    // Update in Supabase
    const { data, error } = await supabase
      .from('payments')
      .update(dbUpdates)
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error updating payment in database:", error);
      throw new Error("Failed to update payment: " + error.message);
    }
    
    // Also update in localStorage
    try {
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const updatedPayments = existingPayments.map((payment: any) => {
        if (payment.id === id) {
          return { ...payment, ...updates };
        }
        return payment;
      });
      
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
    } catch (localStorageError) {
      console.error("Failed to update payment in localStorage:", localStorageError);
    }

    // Return updated payment
    return await getPayment(id);
  } catch (error: any) {
    console.error("Error updating payment:", error);
    throw new Error(error.message || "Failed to update payment");
  }
};

export const deletePayment = async (id: string) => {
  try {
    // Delete from Supabase
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting payment from database:", error);
      throw new Error("Failed to delete payment: " + error.message);
    }
    
    // Also delete from localStorage
    try {
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const filteredPayments = existingPayments.filter((payment: any) => payment.id !== id);
      localStorage.setItem('payments', JSON.stringify(filteredPayments));
    } catch (localStorageError) {
      console.error("Failed to delete payment from localStorage:", localStorageError);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    throw new Error(error.message || "Failed to delete payment");
  }
};

export const parseQRWithOCR = async (imageDataUrl: string): Promise<{
  staticQrisContent?: string;
  merchantInfo?: any;
}> => {
  try {
    // Extract QR code from image
    const qrContent = await extractQRCodeFromImage(imageDataUrl);
    
    if (!qrContent) {
      throw new Error("No QR code found in the image");
    }
    
    // Parse the QR code to extract merchant info
    const merchantInfo = parseQrisData(qrContent);
    
    return {
      staticQrisContent: qrContent,
      merchantInfo
    };
  } catch (error: any) {
    console.error("Error parsing QR code:", error);
    throw new Error(error.message || "Failed to parse QR code");
  }
};

export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    // Try to get payments from Supabase
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    let payments = [];
    
    if (error) {
      console.error("Error fetching payments from database:", error);
      // Fall back to localStorage if there's a database error
    } else if (data && data.length > 0) {
      // Transform database records to Payment objects
      payments = data.map(item => {
        const merchantInfo = item.merchant_info || {};
        const merchantName = typeof merchantInfo === 'object' && merchantInfo !== null && 'merchantName' in merchantInfo
          ? (merchantInfo as any).merchantName || "Jedo Store" 
          : "Jedo Store";
        const qrisNmid = typeof merchantInfo === 'object' && merchantInfo !== null && 'nmid' in merchantInfo
          ? (merchantInfo as any).nmid || "ID10243136428" 
          : "ID10243136428";
        
        return {
          id: item.id,
          amount: item.amount,
          buyerName: item.buyer_name,
          bankSender: item.bank_sender,
          note: item.note,
          createdAt: item.created_at,
          status: item.status as 'pending' | 'paid',
          qrImageUrl: item.dynamic_qris,
          merchantName: merchantName,
          qrisNmid: qrisNmid,
          formattedAmount: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(item.amount),
          staticQrisContent: item.static_qris_content,
          ocrResult: item.ocr_result,
          merchantInfo: merchantInfo
        };
      });
      
      console.log("Fetched payments from database:", payments.length);
    }
    
    // If no payments from database or error, try localStorage
    if (payments.length === 0) {
      try {
        const localPayments = JSON.parse(localStorage.getItem('payments') || '[]');
        if (localPayments.length > 0) {
          payments = localPayments;
          console.log("Fetched payments from localStorage:", payments.length);
        }
      } catch (localStorageError) {
        console.error("Error fetching payments from localStorage:", localStorageError);
      }
    }
    
    // Sort by date, most recent first
    return payments.sort((a: Payment, b: Payment) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) as Payment[];
  } catch (error: any) {
    console.error("Error fetching all payments:", error);
    throw new Error(error.message || "Failed to fetch payments");
  }
};

// Create a PaymentService object for easier imports in other files
export const PaymentService = {
  createPayment,
  getPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  getAllPayments,
  parseQRWithOCR,
  searchPayments: (query: string): Promise<Payment[]> => {
    return getAllPayments().then(payments => {
      return payments.filter(payment => 
        payment.buyerName?.toLowerCase().includes(query.toLowerCase()) ||
        payment.note?.toLowerCase().includes(query.toLowerCase()) ||
        payment.bankSender?.toLowerCase().includes(query.toLowerCase()) ||
        payment.amount.toString().includes(query)
      );
    });
  }
};
