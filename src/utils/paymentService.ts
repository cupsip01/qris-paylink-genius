
import { Payment } from "@/types/payment";
import QRCode from "qrcode";
import { convertStaticToDynamicQRIS, parseQrisData } from "./qrisUtils";

// In a real app, this would be a backend call
// For demo purposes, we're using localStorage
const STORAGE_KEY = "qris_payments";

// Your specific static QRIS content
const STATIC_QRIS = "00020101021126570011ID.DANA.WWW011893600915359884425702095988442570303UMI51440014ID.CO.QRIS.WWW0215ID10243136428100303UMI5204594553033605802ID5910Jedo Store6010Kab. Bogor61051682063049B94";

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
    // Use the static QRIS defined above
    const staticQrisContent = STATIC_QRIS;
    
    // Parse QRIS data to get merchant info
    const qrisData = parseQrisData(staticQrisContent);
    qrisNmid = qrisData.nmid || "ID1024313642810";
    merchantName = qrisData.merchantName || "Jedo Store";
    qrisId = qrisData.id || "01";
    
    console.log("Parsed QRIS data:", qrisData);
    
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

const deletePayment = (id: string): boolean => {
  const payments = getPayments();
  const filteredPayments = payments.filter((payment) => payment.id !== id);
  
  if (filteredPayments.length < payments.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPayments));
    return true;
  }
  
  return false;
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
  deletePayment,
  searchPayments
};
