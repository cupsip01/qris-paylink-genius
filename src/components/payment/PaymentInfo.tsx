
import { motion } from "framer-motion";
import { User, CreditCard, MessageSquare } from "lucide-react";

interface PaymentInfoProps {
  buyerName?: string;
  bankSender?: string;
  note?: string;
}

const PaymentInfo = ({ buyerName, bankSender, note }: PaymentInfoProps) => {
  if (!buyerName && !bankSender && !note) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {buyerName && (
        <motion.div className="flex items-center mb-3" variants={itemVariants}>
          <div className="bg-violet-100 p-3 rounded-full mr-3">
            <User className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Customer Name</p>
            <p className="text-sm font-medium">{buyerName}</p>
          </div>
        </motion.div>
      )}
      
      {bankSender && (
        <motion.div className="flex items-center mb-3" variants={itemVariants}>
          <div className="bg-blue-100 p-3 rounded-full mr-3">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Payment Method</p>
            <p className="text-sm font-medium">{bankSender}</p>
          </div>
        </motion.div>
      )}
      
      {note && (
        <motion.div className="flex items-start" variants={itemVariants}>
          <div className="bg-amber-100 p-3 rounded-full mr-3 mt-0.5">
            <MessageSquare className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Notes</p>
            <p className="text-sm">{note}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PaymentInfo;
