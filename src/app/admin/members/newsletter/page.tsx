"use client";

import { useState, useEffect } from "react";
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
import { Search, Download, ChevronLeft, ChevronRight, Mail, Users } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  tags: string[];
  subscribedAt: string;
  lastChanged: string;
  memberRating: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function NewsletterMailingPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
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
  const [statusFilter, setStatusFilter] = useState("subscribed");

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/newsletter?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setSubscribers(data.data.subscribers || []);
        setPagination(data.data.pagination || pagination);
      } else {
        console.error("Failed to fetch subscribers:", data.error);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [pagination.page, statusFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSubscribers();
  };

  const handleExportCSV = () => {
    const headers = [
      "Email",
      "First Name",
      "Last Name",
      "Status",
      "Tags",
      "Subscribed At",
      "Last Changed",
    ];
    
    const rows = subscribers.map(s => [
      s.email,
      s.firstName,
      s.lastName,
      s.status,
      s.tags.join("; "),
      s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : "",
      s.lastChanged ? new Date(s.lastChanged).toLocaleDateString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "subscribed": return "default";
      case "unsubscribed": return "secondary";
      case "pending": return "outline";
      case "cleaned": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter/Mailing</h1>
          <p className="text-gray-600 mt-1">Manage newsletter subscribers and campaigns</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Subscribed</p>
              <p className="text-2xl font-bold">
                {subscribers.filter(s => s.status === 'subscribed').length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Page</p>
              <p className="text-2xl font-bold">{subscribers.length}</p>
            </div>
            <Users className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cleaned">Cleaned</SelectItem>
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
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No subscribers found
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {subscriber.firstName || subscriber.lastName
                        ? `${subscriber.firstName} ${subscriber.lastName}`.trim()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(subscriber.status)}>
                        {subscriber.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {subscriber.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {subscriber.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{subscriber.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscriber.subscribedAt
                        ? new Date(subscriber.subscribedAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {subscriber.memberRating || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subscribers
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
