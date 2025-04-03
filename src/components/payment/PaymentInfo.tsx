
import { motion } from "framer-motion";
import { User, CreditCard, MessageSquare, Calendar, Hash } from "lucide-react";
import { format } from "date-fns";

interface PaymentInfoProps {
  buyerName?: string;
  bankSender?: string;
  note?: string;
  id?: string;
  createdAt?: string;
}

const PaymentInfo = ({ buyerName, bankSender, note, id, createdAt }: PaymentInfoProps) => {
  if (!buyerName && !bankSender && !note && !id && !createdAt) return null;

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
        <motion.div className="flex items-start mb-3" variants={itemVariants}>
          <div className="bg-amber-100 p-3 rounded-full mr-3 mt-0.5">
            <MessageSquare className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Notes</p>
            <p className="text-sm">{note}</p>
          </div>
        </motion.div>
      )}
      
      {id && (
        <motion.div className="flex items-center mb-3" variants={itemVariants}>
          <div className="bg-gray-100 p-3 rounded-full mr-3">
            <Hash className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Payment ID</p>
            <p className="text-sm font-mono">{id}</p>
          </div>
        </motion.div>
      )}
      
      {createdAt && (
        <motion.div className="flex items-center" variants={itemVariants}>
          <div className="bg-green-100 p-3 rounded-full mr-3">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Created On</p>
            <p className="text-sm">{format(new Date(createdAt), "dd MMM yyyy HH:mm")}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PaymentInfo;
