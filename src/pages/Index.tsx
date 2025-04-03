
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPayment } from "@/utils/paymentService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { Wallet } from "lucide-react";

const Index = () => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [bankSender, setBankSender] = useState("");
  const [note, setNote] = useState("");

  const navigate = useNavigate();

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Creating payment with data:", { 
        amount: Number(amount), 
        buyer_name: name || undefined,
        bank_sender: bankSender || undefined,
        note: note || undefined
      });
      
      const payment = await createPayment({
        amount: Number(amount),
        buyer_name: name || undefined,
        bank_sender: bankSender || undefined,
        note: note || undefined
      });
      
      if (payment && payment.id) {
        toast.success("Payment created successfully!");
        console.log("Payment created, navigating to:", `/payment/${payment.id}`);
        navigate(`/payment/${payment.id}`);
      } else {
        throw new Error("Failed to create payment - no ID returned");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to create payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto pt-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-4 rounded-full">
              <Wallet className="h-10 w-10 text-purple-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-purple-600 mb-1">
            Create New Payment
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Generate a QRIS code for your customer
          </p>
        </div>
        
        <form onSubmit={handleCreatePayment} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Buyer Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Masukan Nama Pembeli"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bank">Bank/Sender (Optional)</Label>
            <Input
              id="bank"
              placeholder="Masukan Nama Bank"
              value={bankSender}
              onChange={(e) => setBankSender(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Masukan Jumlah Nominal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Berikan catatan untuk transaksi ini"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? "Processing..." : "Generate Payment"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Index;
