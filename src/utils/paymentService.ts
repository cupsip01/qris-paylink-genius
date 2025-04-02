
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types/payment";
import { convertStaticToDynamicQRIS, parseQrisData, generateQRImageFromQRIS } from './qrisUtils';

export const createPayment = async (data: {
  amount: number;
  buyer_name?: string;
  bank_sender?: string;
  note?: string;
}) => {
  try {
    const paymentId = uuidv4();
    
    // Get default static QRIS code from localStorage if available
    const defaultStaticQris = localStorage.getItem('defaultStaticQris');
    
    let qrImageUrl = "";
    let merchantName = "Jedo Store";
    let qrisNmid = "ID10243136428";
    
    // If we have a default static QRIS, generate dynamic QRIS from it
    if (defaultStaticQris) {
      try {
        // Generate dynamic QRIS with the amount
        const dynamicQrisContent = convertStaticToDynamicQRIS(defaultStaticQris, data.amount);
        
        // Parse QRIS data to extract merchant info
        const qrisData = parseQrisData(defaultStaticQris);
        merchantName = qrisData.merchantName;
        qrisNmid = qrisData.nmid;
        
        // Generate QR code image URL from the dynamic QRIS
        qrImageUrl = generateQRImageFromQRIS(dynamicQrisContent);
      } catch (err) {
        console.error("Error processing static QRIS:", err);
        // Fallback to default QR code generator
        qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
                    encodeURIComponent(`amount=${data.amount}&id=${paymentId}`);
      }
    } else {
      // Use the default QR image if available
      const defaultQrImage = localStorage.getItem('defaultQrImage');
      if (defaultQrImage) {
        qrImageUrl = defaultQrImage;
      } else {
        // Fallback to generated QR
        qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
                    encodeURIComponent(`amount=${data.amount}&id=${paymentId}`);
      }
    }
    
    const currentDate = new Date().toISOString();
    
    // Format for display in Indonesian Rupiah
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(data.amount);
    
    console.log("Creating payment record with QR:", qrImageUrl);
    
    // Insert into Supabase
    const { data: paymentRecord, error } = await supabase
      .from('payments')
      .insert([
        {
          id: paymentId,
          buyer_name: data.buyer_name,
          amount: data.amount,
          bank_sender: data.bank_sender,
          note: data.note,
          dynamic_qris: qrImageUrl, 
          status: 'pending',
        },
      ])
      .select();

    if (error) {
      console.error("Error creating payment:", error);
      throw new Error("Failed to create payment in database");
    }

    console.log("Payment created successfully:", paymentRecord);

    // Return full payment object with all needed data for the UI
    return {
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
    } as Payment;
  } catch (error: any) {
    console.error("Error creating payment:", error);
    throw new Error(error.message || "Failed to create payment");
  }
};

export const getPayment = async (id: string): Promise<Payment> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching payment:", error);
      throw new Error("Failed to fetch payment");
    }

    if (!data) {
      throw new Error("Payment not found");
    }

    // Format the amount for display
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(data.amount);

    // Transform the database record into our Payment type
    return {
      id: data.id,
      amount: data.amount,
      buyerName: data.buyer_name,
      bankSender: data.bank_sender,
      note: data.note,
      createdAt: data.created_at || new Date().toISOString(),
      status: data.status,
      qrImageUrl: data.dynamic_qris,
      merchantName: "Jedo Store", // Can be updated if stored in the DB
      qrisNmid: "ID10243136428", // Default, can be updated if stored
      qrisRequestDate: data.created_at || new Date().toISOString(),
      formattedAmount,
    } as Payment;
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    throw new Error(error.message || "Failed to fetch payment");
  }
};

export const updatePaymentStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) {
      console.error("Error updating payment status:", error);
      throw new Error("Failed to update payment status");
    }

    return data;
  } catch (error: any) {
    console.error("Error updating payment status:", error);
    throw new Error(error.message || "Failed to update payment status");
  }
};

export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching all payments:", error);
      throw new Error("Failed to fetch payments");
    }

    // Transform database records to Payment objects
    return data.map(item => ({
      id: item.id,
      amount: item.amount,
      buyerName: item.buyer_name,
      bankSender: item.bank_sender,
      note: item.note,
      createdAt: item.created_at,
      status: item.status,
      qrImageUrl: item.dynamic_qris,
      formattedAmount: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(item.amount),
    })) as Payment[];
  } catch (error: any) {
    console.error("Error fetching all payments:", error);
    throw new Error(error.message || "Failed to fetch payments");
  }
};

// Create a PaymentService object for easier imports in other files
export const PaymentService = {
  createPayment,
  getPayment,
  updatePaymentStatus,
  getAllPayments,
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
