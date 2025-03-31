
import { useState } from "react";
import { format } from "date-fns";

interface QRCodeDisplayProps {
  qrImageUrl?: string;
  amount: number;
  qrisNmid?: string;
  merchantName?: string;
  qrisRequestDate?: string;
}

const QRCodeDisplay = ({ 
  qrImageUrl, 
  qrisNmid, 
  merchantName, 
  qrisRequestDate 
}: QRCodeDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col items-center py-6">
      {qrImageUrl && (
        <div className="border-2 border-qris-red p-4 rounded-lg mb-2">
          <img 
            src={qrImageUrl} 
            alt="QRIS Payment QR Code" 
            className="h-64 w-64 object-contain" 
          />
        </div>
      )}
      
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-gray-500 underline mt-2"
      >
        {isExpanded ? "Hide details" : "Show QRIS details"}
      </button>
      
      {isExpanded && (
        <div className="mt-4 text-sm text-gray-600 w-full">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-right font-medium">Merchant:</div>
            <div>{merchantName || "-"}</div>
            
            <div className="text-right font-medium">NMID:</div>
            <div>{qrisNmid || "-"}</div>
            
            <div className="text-right font-medium">Generated:</div>
            <div>
              {qrisRequestDate 
                ? format(new Date(qrisRequestDate), "dd MMM yyyy HH:mm") 
                : "-"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
