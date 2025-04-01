import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { PaymentService } from "@/utils/paymentService";
import { Payment } from "@/types/payment";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";
import PaymentActions from "@/components/payment/PaymentActions";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Trash2, 
  Check, 
  ArrowDown, 
  ArrowUp, 
  Filter,
  Calendar
} from "lucide-react";

const PaymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");

  // Long press detection
  let timer: ReturnType<typeof setTimeout>;
  const startLongPress = () => {
    timer = setTimeout(() => {
      setBulkMode(true);
    }, 500);
  };

  const endLongPress = () => {
    clearTimeout(timer);
  };

  useEffect(() => {
    if (id) {
      const fetchedPayment = PaymentService.getPaymentById(id);
      if (fetchedPayment) {
        setPayment(fetchedPayment);
      }
      setLoading(false);
    }
  }, [id]);

  const handleMarkAsPaid = () => {
    if (id && payment) {
      const updatedPayment = {...payment, status: 'paid' as const};
      setPayment(updatedPayment);
      toast({
        title: "Status updated",
        description: "Payment has been marked as paid",
      });
    }
  };

  const handleDeletePayment = () => {
    if (id) {
      toast({
        title: "Payment deleted",
        description: "Payment has been permanently deleted",
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length > 0) {
      toast({
        title: `${selectedItems.length} items deleted`,
        description: "Selected payments have been permanently deleted",
      });
      setSelectedItems([]);
      setBulkMode(false);
    }
  };

  const toggleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleWhatsAppConfirmation = () => {
    if (payment) {
      const message = `${whatsAppMessage} ${payment.id}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${adminWhatsApp}?text=${encodedMessage}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qris-red" />
        </div>
      </Layout>
    );
  }

  if (!payment) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <Card className="overflow-hidden mb-6">
          <PaymentHeader createdAt={payment.createdAt} />
          
          <CardContent className="p-6">
            <div className="mb-6">
              <PaymentAmount amount={payment.amount} />
              
              <PaymentInfo 
                buyerName={payment.buyerName}
                bankSender={payment.bankSender}
                note={payment.note}
              />
              
              <QRCodeDisplay 
                qrImageUrl={payment.qrImageUrl}
                amount={payment.amount}
                qrisNmid={payment.qrisNmid}
                merchantName={payment.merchantName}
                qrisRequestDate={payment.qrisRequestDate}
              />
              
              {!user ? (
                <div className="mt-6">
                  <Button 
                    onClick={handleWhatsAppConfirmation} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Konfirmasi Sudah Bayar
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction Details</CardTitle>
                      <CardDescription>Manage payment information</CardDescription>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Input 
                            type="date" 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-auto"
                          />
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-1" /> Filter
                          </Button>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                        >
                          {sortDirection === 'asc' ? (
                            <><ArrowUp className="h-4 w-4 mr-1" /> Oldest First</>
                          ) : (
                            <><ArrowDown className="h-4 w-4 mr-1" /> Newest First</>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {bulkMode && (
                                <TableHead className="w-12">
                                  <Checkbox 
                                    checked={selectedItems.length > 0}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedItems([payment.id]);
                                      } else {
                                        setSelectedItems([]);
                                      }
                                    }}
                                  />
                                </TableHead>
                              )}
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow
                              onMouseDown={startLongPress}
                              onMouseUp={endLongPress}
                              onMouseLeave={endLongPress}
                              onTouchStart={startLongPress}
                              onTouchEnd={endLongPress}
                              className="cursor-pointer"
                            >
                              {bulkMode && (
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedItems.includes(payment.id)}
                                    onCheckedChange={() => toggleSelectItem(payment.id)}
                                  />
                                </TableCell>
                              )}
                              <TableCell>
                                {format(new Date(payment.createdAt), "dd MMM yyyy")}
                              </TableCell>
                              <TableCell>
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(payment.amount)}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  payment.status === 'paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {payment.status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={handleMarkAsPaid}
                                    disabled={payment.status === 'paid'}
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="icon">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the payment record.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeletePayment} className="bg-red-600 hover:bg-red-700">
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      
                      {bulkMode && selectedItems.length > 0 && (
                        <div className="mt-4 flex justify-end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete selected payments?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete {selectedItems.length} payment records.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                                  Delete All
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setBulkMode(false);
                              setSelectedItems([]);
                            }}
                            className="ml-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      {user && (
                        <div className="mt-6 border p-4 rounded-lg">
                          <h3 className="font-medium mb-2">WhatsApp Settings</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Admin WhatsApp Number</label>
                              <Input 
                                value={adminWhatsApp} 
                                onChange={(e) => setAdminWhatsApp(e.target.value)}
                                placeholder="e.g. 628123456789"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Confirmation Message Template</label>
                              <Input 
                                value={whatsAppMessage} 
                                onChange={(e) => setWhatsAppMessage(e.target.value)}
                                placeholder="Message template"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {user && <PaymentActions payment={payment} />}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentDetails;
