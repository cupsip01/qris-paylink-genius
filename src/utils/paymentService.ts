
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types/payment";

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
          buyer_name: data.customer_name, // Changed to match DB column
          amount: data.amount,
          bank_sender: null,
          note: null,
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

// Mock data for UI development
const mockPayments: Payment[] = [
  {
    id: "1",
    amount: 150000,
    buyerName: "John Doe",
    bankSender: "BCA",
    createdAt: new Date().toISOString(),
    status: 'paid',
    note: "Monthly subscription",
    merchantName: "My Store",
    qrisNmid: "ID10023456789",
    qrisRequestDate: new Date().toISOString()
  },
  {
    id: "2",
    amount: 75000,
    buyerName: "Jane Smith",
    bankSender: "Mandiri",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'pending',
    note: "Product purchase",
    merchantName: "My Store",
    qrisNmid: "ID10023456789",
    qrisRequestDate: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "3",
    amount: 250000,
    buyerName: "Robert Brown",
    bankSender: "BNI",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'paid',
    note: "Service fee",
    merchantName: "My Store",
    qrisNmid: "ID10023456789",
    qrisRequestDate: new Date(Date.now() - 172800000).toISOString()
  }
];

// Create a PaymentService object for easier imports in other files
export const PaymentService = {
  createPayment,
  getPayment,
  updatePaymentStatus,
  // Add mock functions for History page
  getPayments: (): Payment[] => {
    return mockPayments;
  },
  searchPayments: (query: string): Payment[] => {
    return mockPayments.filter(payment => 
      payment.buyerName?.toLowerCase().includes(query.toLowerCase()) ||
      payment.note?.toLowerCase().includes(query.toLowerCase()) ||
      payment.bankSender?.toLowerCase().includes(query.toLowerCase()) ||
      payment.amount.toString().includes(query)
    );
  },
  // Add getPaymentById for PaymentDetails.tsx
  getPaymentById: (id: string): Payment => {
    const payment = mockPayments.find(p => p.id === id);
    if (payment) return payment;
    
    return {
      id,
      amount: 100000,
      buyerName: "John Doe",
      createdAt: new Date().toISOString(),
      status: 'pending',
      qrImageUrl: "https://example.com/qr.png",
      merchantName: "Example Merchant",
      qrisNmid: "12345",
      qrisRequestDate: new Date().toISOString(),
      bankSender: "BCA",
      note: "Test payment"
    };
  }
};
