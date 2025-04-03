
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Payment } from "@/types/payment";
import CustomerPaymentView from "@/components/payment/CustomerPaymentView";
import { useQuery } from "@tanstack/react-query";
import { getPayment } from "@/utils/paymentService";
import { Loader2 } from "lucide-react";

export default function PaymentDetails() {
  const { id } = useParams<{ id: string }>();
  
  const {
    data: payment,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => id ? getPayment(id) : Promise.reject("No payment ID"),
    enabled: Boolean(id),
    refetchInterval: (data) => {
      // Refetch every 5 seconds if payment is pending, otherwise don't refetch
      return data && data.status === 'pending' ? 5000 : false;
    },
  });

  // If payment exists but status is not 'pending' or 'paid', convert it to one of these values
  let processedPayment: Payment | undefined;
  if (payment) {
    const validStatus = payment.status === 'pending' || payment.status === 'paid' 
      ? payment.status 
      : 'pending';
      
    processedPayment = {
      ...payment,
      status: validStatus as 'pending' | 'paid'
    };
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-qris-red" />
          <span>Loading payment...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-600">Payment Not Found</h1>
          <p className="text-gray-600">
            The payment you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {processedPayment && <CustomerPaymentView payment={processedPayment} />}
    </div>
  );
}
