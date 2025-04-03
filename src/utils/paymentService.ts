
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
        console.log("Found static QRIS code:", defaultStaticQris);
        // Generate dynamic QRIS with the amount
        const dynamicQrisContent = convertStaticToDynamicQRIS(defaultStaticQris, data.amount);
        console.log("Generated dynamic QRIS:", dynamicQrisContent);
        
        // Parse QRIS data to extract merchant info
        const qrisData = parseQrisData(defaultStaticQris);
        merchantName = qrisData.merchantName;
        qrisNmid = qrisData.nmid;
        
        // Generate QR code image URL from the dynamic QRIS
        qrImageUrl = generateQRImageFromQRIS(dynamicQrisContent);
        console.log("Generated QR image URL:", qrImageUrl);
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
    
    // Try to insert into Supabase if user is logged in
    let paymentRecord = null;
    try {
      const { data: record, error } = await supabase
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
        console.error("Error creating payment in database:", error);
        // Continue without storing in database if there's an error
      } else {
        paymentRecord = record;
        console.log("Payment created successfully in database:", paymentRecord);
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

export const getPayment = async (id: string): Promise<Payment> => {
  try {
    // First try to get payment from localStorage
    try {
      const localPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const localPayment = localPayments.find((p: any) => p.id === id);
      
      if (localPayment) {
        console.log("Payment found in localStorage:", localPayment);
        return localPayment as Payment;
      }
    } catch (localStorageError) {
      console.error("Error checking localStorage:", localStorageError);
    }

    // If not in localStorage, try from database
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching payment from database:", error);
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
    // First update in Supabase
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error updating payment status in database:", error);
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
      payments = data.map(item => ({
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
      }));
      
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
    
    // Merge local and database payments to ensure we have everything
    // This is a basic approach - a more sophisticated one would check for duplicates
    try {
      const localPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      
      // Find payments in localStorage that aren't in the database results
      const paymentIds = new Set(payments.map(p => p.id));
      const uniqueLocalPayments = localPayments.filter((p: any) => !paymentIds.has(p.id));
      
      // Add unique local payments to the results
      if (uniqueLocalPayments.length > 0) {
        payments = [...payments, ...uniqueLocalPayments];
        console.log(`Added ${uniqueLocalPayments.length} unique payments from localStorage`);
      }
    } catch (e) {
      console.error("Error merging payments:", e);
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
