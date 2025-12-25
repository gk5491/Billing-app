import { Link, useLocation } from "wouter";
import {
  Home,
  Package,
  ShoppingCart,
  ShoppingBag,
  Clock,
  Building2,
  FileCheck,
  UserCog,
  BarChart3,
  FolderOpen,
  ChevronRight,
  Menu,
  Settings as SettingsIcon,
  CreditCard,
  Star,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const NavItem = ({
    href,
    icon: Icon,
    label,
    active,
    indent = false
  }: {
    href: string;
    icon?: any;
    label: string;
    active?: boolean;
    indent?: boolean;
  }) => {
    const isActive = active || location === href || location.startsWith(href + "/");
    return (
      <Link href={href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 font-medium transition-all duration-200 h-10",
            indent ? "pl-12" : "px-4",
            isActive
              ? "bg-indigo-50 text-indigo-700 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          {Icon && (
            <Icon className={cn(
              "h-4 w-4",
              isActive ? "text-indigo-600" : "text-slate-400"
            )} />
          )}
          {label}
        </Button>
      </Link>
    );
  };

  const CollapsibleNavItem = ({
    id,
    icon: Icon,
    label,
    children
  }: {
    id: string;
    icon: any;
    label: string;
    children: React.ReactNode;
  }) => {
    const isOpen = openMenu === id;

    return (
      <Collapsible open={isOpen} onOpenChange={(open) => setOpenMenu(open ? id : null)}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 font-medium transition-all duration-200 px-4 h-10",
              isOpen
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <ChevronRight className={cn(
              "h-3 w-3 text-slate-400 transition-transform duration-200",
              isOpen && "rotate-90"
            )} />
            <Icon className={cn("h-4 w-4", isOpen ? "text-indigo-600" : "text-slate-400")} />
            {label}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 mt-0.5">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 flex items-center gap-3 border-b border-slate-100">
        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center overflow-hidden shadow-md ring-2 ring-indigo-100">
          <span className="font-display font-bold text-white text-xl">B</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight tracking-tight text-slate-900">Billing</h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Accounting</p>
        </div>
      </div>

      <ScrollArea className="flex-1 py-3">
        <div className="px-2 space-y-0.5">
          <NavItem href="/" icon={Home} label="Home" />

          <CollapsibleNavItem id="items" icon={Package} label="Items">
            <NavItem href="/items" label="Items" indent />
          </CollapsibleNavItem>

          <CollapsibleNavItem id="sales" icon={ShoppingCart} label="Sales">
            <NavItem href="/customers" label="Customers" indent />
            <NavItem href="/estimates" label="Quotes" indent />
            <NavItem href="/sales-orders" label="Sales Orders" indent />
            <NavItem href="/invoices" label="Invoices" indent />
            <NavItem href="/delivery-challans" label="Delivery Challans" indent />
            <NavItem href="/payments-received" label="Payments Received" indent />
            <NavItem href="/credit-notes" label="Credit Notes" indent />
            <NavItem href="/eway-bills" label="e-Way Bills" indent />
          </CollapsibleNavItem>

          <CollapsibleNavItem id="purchases" icon={ShoppingBag} label="Purchases">
            <NavItem href="/vendors" label="Vendors" indent />
            <NavItem href="/expenses" label="Expenses" indent />
            <NavItem href="/purchase-orders" label="Purchase Orders" indent />
            <NavItem href="/bills" label="Bills" indent />
            <NavItem href="/payments-made" label="Payments Made" indent />
            <NavItem href="/vendor-credits" label="Vendor Credits" indent />
          </CollapsibleNavItem>

          <NavItem href="/time-tracking" icon={Clock} label="Time Tracking (TBD)" />

          <NavItem href="/banking" icon={Building2} label="Banking (TBD)" />

          <CollapsibleNavItem id="filing" icon={FileCheck} label="Filing & Compliance (TBD)">
            <NavItem href="/filing-compliance" label="GST Filing" indent />
          </CollapsibleNavItem>

          <CollapsibleNavItem id="accountant" icon={UserCog} label="Accountant (TBD)">
            <NavItem href="/manual-journals" label="Manual Journals" indent />
            <NavItem href="/bulk-update" label="Bulk Update" indent />
            <NavItem href="/chart-of-accounts" label="Chart of Accounts" indent />
            <NavItem href="/transaction-locking" label="Transaction Locking" indent />
          </CollapsibleNavItem>

          <NavItem href="/reports" icon={BarChart3} label="Reports" />

          <NavItem href="/documents" icon={FolderOpen} label="Documents (TBD)" />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div
            onClick={() => setLocation("/settings")}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-slate-200 flex-1"
            data-testid="button-settings"
          >
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-indigo-100 text-indigo-700">AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@Billing.com</p>
            </div>
            <SettingsIcon className="h-4 w-4 text-slate-400" />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-30 bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 md:ml-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="-ml-2">
            <Menu className="h-5 w-5 text-slate-600" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
