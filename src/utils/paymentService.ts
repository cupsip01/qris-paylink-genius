
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

const formatIndonesianCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
  
  // Format the amount in Indonesian style (no decimal points)
  const formattedAmount = formatIndonesianCurrency(amount);
  
  // For QRIS, we need the amount without any formatting, just the raw number
  // The QRIS standard expects amount in smallest currency unit (e.g., cents)
  // For IDR, we'll convert to a string without decimals since Rupiah doesn't use cents in practice
  
  // We'll format according to the QRIS standard
  // The 54 data object contains the transaction amount
  // Format: two digits for length + amount value
  const amountString = amount.toString();
  const amountLength = amountString.length.toString().padStart(2, '0');
  const amountField = `54${amountLength}${amountString}`;
  
  // Merchant ID from your QRIS image
  const merchantId = "ID1024313642810"; 
  
  // Build the full QRIS data string according to standards
  // This follows a simplified version of the EMVCO QR Code standard
  // In a real implementation, you would need to calculate CRC and other elements
  const qrisData = `00020101021226650014ID.CO.QRIS.WWW011893600914${merchantId}5204581453033605802ID5924Jedo Store6007Jakarta6304${amountField}`;
  
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
    originalMerchantQrImage: "/lovable-uploads/77d1e713-7a92-4d6e-9b4d-a61ea8274672.png",
    formattedAmount: formattedAmount
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
