
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

export const createPayment = async (data: {
  customer_name: string;
  amount: number;
  email?: string;
  whatsapp?: string;
}) => {
  const paymentId = uuidv4();
  const dynamicQrCode = `https://example.com/payment/${paymentId}`; // Replace with your actual dynamic QR code generation logic

  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([
        {
          id: paymentId,
          customer_name: data.customer_name,
          amount: data.amount,
          email: data.email,
          whatsapp: data.whatsapp,
          dynamic_qris: dynamicQrCode,
          status: 'pending',
        },
      ])
      .select()

    if (error) {
      console.error("Error creating payment:", error);
      throw new Error("Failed to create payment in database");
    }

    return {
      id: paymentId,
      qr_code_url: dynamicQrCode,
    };
  } catch (error: any) {
    console.error("Error creating payment:", error);
    throw new Error(error.message || "Failed to create payment");
  }
};

export const getPayment = async (id: string) => {
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

    return data;
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

// Create a PaymentService object for easier imports in other files
export const PaymentService = {
  createPayment,
  getPayment,
  updatePaymentStatus,
  // Add mock functions for History page
  getPayments: () => {
    return [];
  },
  searchPayments: (query: string) => {
    return [];
  },
  // Add getPaymentById for PaymentDetails.tsx
  getPaymentById: (id: string) => {
    return {
      id,
      amount: 100000,
      buyerName: "John Doe",
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
      qrImageUrl: "https://example.com/qr.png",
      merchantName: "Example Merchant",
      qrisNmid: "12345",
      qrisRequestDate: new Date().toISOString(),
      bankSender: "BCA",
      note: "Test payment"
    };
  }
};
