import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPayment } from '@/utils/paymentService';
import { toast } from "sonner";
import CustomerPaymentView from '@/components/payment/CustomerPaymentView';

const PaymentDetails = () => {
  const { id: paymentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: payment, isLoading, isError, error } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => getPayment(paymentId),
    enabled: !!paymentId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isError) {
    console.error("Error fetching payment:", error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-red-500 p-4">
        <h1 className="text-xl font-bold mb-2">Error</h1>
        <p>Failed to load payment details. {error instanceof Error ? error.message : 'Unknown error.'}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-gray-500 p-4">
        <h1 className="text-xl font-bold mb-2">Not Found</h1>
        <p>Payment not found.</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <CustomerPaymentView payment={payment} />;
};

export default PaymentDetails;
