
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ChevronRight, Search, SlidersHorizontal, Trash2, Edit, AlertCircle } from "lucide-react";
import { Payment } from "@/types/payment";
import { PaymentService } from "@/utils/paymentService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthProvider";
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

const History = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch payments when component mounts
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await PaymentService.getAllPayments();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'pending' | 'paid') => {
    try {
      await PaymentService.updatePaymentStatus(id, status);
      toast({
        title: "Success",
        description: `Payment status updated to ${status}`,
      });
      // Refresh payments after update
      fetchPayments();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await PaymentService.deletePayment(id);
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
      // Remove from state
      setPayments(payments.filter(p => p.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    }
  };

  // Filter payments based on search query and status filter
  const filteredPayments = payments.filter(payment => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (payment.buyerName?.toLowerCase().includes(query)) ||
      (payment.bankSender?.toLowerCase().includes(query)) ||
      (payment.note?.toLowerCase().includes(query)) ||
      (payment.amount.toString().includes(query));
    
    // Apply status filter if not "all"
    const matchesStatus = statusFilter === "all" ? true : payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
        <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="p-2 h-10 w-10">
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-accent text-accent-foreground" : ""}
            >
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setStatusFilter("pending")}
              className={statusFilter === "pending" ? "bg-accent text-accent-foreground" : ""}
            >
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setStatusFilter("paid")}
              className={statusFilter === "paid" ? "bg-accent text-accent-foreground" : ""}
            >
              Paid
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {user ? (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Admin View</h2>
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-purple-600"></div>
              <p className="mt-2 text-gray-500">Loading payment history...</p>
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                      <TableCell>
                        {payment.buyerName || "No Name"}
                        {payment.note && <p className="text-xs text-gray-500">{payment.note}</p>}
                      </TableCell>
                      <TableCell>{payment.formattedAmount}</TableCell>
                      <TableCell>
                        <Badge 
                          className={payment.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link to={`/payment/${payment.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          {payment.status === 'pending' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 text-green-700"
                              onClick={() => handleUpdateStatus(payment.id, 'paid')}
                            >
                              Mark Paid
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                              onClick={() => handleUpdateStatus(payment.id, 'pending')}
                            >
                              Mark Pending
                            </Button>
                          )}
                          <AlertDialog open={deleteId === payment.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-red-50 hover:bg-red-100 text-red-700"
                                onClick={() => setDeleteId(payment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this payment? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => payment.id && handleDeletePayment(payment.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No payments found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-purple-600"></div>
              <p className="mt-2 text-gray-500">Loading payment history...</p>
            </div>
          ) : filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <div key={payment.id} className="relative">
                <Link
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
                    <Badge 
                      className={payment.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}
                    >
                      {payment.status}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                  </div>
                </Link>
                <AlertDialog open={deleteId === payment.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 absolute top-2 right-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteId(payment.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this payment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => payment.id && handleDeletePayment(payment.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No payments found.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default History;
