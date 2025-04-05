import { motion } from "framer-motion";

interface PaymentAmountProps {
  amount: number | string;
}

// Helper function to convert string to number if needed
const parseAmount = (amount: number | string): number => {
  if (typeof amount === 'string') {
    // Remove currency symbols and commas
    const cleanedAmount = amount.replace(/[^\d.]/g, '');
    return parseFloat(cleanedAmount) || 0;
  }
  return amount;
};

const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
    .format(numericAmount)
    .replace('IDR', 'Rp')
    .replace(/\./g, ',')
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ');
};

const PaymentAmount = ({ amount }: PaymentAmountProps) => {
  const numericAmount = parseAmount(amount);
  const formattedAmount = formatCurrency(numericAmount).replace(/[^\d,]/g, '');
  
  return (
    <motion.div 
      className="text-center mb-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <span className="text-gray-500 text-sm block mb-1 font-medium">Amount to Pay</span>
      <motion.p 
        className="text-4xl font-bold text-purple-600"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.3
        }}
      >
        Rp {formattedAmount}
      </motion.p>
      <div className="h-1 w-24 bg-purple-500 mx-auto mt-3 rounded-full"></div>
    </motion.div>
  );
};

export default PaymentAmount;
export { formatCurrency };
