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
import { Search, Download, Eye, ChevronLeft, ChevronRight, DollarSign, Users } from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  amount: number;
  currency: string;
  joinDate: string;
}

interface Totals {
  totalMembers: number;
  totalRevenue: number;
  totalThisMonth: number;
  totalLastMonth: number;
  activeMembers: number;
  pendingPayments: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function MemberPaymentPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
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
  const [membershipTypeFilter, setMembershipTypeFilter] = useState("all");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      params.set("sortBy", "createdAt");
      params.set("sortOrder", "desc");
      
      if (search) params.set("search", search);
      if (paymentStatusFilter !== "all") params.set("paymentStatus", paymentStatusFilter);
      if (membershipTypeFilter !== "all") params.set("membershipType", membershipTypeFilter);

      const res = await fetch(`/api/admin/members?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setMembers(data.data.members || []);
        setPagination(data.data.pagination || pagination);
        
        // Calculate totals
        const allMembers = data.data.members || [];
        const totalRevenue = allMembers
          .filter((m: Member) => m.paymentStatus === 'paid')
          .reduce((sum: number, m: Member) => sum + m.amount, 0);
        const activeMembers = allMembers.filter((m: Member) => m.status === 'active').length;
        const pendingPayments = allMembers.filter((m: Member) => m.paymentStatus === 'pending').length;
        
        setTotals({
          totalMembers: data.data.pagination.total,
          totalRevenue,
          totalThisMonth: 0, // TODO: Calculate from date range
          totalLastMonth: 0, // TODO: Calculate from date range
          activeMembers,
          pendingPayments
        });
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
  }, [pagination.page, paymentStatusFilter, membershipTypeFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMembers();
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Membership Type",
      "Payment Status",
      "Amount",
      "Payment Method",
      "Join Date",
    ];
    
    const rows = members.map(m => [
      m.id,
      `${m.firstName} ${m.lastName}`,
      m.email,
      m.membershipType,
      m.paymentStatus,
      `${m.amount} ${m.currency}`,
      m.paymentMethod || "",
      new Date(m.joinDate).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `member-payments-${new Date().toISOString().split("T")[0]}.csv`;
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
        <h1 className="text-3xl font-bold text-gray-900">Member Payments</h1>
        <Button onClick={handleExportCSV} variant="outline">
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
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{totals.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">{totals.activeMembers}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold">{totals.pendingPayments}</p>
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
            placeholder="Search by name or email..."
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
        <Select value={membershipTypeFilter} onValueChange={setMembershipTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Membership Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="lifetime">Lifetime</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="supporter">Supporter</SelectItem>
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
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No members found
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Membership Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Method</TableHead>
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
                      {member.currency} {member.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusBadgeVariant(member.paymentStatus)}>
                        {member.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.paymentMethod || '-'}</TableCell>
                    <TableCell>
                      {new Date(member.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/members/${member.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} members
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
