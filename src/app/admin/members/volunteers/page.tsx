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
import { Search, Download, Eye, ChevronLeft, ChevronRight, Mail, UserPlus } from "lucide-react";

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  status: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  interviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function VolunteersJobsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
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
  const [jobIdFilter, setJobIdFilter] = useState("all");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      params.set("sortBy", "createdAt");
      params.set("sortOrder", "desc");
      
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (jobIdFilter !== "all") params.set("jobId", jobIdFilter);

      const res = await fetch(`/api/admin/volunteers?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setApplications(data.data.applications || []);
        setPagination(data.data.pagination || pagination);
      } else {
        console.error("Failed to fetch applications:", data.error);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [pagination.page, statusFilter, jobIdFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchApplications();
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Job Title",
      "Applicant Name",
      "Applicant Email",
      "Applicant Phone",
      "Status",
      "Date",
    ];
    
    const rows = applications.map(app => [
      app.id,
      app.jobTitle || "N/A",
      app.applicantName,
      app.applicantEmail,
      app.applicantPhone || "",
      app.status,
      new Date(app.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `volunteer-applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "shortlisted":
        return "default";
      case "reviewing":
        return "outline";
      case "interviewed":
        return "outline";
      case "rejected":
        return "destructive";
      case "pending":
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Volunteer Applications</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="flex gap-2">
              <Input
                placeholder="Applicant name, email..."
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
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job</label>
            <Select value={jobIdFilter} onValueChange={setJobIdFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {/* TODO: Fetch and populate jobs list */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No applications found</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.applicantName}</div>
                        <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                        {application.applicantPhone && (
                          <div className="text-xs text-gray-400">{application.applicantPhone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{application.jobTitle || "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(application.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/members/volunteers/${application.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
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
                {pagination.total} applications
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
