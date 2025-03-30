
import { formatDistanceToNow } from "date-fns";

interface PaymentHeaderProps {
  createdAt: string;
}

const PaymentHeader = ({ createdAt }: PaymentHeaderProps) => {
  return (
    <div className="bg-qris-red text-white p-4 text-center">
      <h2 className="text-2xl font-bold">Payment Details</h2>
      <p className="opacity-90">
        Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </p>
    </div>
  );
};

export default PaymentHeader;
