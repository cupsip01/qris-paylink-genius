
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PaymentService } from "@/utils/paymentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import Layout from "@/components/Layout";
import { CreditCard, Upload, FileUp } from "lucide-react";

const Index = () => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [bankSender, setBankSender] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrisText, setQrisText] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  
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
        <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New Payment</TabsTrigger>
            <TabsTrigger value="upload">Upload QRIS Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
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
          </TabsContent>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  Upload QRIS Code
                </CardTitle>
                <CardDescription className="text-center">
                  Upload your static QRIS code and convert it to dynamic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <Label htmlFor="qris-file" className="cursor-pointer text-blue-600 hover:text-blue-800">
                        Upload QRIS image
                      </Label>
                      <Input
                        id="qris-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qris-text">QRIS Code Text</Label>
                    <Textarea
                      id="qris-text"
                      placeholder="Paste your QRIS code text here..."
                      value={qrisText}
                      onChange={(e) => setQrisText(e.target.value)}
                      className="h-24"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="upload-amount">Amount (Rp)</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <Input
                        id="upload-amount"
                        placeholder="100.000"
                        value={amount}
                        onChange={handleAmountChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    className="w-full bg-qris-red hover:bg-red-700"
                    disabled={loading || !qrisText || !amount}
                    onClick={async () => {
                      // Here we would process the QRIS code
                      toast({
                        title: "Coming soon",
                        description: "QRIS code upload feature is coming soon",
                      });
                    }}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    {loading ? "Processing..." : "Process QRIS"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
