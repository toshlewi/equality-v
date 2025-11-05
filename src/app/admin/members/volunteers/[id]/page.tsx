"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Mail, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  id: string;
  jobId: string;
  job: {
    title: string;
    slug: string;
    department: string;
    type: string;
  } | null;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  coverLetter: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  additionalInfo?: string;
  applicationData?: Record<string, any>;
  status: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  interviewDate?: string;
  interviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/volunteers/${applicationId}`);
      const data = await res.json();

      if (data.success) {
        setApplication(data.data);
        setStatus(data.data.status);
        setReviewNotes(data.data.reviewNotes || "");
        setInterviewDate(data.data.interviewDate ? new Date(data.data.interviewDate).toISOString().split("T")[0] : "");
        setInterviewNotes(data.data.interviewNotes || "");
      } else {
        console.error("Failed to fetch application:", data.error);
        alert("Application not found");
        router.push("/admin/members/volunteers");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      alert("Failed to load application");
      router.push("/admin/members/volunteers");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/volunteers/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewNotes,
          interviewDate: interviewDate || undefined,
          interviewNotes: interviewNotes || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Application updated successfully!");
        fetchApplication();
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating application:", error);
      alert("Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading application details...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Application not found</div>
        <Link href="/admin/members/volunteers">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/members/volunteers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">
              Application #{application.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-600">{application.applicantName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Information */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Application Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Applicant Name</label>
              <div className="mt-1 text-sm">{application.applicantName}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="mt-1 text-sm">{application.applicantEmail}</div>
            </div>
            {application.applicantPhone && (
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <div className="mt-1 text-sm">{application.applicantPhone}</div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Job Position</label>
              <div className="mt-1 text-sm">
                {application.job ? application.job.title : "N/A"}
              </div>
            </div>
          </div>

          {application.coverLetter && (
            <div>
              <label className="text-sm font-medium text-gray-600">Cover Letter</label>
              <div className="mt-1 text-sm p-3 bg-gray-50 rounded whitespace-pre-wrap">
                {application.coverLetter}
              </div>
            </div>
          )}

          {(application.resumeUrl || application.portfolioUrl || application.linkedInUrl) && (
            <div>
              <label className="text-sm font-medium text-gray-600">Links</label>
              <div className="mt-1 space-y-1">
                {application.resumeUrl && (
                  <div>
                    <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      Resume
                    </a>
                  </div>
                )}
                {application.portfolioUrl && (
                  <div>
                    <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      Portfolio
                    </a>
                  </div>
                )}
                {application.linkedInUrl && (
                  <div>
                    <a href={application.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {application.additionalInfo && (
            <div>
              <label className="text-sm font-medium text-gray-600">Additional Information</label>
              <div className="mt-1 text-sm p-3 bg-gray-50 rounded whitespace-pre-wrap">
                {application.additionalInfo}
              </div>
            </div>
          )}
        </div>

        {/* Review & Status */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Review & Status</h2>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Review Notes</label>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add review notes..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Interview Date</label>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Interview Notes</label>
            <Textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Add interview notes..."
              rows={4}
            />
          </div>

          {application.reviewedBy && (
            <div className="text-sm text-gray-500">
              Reviewed by: {application.reviewedBy} on{" "}
              {application.reviewedAt
                ? new Date(application.reviewedAt).toLocaleDateString()
                : "N/A"}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Link href="/admin/members/volunteers">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
          <Save className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

