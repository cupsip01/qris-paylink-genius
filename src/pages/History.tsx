
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/components/payment/PaymentAmount";
import { format } from "date-fns";
import { ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Payment } from "@/types/payment";

const History = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedPayments = data.map((payment: any) => ({
          id: payment.id,
          amount: payment.amount,
          buyerName: payment.buyer_name || "",
          bankSender: payment.bank_sender || "",
          note: payment.note || "",
          status: payment.status || "pending",
          createdAt: payment.created_at,
          formattedAmount: formatCurrency(payment.amount)
        }));
        setPayments(formattedPayments);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const query = searchQuery.toLowerCase();
    return (
      (payment.buyerName?.toLowerCase().includes(query)) ||
      (payment.bankSender?.toLowerCase().includes(query)) ||
      (payment.note?.toLowerCase().includes(query)) ||
      (payment.amount.toString().includes(query))
    );
  });

  return (
    <Layout title="Transaction History" subtitle="View all your generated QRIS payments">
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, amount, or note"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="bg-white p-2 rounded-md border">
          <SlidersHorizontal className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-purple-600"></div>
            <p className="mt-2 text-gray-500">Loading payment history...</p>
          </div>
        ) : filteredPayments.length > 0 ? (
          filteredPayments.map((payment) => (
            <Link
              key={payment.id}
              to={`/payment/${payment.id}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-amber-600">₹</span>
                </div>
                <div>
                  <p className="font-medium">
                    {payment.buyerName || (payment.note ? payment.note.slice(0, 20) : "Rp " + payment.amount.toLocaleString())}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(payment.createdAt), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No payments found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
