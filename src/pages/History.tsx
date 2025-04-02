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
import { Search, ChevronRight, Clock, CheckCircle, History } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch payments from service
    const fetchData = async () => {
      try {
        setLoading(true);
        let results;
        
        if (searchQuery.trim()) {
          results = await PaymentService.searchPayments(searchQuery);
        } else {
          results = await PaymentService.getAllPayments();
        }
        
        setPayments(results);
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchQuery]);

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
              <History className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Transaction History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              View all your generated QRIS payments
            </p>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search by name, amount, or note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : payments.length === 0 ? (
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
                            <p className="font-medium">{payment.formattedAmount || formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-500">
                              {payment.buyerName || payment.note || "No details"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {payment.bankSender && <span className="font-medium">{payment.bankSender} • </span>}
                              {payment.createdAt && format(new Date(payment.createdAt), "MMM d, yyyy h:mm a")}
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
      </div>
    </Layout>
  );
};

export default History;
