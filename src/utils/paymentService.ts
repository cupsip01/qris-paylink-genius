
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
  bankSender?: string,
  useCustomQr: boolean = true
): Promise<Payment> => {
  const id = Math.random().toString(36).substring(2, 15);
  let qrImageUrl;
  
  // Always generate a QR code that includes the amount
  // This follows a simplified QRIS format with amount embedded
  // In a real implementation, this would follow the QRIS standard format
  const amountInRupiah = amount.toFixed(2);
  const merchantId = "ID1024313642810"; // Merchant ID from your QRIS image
  const qrisData = `00020101021226650014ID.CO.QRIS.WWW011893600914${merchantId}5204581453033605802ID5924Jedo Store6007Jakarta62070703A016304${amountInRupiah}`;
  
  qrImageUrl = await generateQRCode(qrisData);
  
  const newPayment: Payment = {
    id,
    amount,
    note,
    buyerName,
    bankSender,
    createdAt: new Date().toISOString(),
    status: "pending",
    qrImageUrl,
    useCustomQr,
    originalMerchantQrImage: "/lovable-uploads/77d1e713-7a92-4d6e-9b4d-a61ea8274672.png"
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
