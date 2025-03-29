
import { Payment } from "@/types/payment";
import QRCode from "qrcode";

// In a real app, this would be a backend call
// For demo purposes, we're using localStorage
const STORAGE_KEY = "qris_payments";

const generateQRCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw err;
  }
};

const getPayments = (): Payment[] => {
  const storedPayments = localStorage.getItem(STORAGE_KEY);
  return storedPayments ? JSON.parse(storedPayments) : [];
};

const getPaymentById = (id: string): Payment | undefined => {
  const payments = getPayments();
  return payments.find((payment) => payment.id === id);
};

const createPayment = async (
  amount: number,
  note?: string,
  buyerName?: string,
  bankSender?: string
): Promise<Payment> => {
  // In a real app, this would generate a real QRIS code with the proper format
  // Here we're just creating a dummy payment link with the data
  const id = Math.random().toString(36).substring(2, 15);
  const qrisData = `QRIS Payment: Amount=${amount}, Note=${note || ""}, Buyer=${buyerName || ""}, Bank=${bankSender || ""}`;
  
  const qrImageUrl = await generateQRCode(qrisData);
  
  const newPayment: Payment = {
    id,
    amount,
    note,
    buyerName,
    bankSender,
    createdAt: new Date().toISOString(),
    status: "pending",
    qrImageUrl
  };

  const payments = getPayments();
  payments.push(newPayment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));

  return newPayment;
};

const updatePaymentStatus = (id: string, status: 'pending' | 'paid'): Payment | undefined => {
  const payments = getPayments();
  const paymentIndex = payments.findIndex((payment) => payment.id === id);
  
  if (paymentIndex !== -1) {
    payments[paymentIndex].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    return payments[paymentIndex];
  }
  
  return undefined;
};

const searchPayments = (query: string): Payment[] => {
  const payments = getPayments();
  const lowerQuery = query.toLowerCase();
  
  return payments.filter(
    (payment) =>
      payment.buyerName?.toLowerCase().includes(lowerQuery) ||
      payment.bankSender?.toLowerCase().includes(lowerQuery) ||
      payment.note?.toLowerCase().includes(lowerQuery) ||
      payment.amount.toString().includes(query)
  );
};

export const PaymentService = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  searchPayments
};
