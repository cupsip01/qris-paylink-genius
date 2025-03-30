
import { Payment } from "@/types/payment";
import QRCode from "qrcode";
import { convertStaticToDynamicQRIS, parseQrisData } from "./qrisUtils";

// In a real app, this would be a backend call
// For demo purposes, we're using localStorage
const STORAGE_KEY = "qris_payments";

// Example static QRIS content (in a real app, this would come from the merchant's QR scan)
const STATIC_QRIS = "00020101021126570011ID.DANA.WWW011893600915302259148102090225914810303UMI51440014ID.CO.QRIS.WWW0215ID10200176114730303UMI5204581253033605802ID5922Warung Sayur Bu Sugeng6010Kab. Demak610559567630458C7";

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
  useCustomQr: boolean = true,
  taxType: 'p' | 'r' = 'p',
  fee: string = '0'
): Promise<Payment> => {
  const id = Math.random().toString(36).substring(2, 15);
  
  // Format the amount in Indonesian style (with thousand separators)
  const formattedAmount = formatIndonesianCurrency(amount);
  
  // Generate transaction reference number based on id
  const cliTrxNumber = `TR${id.substring(0, 6).toUpperCase()}`;
  
  let qrisContent = '';
  let dynamicQrisContent = '';
  let qrImageUrl = '';
  let qrisInvoiceId = '';
  let qrisNmid = '';
  let qrisRequestDate = '';
  let merchantName = '';
  let qrisId = '';
  
  try {
    // In a real implementation, you would get the static QRIS from a QR code scan
    // or from a saved value in your database
    const staticQrisContent = STATIC_QRIS;
    
    // Parse QRIS data to get merchant info
    const qrisData = parseQrisData(staticQrisContent);
    qrisNmid = qrisData.nmid || "ID1020021181745";
    merchantName = qrisData.merchantName || "Jedo Store";
    qrisId = qrisData.id || "01";
    
    // Convert static QRIS to dynamic QRIS with embedded amount
    dynamicQrisContent = convertStaticToDynamicQRIS(staticQrisContent, amount, taxType, fee);
    
    // Use the dynamic QRIS content as the QRIS content
    qrisContent = dynamicQrisContent;
    
    // Generate QR code from the dynamic QRIS content
    qrImageUrl = await generateQRCode(dynamicQrisContent);
    
    // Set values that would come from API
    qrisInvoiceId = cliTrxNumber;
    qrisRequestDate = new Date().toISOString();
    
  } catch (error) {
    console.error("Error generating QRIS:", error);
    // Fallback to basic QR if conversion fails
    qrisContent = `00020101021226650014ID.CO.QRIS.WWW011893600914ID102431364281054${amount.toString().length.toString().padStart(2, '0')}${amount}5802ID5910Jedo Store6013Jakarta610560136621304${cliTrxNumber}`;
    qrImageUrl = await generateQRCode(qrisContent);
    merchantName = "Jedo Store";
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
    originalMerchantQrImage: "/lovable-uploads/bf9cac39-aefe-4140-97a5-1b3926f4b651.png",
    formattedAmount: formattedAmount,
    qrisContent: qrisContent,
    staticQrisContent: STATIC_QRIS,
    dynamicQrisContent: dynamicQrisContent,
    qrisInvoiceId: qrisInvoiceId,
    qrisNmid: qrisNmid,
    qrisRequestDate: qrisRequestDate,
    cliTrxNumber: cliTrxNumber,
    merchantName: merchantName,
    taxType: taxType,
    fee: fee,
    qrisId: qrisId
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
