import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/table-pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Plus,
    Download,
    Send,
    MoreHorizontal,
    Trash2,
    Pencil,
    MessageSquare,
    HelpCircle,
    Mail,
    Printer,
    Copy,
    X,
    Menu,
    Search,
    Filter,
    ChevronDown,
    FileText,
    ArrowRight
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface ChallanListItem {
    id: string;
    challanNumber: string;
    referenceNumber: string;
    customerName: string;
    customerId: string;
    date: string;
    amount: number;
    status: string;
    invoiceStatus: string;
    challanType: string;
}

interface ChallanDetail {
    id: string;
    challanNumber: string;
    referenceNumber: string;
    date: string;
    customerId: string;
    customerName: string;
    challanType: string;
    billingAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    };
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    };
    placeOfSupply: string;
    gstin: string;
    items: any[];
    subTotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    adjustment: number;
    total: number;
    customerNotes: string;
    termsAndConditions: string;
    status: string;
    invoiceStatus: string;
    invoiceId: string | null;
    createdAt: string;
    activityLogs: any[];
}

const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const formatAddress = (address: any): string[] => {
    if (!address) return ['-'];
    if (typeof address === 'string') return [address];
    if (typeof address !== 'object') return ['-'];
    const parts = [
        address.street ? String(address.street) : '',
        address.city ? String(address.city) : '',
        address.state ? String(address.state) : '',
        address.country ? String(address.country) : '',
        address.pincode ? String(address.pincode) : ''
    ].filter(Boolean);
    return parts.length > 0 ? parts : ['-'];
};

const getChallanTypeLabel = (type: string) => {
    switch (type) {
        case 'supply_on_approval': return 'Supply on Approval';
        case 'supply_for_job_work': return 'Supply for Job Work';
        case 'supply_for_repair': return 'Supply for Repair';
        case 'removal_for_own_use': return 'Removal for Own Use';
        case 'others': return 'Others';
        default: return type || 'Others';
    }
};

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'OPEN':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'DELIVERED':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'DRAFT':
            return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'INVOICED':
            return 'bg-purple-100 text-purple-700 border-purple-200';
        default:
            return 'bg-slate-100 text-slate-600 border-slate-200';
    }
};

const getActivityIcon = (action: string) => {
    switch (action) {
        case 'created':
            return <div className="w-3 h-3 rounded-full bg-green-500" />;
        case 'sent':
            return <div className="w-3 h-3 rounded-full bg-blue-500" />;
        case 'converted':
            return <div className="w-3 h-3 rounded-full bg-purple-500" />;
        case 'updated':
            return <div className="w-3 h-3 rounded-full bg-yellow-500" />;
        default:
            return <div className="w-3 h-3 rounded-full bg-slate-400" />;
    }
};

function ChallanPDFView({ challan, branding }: { challan: ChallanDetail; branding?: any }) {
    return (
        <div id="challan-pdf-content" className="bg-white p-8 text-black min-h-full">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-start mb-8 border-b-2 border-primary pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">DELIVERY CHALLAN</h1>
                        <p className="text-sm text-muted-foreground mt-1">{challan.challanNumber}</p>
                    </div>
                    <div className="text-right">
                        {branding?.logo?.url ? (
                            <img src={branding.logo.url} alt="Logo" className="h-12 w-auto" />
                        ) : (
                            <p className="font-semibold text-lg">Company Name</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Deliver To</h3>
                        <p className="font-semibold">{challan.customerName}</p>
                        <div className="text-sm text-muted-foreground">
                            {formatAddress(challan.shippingAddress).map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="space-y-1">
                            <p className="text-sm"><span className="text-muted-foreground">Date:</span> {formatDate(challan.date)}</p>
                            <p className="text-sm"><span className="text-muted-foreground">Type:</span> {getChallanTypeLabel(challan.challanType)}</p>
                        </div>
                    </div>
                </div>

                <table className="w-full mb-8 text-sm">
                    <thead>
                        <tr className="bg-muted/50">
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Item</th>
                            <th className="px-3 py-2 text-right">Qty</th>
                            <th className="px-3 py-2 text-right">Rate</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {challan.items.map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="px-3 py-2">{index + 1}</td>
                                <td className="px-3 py-2">{item.name}</td>
                                <td className="px-3 py-2 text-right">{item.quantity}</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(item.rate)}</td>
                                <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sub Total</span>
                            <span>{formatCurrency(challan.subTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2">
                            <span>Total</span>
                            <span>{formatCurrency(challan.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DeliveryChallans() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [challans, setChallans] = useState<ChallanListItem[]>([]);
    const [selectedChallan, setSelectedChallan] = useState<ChallanDetail | null>(null);
    const [selectedChallans, setSelectedChallans] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [challanToDelete, setChallanToDelete] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("whats-next");
    const [branding, setBranding] = useState<any>(null);

    useEffect(() => {
        fetchChallans();
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

    const fetchChallans = async () => {
        try {
            const response = await fetch('/api/delivery-challans');
            if (response.ok) {
                const data = await response.json();
                setChallans(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch delivery challans:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChallanDetail = async (id: string) => {
        try {
            const response = await fetch(`/api/delivery-challans/${id}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedChallan(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch challan detail:', error);
        }
    };

    const handleSelectChallan = (challan: ChallanListItem) => {
        fetchChallanDetail(challan.id);
    };

    const handleCloseDetail = () => {
        setSelectedChallan(null);
    };

    const handleDeleteChallan = async () => {
        if (!challanToDelete) return;

        try {
            const response = await fetch(`/api/delivery-challans/${challanToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: "Delivery Challan Deleted",
                    description: "The delivery challan has been deleted successfully.",
                });
                fetchChallans();
                if (selectedChallan?.id === challanToDelete) {
                    setSelectedChallan(null);
                }
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete delivery challan. Please try again.",
                variant: "destructive"
            });
        } finally {
            setDeleteDialogOpen(false);
            setChallanToDelete(null);
        }
    };

    const handleConvertToInvoice = async (challanId: string) => {
        try {
            const response = await fetch(`/api/delivery-challans/${challanId}/convert-to-invoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                toast({
                    title: "Converted to Invoice",
                    description: `Invoice ${data.data.invoice.invoiceNumber} has been created.`,
                });
                fetchChallans();
                if (selectedChallan?.id === challanId) {
                    fetchChallanDetail(challanId);
                }
            } else {
                throw new Error('Failed to convert');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to convert to invoice. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleStatusChange = async (challanId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/delivery-challans/${challanId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast({
                    title: "Status Updated",
                    description: `Delivery challan status changed to ${newStatus}.`,
                });
                fetchChallans();
                if (selectedChallan?.id === challanId) {
                    fetchChallanDetail(challanId);
                }
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleCloneChallan = async (challanId: string) => {
        try {
            const response = await fetch(`/api/delivery-challans/${challanId}/clone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                toast({
                    title: "Challan Cloned",
                    description: `New challan ${data.data.challanNumber} has been created.`,
                });
                fetchChallans();
            } else {
                throw new Error('Failed to clone');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to clone delivery challan. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleGeneratePDF = async () => {
        if (!selectedChallan) return;

        try {
            // Import the unified PDF utility
            const { generatePDFFromElement } = await import("@/lib/pdf-utils");

            // Generate PDF from the existing PDF view
            await generatePDFFromElement("challan-pdf-content", `${selectedChallan.challanNumber}.pdf`);

            toast({
                title: "PDF Downloaded",
                description: `${selectedChallan.challanNumber}.pdf has been downloaded successfully.`
            });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({
                title: "Failed to generate PDF",
                description: "Please try again.",
                variant: "destructive"
            });
        }
    };

    const handlePrint = () => {
        if (!selectedChallan) return;

        // Use the unified print utility
        import("@/lib/pdf-utils").then(({ printPDFView }) => {
            printPDFView("challan-pdf-content", `Delivery Challan - ${selectedChallan.challanNumber}`);
        }).catch(error => {
            console.error("Print error:", error);
            toast({
                title: "Failed to print",
                description: "Please try again.",
                variant: "destructive"
            });
        });
    };

    const filteredChallans = challans.filter(challan =>
        challan.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challan.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { currentPage, totalPages, totalItems, itemsPerPage, paginatedItems, goToPage } = usePagination(filteredChallans, 10);

    const toggleSelectAll = () => {
        if (selectedChallans.length === filteredChallans.length) {
            setSelectedChallans([]);
        } else {
            setSelectedChallans(filteredChallans.map(c => c.id));
        }
    };

    const toggleSelectChallan = (id: string) => {
        setSelectedChallans(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex h-full">
            {selectedChallan && (
                <div id="challan-pdf-content" className="fixed" style={{ left: '-9999px', top: 0 }}>
                    <div className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
                        <div className="p-12 text-black">
                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-200">
                                <div className="flex-1">
                                    {branding?.logo?.url ? (
                                        <img src={branding.logo.url} alt="Company Logo" className="h-16 w-auto mb-2" />
                                    ) : (
                                        <div className="text-xl font-bold text-blue-600 mb-2">Cybaem<br />tech</div>
                                    )}
                                    <div className="text-xs text-slate-600 mt-2">
                                        <p>Your Company Address</p>
                                        <p>City, State - PIN Code</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h1 className="text-4xl font-bold text-slate-900 mb-2">DELIVERY CHALLAN</h1>
                                    <p className="text-sm text-blue-600">Delivery Challan# {selectedChallan.challanNumber}</p>
                                </div>
                            </div>

                            {/* Bill To & Invoice Details */}
                            <div className="grid grid-cols-2 gap-12 mb-6">
                                <div>
                                    <h4 className="text-xs uppercase tracking-wide text-slate-600 font-bold mb-3">DELIVER TO</h4>
                                    <p className="font-bold text-blue-600 text-base mb-1">{selectedChallan.customerName}</p>
                                    <div className="text-sm text-slate-600 space-y-0.5">
                                        {formatAddress(selectedChallan.shippingAddress).map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <div>
                                        <span className="text-sm text-slate-600">Challan Date:</span>
                                        <span className="ml-2 text-sm font-semibold">{formatDate(selectedChallan.date)}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Challan Type:</span>
                                        <span className="ml-2 text-sm font-semibold">{getChallanTypeLabel(selectedChallan.challanType)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table className="w-full mb-6 text-sm border-collapse">
                                <thead>
                                    <tr className="bg-blue-600 text-white">
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">#</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Item & Description</th>
                                        <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider">HSN/SAC</th>
                                        <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider">Qty</th>
                                        <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider">Rate</th>
                                        <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedChallan.items.map((item, index) => (
                                        <tr key={item.id} className="border-b border-slate-100">
                                            <td className="px-3 py-4">{index + 1}</td>
                                            <td className="px-3 py-4">
                                                <div className="font-semibold">{item.name}</div>
                                                {item.description && (
                                                    <div className="text-xs text-slate-600 mt-1">{item.description}</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-4 text-center">{item.hsnSac || '-'}</td>
                                            <td className="px-3 py-4 text-center">{item.quantity}</td>
                                            <td className="px-3 py-4 text-right">{formatCurrency(item.rate)}</td>
                                            <td className="px-3 py-4 text-right font-semibold">{formatCurrency(item.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Summary */}
                            <div className="flex justify-end mb-8">
                                <div className="w-96 border border-slate-300 rounded-lg overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-300">
                                        <h4 className="text-sm font-bold uppercase text-slate-700">SUMMARY</h4>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Sub Total</span>
                                            <span className="font-semibold">{formatCurrency(selectedChallan.subTotal)}</span>
                                        </div>
                                        {selectedChallan.cgst > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">CGST (9%)</span>
                                                <span className="font-semibold">{formatCurrency(selectedChallan.cgst)}</span>
                                            </div>
                                        )}
                                        {selectedChallan.sgst > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">SGST (9%)</span>
                                                <span className="font-semibold">{formatCurrency(selectedChallan.sgst)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between py-3 border-t-2 border-slate-300 text-lg font-bold">
                                            <span className="text-slate-900">Total</span>
                                            <span className="text-slate-900">{formatCurrency(selectedChallan.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Signature */}
                            <div className="mt-12 pt-6 border-t border-slate-200">
                                {branding?.signature?.url ? (
                                    <div className="flex flex-col gap-2">
                                        <img
                                            src={branding.signature.url}
                                            alt="Authorized Signature"
                                            style={{ maxWidth: '180px', maxHeight: '60px', objectFit: 'contain' }}
                                        />
                                        <p className="text-xs text-slate-600">Authorized Signature</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className="text-base font-cursive text-slate-800">Signature</div>
                                        <p className="text-xs text-slate-600">Authorized Signature</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${selectedChallan ? 'w-1/2' : 'w-full'}`}>
                <div className="flex items-center justify-between gap-4 p-4 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="text-lg font-semibold gap-1" data-testid="dropdown-challan-filter">
                                    All Delivery Challans
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem data-testid="filter-all">All Delivery Challans</DropdownMenuItem>
                                <DropdownMenuItem data-testid="filter-draft">Draft</DropdownMenuItem>
                                <DropdownMenuItem data-testid="filter-open">Open</DropdownMenuItem>
                                <DropdownMenuItem data-testid="filter-delivered">Delivered</DropdownMenuItem>
                                <DropdownMenuItem data-testid="filter-invoiced">Invoiced</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/delivery-challans/new">
                            <Button className="gap-1" data-testid="button-new-challan">
                                <Plus className="h-4 w-4" />
                                New
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" data-testid="button-more-options">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem data-testid="menu-import">Import Challans</DropdownMenuItem>
                                <DropdownMenuItem data-testid="menu-export">Export Challans</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem data-testid="menu-preferences">Preferences</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search challans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 h-9"
                            data-testid="input-search-challans"
                        />
                    </div>
                    <Button variant="outline" size="sm" className="gap-1" data-testid="button-filter">
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <table className="w-full">
                            <thead className="bg-muted/30 sticky top-0">
                                <tr className="text-left text-xs uppercase text-muted-foreground">
                                    <th className="p-3 w-10">
                                        <Checkbox
                                            checked={selectedChallans.length === filteredChallans.length && filteredChallans.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                            data-testid="checkbox-select-all"
                                        />
                                    </th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Delivery Challan#</th>
                                    <th className="p-3">Reference Number</th>
                                    <th className="p-3">Customer Name</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filteredChallans.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                            No delivery challans found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((challan) => (
                                        <tr
                                            key={challan.id}
                                            className={`border-b border-border/40 hover-elevate cursor-pointer ${selectedChallan?.id === challan.id ? 'bg-primary/5' : ''}`}
                                            onClick={() => handleSelectChallan(challan)}
                                            data-testid={`row-challan-${challan.id}`}
                                        >
                                            <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedChallans.includes(challan.id)}
                                                    onCheckedChange={() => toggleSelectChallan(challan.id)}
                                                    data-testid={`checkbox-challan-${challan.id}`}
                                                />
                                            </td>
                                            <td className="p-3 text-sm">{formatDate(challan.date)}</td>
                                            <td className="p-3">
                                                <span className="text-primary font-medium text-sm" data-testid={`text-challan-number-${challan.id}`}>
                                                    {challan.challanNumber}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {challan.referenceNumber || '-'}
                                            </td>
                                            <td className="p-3 text-sm font-medium">{challan.customerName}</td>
                                            <td className="p-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getStatusColor(challan.status)}`}
                                                    data-testid={`badge-status-${challan.id}`}
                                                >
                                                    {challan.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right text-sm font-medium">
                                                {formatCurrency(challan.amount)}
                                            </td>
                                            <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${challan.id}`}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setLocation(`/delivery-challans/${challan.id}/edit`)} data-testid={`action-edit-${challan.id}`}>
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleConvertToInvoice(challan.id)} data-testid={`action-convert-${challan.id}`}>
                                                            <ArrowRight className="h-4 w-4 mr-2" />
                                                            Convert to Invoice
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => {
                                                                setChallanToDelete(challan.id);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            data-testid={`action-delete-${challan.id}`}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={goToPage}
                        />
                    </ScrollArea>
                </div>
            </div>

            {selectedChallan && (
                <div className="w-1/2 border-l border-border/60 flex flex-col bg-background">
                    <div className="flex items-center justify-between gap-2 p-3 border-b border-border/60">
                        <h2 className="font-semibold text-lg" data-testid="text-selected-challan-number">
                            {selectedChallan.challanNumber}
                        </h2>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setLocation(`/delivery-challans/${selectedChallan.id}/edit`)} data-testid="button-edit-detail">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid="button-comment">
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleCloseDetail} data-testid="button-close-detail">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 border-b border-border/60">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => setLocation(`/delivery-challans/${selectedChallan.id}/edit`)} data-testid="button-edit-challan">
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1" data-testid="button-pdf-print">
                                    <FileText className="h-4 w-4" />
                                    PDF/Print
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleGeneratePDF} data-testid="action-download-pdf">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handlePrint} data-testid="action-print">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {!selectedChallan.invoiceStatus && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleConvertToInvoice(selectedChallan.id)}
                                data-testid="button-convert-to-invoice"
                            >
                                <ArrowRight className="h-4 w-4" />
                                Convert to Invoice
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" data-testid="button-more-actions">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {!selectedChallan.invoiceId && (
                                    <DropdownMenuItem
                                        onClick={() => handleConvertToInvoice(selectedChallan.id)}
                                        className="text-primary font-medium"
                                        data-testid="action-convert-invoice"
                                    >
                                        Convert to Invoice
                                    </DropdownMenuItem>
                                )}
                                {selectedChallan.status === 'DELIVERED' && (
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(selectedChallan.id, 'OPEN')}
                                        data-testid="action-revert-open"
                                    >
                                        Revert to Open
                                    </DropdownMenuItem>
                                )}
                                {selectedChallan.status === 'OPEN' && (
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(selectedChallan.id, 'DELIVERED')}
                                        data-testid="action-mark-delivered"
                                    >
                                        Mark as Delivered
                                    </DropdownMenuItem>
                                )}
                                {selectedChallan.status === 'DRAFT' && (
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(selectedChallan.id, 'OPEN')}
                                        data-testid="action-mark-open"
                                    >
                                        Mark as Open
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem data-testid="action-eway-bill">
                                    Add e-Way Bill Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleCloneChallan(selectedChallan.id)}
                                    data-testid="action-clone"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Clone
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        setChallanToDelete(selectedChallan.id);
                                        setDeleteDialogOpen(true);
                                    }}
                                    data-testid="action-delete-selected"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            <div className="bg-white dark:bg-slate-900 border border-border/60 rounded-lg shadow-sm">
                                <div className="p-6 border-b border-border/40 relative">
                                    {selectedChallan.status === 'DRAFT' && (
                                        <div className="absolute top-4 left-4 transform -rotate-12">
                                            <span className="text-4xl font-bold text-slate-200 dark:text-slate-700 uppercase tracking-wider">
                                                Draft
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            {branding?.logo?.url ? (
                                                <img src={branding.logo.url} alt="Company Logo" className="h-16 w-auto mb-4" data-testid="img-challan-logo" />
                                            ) : (
                                                <div className="h-16 w-16 bg-slate-200 rounded flex items-center justify-center mb-4">
                                                    <span className="text-xs text-slate-500">No Logo</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <h2 className="text-2xl font-bold text-foreground mb-2">DELIVERY CHALLAN</h2>
                                            <p className="text-sm font-medium">Delivery Challan# {selectedChallan.challanNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-b border-border/40">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Deliver To</h4>
                                            <p className="font-semibold text-primary">{selectedChallan.customerName}</p>
                                            <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                                                {formatAddress(selectedChallan.shippingAddress).map((line, i) => (
                                                    <p key={i}>{line}</p>
                                                ))}
                                                {selectedChallan.gstin && <p className="mt-2">GSTIN: {selectedChallan.gstin}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div>
                                                <span className="text-xs text-muted-foreground">Challan Date:</span>
                                                <span className="ml-2 text-sm">{formatDate(selectedChallan.date)}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground">Challan Type:</span>
                                                <span className="ml-2 text-sm">{getChallanTypeLabel(selectedChallan.challanType)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedChallan.placeOfSupply && (
                                        <div className="mt-4 pt-4 border-t border-border/40">
                                            <span className="text-xs text-muted-foreground">Place Of Supply:</span>
                                            <span className="ml-2 text-sm">{selectedChallan.placeOfSupply}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-primary text-primary-foreground">
                                                <th className="p-2 text-left">#</th>
                                                <th className="p-2 text-left">Item & Description</th>
                                                <th className="p-2 text-center">HSN/SAC</th>
                                                <th className="p-2 text-center">Qty</th>
                                                <th className="p-2 text-right">Rate</th>
                                                <th className="p-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedChallan.items.map((item, index) => (
                                                <tr key={item.id} className="border-b border-border/40">
                                                    <td className="p-2">{index + 1}</td>
                                                    <td className="p-2">
                                                        <div className="font-medium">{item.name}</div>
                                                        {item.description && (
                                                            <div className="text-xs text-muted-foreground">{item.description}</div>
                                                        )}
                                                    </td>
                                                    <td className="p-2 text-center">{item.hsnSac || '-'}</td>
                                                    <td className="p-2 text-center">{item.quantity}</td>
                                                    <td className="p-2 text-right">{formatCurrency(item.rate)}</td>
                                                    <td className="p-2 text-right">{formatCurrency(item.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="mt-4 flex justify-end">
                                        <div className="w-64 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Sub Total</span>
                                                <span>{formatCurrency(selectedChallan.subTotal)}</span>
                                            </div>
                                            {selectedChallan.cgst > 0 && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>CGST (9%)</span>
                                                    <span>{formatCurrency(selectedChallan.cgst)}</span>
                                                </div>
                                            )}
                                            {selectedChallan.sgst > 0 && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>SGST (9%)</span>
                                                    <span>{formatCurrency(selectedChallan.sgst)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold bg-primary/10 p-2 rounded">
                                                <span>Total</span>
                                                <span>{formatCurrency(selectedChallan.total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-border/40">
                                        {branding?.signature?.url ? (
                                            <div className="flex flex-col gap-2">
                                                <img
                                                    src={branding.signature.url}
                                                    alt="Authorized Signature"
                                                    style={{ maxWidth: '180px', maxHeight: '60px', objectFit: 'contain' }}
                                                />
                                                <p className="text-xs text-muted-foreground">Authorized Signature</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm">Authorized Signature ____________________</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="whats-next" data-testid="tab-whats-next">What's Next</TabsTrigger>
                                    <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
                                </TabsList>
                                <TabsContent value="whats-next" className="mt-4">
                                    <div className="space-y-3">
                                        <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-send-email">
                                            <Send className="h-4 w-4" />
                                            Send Delivery Challan via Email
                                        </Button>
                                        {!selectedChallan.invoiceStatus && (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start gap-2"
                                                onClick={() => handleConvertToInvoice(selectedChallan.id)}
                                                data-testid="button-create-invoice"
                                            >
                                                <FileText className="h-4 w-4" />
                                                Create Invoice from Challan
                                            </Button>
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="activity" className="mt-4">
                                    <div className="space-y-4">
                                        {selectedChallan.activityLogs?.map((log) => (
                                            <div key={log.id} className="flex gap-3">
                                                <div className="mt-1.5">{getActivityIcon(log.action)}</div>
                                                <div className="flex-1">
                                                    <p className="text-sm">{log.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateTime(log.timestamp)} by {log.user}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </ScrollArea>
                </div>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Delivery Challan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this delivery challan? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChallan} className="bg-destructive text-destructive-foreground" data-testid="button-confirm-delete">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
