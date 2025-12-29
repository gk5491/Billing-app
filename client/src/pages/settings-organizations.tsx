import React, { useState } from "react";
import { useOrganization, Organization } from "@/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Building2, Trash2, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const INDUSTRIES = [
    "Agency or Sales House", "Agriculture", "Art & Design", "Automotive", "Construction",
    "Consulting", "CPG", "Education", "Engineering", "Entertainment", "Financial Services",
    "Food Services", "Gaming", "Government", "Health Care", "Interior Design", "Internal",
    "Legal", "Manufacturing", "Marketing", "Mining & Logistics", "Non-Profit",
    "Publishing & Web Media", "Real Estate", "Retail", "Services", "Technology",
    "Telecommunications", "Travel/Hospitality", "Web Designing", "Web Development", "Writers"
];

export default function SettingsOrganizations() {
    const { organizations, currentOrganization, setCurrentOrganization, refreshOrganizations } = useOrganization();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState<Partial<Organization>>({
        name: "",
        industry: "",
        location: "India",
        gstRegistered: false,
        gstin: "",
    });

    const createMutation = useMutation({
        mutationFn: async (data: Partial<Organization>) => {
            const res = await apiRequest("POST", "/api/organizations", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Organization created successfully" });
            setIsDialogOpen(false);
            refreshOrganizations();
            setFormData({
                name: "",
                industry: "",
                location: "India",
                gstRegistered: false,
                gstin: "",
            });
        },
        onError: () => {
            toast({ title: "Failed to create organization", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/organizations/${id}`);
        },
        onSuccess: () => {
            toast({ title: "Organization deleted" });
            refreshOrganizations();
        },
        onError: (error: any) => {
            toast({ title: "Failed to delete organization", description: error.message, variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.industry || !formData.location) {
            toast({ title: "Please fill in all required fields", variant: "destructive" });
            return;
        }
        if (formData.gstRegistered && !formData.gstin) {
            toast({ title: "GSTIN is required when GST is enabled", variant: "destructive" });
            return;
        }
        createMutation.mutate(formData);
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">Manage your organizations and business profiles</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Organization
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add New Organization</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Organization Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. My Company"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="industry">Industry *</Label>
                                <Select
                                    value={formData.industry}
                                    onValueChange={(value) => setFormData({ ...formData, industry: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDUSTRIES.map((ind) => (
                                            <SelectItem key={ind} value={ind}>
                                                {ind}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. India"
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">GST Registration</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Enable if your business is registered for GST
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.gstRegistered}
                                    onCheckedChange={(checked) => setFormData({ ...formData, gstRegistered: checked })}
                                />
                            </div>

                            {formData.gstRegistered && (
                                <div className="grid gap-2">
                                    <Label htmlFor="gstin">GSTIN *</Label>
                                    <Input
                                        id="gstin"
                                        value={formData.gstin}
                                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                        placeholder="Enter your GSTIN"
                                    />
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Organization
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                    <Card key={org.id} className={currentOrganization?.id === org.id ? "border-primary" : ""}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                {org.name}
                            </CardTitle>
                            {currentOrganization?.id === org.id && (
                                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Active
                                </span>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground mt-2">
                                <div className="flex justify-between">
                                    <span>Industry:</span>
                                    <span className="font-medium text-foreground">{org.industry}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Location:</span>
                                    <span className="font-medium text-foreground">{org.location}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>GST Registered:</span>
                                    <span className="font-medium text-foreground">{org.gstRegistered ? "Yes" : "No"}</span>
                                </div>
                                {org.gstRegistered && (
                                    <div className="flex justify-between">
                                        <span>GSTIN:</span>
                                        <span className="font-medium text-foreground">{org.gstin}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 mt-6">
                                {currentOrganization?.id !== org.id && (
                                    <Button
                                        className="flex-1"
                                        variant="default"
                                        onClick={() => setCurrentOrganization(org.id)}
                                    >
                                        Switch to this Org
                                    </Button>
                                )}
                                {organizations.length > 1 && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            if (confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
                                                deleteMutation.mutate(org.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
