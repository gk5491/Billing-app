import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Plus, Search, ChevronDown, MoreHorizontal, Pencil, Trash2,
  X, Send, FileText, Printer, Download, RefreshCw, Eye,
  Check, Filter
} from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JournalEntry {
  account: string;
  debit: number;
  credit: number;
}

interface PaymentReceived {
  id: string;
  paymentNumber: string;
  date: string;
  referenceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  invoices: any[];
  mode: string;
  depositTo: string;
  amount: number;
  unusedAmount: number;
  bankCharges: number;
  tax: string;
  taxAmount: number;
  notes: string;
  attachments: string[];
  sendThankYou: boolean;
  status: string;
  paymentType: string;
  placeOfSupply: string;
  descriptionOfSupply: string;
  amountInWords: string;
  journalEntries: JournalEntry[];
  createdAt: string;
}

interface Customer {
  id: string;
  displayName: string;
  companyName: string;
  email: string;
  pan?: string;
  gstin?: string;
  gstTreatment?: string;
  placeOfSupply?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  balanceDue: number;
  status: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function PaymentReceiptView({ payment, branding }: { payment: PaymentReceived; branding?: any }) {
  return (
    <div className="bg-white" style={{ width: '210mm', minHeight: '297mm', color: 'black' }}>
      <div className="p-12 text-black text-sm">
        {/* Header with Logo and Company Details */}
        <div className="mb-6 pb-4 border-b border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              {branding?.logo?.url ? (
                <img
                  src={branding.logo.url}
                  alt="Company Logo"
                  className="h-16 w-auto mb-2"
                  data-testid="img-payment-logo"
                />
              ) : (
                <div className="mb-2">
                  <span className="text-xl font-bold text-slate-900">Your Company</span>
                </div>
              )}
              <div className="text-xs text-gray-600 space-y-0.5 mt-2">
                <p>Hingewadi - Wakad road</p>
                <p>Hingewadi</p>
                <p>Pune, Maharashtra 411057</p>
                <p>India</p>
                <p className="mt-2"><strong>GSTIN:</strong> 27AZCPA5145K1ZH</p>
                <p><strong>Sales:</strong> sales@company.com</p>
                <p><strong>Website:</strong> www.company.com</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-slate-900">PAYMENT RECEIPT</h1>
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Date</span>
            <span className="font-semibold text-slate-900">{formatDate(payment.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reference Number</span>
            <span className="font-semibold text-slate-900">{payment.referenceNumber || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Mode</span>
            <span className="font-semibold text-slate-900">{payment.mode}</span>
          </div>
        </div>

        {/* Amount Received and In Words Section */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <p className="text-gray-600 text-xs font-semibold mb-2">Amount Received In Words</p>
            <p className="font-semibold text-slate-900">{payment.amountInWords || 'N/A'}</p>
          </div>
          <div className="flex justify-end items-start">
            <div className="bg-green-500 text-white px-8 py-3 rounded text-center">
              <div className="text-xs font-medium text-white">Amount Received</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(payment.amount)}</div>
            </div>
          </div>
        </div>

        {/* Received From and Signature Section */}
        <div className="mb-8 grid grid-cols-2 gap-12">
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">RECEIVED FROM</h4>
            <p className="font-bold text-slate-900 mb-2">{payment.customerName}</p>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p>{payment.placeOfSupply || '(MH) - Maharashtra'}</p>
              <p>India</p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between">
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-12">Authorized Signature</p>
              {branding?.signature?.url && (
                <img src={branding.signature.url} alt="Signature" className="h-12 w-auto mb-1" />
              )}
            </div>
          </div>
        </div>

        {/* Payment For Table */}
        {payment.invoices && payment.invoices.length > 0 && (
          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Payment For</h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-slate-100">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Invoice Number</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Invoice Date</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Invoice Amount</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Payment Amount</th>
                </tr>
              </thead>
              <tbody>
                {payment.invoices.map((invoice: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-2 text-gray-900">{invoice.invoiceNumber || '-'}</td>
                    <td className="py-2 px-2 text-gray-900">{invoice.date ? formatDate(invoice.date) : '-'}</td>
                    <td className="py-2 px-2 text-right text-gray-900">{formatCurrency(invoice.amount || 0)}</td>
                    <td className="py-2 px-2 text-right text-gray-900">{formatCurrency(invoice.paymentAmount || invoice.amount || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Over Payment Section */}
        {payment.unusedAmount > 0 && (
          <div className="pt-4 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-600 mb-1">Over payment</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(payment.unusedAmount)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentDetailPanel({
  payment,
  branding,
  onClose,
  onEdit,
  onDelete,
  onRefund
}: {
  payment: PaymentReceived;
  branding?: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefund: () => void;
}) {
  const [showPdfView, setShowPdfView] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      const { generatePDFFromElement } = await import("@/lib/pdf-utils");
      await generatePDFFromElement("payment-pdf-content", `Payment-${payment.paymentNumber}.pdf`);

      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "PDF Downloaded",
        description: `${payment.paymentNumber}.pdf has been downloaded successfully.`
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Failed to download PDF",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    import("@/lib/pdf-utils").then(({ printPDFView }) => {
      printPDFView("payment-pdf-content", `Payment Receipt - ${payment.paymentNumber}`);
    }).catch(error => {
      console.error("Print error:", error);
      const { toast } = require("@/hooks/use-toast");
      toast({
        title: "Failed to print",
        description: "Please try again.",
        variant: "destructive"
      });
    });
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 overflow-hidden">
      <div id="payment-pdf-content" className="bg-white" style={{ position: 'fixed', left: '-9999px', top: 0, width: '210mm', height: '297mm', overflow: 'hidden', zIndex: -1 }}>
        <PaymentReceiptView payment={payment} branding={branding} />
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900" data-testid="text-payment-number">{payment.paymentNumber}</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} data-testid="button-close-panel">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 overflow-x-auto bg-white">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onEdit} data-testid="button-edit-payment">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Send
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Send via Email</DropdownMenuItem>
            <DropdownMenuItem>Send via SMS</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              PDF/Print
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onRefund}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refund
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5" data-testid="button-more-actions">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Label htmlFor="pdf-view" className="text-sm text-slate-500">Show PDF View</Label>
          <Switch id="pdf-view" checked={showPdfView} onCheckedChange={setShowPdfView} />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {showPdfView ? (
          <PaymentReceiptView payment={payment} branding={branding} />
        ) : (
          <div className="p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-500">Customer</p>
                  <p className="font-semibold text-blue-600">{payment.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(payment.amount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Payment Date</p>
                  <p className="font-medium">{formatDate(payment.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Payment #</p>
                  <p className="font-medium">{payment.paymentNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Payment Mode</p>
                  <p className="font-medium">{payment.mode}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Deposit To</p>
                  <p className="font-medium">{payment.depositTo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Reference Number</p>
                  <p className="font-medium">{payment.referenceNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    {payment.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">More Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deposit To</span>
                    <span className="text-blue-600">{payment.depositTo}</span>
                  </div>
                </div>
              </div>

              {payment.journalEntries && payment.journalEntries.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Journal</h4>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">INR</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Amount is displayed in your base currency</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">Customer Payment - {payment.paymentNumber}</span>
                    <Button variant="outline" size="sm" className="h-6 text-xs">Accrual</Button>
                    <Button variant="outline" size="sm" className="h-6 text-xs">Cash</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="text-xs">ACCOUNT</TableHead>
                        <TableHead className="text-xs text-right">DEBIT</TableHead>
                        <TableHead className="text-xs text-right">CREDIT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payment.journalEntries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm">{entry.account}</TableCell>
                          <TableCell className="text-sm text-right">{entry.debit > 0 ? formatCurrency(entry.debit).replace('₹', '') : '0.00'}</TableCell>
                          <TableCell className="text-sm text-right">{entry.credit > 0 ? formatCurrency(entry.credit).replace('₹', '') : '0.00'}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell className="font-semibold">Total</TableCell>
                        <TableCell className="font-semibold text-right">
                          {formatCurrency(payment.journalEntries.reduce((sum, e) => sum + e.debit, 0)).replace('₹', '')}
                        </TableCell>
                        <TableCell className="font-semibold text-right">
                          {formatCurrency(payment.journalEntries.reduce((sum, e) => sum + e.credit, 0)).replace('₹', '')}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-slate-200 p-3 text-center text-xs text-slate-500">
        PDF Template: <span className="text-blue-600">Elite Template</span>
        <button className="text-blue-600 ml-2">Change</button>
      </div>
    </div>
  );
}

function PaymentCreateDialog({
  open,
  onOpenChange,
  onSave,
  customers,
  editPayment
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payment: any) => void;
  customers: Customer[];
  editPayment?: PaymentReceived | null;
}) {
  const [paymentType, setPaymentType] = useState<'invoice_payment' | 'customer_advance'>('invoice_payment');
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    amount: '',
    bankCharges: '',
    tax: '',
    date: new Date().toISOString().split('T')[0],
    paymentNumber: '',
    mode: 'Cash',
    depositTo: 'Petty Cash',
    referenceNumber: '',
    taxDeducted: 'no',
    notes: '',
    sendThankYou: true,
    placeOfSupply: '',
    descriptionOfSupply: ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<Record<string, { payment: number; receivedDate: string }>>({});

  // Auto-allocation function
  const autoAllocatePayment = (totalAmount: number, invoices: Invoice[]) => {
    if (invoices.length === 0) {
      setSelectedInvoices({});
      return;
    }

    if (totalAmount <= 0) {
      setSelectedInvoices({});
      return;
    }

    // Sort invoices by date (oldest first)
    const sortedInvoices = [...invoices].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let remainingAmount = totalAmount;
    const newSelectedInvoices: Record<string, { payment: number; receivedDate: string }> = {};

    for (const invoice of sortedInvoices) {
      if (remainingAmount <= 0) break;

      const invoiceBalance = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.amount;
      if (invoiceBalance > 0) {
        const paymentAmount = Math.min(remainingAmount, invoiceBalance);
        newSelectedInvoices[invoice.id] = {
          payment: paymentAmount,
          receivedDate: new Date().toISOString().split('T')[0]
        };
        remainingAmount -= paymentAmount;
        console.log(`Allocated ${paymentAmount} to ${invoice.invoiceNumber}, remaining: ${remainingAmount}`);
      }
    }

    setSelectedInvoices(newSelectedInvoices);
  };

  // Handle amount change with auto-allocation
  const handleAmountChange = (amount: string) => {
    setFormData(prev => ({ ...prev, amount }));
    const numAmount = parseFloat(amount) || 0;
    if (numAmount > 0 && paymentType === 'invoice_payment') {
      autoAllocatePayment(numAmount, unpaidInvoices);
    } else {
      setSelectedInvoices({});
    }
  };

  // Calculate totals
  const totalPaymentAmount = Object.values(selectedInvoices).reduce((sum, inv) => sum + inv.payment, 0);
  const amountReceived = parseFloat(formData.amount) || 0;
  const amountInExcess = Math.max(0, amountReceived - totalPaymentAmount);

  useEffect(() => {
    if (editPayment) {
      setPaymentType(editPayment.paymentType === 'customer_advance' ? 'customer_advance' : 'invoice_payment');
      setFormData({
        customerId: editPayment.customerId,
        customerName: editPayment.customerName,
        customerEmail: editPayment.customerEmail,
        amount: String(editPayment.amount),
        bankCharges: String(editPayment.bankCharges || ''),
        tax: editPayment.tax,
        date: editPayment.date,
        paymentNumber: editPayment.paymentNumber,
        mode: editPayment.mode,
        depositTo: editPayment.depositTo,
        referenceNumber: editPayment.referenceNumber,
        taxDeducted: 'no',
        notes: editPayment.notes,
        sendThankYou: editPayment.sendThankYou,
        placeOfSupply: editPayment.placeOfSupply,
        descriptionOfSupply: editPayment.descriptionOfSupply
      });
    } else {
      setFormData({
        customerId: '',
        customerName: '',
        customerEmail: '',
        amount: '',
        bankCharges: '',
        tax: '',
        date: new Date().toISOString().split('T')[0],
        paymentNumber: '',
        mode: 'Cash',
        depositTo: 'Petty Cash',
        referenceNumber: '',
        taxDeducted: 'no',
        notes: '',
        sendThankYou: true,
        placeOfSupply: '',
        descriptionOfSupply: ''
      });
      setSelectedCustomer(null);
    }
  }, [editPayment, open]);

  const handleCustomerChange = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.displayName || customer.companyName,
        customerEmail: customer.email || '',
        placeOfSupply: customer.placeOfSupply || ''
      }));

      // Fetch unpaid invoices
      try {
        const response = await fetch(`/api/customers/${customerId}/unpaid-invoices`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched unpaid invoices:', data.data);
          const invoices = (data.data || []).map((inv: any) => ({
            ...inv,
            // Ensure balanceDue is set properly
            balanceDue: inv.balanceDue > 0 ? inv.balanceDue : inv.amount
          }));
          setUnpaidInvoices(invoices);

          // Auto-allocate if amount already entered
          const amount = parseFloat(formData.amount) || 0;
          if (amount > 0) {
            autoAllocatePayment(amount, invoices);
          }
        }
      } catch (error) {
        console.error('Failed to fetch unpaid invoices:', error);
      }
    }
  };

  const handleSubmit = () => {
    // Build invoices array from selected invoices
    const invoicePayments = Object.entries(selectedInvoices)
      .filter(([_, inv]) => inv.payment > 0)
      .map(([id, inv]) => {
        const invoice = unpaidInvoices.find(i => i.id === id);
        return {
          invoiceId: id,
          invoiceNumber: invoice?.invoiceNumber || '',
          invoiceDate: invoice?.date || '',
          invoiceAmount: invoice?.amount || 0,
          balanceDue: invoice?.balanceDue || 0,
          paymentAmount: inv.payment,
          paymentReceivedDate: inv.receivedDate
        };
      });

    const paymentData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      bankCharges: parseFloat(formData.bankCharges) || 0,
      paymentType,
      status: 'PAID',
      unusedAmount: amountInExcess,
      invoices: invoicePayments,
      attachments: [],
      journalEntries: [
        {
          account: formData.depositTo,
          debit: parseFloat(formData.amount) || 0,
          credit: 0
        },
        {
          account: 'Unearned Revenue',
          debit: 0,
          credit: parseFloat(formData.amount) || 0
        }
      ]
    };

    console.log('Saving payment with invoices:', paymentData);
    onSave(paymentData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPayment ? 'Edit Payment' : 'Record Payment'}</DialogTitle>
          <DialogDescription>Record a payment received from a customer</DialogDescription>
        </DialogHeader>

        <Tabs value={paymentType} onValueChange={(v) => setPaymentType(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="invoice_payment">Invoice Payment</TabsTrigger>
            <TabsTrigger value="customer_advance">Customer Advance</TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600">Customer Name*</Label>
                <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.displayName || customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCustomer?.pan && (
                  <p className="text-sm text-blue-600">PAN: {selectedCustomer.pan}</p>
                )}
                {selectedCustomer?.gstTreatment && (
                  <p className="text-sm text-slate-600">GST Treatment: {selectedCustomer.gstTreatment}</p>
                )}
                {selectedCustomer?.gstin && (
                  <p className="text-sm text-slate-600">GSTIN: {selectedCustomer.gstin}</p>
                )}
              </div>

              {paymentType === 'customer_advance' && (
                <div className="space-y-2">
                  <Label className="text-red-600">Place of Supply*</Label>
                  <Select value={formData.placeOfSupply} onValueChange={(v) => setFormData(prev => ({ ...prev, placeOfSupply: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select place of supply" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="[MH] - Maharashtra">[MH] - Maharashtra</SelectItem>
                      <SelectItem value="[DL] - Delhi">[DL] - Delhi</SelectItem>
                      <SelectItem value="[KA] - Karnataka">[KA] - Karnataka</SelectItem>
                      <SelectItem value="[TN] - Tamil Nadu">[TN] - Tamil Nadu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {paymentType === 'customer_advance' && (
              <div className="space-y-2">
                <Label>Description of Supply</Label>
                <Textarea
                  placeholder="Will be displayed on the Payment Receipt"
                  value={formData.descriptionOfSupply}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionOfSupply: e.target.value }))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600">Amount Received*</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 bg-slate-50 rounded-l-md text-sm">
                    INR
                  </span>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter amount to auto-allocate"
                    className="rounded-l-none"
                    data-testid="input-amount"
                  />
                </div>
                <p className="text-xs text-slate-500">Amount will be auto-allocated to unpaid invoices (oldest first)</p>
              </div>
              <div className="space-y-2">
                <Label>Bank Charges (if any)</Label>
                <Input
                  type="number"
                  value={formData.bankCharges}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankCharges: e.target.value }))}
                  data-testid="input-bank-charges"
                />
              </div>
            </div>

            {paymentType === 'customer_advance' && (
              <div className="space-y-2">
                <Label>Tax</Label>
                <Select value={formData.tax} onValueChange={(v) => setFormData(prev => ({ ...prev, tax: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Tax" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Tax</SelectItem>
                    <SelectItem value="gst18">GST 18%</SelectItem>
                    <SelectItem value="gst12">GST 12%</SelectItem>
                    <SelectItem value="gst5">GST 5%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600">Payment Date*</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  data-testid="input-date"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-600">Payment #*</Label>
                <Input
                  value={formData.paymentNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentNumber: e.target.value }))}
                  placeholder="Auto-generated"
                  data-testid="input-payment-number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={formData.mode} onValueChange={(v) => setFormData(prev => ({ ...prev, mode: v }))}>
                  <SelectTrigger data-testid="select-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-red-600">Deposit To*</Label>
                <Select value={formData.depositTo} onValueChange={(v) => setFormData(prev => ({ ...prev, depositTo: v }))}>
                  <SelectTrigger data-testid="select-deposit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petty Cash">Petty Cash</SelectItem>
                    <SelectItem value="Bank Account">Bank Account</SelectItem>
                    <SelectItem value="Cash on Hand">Cash on Hand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reference#</Label>
              <Input
                value={formData.referenceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                data-testid="input-reference"
              />
            </div>

            {paymentType === 'invoice_payment' && (
              <div className="space-y-2">
                <Label>Tax deducted?</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="taxDeducted"
                      value="no"
                      checked={formData.taxDeducted === 'no'}
                      onChange={() => setFormData(prev => ({ ...prev, taxDeducted: 'no' }))}
                    />
                    No Tax deducted
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="taxDeducted"
                      value="yes"
                      checked={formData.taxDeducted === 'yes'}
                      onChange={() => setFormData(prev => ({ ...prev, taxDeducted: 'yes' }))}
                    />
                    Yes, TDS (Income Tax)
                  </label>
                </div>
              </div>
            )}

            {paymentType === 'invoice_payment' && formData.customerId && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Unpaid Invoices</h4>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-3 w-3" />
                      Filter by Date Range
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-blue-600"
                      onClick={() => setSelectedInvoices({})}
                    >
                      Clear Applied Amount
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs">DATE</TableHead>
                      <TableHead className="text-xs">INVOICE NUMBER</TableHead>
                      <TableHead className="text-xs text-right">INVOICE AMOUNT</TableHead>
                      <TableHead className="text-xs text-right">AMOUNT DUE</TableHead>
                      <TableHead className="text-xs">PAYMENT RECEIVED ON</TableHead>
                      <TableHead className="text-xs text-right">PAYMENT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                          There are no unpaid invoices associated with this customer.
                        </TableCell>
                      </TableRow>
                    ) : (
                      unpaidInvoices.map(invoice => (
                        <TableRow key={invoice.id} className={selectedInvoices[invoice.id]?.payment > 0 ? "bg-green-50" : ""}>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell className="text-blue-600">{invoice.invoiceNumber}</TableCell>
                          <TableCell className="text-right">{formatCurrency(invoice.amount || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(invoice.balanceDue || 0)}</TableCell>
                          <TableCell>
                            {selectedInvoices[invoice.id]?.payment > 0 ? (
                              <Input
                                type="date"
                                className="w-32"
                                value={selectedInvoices[invoice.id]?.receivedDate || ''}
                                onChange={(e) => setSelectedInvoices(prev => ({
                                  ...prev,
                                  [invoice.id]: {
                                    ...prev[invoice.id],
                                    receivedDate: e.target.value
                                  }
                                }))}
                              />
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              className="w-24 text-right"
                              value={selectedInvoices[invoice.id]?.payment || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                const maxPayment = invoice.balanceDue || invoice.amount;
                                const validPayment = Math.min(Math.max(0, value), maxPayment);
                                setSelectedInvoices(prev => ({
                                  ...prev,
                                  [invoice.id]: {
                                    payment: validPayment,
                                    receivedDate: prev[invoice.id]?.receivedDate || new Date().toISOString().split('T')[0]
                                  }
                                }));
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <p className="text-xs text-slate-500">**List contains only SENT invoices</p>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>{formatCurrency(unpaidInvoices.reduce((sum, inv) => sum + (inv.balanceDue || inv.amount || 0), 0))}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Amount Received :</span>
                      <span>{formatCurrency(amountReceived)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount used for Payments :</span>
                      <span>{formatCurrency(totalPaymentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Refunded :</span>
                      <span>0.00</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Amount in Excess:</span>
                      <span>{formatCurrency(amountInExcess)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Notes (Internal use. Not visible to customer)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px]"
                data-testid="input-notes"
              />
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <Button variant="outline" size="sm" className="gap-1">
                Upload File
                <ChevronDown className="h-3 w-3" />
              </Button>
              <p className="text-xs text-slate-500">You can upload a maximum of 5 files, 5MB each</p>
            </div>

            <div className="flex items-center gap-2 border-t pt-4">
              <Checkbox
                id="sendThankYou"
                checked={formData.sendThankYou}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendThankYou: checked as boolean }))}
              />
              <Label htmlFor="sendThankYou">Send a "Thank you" note for this payment</Label>
            </div>

            {formData.sendThankYou && formData.customerEmail && (
              <div className="ml-6 flex items-center gap-2">
                <Checkbox checked disabled />
                <span className="text-sm">&lt;{formData.customerEmail}&gt;</span>
              </div>
            )}

            <p className="text-sm text-slate-500">
              Additional Fields: Start adding custom fields for your payments received by going to{' '}
              <span className="text-blue-600">Settings → Sales → Payments Received</span>.
            </p>
          </div>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="outline" onClick={handleSubmit} data-testid="button-save-draft">Save as Draft</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-paid">Save as Paid</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PaymentsReceived() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentReceived[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentReceived | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<PaymentReceived | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    fetchPayments();
    fetchCustomers();
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await fetch("/api/branding");
      const data = await response.json();
      if (data.success) {
        setBranding(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch branding:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments-received');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchPaymentDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/payments-received/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPayment(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payment detail:', error);
    }
  };

  const handlePaymentClick = (payment: PaymentReceived) => {
    fetchPaymentDetail(payment.id);
  };

  const handleClosePanel = () => {
    setSelectedPayment(null);
  };

  const handleEditPayment = () => {
    if (selectedPayment) {
      setEditPayment(selectedPayment);
      setCreateDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setPaymentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    try {
      const response = await fetch(`/api/payments-received/${paymentToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Payment deleted successfully" });
        fetchPayments();
        if (selectedPayment?.id === paymentToDelete) {
          handleClosePanel();
        }
      }
    } catch (error) {
      toast({ title: "Failed to delete payment", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;
    try {
      const response = await fetch(`/api/payments-received/${selectedPayment.id}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundAmount: selectedPayment.amount })
      });
      if (response.ok) {
        toast({ title: "Payment refunded" });
        fetchPayments();
        fetchPaymentDetail(selectedPayment.id);
      }
    } catch (error) {
      toast({ title: "Failed to refund payment", variant: "destructive" });
    }
  };

  const handleSavePayment = async (paymentData: any) => {
    try {
      const url = editPayment
        ? `/api/payments-received/${editPayment.id}`
        : '/api/payments-received';
      const method = editPayment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        toast({ title: editPayment ? "Payment updated" : "Payment recorded successfully" });
        fetchPayments();
        setEditPayment(null);
      }
    } catch (error) {
      toast({ title: "Failed to save payment", variant: "destructive" });
    }
  };

  const toggleSelectPayment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPayments.includes(id)) {
      setSelectedPayments(selectedPayments.filter(i => i !== id));
    } else {
      setSelectedPayments([...selectedPayments, id]);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.paymentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { currentPage, totalPages, totalItems, itemsPerPage, paginatedItems, goToPage } = usePagination(filteredPayments, 10);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">PAID</Badge>;
      case 'REFUNDED':
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">REFUNDED</Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="text-slate-600 border-slate-200">DRAFT</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] animate-in fade-in duration-300">
      <div className={`flex flex-col overflow-hidden transition-all duration-300 ${selectedPayment ? 'flex-1 min-w-[400px]' : 'flex-1'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">All Received Payments</h1>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditPayment(null);
                setCreateDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 gap-1.5 h-9"
              data-testid="button-new-payment"
            >
              <Plus className="h-4 w-4" /> New
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" data-testid="button-more-options">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={fetchPayments}>
                  Refresh List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {!selectedPayment && (
          <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search in Payments Received ( / )"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading payments...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Record your first payment to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2" data-testid="button-create-first-payment">
                  <Plus className="h-4 w-4" /> Record Payment
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="text-xs">DATE</TableHead>
                    <TableHead className="text-xs">PAYMENT #</TableHead>
                    <TableHead className="text-xs">REFERENCE NUMBER</TableHead>
                    <TableHead className="text-xs">CUSTOMER NAME</TableHead>
                    <TableHead className="text-xs">INVOICE#</TableHead>
                    <TableHead className="text-xs">MODE</TableHead>
                    <TableHead className="text-xs text-right">AMOUNT</TableHead>
                    <TableHead className="text-xs text-right">UNUSED AMOUNT</TableHead>
                    <TableHead className="text-xs">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((payment) => (
                    <TableRow
                      key={payment.id}
                      onClick={() => handlePaymentClick(payment)}
                      className={`cursor-pointer hover-elevate ${selectedPayment?.id === payment.id ? 'bg-blue-50' : ''}`}
                      data-testid={`row-payment-${payment.id}`}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedPayments.includes(payment.id)}
                          onClick={(e) => toggleSelectPayment(payment.id, e)}
                        />
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(payment.date)}</TableCell>
                      <TableCell className="text-sm text-blue-600 font-medium">{payment.paymentNumber}</TableCell>
                      <TableCell className="text-sm">{payment.referenceNumber || '-'}</TableCell>
                      <TableCell className="text-sm">{payment.customerName}</TableCell>
                      <TableCell className="text-sm">
                        {payment.invoices?.length > 0
                          ? payment.invoices.map((inv: any) => inv.invoiceNumber).join(', ')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-sm">{payment.mode}</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(payment.unusedAmount)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
              />
            </>
          )}
        </div>
      </div>

      {selectedPayment && (
        <div className="w-full max-w-[600px] lg:w-[600px] flex-shrink-0 border-l border-slate-200">
          <PaymentDetailPanel
            payment={selectedPayment}
            branding={branding}
            onClose={handleClosePanel}
            onEdit={handleEditPayment}
            onDelete={() => handleDelete(selectedPayment.id)}
            onRefund={handleRefund}
          />
        </div>
      )}

      <PaymentCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleSavePayment}
        customers={customers}
        editPayment={editPayment}
      />

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
