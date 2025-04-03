
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentHeaderProps {
  createdAt: string;
  expiresInMinutes?: number;
}

const PaymentHeader = ({ createdAt, expiresInMinutes }: PaymentHeaderProps) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <motion.div 
      className="bg-purple-600 text-white p-6 text-center rounded-b-3xl relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute top-6 left-6">
        <button 
          onClick={handleBack}
          className="p-1 rounded-full hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold font-poppins">Payment Details</h2>
        {expiresInMinutes && (
          <motion.p 
            className="text-sm opacity-90 mt-1 font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Expires in {expiresInMinutes}:00
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default PaymentHeader;
