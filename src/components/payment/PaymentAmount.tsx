
import { motion } from "framer-motion";

interface PaymentAmountProps {
  amount: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const PaymentAmount = ({ amount }: PaymentAmountProps) => {
  return (
    <motion.div 
      className="text-center mb-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <span className="text-gray-500 text-sm block mb-1 font-medium">Amount to Pay</span>
      <motion.p 
        className="text-4xl font-bold bg-gradient-to-r from-violet-700 to-indigo-700 text-transparent bg-clip-text font-poppins"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.3
        }}
      >
        {formatCurrency(amount)}
      </motion.p>
      <div className="h-1 w-24 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto mt-3 rounded-full"></div>
    </motion.div>
  );
};

export default PaymentAmount;
export { formatCurrency };
