
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PaymentService } from "@/utils/paymentService";
import Layout from "@/components/Layout";
import { ArrowLeft, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditPayment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    buyerName: "",
    bankSender: "",
    amount: "",
    note: "",
    status: "pending" as "pending" | "paid",
  });

  const [isLoading, setIsLoading] = useState(false);

  const { data: payment, isLoading: fetchLoading, error } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => PaymentService.getPayment(id || ""),
    enabled: !!id,
    onSuccess: (data) => {
      setFormData({
        buyerName: data.buyerName || "",
        bankSender: data.bankSender || "",
        amount: data.amount.toString(),
        note: data.note || "",
        status: data.status,
      });
    },
    onError: (err) => {
      toast.error("Failed to load payment details");
      console.error(err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) =>
      PaymentService.updatePayment(data.id, data.updates),
    onSuccess: () => {
      toast.success("Payment updated successfully");
      navigate(`/payment/${id}`);
    },
    onError: (err) => {
      toast.error("Failed to update payment");
      console.error(err);
      setIsLoading(false);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value as "pending" | "paid",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!id) {
      toast.error("Payment ID is missing");
      setIsLoading(false);
      return;
    }

    // Convert amount to number if it's changed
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      setIsLoading(false);
      return;
    }

    const updates = {
      ...formData,
      amount,
    };

    updateMutation.mutate({ id, updates });
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500 p-4">
        <h1 className="text-xl font-bold mb-2">Error</h1>
        <p>Failed to load payment details.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto pt-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="p-0 mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Payment</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="buyerName">Buyer Name</Label>
            <Input
              id="buyerName"
              name="buyerName"
              value={formData.buyerName}
              onChange={handleInputChange}
              placeholder="Buyer Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankSender">Bank/Payment Method</Label>
            <Input
              id="bankSender"
              name="bankSender"
              value={formData.bankSender}
              onChange={handleInputChange}
              placeholder="Bank or Payment Method"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Rp)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Payment Amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Payment Note"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Payment Status</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={isLoading || updateMutation.isPending}
            >
              {isLoading || updateMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditPayment;
