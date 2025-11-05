"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Mail, Trash2 } from "lucide-react";

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
  paymentId?: string;
  amount: number;
  currency: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  organization?: {
    name?: string;
    type?: string;
    website?: string;
  };
  interests?: string[];
  newsletter: boolean;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  notes?: string;
  lastLogin?: string;
  profileImage?: string;
  documents?: Array<{
    type?: string;
    url?: string;
    uploadedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`);
      const data = await res.json();

      if (data.success) {
        setMember(data.data);
        setStatus(data.data.status);
        setIsActive(data.data.isActive);
        setNotes(data.data.notes || "");
      } else {
        console.error("Failed to fetch member:", data.error);
        alert("Member not found");
        router.push("/admin/members");
      }
    } catch (error) {
      console.error("Error fetching member:", error);
      alert("Failed to load member");
      router.push("/admin/members");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          isActive,
          notes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Member updated successfully!");
        fetchMember();
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating member:", error);
      alert("Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  const handleResendEmail = async () => {
    if (!confirm(`Resend confirmation email to ${member?.email}?`)) return;

    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active", isActive: true }),
      });

      if (res.ok) {
        alert("Confirmation email sent!");
        fetchMember();
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      console.error("Error resending email:", error);
      alert("Failed to send email");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this membership? This will set status to cancelled and deactivate the member.")) return;

    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Membership cancelled successfully");
        router.push("/admin/members");
      } else {
        alert(`Failed to cancel: ${data.error}`);
      }
    } catch (error) {
      console.error("Error cancelling member:", error);
      alert("Failed to cancel membership");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading member details...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Member not found</div>
        <Link href="/admin/members">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Members
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/members">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-sm text-gray-600">{member.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleResendEmail} variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Resend Email
          </Button>
          <Button onClick={handleCancel} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Cancel Membership
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">First Name</label>
              <div className="mt-1 text-sm">{member.firstName}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Last Name</label>
              <div className="mt-1 text-sm">{member.lastName}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="mt-1 text-sm">{member.email}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <div className="mt-1 text-sm">{member.phone || "—"}</div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Membership Type</label>
            <div className="mt-1">
              <Badge variant="outline">{member.membershipType}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Join Date</label>
              <div className="mt-1 text-sm">
                {new Date(member.joinDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Expiry Date</label>
              <div className="mt-1 text-sm">
                {member.expiryDate
                  ? new Date(member.expiryDate).toLocaleDateString()
                  : "Lifetime"}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Payment */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Status & Payment</h2>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active Membership
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Payment Status</label>
            <div className="mt-1">
              <Badge
                variant={
                  member.paymentStatus === "paid"
                    ? "default"
                    : member.paymentStatus === "failed"
                    ? "destructive"
                    : "outline"
                }
              >
                {member.paymentStatus}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Payment Method</label>
              <div className="mt-1 text-sm">{member.paymentMethod || "—"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Amount</label>
              <div className="mt-1 text-sm">
                {member.amount} {member.currency}
              </div>
            </div>
          </div>

          {member.paymentId && (
            <div>
              <label className="text-sm font-medium text-gray-600">Payment ID</label>
              <div className="mt-1 text-sm font-mono text-xs">{member.paymentId}</div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        {(member.address || member.organization || member.interests?.length) && (
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h2 className="text-lg font-semibold">Additional Information</h2>

            {member.address && (
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <div className="mt-1 text-sm">
                  {[
                    member.address.street,
                    member.address.city,
                    member.address.state,
                    member.address.country,
                    member.address.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
              </div>
            )}

            {member.organization && (
              <div>
                <label className="text-sm font-medium text-gray-600">Organization</label>
                <div className="mt-1 text-sm">
                  {member.organization.name || "—"}
                  {member.organization.website && (
                    <span className="ml-2 text-blue-600">
                      ({member.organization.website})
                    </span>
                  )}
                </div>
              </div>
            )}

            {member.interests && member.interests.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Interests</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {member.interests.map((interest, idx) => (
                    <Badge key={idx} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {member.emergencyContact && (
              <div>
                <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                <div className="mt-1 text-sm">
                  {member.emergencyContact.name || "—"}
                  {member.emergencyContact.phone && (
                    <span className="ml-2">({member.emergencyContact.phone})</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Admin Notes</h2>
          <div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this member..."
              rows={6}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Link href="/admin/members">
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

