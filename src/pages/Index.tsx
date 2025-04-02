
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Settings } from "lucide-react";
import { createPayment } from "@/utils/paymentService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import SettingsDialog from "@/components/payment/SettingsDialog";

const Index = () => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [bankSender, setBankSender] = useState("");
  const [note, setNote] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
            <QrCode className="h-10 w-10 text-white" />
          </div>
          <div className="flex justify-center items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create New Payment
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Generate a QRIS code for your customer
          </p>
        </div>
        
        <form onSubmit={handleCreatePayment} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Buyer Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Enter buyer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bank">Bank/Sender (Optional)</Label>
            <Input
              id="bank"
              placeholder="Enter bank or sender name"
              value={bankSender}
              onChange={(e) => setBankSender(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add any additional notes here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={loading}
          >
            {loading ? "Creating..." : "Generate Payment"}
          </Button>
        </form>
        
        <SettingsDialog 
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </div>
    </div>
  );
};

export default Index;
