
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
  
  // Format the amount in Indonesian style (with thousand separators)
  const formattedAmount = formatIndonesianCurrency(amount);
  
  // Generate transaction reference number based on id
  const cliTrxNumber = `TR${id.substring(0, 6).toUpperCase()}`;
  
  // QRIS API parameters
  const params = new URLSearchParams({
    do: 'create-invoice',
    apikey: 'a789789', // Replace with your actual API key
    mID: '123456', // Replace with your actual merchant ID
    cliTrxNumber: cliTrxNumber,
    cliTrxAmount: amount.toString(),
    useTip: 'no'
  });
  
  let qrisContent = '';
  let qrImageUrl = '';
  let qrisInvoiceId = '';
  let qrisNmid = '';
  let qrisRequestDate = '';
  
  try {
    // In a real implementation, you would call the actual API
    // For demo purposes, we'll simulate the API call with the QRIS format
    // fetch(`https://qris.interactive.co.id/restapi/qris/show_qris.php?${params.toString()}`)
    
    // Simulate API response for demo
    // This is a placeholder. In production, use the actual API response
    const merchantId = "ID1024313642810"; // This would come from the API
    
    // Simulate QRIS content from API
    // In a real implementation, this would be the qris_content from the API response
    qrisContent = `00020101021226680016ID.CO.PJSP.WWW011893600914${merchantId}0215${merchantId}0303UMI51440014ID.CO.QRIS.WWW0215ID${merchantId}0303UMI52045732530336054082${amount}5502015802ID5916Jedo Store6007Jakarta61056013662130509${cliTrxNumber}`;
    
    // Generate QR code from QRIS content
    qrImageUrl = await generateQRCode(qrisContent);
    
    // Set values that would come from API
    qrisInvoiceId = cliTrxNumber;
    qrisNmid = merchantId;
    qrisRequestDate = new Date().toISOString();
    
  } catch (error) {
    console.error("Error generating QRIS:", error);
    // Fallback to basic QR if API fails
    const amountString = amount.toString();
    const amountLength = amountString.length.toString().padStart(2, '0');
    const amountField = `54${amountLength}${amountString}`;
    
    const merchantId = "ID1024313642810"; 
    qrisContent = `00020101021226650014ID.CO.QRIS.WWW011893600914${merchantId}5204581453033605802ID5924Jedo Store6007Jakarta6304${amountField}`;
    qrImageUrl = await generateQRCode(qrisContent);
  }

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
    formattedAmount: formattedAmount,
    qrisContent: qrisContent,
    qrisInvoiceId: qrisInvoiceId,
    qrisNmid: qrisNmid,
    qrisRequestDate: qrisRequestDate,
    cliTrxNumber: cliTrxNumber
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
