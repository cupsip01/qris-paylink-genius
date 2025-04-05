import { Clock, User, CreditCard, MessageSquare } from 'lucide-react';

interface PaymentInfoProps {
  buyerName?: string;
  bankSender?: string;
  note?: string;
  id: string;
  createdAt: string;
}

const PaymentInfo = ({ buyerName, bankSender, note, id, createdAt }: PaymentInfoProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
      <div className="space-y-3">
        {buyerName && (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <User className="h-4 w-4 mr-2" />
            <span>Pembeli: {buyerName}</span>
          </div>
        )}
        
        {bankSender && (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>Bank: {bankSender}</span>
          </div>
        )}
        
        {note && (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Catatan: {note}</span>
          </div>
        )}
        
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Clock className="h-4 w-4 mr-2" />
          <span>ID: {id}</span>
        </div>
        
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Clock className="h-4 w-4 mr-2" />
          <span>Dibuat: {new Date(createdAt).toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;
