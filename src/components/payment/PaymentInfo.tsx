import { motion } from "framer-motion";
import { User, CreditCard, MessageSquare } from "lucide-react";

interface PaymentInfoProps {
  buyerName?: string;
  bankSender?: string;
  note?: string;
}

const PaymentInfo = ({ buyerName, bankSender, note }: PaymentInfoProps) => {
  if (!buyerName && !bankSender && !note) return null;

  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-4">
      {buyerName && (
        <p className="text-sm mb-1">
          <span className="font-medium">Name:</span> {buyerName}
        </p>
      )}
      {bankSender && (
        <p className="text-sm mb-1">
          <span className="font-medium">Sender:</span> {bankSender}
        </p>
      )}
      {note && (
        <p className="text-sm">
          <span className="font-medium">Note:</span> {note}
        </p>
      )}
    </div>
  );
};

export default PaymentInfo;
