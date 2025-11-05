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
import { Search, Download, Eye, ChevronLeft, ChevronRight, Mail } from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: string;
  status: string;
  isActive: boolean;
  joinDate: string;
  expiryDate?: string;
  paymentStatus: string;
  paymentMethod?: string;
  amount: number;
  currency: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
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
  const [membershipTypeFilter, setMembershipTypeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      params.set("sortBy", "createdAt");
      params.set("sortOrder", "desc");
      
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (membershipTypeFilter !== "all") params.set("membershipType", membershipTypeFilter);
      if (paymentStatusFilter !== "all") params.set("paymentStatus", paymentStatusFilter);

      const res = await fetch(`/api/admin/members?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setMembers(data.data.members || []);
        setPagination(data.data.pagination || pagination);
      } else {
        console.error("Failed to fetch members:", data.error);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [pagination.page, statusFilter, membershipTypeFilter, paymentStatusFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMembers();
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Membership Type",
      "Status",
      "Payment Status",
      "Amount",
      "Join Date",
      "Expiry Date",
    ];
    
    const rows = members.map(m => [
      m.id,
      `${m.firstName} ${m.lastName}`,
      m.email,
      m.phone || "",
      m.membershipType,
      m.status,
      m.paymentStatus,
      `${m.amount} ${m.currency}`,
      new Date(m.joinDate).toLocaleDateString(),
      m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleResendEmail = async (memberId: string, email: string) => {
    if (!confirm(`Resend confirmation email to ${email}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active", isActive: true }),
      });
      
      if (res.ok) {
        alert("Confirmation email sent!");
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      console.error("Error resending email:", error);
      alert("Failed to send email");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "outline";
      case "suspended":
        return "destructive";
      case "cancelled":
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
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Members</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="flex gap-2">
              <Input
                placeholder="Name, email, phone..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Membership Type</label>
            <Select value={membershipTypeFilter} onValueChange={setMembershipTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="supporter">Supporter</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
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
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No members found</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.membershipType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(member.status)}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusBadgeVariant(member.paymentStatus)}>
                        {member.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.amount} {member.currency}
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/members/${member.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendEmail(member.id, member.email)}
                          title="Resend confirmation email"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
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
                {pagination.total} members
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
