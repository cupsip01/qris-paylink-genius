
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PaymentService } from "@/utils/paymentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import Layout from "@/components/Layout";
import { CreditCard } from "lucide-react";

const Index = () => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [bankSender, setBankSender] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to format input with thousand separators
  const formatAmountInput = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format with thousand separators
    if (digits) {
      const number = parseInt(digits, 10);
      return number.toLocaleString('id-ID');
    }
    return '';
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatAmountInput(e.target.value);
    setAmount(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert formatted amount to number
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const payment = await PaymentService.createPayment(
        numericAmount,
        note,
        buyerName,
        bankSender,
        true // Always use the custom QRIS
      );
      
      toast({
        title: "Payment created",
        description: "Your QRIS payment has been generated",
      });
      
      navigate(`/payment/${payment.id}`);
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create New Payment
            </CardTitle>
            <CardDescription className="text-center">
              Generate a QRIS code for your customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Rp)</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="amount"
                    placeholder="100.000"
                    value={amount}
                    onChange={handleAmountChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buyerName">Buyer Name (Optional)</Label>
                <Input
                  id="buyerName"
                  placeholder="John Doe"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bankSender">Bank/Sender (Optional)</Label>
                <Input
                  id="bankSender"
                  placeholder="BCA - Andi"
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
                className="w-full bg-qris-red hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Payment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
