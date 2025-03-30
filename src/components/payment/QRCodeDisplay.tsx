
import { Info, Barcode } from "lucide-react";
import { formatCurrency } from "./PaymentAmount";

interface QRCodeDisplayProps {
  qrImageUrl?: string;
  amount: number;
  qrisNmid?: string;
  merchantName?: string;
  qrisRequestDate?: string;
}

const QRCodeDisplay = ({ 
  qrImageUrl, 
  amount, 
  qrisNmid, 
  merchantName = "Jedo Store", 
  qrisRequestDate 
}: QRCodeDisplayProps) => {
  if (!qrImageUrl) return null;

  // Calculate expiry time (30 minutes from creation)
  const expiryTime = qrisRequestDate 
    ? new Date(new Date(qrisRequestDate).getTime() + 30 * 60 * 1000) 
    : null;

  const isExpired = expiryTime ? new Date() > expiryTime : false;
  const expiryTimeString = expiryTime ? 
    `${expiryTime.getHours().toString().padStart(2, '0')}:${expiryTime.getMinutes().toString().padStart(2, '0')}` : 
    '';

  return (
    <div className="flex justify-center mb-6">
      <div className="flex flex-col items-center bg-white p-4 border rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Barcode className="h-4 w-4 text-qris-red" />
          <div className="text-center font-semibold">QRIS - {merchantName}</div>
        </div>
        <img 
          src={qrImageUrl} 
          alt="QRIS Payment QR Code with Amount"
          className="max-w-full"
          style={{width: 'auto', height: 'auto', maxHeight: '300px'}}
        />
        <div className="text-center mt-4 bg-gray-100 p-2 rounded w-full">
          <div className="font-bold mb-1">Total Bayar: {formatCurrency(amount)}</div>
          <div className="text-xs">NMID: {qrisNmid || "ID1024313642810"}</div>
          {expiryTimeString && (
            <div className="text-xs mt-1">
              {isExpired ? (
                <span className="text-red-600">EXPIRED</span>
              ) : (
                <span>Valid until {expiryTimeString} WIB</span>
              )}
            </div>
          )}
          <div className="flex justify-center items-center gap-1 mt-2">
            <Info className="h-3 w-3 text-gray-500" />
            <div className="text-sm text-gray-600">QR sudah terisi nominal {formatCurrency(amount)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
