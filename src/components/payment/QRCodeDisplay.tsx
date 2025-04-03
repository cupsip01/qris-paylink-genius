
import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

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
  qrisRequestDate,
  amount
}: QRCodeDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // If no QR image is provided or there was an error loading it, use default placeholder
  const imageUrl = (imageError || !qrImageUrl) 
    ? "https://via.placeholder.com/300x300?text=QR+Code"
    : qrImageUrl;

  return (
    <div className="flex flex-col items-center py-2">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-4 w-full"
      >
        <div className="flex justify-center">
          <img 
            src={imageUrl} 
            alt="QRIS Payment QR Code" 
            className="h-64 w-64 object-contain" 
            onError={(e) => {
              console.error("QR code image failed to load:", qrImageUrl);
              setImageError(true);
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/300x300?text=QR+Code+Not+Found";
            }}
          />
        </div>
      </motion.div>
      
      <motion.button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full mt-4 font-medium"
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
      >
        {isExpanded ? "Hide details" : "Show details"}
      </motion.button>
      
      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-sm text-center w-full"
        >
          <p className="text-gray-600 font-medium">Merchant: <span className="font-normal">{merchantName || "My Store"}</span></p>
          <p className="text-gray-600 font-medium">NMID: <span className="font-mono text-xs">{qrisNmid || "ID10023456789"}</span></p>
          <p className="text-gray-600 font-medium">Generated: 
            <span className="font-normal">
              {qrisRequestDate 
                ? format(new Date(qrisRequestDate), "dd MMM yyyy HH:mm") 
                : format(new Date(), "dd MMM yyyy HH:mm")}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
