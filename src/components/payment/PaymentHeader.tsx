
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Receipt } from "lucide-react";

interface PaymentHeaderProps {
  createdAt: string;
}

const PaymentHeader = ({ createdAt }: PaymentHeaderProps) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 text-center rounded-t-xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white/20 p-3 rounded-full mb-3">
          <Receipt className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold font-poppins">Payment Details</h2>
        <motion.p 
          className="text-sm opacity-90 mt-1 font-medium bg-white/10 px-3 py-1 rounded-full"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default PaymentHeader;
