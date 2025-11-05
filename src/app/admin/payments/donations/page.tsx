"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, ChevronLeft, ChevronRight, Mail, RefreshCw, DollarSign } from "lucide-react";

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  donationType: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentId?: string;
  transactionId?: string;
  isAnonymous: boolean;
  receiptSent: boolean;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface Totals {
  total: number;
  totalThisMonth: number;
  totalLastMonth: number;
  totalAmount: number;
  totalAmountThisMonth: number;
  totalAmountLastMonth: number;
  completedCount: number;
  pendingCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function DonationsPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [donationTypeFilter, setDonationTypeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      params.set("sortBy", "createdAt");
      params.set("sortOrder", "desc");
      
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (donationTypeFilter !== "all") params.set("donationType", donationTypeFilter);
      if (paymentStatusFilter !== "all") params.set("paymentStatus", paymentStatusFilter);
      if (paymentMethodFilter !== "all") params.set("paymentMethod", paymentMethodFilter);

      const res = await fetch(`/api/admin/donations?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setDonations(data.data.donations || []);
        setTotals(data.data.totals || null);
        setPagination(data.data.pagination || pagination);
      } else {
        console.error("Failed to fetch donations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [pagination.page, statusFilter, donationTypeFilter, paymentStatusFilter, paymentMethodFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDonations();
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Donor Name",
      "Donor Email",
      "Amount",
      "Currency",
      "Donation Type",
      "Status",
      "Payment Status",
      "Payment Method",
      "Receipt Number",
      "Date",
    ];
    
    const rows = donations.map(donation => [
      donation.id,
      donation.isAnonymous ? "Anonymous" : donation.donorName,
      donation.donorEmail,
      donation.amount.toString(),
      donation.currency,
      donation.donationType,
      donation.status,
      donation.paymentStatus,
      donation.paymentMethod || "",
      donation.receiptNumber || "",
      new Date(donation.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleResendReceipt = async (donationId: string) => {
    if (!confirm("Resend receipt email to donor?")) return;
    
    try {
      const res = await fetch(`/api/admin/donations/${donationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_receipt" }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert("Receipt sent successfully!");
        fetchDonations();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error resending receipt:", error);
      alert("Failed to send receipt");
    }
  };

  const handleRefund = async (donationId: string) => {
    const reason = prompt("Refund reason (duplicate, fraudulent, requested_by_customer):", "requested_by_customer");
    if (!reason) return;
    
    if (!["duplicate", "fraudulent", "requested_by_customer"].includes(reason)) {
      alert("Invalid reason. Must be: duplicate, fraudulent, or requested_by_customer");
      return;
    }
    
    if (!confirm(`Process refund for this donation? Reason: ${reason}`)) return;
    
    try {
      const res = await fetch(`/api/admin/donations/${donationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refund", reason }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`Refund processed successfully! Refund ID: ${data.data.refundId}`);
        fetchDonations();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Failed to process refund");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "outline";
      case "failed":
        return "destructive";
      case "refunded":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "outline";
      case "failed":
        return "destructive";
      case "refunded":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Donations</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Totals Dashboard */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-green-600">
              ${totals.totalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">This Month</div>
            <div className="text-2xl font-bold">
              ${totals.totalAmountThisMonth.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {totals.totalThisMonth} donations
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Last Month</div>
            <div className="text-2xl font-bold">
              ${totals.totalAmountLastMonth.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {totals.totalLastMonth} donations
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-lg font-semibold">
              {totals.completedCount} Completed
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {totals.pendingCount} Pending
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="flex gap-2">
              <Input
                placeholder="Donor name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Status</label>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Donation Type</label>
            <Select value={donationTypeFilter} onValueChange={setDonationTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="specific_campaign">Campaign</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="one_time">One Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading donations...</div>
        ) : donations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No donations found</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
    <div>
                        <div className="font-medium">
                          {donation.isAnonymous ? "Anonymous" : donation.donorName}
                        </div>
                        <div className="text-sm text-gray-500">{donation.donorEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {donation.currency === "USD" ? "$" : donation.currency}
                      {donation.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{donation.donationType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(donation.status)}>
                        {donation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusBadgeVariant(donation.paymentStatus)}>
                        {donation.paymentStatus}
                      </Badge>
                      {donation.paymentMethod && (
                        <div className="text-xs text-gray-500 mt-1">
                          {donation.paymentMethod}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {donation.receiptSent ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Sent</Badge>
                          {donation.receiptNumber && (
                            <span className="text-xs text-gray-500">
                              {donation.receiptNumber}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">Not Sent</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/payments/donations/${donation.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {donation.status === "completed" && donation.paymentStatus === "paid" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendReceipt(donation.id)}
                              title="Resend receipt"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            {donation.paymentMethod === "stripe" && donation.paymentId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefund(donation.id)}
                                title="Process refund"
                                className="text-orange-600"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} donations
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
