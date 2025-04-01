
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PaymentService } from "@/utils/paymentService";
import { Payment } from "@/types/payment";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { Search, ChevronRight, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const History = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Mock data for demonstration
    const mockPayments: Payment[] = [
      {
        id: "1",
        amount: 150000,
        buyerName: "John Doe",
        bankSender: "BCA",
        createdAt: new Date().toISOString(),
        status: 'paid',
        note: "Monthly subscription"
      },
      {
        id: "2",
        amount: 75000,
        buyerName: "Jane Smith",
        bankSender: "Mandiri",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending',
        note: "Product purchase"
      },
      {
        id: "3",
        amount: 250000,
        buyerName: "Robert Brown",
        bankSender: "BNI",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'paid',
        note: "Service fee"
      }
    ];

    if (searchQuery.trim()) {
      const results = mockPayments.filter(payment => 
        payment.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.amount.toString().includes(searchQuery)
      );
      setPayments(results);
    } else {
      setPayments(mockPayments);
    }
  }, [searchQuery]);

  return (
    <Layout>
      <div className="max-w-md mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your generated QRIS payments
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search by name, amount, or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found</p>
                {searchQuery && (
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <Link
                    to={`/payment/${payment.id}`}
                    key={payment.id}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          payment.status === "paid" ? "bg-green-100" : "bg-amber-100"
                        }`}>
                          {payment.status === "paid" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-gray-500">
                            {payment.buyerName || payment.note || "No details"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {payment.bankSender && <span className="font-medium">{payment.bankSender} • </span>}
                            {format(new Date(payment.createdAt), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;
