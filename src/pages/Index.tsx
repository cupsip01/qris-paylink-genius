import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCodePlus, CopyCheck, PlusCircle, Settings, History } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PaymentService } from "@/utils/paymentService";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";

const Index = () => {
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [note, setNote] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [bankSender, setBankSender] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { user } = useAuth();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and handle empty string
    if (/^\d*$/.test(value)) {
      setAmount(value === "" ? undefined : parseInt(value, 10));
    }
  };

  const handleCreatePayment = async () => {
    if (amount === undefined || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await PaymentService.createPayment(amount, note, buyerName, bankSender);
      toast({
        title: "Payment created",
        description: "Payment has been created successfully",
      });
      setOpen(false);
      setAmount(undefined);
      setNote("");
      setBuyerName("");
      setBankSender("");
    } catch (error) {
      toast({
        title: "Error creating payment",
        description: "An error occurred while creating the payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-qris-red dark:text-red-400 mb-2 animate-gradient-text">
          QRIS Payment Generator
        </h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Generate QRIS codes for easy payments
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-md mx-auto"
      >
        <Card className="glass-card border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold">Create New Payment</CardTitle>
            <CardDescription>Enter the amount to generate a QRIS code</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount === undefined ? "" : amount.toString()}
                onChange={handleAmountChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                placeholder="Payment for..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerName">Buyer Name (Optional)</Label>
              <Input
                id="buyerName"
                placeholder="Enter buyer name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankSender">Bank Sender (Optional)</Label>
              <Input
                id="bankSender"
                placeholder="Enter bank name"
                value={bankSender}
                onChange={(e) => setBankSender(e.target.value)}
              />
            </div>
            <Button className="bg-qris-red hover:bg-red-700" onClick={handleCreatePayment} disabled={loading}>
              {loading ? "Creating..." : "Generate QRIS Code"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings and History Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        <Link to="/settings">
          <motion.button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="h-6 w-6" />
          </motion.button>
        </Link>
        
        <Link to="/history">
          <motion.button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <History className="h-6 w-6" />
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
