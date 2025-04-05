import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Payment } from '@/types/payment';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const getPaymentById = async (id: string): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }

  return data as Payment;
};

const EditPayment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [bankSender, setBankSender] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Fixed query options by moving onSuccess to a separate useEffect
  const { data: paymentData, isLoading: isPaymentLoading, error } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => id ? getPaymentById(id) : Promise.reject('No ID provided'),
    enabled: !!id
  });

  // Use useEffect to handle the success case
  useEffect(() => {
    if (paymentData) {
      setPayment(paymentData);
      setBuyerName(paymentData.buyerName || '');
      setBankSender(paymentData.bankSender || '');
      setAmount(paymentData.amount || 0);
      setNote(paymentData.note || '');
    }
  }, [paymentData]);

  const handleUpdatePayment = async () => {
    if (!id) {
      toast({
        title: "Missing payment ID",
        description: "Could not update payment because ID is missing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('payments')
        .update({
          buyer_name: buyerName,
          bank_sender: bankSender,
          amount: amount,
          note: note,
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Payment updated",
        description: "Payment details have been successfully updated.",
      });
      navigate('/history');
    } catch (error: any) {
      console.error("Update payment error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update payment details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isPaymentLoading) {
    return (
      <Layout title="Edit Payment">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Edit Payment">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Payment" showBackButton={true}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="buyerName">Buyer Name</Label>
          <Input
            id="buyerName"
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Enter buyer name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankSender">Bank Sender</Label>
          <Input
            id="bankSender"
            type="text"
            value={bankSender}
            onChange={(e) => setBankSender(e.target.value)}
            placeholder="Enter bank sender"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter note"
          />
        </div>

        <Button
          onClick={handleUpdatePayment}
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Payment"}
        </Button>
      </div>
    </Layout>
  );
};

export default EditPayment;
