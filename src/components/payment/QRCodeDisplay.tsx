
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

  // If no QR image is provided, use default placeholder
  const imageUrl = qrImageUrl || "https://via.placeholder.com/300x300?text=QR+Code";

  return (
    <div className="flex flex-col items-center py-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-2xl shadow-lg mb-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-violet-100/30 rounded-2xl" />
        <div className="relative z-10">
          <motion.img 
            src={imageUrl} 
            alt="QRIS Payment QR Code" 
            className="h-72 w-72 object-contain rounded-lg" 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            onError={(e) => {
              // If image fails to load, set to placeholder
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/300x300?text=QR+Code+Not+Found";
              console.error("QR code image failed to load:", qrImageUrl);
            }}
          />
          <div className="absolute top-3 right-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            QRIS
          </div>
        </div>
      </motion.div>
      
      <motion.button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-full mt-2 font-medium shadow-md hover:shadow-lg transition-all duration-300"
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
      >
        {isExpanded ? "Hide details" : "Show QRIS details"}
      </motion.button>
      
      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-sm text-gray-600 w-full bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-100 shadow-sm"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="text-right font-medium text-violet-700">Merchant:</div>
            <div className="font-sans">{merchantName || "-"}</div>
            
            <div className="text-right font-medium text-violet-700">NMID:</div>
            <div className="font-mono text-xs bg-gray-50 p-1 rounded">{qrisNmid || "-"}</div>
            
            <div className="text-right font-medium text-violet-700">Generated:</div>
            <div className="font-sans">
              {qrisRequestDate 
                ? format(new Date(qrisRequestDate), "dd MMM yyyy HH:mm") 
                : "-"}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
