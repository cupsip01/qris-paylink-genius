import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types/payment";
import { convertStaticToDynamicQRIS, parseQrisData } from './qrisUtils';

export const createPayment = async (data: {
  amount: number;
  buyer_name?: string;
  bank_sender?: string;
  note?: string;
}) => {
  try {
    const paymentId = uuidv4();
    
    // For now, we'll use a placeholder QR image
    // In a real implementation, you would get this from a QRIS provider API
    const qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
                      encodeURIComponent(`https://example.com/payment/${paymentId}?amount=${data.amount}`);
    
    const currentDate = new Date().toISOString();
    
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([
        {
          id: paymentId,
          buyer_name: data.buyer_name,
          amount: data.amount,
          bank_sender: data.bank_sender,
          note: data.note,
          dynamic_qris: qrImageUrl, // Using the QR image URL as dynamic_qris
          status: 'pending',
        },
      ])
      .select();

    if (error) {
      console.error("Error creating payment:", error);
      throw new Error("Failed to create payment in database");
    }

    console.log("Payment created successfully:", payment);

    return {
      id: paymentId,
      amount: data.amount,
      buyerName: data.buyer_name,
      bankSender: data.bank_sender,
      note: data.note,
      createdAt: currentDate,
      status: 'pending',
      qrImageUrl: qrImageUrl,
      merchantName: "My Store",
      qrisNmid: "ID10023456789",
      qrisRequestDate: currentDate,
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

    if (!data) {
      throw new Error("Payment not found");
    }

    // Transform the database record into our Payment type
    return {
      id: data.id,
      amount: data.amount,
      buyerName: data.buyer_name,
      bankSender: data.bank_sender,
      note: data.note,
      createdAt: data.created_at,
      status: data.status,
      qrImageUrl: data.dynamic_qris,
      merchantName: "My Store", // Default values for now
      qrisNmid: "ID10023456789",
      qrisRequestDate: data.created_at,
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
    qrisRequestDate: new Date().toISOString(),
    qrImageUrl: "https://example.com/qr.png"
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
    qrisRequestDate: new Date(Date.now() - 86400000).toISOString(),
    qrImageUrl: "https://example.com/qr2.png"
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
    qrisRequestDate: new Date(Date.now() - 172800000).toISOString(),
    qrImageUrl: "https://example.com/qr3.png"
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
