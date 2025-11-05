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
import { Search, Download, Eye, ChevronLeft, ChevronRight, DollarSign, Calendar } from "lucide-react";

interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle?: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketCount: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod?: string;
  status: string;
  confirmationCode?: string;
  createdAt: string;
}

interface Totals {
  totalRevenue: number;
  totalRegistrations: number;
  totalThisMonth: number;
  paidRegistrations: number;
  pendingRegistrations: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function EventsPaymentPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
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
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      params.set("sortBy", "createdAt");
      params.set("sortOrder", "desc");
      
      if (search) params.set("search", search);
      if (paymentStatusFilter !== "all") params.set("paymentStatus", paymentStatusFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/events/registrations?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setRegistrations(data.data.registrations || []);
        setPagination(data.data.pagination || pagination);
        setTotals({
          totalRevenue: data.data.totals?.totalRevenue || 0,
          totalRegistrations: data.data.pagination.total,
          totalThisMonth: 0,
          paidRegistrations: data.data.totals?.paidRegistrations || 0,
          pendingRegistrations: data.data.totals?.pendingRegistrations || 0
        });
      } else {
        console.error("Failed to fetch registrations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching event registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [pagination.page, paymentStatusFilter, statusFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRegistrations();
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Event",
      "Attendee Name",
      "Attendee Email",
      "Tickets",
      "Amount",
      "Payment Status",
      "Payment Method",
      "Confirmation Code",
      "Created At",
    ];
    
    const rows = registrations.map(r => [
      r.id,
      r.eventTitle || r.eventId,
      r.attendeeName,
      r.attendeeEmail,
      r.ticketCount,
      `${r.currency} ${r.amount.toFixed(2)}`,
      r.paymentStatus,
      r.paymentMethod || "",
      r.confirmationCode || "",
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "failed": return "destructive";
      case "refunded": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Payments</h1>
        <Button onClick={handleExportCSV} variant="outline" disabled={registrations.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totals.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold">{totals.totalRegistrations}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold">{totals.paidRegistrations}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{totals.pendingRegistrations}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by attendee name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Registration Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No event registrations found</p>
          <p className="text-sm mt-2">Event registrations API endpoint needs to be implemented</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Confirmation Code</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.eventTitle || registration.eventId}
                    </TableCell>
                    <TableCell>{registration.attendeeName}</TableCell>
                    <TableCell>{registration.attendeeEmail}</TableCell>
                    <TableCell>{registration.ticketCount}</TableCell>
                    <TableCell>
                      {registration.currency} {registration.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusBadgeVariant(registration.paymentStatus)}>
                        {registration.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {registration.confirmationCode || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(registration.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} registrations
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNextPage}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
