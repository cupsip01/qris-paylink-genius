import { motion } from "framer-motion";

interface PaymentAmountProps {
  amount: number;
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const PaymentAmount = ({ amount }: PaymentAmountProps) => {
  return (
    <div className="text-center mb-6">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Jumlah yang harus dibayar</p>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        Rp {formatAmount(amount)}
      </h1>
    </div>
  );
};

export default PaymentAmount;
