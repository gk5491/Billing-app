import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Plus, Search, ChevronDown, MoreHorizontal, Pencil, Trash2,
  X, Mail, FileText, Printer, ArrowRight, Filter, Download,
  ClipboardList, Eye, Check, Calendar, XCircle, Copy, Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/table-pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PurchaseOrder {
  id: string;
  purchaseOrderNumber: string;
  referenceNumber?: string;
  date: string;
  deliveryDate?: string;
  vendorId: string;
  vendorName: string;
  vendorAddress?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    countryRegion?: string;
    gstin?: string;
  };
  items: Array<{
    id: string;
    itemName: string;
    description?: string;
    quantity: number;
    rate: number;
    tax?: string;
    taxAmount?: number;
    amount: number;
  }>;
  subTotal: number;
  discountAmount?: number;
  taxAmount?: number;
  adjustment?: number;
  total: number;
  notes?: string;
  termsAndConditions?: string;
  status: string;
  receiveStatus?: string;
  billedStatus?: string;
  createdAt?: string;
  pdfTemplate?: string;
}

interface ActionItem {
  icon: any;
  label: string;
  onClick: () => void;
  className?: string;
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

function PurchaseOrderPDFView({ purchaseOrder, branding }: { purchaseOrder: PurchaseOrder; branding?: any }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm w-full">
      <div className="flex w-full">
        <div className="w-2 bg-blue-600 shrink-0"></div>
        <div className="flex-1 p-4 min-w-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              {branding?.logo?.url ? (
                <img src={branding.logo.url} alt="Company Logo" className="h-12 w-auto mb-2" data-testid="img-po-logo" />
              ) : (
                <div className="h-10 w-10 bg-blue-600 rounded flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">Purchase Order</h2>
              <p className="text-blue-600 font-medium"># {purchaseOrder.purchaseOrderNumber}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-500 mb-2">Vendor Address</h4>
            <p className="font-semibold text-blue-600">{purchaseOrder.vendorName}</p>
            {purchaseOrder.vendorAddress && (
              <div className="text-sm text-slate-600">
                {purchaseOrder.vendorAddress.street1 && <p>{purchaseOrder.vendorAddress.street1}</p>}
                {purchaseOrder.vendorAddress.city && (
                  <p>{purchaseOrder.vendorAddress.city}, {purchaseOrder.vendorAddress.state}</p>
                )}
                {purchaseOrder.vendorAddress.pinCode && <p>{purchaseOrder.vendorAddress.pinCode}</p>}
                {purchaseOrder.vendorAddress.countryRegion && <p>{purchaseOrder.vendorAddress.countryRegion}</p>}
                {purchaseOrder.vendorAddress.gstin && <p>GSTIN: {purchaseOrder.vendorAddress.gstin}</p>}
              </div>
            )}
          </div>

          <div className="text-right mb-4">
            <p className="text-sm"><span className="text-slate-500">Date:</span> {formatDate(purchaseOrder.date)}</p>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-3 py-2 text-left text-sm font-medium">#</th>
                <th className="px-3 py-2 text-left text-sm font-medium">Item & Description</th>
                <th className="px-3 py-2 text-center text-sm font-medium">Qty</th>
                <th className="px-3 py-2 text-right text-sm font-medium">Rate</th>
                <th className="px-3 py-2 text-right text-sm font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrder.items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-sm">{index + 1}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-sm">{item.itemName}</p>
                    {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                  </td>
                  <td className="px-3 py-3 text-center text-sm">{item.quantity.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-right text-sm">{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-3 text-right text-sm font-medium">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sub Total</span>
                <span>{purchaseOrder.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {purchaseOrder.taxAmount && purchaseOrder.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">IGST (18%)</span>
                  <span>{purchaseOrder.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(purchaseOrder.total)}</span>
              </div>
            </div>
          </div>

          {purchaseOrder.termsAndConditions && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2">Terms & Conditions</h4>
              <div className="text-xs text-slate-600 space-y-1">
                {purchaseOrder.termsAndConditions.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            {branding?.signature?.url ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={branding.signature.url}
                  alt="Authorized Signature"
                  style={{ maxWidth: '180px', maxHeight: '60px', objectFit: 'contain' }}
                />
                <p className="text-sm">Authorized Signature</p>
              </div>
            ) : (
              <>
                <div className="w-32 h-32 border-2 border-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <div className="text-center">
                    <p className="text-xs text-blue-600 font-medium">COMPANY</p>
                    <p className="text-[8px] text-slate-500">PVT. LTD.</p>
                  </div>
                </div>
                <p className="text-center text-sm mt-2">Authorized Signature</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseOrderDetailPanel({
  purchaseOrder,
  onClose,
  onEdit,
  onDelete,
  onConvertToBill,
  onMarkAsIssued,
  onMarkAsReceived,
  onMarkAsCancelled,
  onClone,
  onSetDeliveryDate,
  onCancelItems,
  branding
}: {
  purchaseOrder: PurchaseOrder;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onConvertToBill: () => void;
  onMarkAsIssued: () => void;
  onMarkAsReceived: () => void;
  onMarkAsCancelled: () => void;
  onClone: () => void;
  onSetDeliveryDate: () => void;
  onCancelItems: () => void;
  branding?: any;
}) {
  const [showPdfView, setShowPdfView] = useState(true);

  function getActionsForStatus(status: string): ActionItem[] {
    const actions: ActionItem[] = [];

    switch (status?.toUpperCase()) {
      case 'DRAFT':
        actions.push(
          { icon: Check, label: "Mark as Issued", onClick: onMarkAsIssued },
          { icon: ArrowRight, label: "Convert to Bill", onClick: onConvertToBill },
          { icon: Copy, label: "Clone", onClick: onClone },
          { icon: Trash2, label: "Delete", onClick: onDelete, className: "text-red-600" }
        );
        break;

      case 'ISSUED':
        actions.push(
          { icon: Calendar, label: "Expected Delivery Date", onClick: onSetDeliveryDate },
          { icon: XCircle, label: "Cancel Items", onClick: onCancelItems },
          { icon: XCircle, label: "Mark as Cancelled", onClick: onMarkAsCancelled },
          { icon: Copy, label: "Clone", onClick: onClone },
          { icon: Trash2, label: "Delete", onClick: onDelete, className: "text-red-600" },
          { icon: Check, label: "Mark as Received", onClick: onMarkAsReceived }
        );
        break;

      case 'RECEIVED':
      case 'CLOSED':
        actions.push(
          { icon: Eye, label: "View", onClick: () => { } },
          { icon: FileText, label: "PDF/Print", onClick: () => { } },
          { icon: Copy, label: "Clone", onClick: onClone },
          { icon: Trash2, label: "Delete", onClick: onDelete, className: "text-red-600" }
        );
        break;

      case 'CANCELLED':
        actions.push(
          { icon: Copy, label: "Clone", onClick: onClone },
          { icon: Trash2, label: "Delete", onClick: onDelete, className: "text-red-600" }
        );
        break;

      default:
        actions.push(
          { icon: Trash2, label: "Delete", onClick: onDelete, className: "text-red-600" }
        );
    }

    return actions;
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900" data-testid="text-po-number">{purchaseOrder.purchaseOrderNumber}</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
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
        <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onEdit} data-testid="button-edit-po">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          Send Email
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              PDF/Print
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Printer className="mr-2 h-4 w-4" /> Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={onConvertToBill}
          data-testid="button-convert-to-bill"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Convert to Bill
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5" data-testid="button-more-actions">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {getActionsForStatus(purchaseOrder.status).map((action: ActionItem, index: number) => (
              <DropdownMenuItem
                key={index}
                onClick={action.onClick}
                className={action.className || ""}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {purchaseOrder.billedStatus === 'YET TO BE BILLED' && (
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <span className="text-amber-600 text-sm font-medium">WHAT'S NEXT?</span>
          <span className="text-sm text-slate-600">Convert this to a bill to complete your purchase.</span>
          <Button
            size="sm"
            className="ml-auto bg-blue-600 hover:bg-blue-700"
            onClick={onConvertToBill}
          >
            Convert to Bill
          </Button>
        </div>
      )}

      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span>
            <span className="text-slate-500">Receive Status:</span>{' '}
            <span className="text-amber-600 font-medium">{purchaseOrder.receiveStatus || 'YET TO BE RECEIVED'}</span>
          </span>
          <span>
            <span className="text-slate-500">Bill Status:</span>{' '}
            <span className="text-amber-600 font-medium">{purchaseOrder.billedStatus || 'YET TO BE BILLED'}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="pdf-view" className="text-sm text-slate-500">Show PDF View</Label>
          <Switch id="pdf-view" checked={showPdfView} onCheckedChange={setShowPdfView} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {showPdfView ? (
          <div className="w-full">
            <PurchaseOrderPDFView purchaseOrder={purchaseOrder} branding={branding} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Vendor</span>
                <p className="font-medium text-blue-600">{purchaseOrder.vendorName}</p>
              </div>
              <div>
                <span className="text-slate-500">Date</span>
                <p className="font-medium">{formatDate(purchaseOrder.date)}</p>
              </div>
              <div>
                <span className="text-slate-500">Delivery Date</span>
                <p className="font-medium">{formatDate(purchaseOrder.deliveryDate || '')}</p>
              </div>
              <div>
                <span className="text-slate-500">Status</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {purchaseOrder.status}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-2 py-1 text-left">Item</th>
                    <th className="px-2 py-1 text-center">Qty</th>
                    <th className="px-2 py-1 text-right">Rate</th>
                    <th className="px-2 py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrder.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-2 py-2">{item.itemName}</td>
                      <td className="px-2 py-2 text-center">{item.quantity}</td>
                      <td className="px-2 py-2 text-right">{formatCurrency(item.rate)}</td>
                      <td className="px-2 py-2 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right space-y-1">
              <div className="flex justify-end gap-4 text-sm">
                <span className="text-slate-500">Sub Total:</span>
                <span className="w-28">{formatCurrency(purchaseOrder.subTotal)}</span>
              </div>
              <div className="flex justify-end gap-4 text-sm font-semibold">
                <span>Total:</span>
                <span className="w-28">{formatCurrency(purchaseOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-3 text-center text-xs text-slate-500">
        PDF Template: <span className="text-blue-600">{purchaseOrder.pdfTemplate || 'Standard Template'}</span>
        <button className="text-blue-600 ml-2">Change</button>
      </div>
    </div>
  );
}

export default function PurchaseOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<string | null>(null);
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    fetchPurchaseOrders();
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

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/purchase-orders');
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPODetail = async (id: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPO(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch PO detail:', error);
    }
  };

  const handlePOClick = (po: PurchaseOrder) => {
    fetchPODetail(po.id);
  };

  const handleClosePanel = () => {
    setSelectedPO(null);
  };

  const handleEditPO = () => {
    if (selectedPO) {
      setLocation(`/purchase-orders/${selectedPO.id}/edit`);
    }
  };

  const handleDelete = (id: string) => {
    setPoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!poToDelete) return;
    try {
      const response = await fetch(`/api/purchase-orders/${poToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Purchase order deleted successfully" });
        fetchPurchaseOrders();
        if (selectedPO?.id === poToDelete) {
          handleClosePanel();
        }
      }
    } catch (error) {
      toast({ title: "Failed to delete purchase order", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setPoToDelete(null);
    }
  };

  const handleConvertToBill = async () => {
    if (!selectedPO) return;
    try {
      // First update the PO status
      const response = await fetch(`/api/purchase-orders/${selectedPO.id}/convert-to-bill`, {
        method: 'POST'
      });
      if (response.ok) {
        toast({ title: "Converting purchase order to bill..." });
        // Refresh PO list to update status before navigating
        await fetchPurchaseOrders();
        // Navigate to bill create with all PO data
        setLocation(`/bills/new?purchaseOrderId=${selectedPO.id}`);
      }
    } catch (error) {
      toast({ title: "Failed to convert to bill", variant: "destructive" });
    }
  };

  const handleMarkAsIssued = async (poId: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${poId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ISSUED',
          updatedBy: 'Admin User'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state with the updated PO from server
        setPurchaseOrders(prev =>
          prev.map(po =>
            po.id === poId ? data.data : po
          )
        );
        toast({ title: "Purchase Order Issued", description: "Status updated successfully" });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase order status",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsReceived = async (poId: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${poId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'RECEIVED',
          updatedBy: 'Admin User'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state with the updated PO from server
        setPurchaseOrders(prev =>
          prev.map(po =>
            po.id === poId ? { ...data.data, receiveStatus: 'RECEIVED' } : po
          )
        );
        toast({ title: "Purchase Order Received", description: "Status updated successfully" });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase order status",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsCancelled = async (poId: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${poId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          updatedBy: 'Admin User'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state with the updated PO from server
        setPurchaseOrders(prev =>
          prev.map(po =>
            po.id === poId ? data.data : po
          )
        );
        toast({ title: "Purchase Order Cancelled", description: "Status updated successfully" });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase order status",
        variant: "destructive"
      });
    }
  };

  const handleClone = (poId: string) => {
    // Clone the purchase order
    const poToClone = purchaseOrders.find(po => po.id === poId);
    if (poToClone) {
      const clonedPO = {
        ...poToClone,
        id: Date.now().toString(),
        purchaseOrderNumber: `PO-${String(purchaseOrders.length + 1).padStart(5, '0')}`,
        date: new Date().toISOString().split('T')[0],
        status: 'DRAFT'
      };
      setPurchaseOrders(prev => [clonedPO, ...prev]);
      toast({ title: "Purchase Order Cloned", description: "Successfully created a copy" });
    }
  };

  const handleSetDeliveryDate = (poId: string) => {
    const newDate = prompt("Enter expected delivery date (YYYY-MM-DD):");
    if (newDate) {
      setPurchaseOrders(prev =>
        prev.map(po =>
          po.id === poId ? { ...po, deliveryDate: newDate } : po
        )
      );
      toast({ title: "Delivery Date Updated", description: "Expected delivery date set successfully" });
    }
  };

  const handleCancelItems = (poId: string) => {
    // Logic to cancel specific items in the PO
    toast({ title: "Cancel Items", description: "Item cancellation dialog would open here" });
  };

  const toggleSelectPO = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPOs.includes(id)) {
      setSelectedPOs(selectedPOs.filter(i => i !== id));
    } else {
      setSelectedPOs([...selectedPOs, id]);
    }
  };

  const filteredPOs = purchaseOrders.filter(po =>
    po.purchaseOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { currentPage, totalPages, totalItems, itemsPerPage, paginatedItems, goToPage } = usePagination(filteredPOs, 10);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ISSUED':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">ISSUED</Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="text-slate-600 border-slate-200">DRAFT</Badge>;
      case 'CLOSED':
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">CLOSED</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  function getActionsForStatus(status: string, poId: string) {
    const actions = [];

    switch (status?.toUpperCase()) {
      case 'DRAFT':
        actions.push(
          { icon: Check, label: "Mark as Issued", onClick: () => handleMarkAsIssued(poId) },
          { icon: ArrowRight, label: "Convert to Bill", onClick: () => handleConvertToBill() },
          { icon: Copy, label: "Clone", onClick: () => handleClone(poId) },
          { icon: Trash2, label: "Delete", onClick: () => handleDelete(poId), className: "text-red-600" }
        );
        break;

      case 'ISSUED':
        actions.push(
          { icon: Calendar, label: "Expected Delivery Date", onClick: () => handleSetDeliveryDate(poId) },
          { icon: XCircle, label: "Cancel Items", onClick: () => handleCancelItems(poId) },
          { icon: XCircle, label: "Mark as Cancelled", onClick: () => handleMarkAsCancelled(poId) },
          { icon: Copy, label: "Clone", onClick: () => handleClone(poId) },
          { icon: Trash2, label: "Delete", onClick: () => handleDelete(poId), className: "text-red-600" },
          { icon: Check, label: "Mark as Received", onClick: () => handleMarkAsReceived(poId) }
        );
        break;

      case 'RECEIVED':
      case 'CLOSED':
        actions.push(
          { icon: Eye, label: "View", onClick: () => handlePOClick(purchaseOrders.find(po => po.id === poId)!) },
          { icon: FileText, label: "PDF/Print", onClick: () => { } },
          { icon: Copy, label: "Clone", onClick: () => handleClone(poId) },
          { icon: Trash2, label: "Delete", onClick: () => handleDelete(poId), className: "text-red-600" }
        );
        break;

      case 'CANCELLED':
        actions.push(
          { icon: Copy, label: "Clone", onClick: () => handleClone(poId) },
          { icon: Trash2, label: "Delete", onClick: () => handleDelete(poId), className: "text-red-600" }
        );
        break;

      default:
        actions.push(
          { icon: Trash2, label: "Delete", onClick: () => handleDelete(poId), className: "text-red-600" }
        );
    }

    return actions;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] animate-in fade-in duration-300 w-full">
      <div className={`flex flex-col overflow-hidden transition-all duration-300 ${selectedPO ? 'w-[350px] min-w-[350px] shrink-0' : 'flex-1 w-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">All Purchase Orders</h1>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setLocation("/purchase-orders/new")}
              className="bg-blue-600 hover:bg-blue-700 gap-1.5 h-9"
              data-testid="button-new-po"
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
                <DropdownMenuItem onClick={fetchPurchaseOrders}>
                  Refresh List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {!selectedPO && (
          <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading purchase orders...</div>
          ) : filteredPOs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ClipboardList className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No purchase orders yet</h3>
              <p className="text-slate-500 mb-4 max-w-sm">
                Create purchase orders to formalize orders with your vendors and track deliveries.
              </p>
              <Button
                onClick={() => setLocation("/purchase-orders/new")}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-create-first-po"
              >
                <Plus className="h-4 w-4 mr-2" /> Create Your First Purchase Order
              </Button>
            </div>
          ) : selectedPO ? (
            <div className="divide-y divide-slate-100">
              {paginatedItems.map((po) => (
                <div
                  key={po.id}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedPO?.id === po.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
                    }`}
                  onClick={() => handlePOClick(po)}
                  data-testid={`card-po-${po.id}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedPOs.includes(po.id)}
                        onClick={(e) => toggleSelectPO(po.id, e)}
                      />
                      <span className="font-medium text-blue-600">{po.purchaseOrderNumber}</span>
                    </div>
                    {getStatusBadge(po.status)}
                  </div>
                  <div className="ml-6 text-sm text-slate-500">
                    <p>{po.vendorName}</p>
                    <p className="font-medium text-slate-900">{formatCurrency(po.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">Date</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">Purchase Order#</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">Reference#</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">Vendor Name</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">Status</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">Billed Status</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase text-right">Amount</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">Delivery Date</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((po) => (
                  <TableRow
                    key={po.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handlePOClick(po)}
                    data-testid={`row-po-${po.id}`}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedPOs.includes(po.id)}
                        onClick={(e) => toggleSelectPO(po.id, e)}
                      />
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(po.date)}</TableCell>
                    <TableCell className="text-sm font-medium text-blue-600">{po.purchaseOrderNumber}</TableCell>
                    <TableCell className="text-sm text-slate-500">{po.referenceNumber || '-'}</TableCell>
                    <TableCell className="text-sm">{po.vendorName}</TableCell>
                    <TableCell>{getStatusBadge(po.status)}</TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500">{po.billedStatus || 'YET TO BE BILLED'}</span>
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium">{formatCurrency(po.total)}</TableCell>
                    <TableCell className="text-sm text-slate-500">{formatDate(po.deliveryDate || '')}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {getActionsForStatus(po.status, po.id).map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={action.onClick}
                              className={action.className || ""}
                            >
                              <action.icon className="mr-2 h-4 w-4" />
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filteredPOs.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={goToPage}
            />
          )}
        </div>
      </div>

      {selectedPO && (
        <div className="flex-1 min-w-0 border-l border-slate-200 overflow-hidden">
          <PurchaseOrderDetailPanel
            purchaseOrder={selectedPO}
            onClose={handleClosePanel}
            onEdit={handleEditPO}
            onDelete={() => handleDelete(selectedPO.id)}
            onConvertToBill={handleConvertToBill}
            onMarkAsIssued={() => handleMarkAsIssued(selectedPO.id)}
            onMarkAsReceived={() => handleMarkAsReceived(selectedPO.id)}
            onMarkAsCancelled={() => handleMarkAsCancelled(selectedPO.id)}
            onClone={() => handleClone(selectedPO.id)}
            onSetDeliveryDate={() => handleSetDeliveryDate(selectedPO.id)}
            onCancelItems={() => handleCancelItems(selectedPO.id)}
            branding={branding}
          />
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this purchase order? This action cannot be undone.
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
