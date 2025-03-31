
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode } from "lucide-react";
import { createPayment } from "@/utils/paymentService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    
    try {
      const payment = await createPayment({
        customer_name: name,
        amount: Number(amount),
        email: email || undefined,
        whatsapp: whatsapp || undefined,
      });
      
      toast.success("Payment created successfully!");
      navigate(`/payment/${payment.id}`);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create QRIS Payment
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Generate a payment QR code for your customers
          </p>
        </div>
        
        <form onSubmit={handleCreatePayment} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              placeholder="Enter customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (IDR)</Label>
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
            <Label htmlFor="email">Customer Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
            <Input
              id="whatsapp"
              placeholder="628123456789"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Include country code without + (e.g., 628123456789)
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Payment"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Index;
