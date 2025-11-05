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
import { Search, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface AuditLog {
  id: string;
  eventType: string;
  description: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  metadata?: Record<string, any>;
  severity: string;
  isSecurityEvent: boolean;
  status: string;
  timestamp: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Filters
  const [search, setSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [securityEventFilter, setSecurityEventFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      
      if (search) params.set("search", search);
      if (eventTypeFilter !== "all") params.set("eventType", eventTypeFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (securityEventFilter !== "all") params.set("isSecurityEvent", securityEventFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/admin/logs/audit?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.data.logs || []);
        setPagination(data.data.pagination || pagination);
      } else {
        console.error("Failed to fetch audit logs:", data.error);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, eventTypeFilter, severityFilter, securityEventFilter, startDate, endDate]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handleExportCSV = () => {
    const headers = [
      "Timestamp",
      "Event Type",
      "Description",
      "User",
      "IP Address",
      "Severity",
      "Status",
    ];
    
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.eventType,
      log.description,
      log.userEmail || log.userId || "N/A",
      log.ipAddress,
      log.severity,
      log.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "outline";
      case "low":
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "failure":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="flex gap-2">
              <Input
                placeholder="Description, email, IP..."
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
            <label className="text-sm font-medium">Event Type</label>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user_login">User Login</SelectItem>
                <SelectItem value="user_logout">User Logout</SelectItem>
                <SelectItem value="admin_action">Admin Action</SelectItem>
                <SelectItem value="payment_processed">Payment Processed</SelectItem>
                <SelectItem value="payment_failed">Payment Failed</SelectItem>
                <SelectItem value="security_event">Security Event</SelectItem>
                <SelectItem value="system_error">System Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Severity</label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Security Events</label>
            <Select value={securityEventFilter} onValueChange={setSecurityEventFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Security Events Only</SelectItem>
                <SelectItem value="false">Non-Security Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No audit logs found</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{log.eventType}</div>
                      {log.isSecurityEvent && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Security
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm truncate" title={log.description}>
                        {log.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{log.userEmail || log.userId || "N/A"}</div>
                      {log.userRole && (
                        <div className="text-xs text-gray-500">{log.userRole}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono text-xs">{log.ipAddress}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityBadgeVariant(log.severity)}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(log.status)}>
                        {log.status}
                      </Badge>
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
                {pagination.total} logs
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

