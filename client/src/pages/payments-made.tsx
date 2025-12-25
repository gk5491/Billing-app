import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, CreditCard, MoreHorizontal, Trash2, X, Pencil, Mail, Printer, ChevronDown } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/table-pagination";
import { useBranding } from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface BillPayment {
  billId: string;
  billNumber: string;
  billDate: string;
  billAmount: number;
  paymentAmount: number;
}

interface PaymentMade {
  id: string;
  paymentNumber: string;
  vendorId: string;
  vendorName: string;
  vendorGstin?: string;
  vendorAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  paymentAmount: number;
  paymentDate: string;
  paymentMode: string;
  paidThrough?: string;
  depositTo?: string;
  paymentType: string;
  status: string;
  reference?: string;
  billPayments?: Record<string, BillPayment> | BillPayment[];
  sourceOfSupply?: string;
  destinationOfSupply?: string;
  notes?: string;
  unusedAmount?: number;
  createdAt: string;
}

interface Vendor {
  id: string;
  vendorName: string;
  companyName?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

// Convert number to words for Indian Rupees
function numberToWords(num: number): string {
  if (num === 0) return "Zero Only";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertLessThanOneThousand(n: number): string {
    let result = "";
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      result += ones[n] + " ";
    }
    return result.trim();
  }

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = Math.floor(num);
  const paise = Math.round((num % 1) * 100);

  let result = "Indian Rupee ";
  if (crore > 0) result += convertLessThanOneThousand(crore) + " Crore ";
  if (lakh > 0) result += convertLessThanOneThousand(lakh) + " Lakh ";
  if (thousand > 0) result += convertLessThanOneThousand(thousand) + " Thousand ";
  if (remainder > 0) result += convertLessThanOneThousand(remainder);

  result += " Only";
  return result.trim();
}

// Helper to safely get payment number as string (handles corrupted data)
function getPaymentNumberString(paymentNumber: any): string {
  if (typeof paymentNumber === 'string') {
    return paymentNumber;
  }
  if (paymentNumber && typeof paymentNumber === 'object' && paymentNumber.nextNumber) {
    return paymentNumber.nextNumber;
  }
  return '';
}

export default function PaymentsMade() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMade | null>(null);

  const { data: paymentsData, isLoading, refetch } = useQuery<{ success: boolean; data: PaymentMade[] }>({
    queryKey: ['/api/payments-made'],
  });

  const { data: vendorsData } = useQuery<{ success: boolean; data: Vendor[] }>({
    queryKey: ['/api/vendors'],
  });

  const { data: branding } = useBranding();

  const payments = paymentsData?.data || [];
  const vendors = vendorsData?.data || [];

  const filteredPayments = payments.filter(payment =>
    getPaymentNumberString(payment.paymentNumber).toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(payment.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(payment.reference || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { currentPage, totalPages, totalItems, itemsPerPage, paginatedItems, goToPage } = usePagination(filteredPayments, 10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDelete = (id: string) => {
    setPaymentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    try {
      const response = await fetch(`/api/payments-made/${paymentToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Payment deleted successfully" });
        if (selectedPayment?.id === paymentToDelete) {
          setSelectedPayment(null);
        }
        refetch();
      } else {
        toast({ title: "Failed to delete payment", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to delete payment", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <span className="text-green-600 font-medium">PAID</span>;
      case 'DRAFT':
        return <span className="text-slate-500">Draft</span>;
      case 'REFUNDED':
        return <span className="text-red-600 font-medium">REFUNDED</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const getBillNumbers = (payment: PaymentMade) => {
    if (!payment.billPayments) return '-';

    if (Array.isArray(payment.billPayments)) {
      return payment.billPayments.map(bp => bp.billNumber).join(', ') || '-';
    }

    const billNums = Object.values(payment.billPayments).map(bp => bp.billNumber);
    return billNums.length > 0 ? billNums.join(', ') : '-';
  };

  const getBillPaymentsArray = (payment: PaymentMade): BillPayment[] => {
    if (!payment.billPayments) return [];
    if (Array.isArray(payment.billPayments)) return payment.billPayments;
    return Object.values(payment.billPayments);
  };

  const getVendorDetails = (payment: PaymentMade) => {
    const vendor = vendors.find(v => v.id === payment.vendorId);
    return vendor;
  };

  const getPaidThroughLabel = (value?: string) => {
    const options: Record<string, string> = {
      'petty_cash': 'Petty Cash',
      'undeposited_funds': 'Undeposited Funds',
      'cash_on_hand': 'Cash on Hand',
      'bank_account': 'Bank Account',
    };
    return options[value || ''] || value || '-';
  };

  const getPaymentModeLabel = (value?: string) => {
    const options: Record<string, string> = {
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer',
      'cheque': 'Cheque',
      'credit_card': 'Credit Card',
      'upi': 'UPI',
      'neft': 'NEFT',
      'rtgs': 'RTGS',
      'imps': 'IMPS',
    };
    return options[value || ''] || value || '-';
  };

  const handleRowClick = (payment: PaymentMade) => {
    setSelectedPayment(payment);
  };

  const calculateUnusedAmount = (payment: PaymentMade) => {
    if (payment.unusedAmount !== undefined) return payment.unusedAmount;
    const billPayments = getBillPaymentsArray(payment);
    const usedAmount = billPayments.reduce((sum, bp) => sum + (bp.paymentAmount || 0), 0);
    return Math.max(0, payment.paymentAmount - usedAmount);
  };

  return (
    <div className="flex h-full">
      {/* Main List View */}
      <div className={`flex-1 transition-all duration-300 ${selectedPayment ? 'pr-0' : ''}`}>
        <div className="max-w-full mx-auto space-y-6 animate-in fade-in duration-500 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1 text-xl font-semibold">
                    All Payments <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>All Payments</DropdownMenuItem>
                  <DropdownMenuItem>Paid</DropdownMenuItem>
                  <DropdownMenuItem>Refunded</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="gap-2"
                onClick={() => setLocation('/payments-made/new')}
                data-testid="button-record-payment"
              >
                <Plus className="h-4 w-4" /> New
              </Button>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-payments"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2" data-testid="text-payments-empty">No payments recorded</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Record payments made to vendors to keep track of your accounts payable.
                </p>
                <Button
                  className="gap-2"
                  onClick={() => setLocation('/payments-made/new')}
                  data-testid="button-record-first-payment"
                >
                  <Plus className="h-4 w-4" /> Record Your First Payment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      <Checkbox data-testid="checkbox-select-all" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reference#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vendor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Bill#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Unused Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                      <Search className="h-4 w-4 mx-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedItems.map((payment) => (
                    <tr
                      key={payment.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${selectedPayment?.id === payment.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => handleRowClick(payment)}
                      data-testid={`row-payment-${payment.id}`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox data-testid={`checkbox-payment-${payment.id}`} />
                      </td>
                      <td className="px-4 py-3 text-sm">{formatDate(payment.paymentDate)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-primary">{getPaymentNumberString(payment.paymentNumber)}</td>
                      <td className="px-4 py-3 text-sm">{payment.reference || '-'}</td>
                      <td className="px-4 py-3 text-sm">{payment.vendorName}</td>
                      <td className="px-4 py-3 text-sm">{getBillNumbers(payment)}</td>
                      <td className="px-4 py-3 text-sm capitalize">{getPaymentModeLabel(payment.paymentMode)}</td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(payment.status)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatCurrency(payment.paymentAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatCurrency(calculateUnusedAmount(payment))}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-payment-actions-${payment.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRowClick(payment)} data-testid={`action-view-${payment.id}`}>View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation(`/payments-made/edit/${payment.id}`)} data-testid={`action-edit-${payment.id}`}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(payment.id)}
                              data-testid={`action-delete-${payment.id}`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedPayment && (
        <div className="w-[600px] border-l bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
          {/* Detail Header - Sidebar with List */}
          {/* <div className="border-b">
            <div className="max-h-[200px] overflow-y-auto">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`p-3 border-b cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedPayment.id === payment.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => setSelectedPayment(payment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox />
                      <div>
                        <div className="font-medium text-sm truncate max-w-[180px]">{payment.vendorName}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(payment.paymentDate)} - {getPaymentModeLabel(payment.paymentMode)}</div>
                        <span className="text-xs text-green-600">{payment.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(payment.paymentAmount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Detail Actions */}
          <div className="flex items-center justify-between p-3 border-b bg-slate-50 dark:bg-slate-800">
            <div className="font-semibold">{getPaymentNumberString(selectedPayment.paymentNumber)}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setLocation(`/payments-made/edit/${selectedPayment.id}`)}>
                <Pencil className="h-3 w-3" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Mail className="h-3 w-3" /> Send Email
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Printer className="h-3 w-3" /> PDF/Print <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Print</DropdownMenuItem>
                  <DropdownMenuItem>Download PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedPayment(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Detail Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Receipt Preview */}
            <div className="bg-white dark:bg-slate-950 border rounded-lg shadow-sm">
              {/* Paid Badge */}
              <div className="relative">
                <div className="absolute -top-3 -left-3 z-10">
                  <div className="bg-green-500 text-white px-4 py-2 text-sm font-bold transform -rotate-12 shadow-lg">
                    Paid
                  </div>
                </div>
              </div>

              {/* Company Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    {branding?.logo?.url ? (
                      <img
                        src={branding.logo.url}
                        alt="Company Logo"
                        className="h-12 w-auto mb-3"
                        data-testid="img-payment-made-logo"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-sm">C</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">Company Name</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {/* Right side can be used for additional info if needed */}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-6">
                <h3 className="text-center text-lg font-bold mb-6">PAYMENTS MADE</h3>

                <div className="flex gap-8">
                  {/* Left Column - Details */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Payment#</div>
                      <div className="font-medium">{getPaymentNumberString(selectedPayment.paymentNumber)}</div>

                      <div className="text-muted-foreground">Payment Date</div>
                      <div>{formatDate(selectedPayment.paymentDate)}</div>

                      <div className="text-muted-foreground">Reference Number</div>
                      <div>{selectedPayment.reference || '-'}</div>

                      <div className="text-muted-foreground">Paid To</div>
                      <div className="text-primary font-medium">{selectedPayment.vendorName}</div>

                      <div className="text-muted-foreground">Place Of Supply</div>
                      <div>{selectedPayment.sourceOfSupply || '-'}</div>

                      <div className="text-muted-foreground">Payment Mode</div>
                      <div className="font-medium">{getPaymentModeLabel(selectedPayment.paymentMode)}</div>

                      <div className="text-muted-foreground">Paid Through</div>
                      <div className="font-medium">{getPaidThroughLabel(selectedPayment.paidThrough)}</div>

                      <div className="text-muted-foreground">Amount Paid In Words</div>
                      <div className="text-primary font-medium">{numberToWords(selectedPayment.paymentAmount)}</div>
                    </div>
                  </div>

                  {/* Right Column - Amount Box */}
                  <div className="w-40">
                    <div className="bg-green-500 text-white p-4 rounded-lg text-center">
                      <div className="text-sm">Amount Paid</div>
                      <div className="text-2xl font-bold">{formatCurrency(selectedPayment.paymentAmount)}</div>
                    </div>
                  </div>
                </div>

                {/* Paid To Section */}
                <div className="mt-8 border-t pt-6">
                  <h4 className="font-semibold mb-2">Paid To</h4>
                  <div className="text-sm">
                    <p className="font-bold">{selectedPayment.vendorName}</p>
                    {(() => {
                      const vendor = getVendorDetails(selectedPayment);
                      if (vendor) {
                        return (
                          <>
                            {vendor.address && <p>{vendor.address}</p>}
                            {(vendor.city || vendor.state || vendor.pincode) && (
                              <p>{[vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(', ')}</p>
                            )}
                            {vendor.country && <p>{vendor.country}</p>}
                            {vendor.gstin && <p className="mt-1">GSTIN {vendor.gstin}</p>}
                          </>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Payment for Section */}
                {getBillPaymentsArray(selectedPayment).length > 0 && (
                  <div className="mt-8 border-t pt-6">
                    <h4 className="font-semibold mb-4">Payment for</h4>
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="px-3 py-2 text-left">Bill Number</th>
                          <th className="px-3 py-2 text-left">Bill Date</th>
                          <th className="px-3 py-2 text-right">Bill Amount</th>
                          <th className="px-3 py-2 text-right">Payment Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getBillPaymentsArray(selectedPayment).map((bp, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-3 py-2 text-primary">{bp.billNumber}</td>
                            <td className="px-3 py-2">{formatDate(bp.billDate)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(bp.billAmount)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(bp.paymentAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Journal Section */}
            <div className="mt-6">
              <Tabs defaultValue="journal">
                <TabsList>
                  <TabsTrigger value="journal">Journal</TabsTrigger>
                </TabsList>
                <TabsContent value="journal" className="mt-4">
                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-muted-foreground">
                        Amount is displayed in your base currency <Badge variant="secondary" className="ml-2">INR</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Accrual</Button>
                        <Button variant="ghost" size="sm">Cash</Button>
                      </div>
                    </div>

                    <div className="font-semibold mb-2">Vendor Payment - {getPaymentNumberString(selectedPayment.paymentNumber)}</div>
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                          <th className="px-3 py-2 text-left">ACCOUNT</th>
                          <th className="px-3 py-2 text-right">DEBIT</th>
                          <th className="px-3 py-2 text-right">CREDIT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-3 py-2">{getPaidThroughLabel(selectedPayment.paidThrough)}</td>
                          <td className="px-3 py-2 text-right">0.00</td>
                          <td className="px-3 py-2 text-right">{selectedPayment.paymentAmount.toFixed(2)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2">Prepaid Expenses</td>
                          <td className="px-3 py-2 text-right">{selectedPayment.paymentAmount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">0.00</td>
                        </tr>
                        <tr className="font-bold bg-slate-100 dark:bg-slate-700">
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2 text-right">{selectedPayment.paymentAmount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">{selectedPayment.paymentAmount.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {getBillPaymentsArray(selectedPayment).length > 0 && (
                      <>
                        <div className="font-semibold mb-2 mt-6">Payments Made - {getBillNumbers(selectedPayment)}</div>
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                              <th className="px-3 py-2 text-left">ACCOUNT</th>
                              <th className="px-3 py-2 text-right">DEBIT</th>
                              <th className="px-3 py-2 text-right">CREDIT</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="px-3 py-2">Prepaid Expenses</td>
                              <td className="px-3 py-2 text-right">0.00</td>
                              <td className="px-3 py-2 text-right">{selectedPayment.paymentAmount.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b">
                              <td className="px-3 py-2">Accounts Payable</td>
                              <td className="px-3 py-2 text-right">{selectedPayment.paymentAmount.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right">0.00</td>
                            </tr>
                            <tr className="font-bold bg-slate-100 dark:bg-slate-700">
                              <td className="px-3 py-2"></td>
                              <td className="px-3 py-2 text-right">{selectedPayment.paymentAmount.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right">{selectedPayment.paymentAmount.toFixed(2)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
