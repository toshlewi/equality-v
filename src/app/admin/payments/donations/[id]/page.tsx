"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Mail, RefreshCw } from "lucide-react";

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  donationType: string;
  campaign?: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentId?: string;
  transactionId?: string;
  isAnonymous: boolean;
  message?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  taxDeductible: boolean;
  receiptSent: boolean;
  receiptNumber?: string;
  notes?: string;
  recurring?: {
    isRecurring: boolean;
    frequency?: string;
    nextPaymentDate?: string;
    subscriptionId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DonationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const donationId = params.id as string;

  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchDonation();
  }, [donationId]);

  const fetchDonation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/donations/${donationId}`);
      const data = await res.json();

      if (data.success) {
        setDonation(data.data);
        setStatus(data.data.status);
        setNotes(data.data.notes || "");
      } else {
        console.error("Failed to fetch donation:", data.error);
        alert("Donation not found");
        router.push("/admin/payments/donations");
      }
    } catch (error) {
      console.error("Error fetching donation:", error);
      alert("Failed to load donation");
      router.push("/admin/payments/donations");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/donations/${donationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Donation updated successfully!");
        fetchDonation();
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating donation:", error);
      alert("Failed to update donation");
    } finally {
      setSaving(false);
    }
  };

  const handleResendReceipt = async () => {
    if (!confirm(`Resend receipt email to ${donation?.donorEmail}?`)) return;

    try {
      const res = await fetch(`/api/admin/donations/${donationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_receipt" }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Receipt sent successfully! Receipt Number: ${data.data.receiptNumber}`);
        fetchDonation();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error resending receipt:", error);
      alert("Failed to send receipt");
    }
  };

  const handleRefund = async () => {
    const reason = prompt("Refund reason (duplicate, fraudulent, requested_by_customer):", "requested_by_customer");
    if (!reason) return;
    
    if (!["duplicate", "fraudulent", "requested_by_customer"].includes(reason)) {
      alert("Invalid reason. Must be: duplicate, fraudulent, or requested_by_customer");
      return;
    }
    
    if (!confirm(`Process refund for ${donation?.currency}${donation?.amount}? Reason: ${reason}`)) return;

    try {
      const res = await fetch(`/api/admin/donations/${donationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refund", reason }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Refund processed successfully! Refund ID: ${data.data.refundId}`);
        fetchDonation();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Failed to process refund");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading donation details...</div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Donation not found</div>
        <Link href="/admin/payments/donations">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Donations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/payments/donations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">
              Donation #{donation.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-600">
              {donation.isAnonymous ? "Anonymous" : donation.donorName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {donation.status === "completed" && donation.paymentStatus === "paid" && (
            <>
              <Button onClick={handleResendReceipt} variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Resend Receipt
              </Button>
              {donation.paymentMethod === "stripe" && donation.paymentId && (
                <Button onClick={handleRefund} variant="destructive" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Process Refund
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Information */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Donation Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Donor Name</label>
              <div className="mt-1 text-sm">
                {donation.isAnonymous ? "Anonymous" : donation.donorName}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="mt-1 text-sm">{donation.donorEmail}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Amount</label>
              <div className="mt-1 text-lg font-semibold">
                {donation.currency === "USD" ? "$" : donation.currency}
                {donation.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Donation Type</label>
              <div className="mt-1">
                <Badge variant="outline">{donation.donationType}</Badge>
              </div>
            </div>
            {donation.campaign && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Campaign</label>
                <div className="mt-1 text-sm">{donation.campaign}</div>
              </div>
            )}
          </div>

          {donation.message && (
            <div>
              <label className="text-sm font-medium text-gray-600">Message</label>
              <div className="mt-1 text-sm p-3 bg-gray-50 rounded">{donation.message}</div>
            </div>
          )}
        </div>

        {/* Payment & Status */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Payment & Status</h2>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Payment Status</label>
            <div className="mt-1">
              <Badge
                variant={
                  donation.paymentStatus === "paid"
                    ? "default"
                    : donation.paymentStatus === "failed"
                    ? "destructive"
                    : "outline"
                }
              >
                {donation.paymentStatus}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Payment Method</label>
              <div className="mt-1 text-sm">{donation.paymentMethod || "—"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tax Deductible</label>
              <div className="mt-1 text-sm">
                {donation.taxDeductible ? "Yes" : "No"}
              </div>
            </div>
          </div>

          {donation.paymentId && (
            <div>
              <label className="text-sm font-medium text-gray-600">Payment ID</label>
              <div className="mt-1 text-sm font-mono text-xs">{donation.paymentId}</div>
            </div>
          )}

          {donation.transactionId && (
            <div>
              <label className="text-sm font-medium text-gray-600">Transaction ID</label>
              <div className="mt-1 text-sm font-mono text-xs">{donation.transactionId}</div>
            </div>
          )}

          {donation.receiptNumber && (
            <div>
              <label className="text-sm font-medium text-gray-600">Receipt Number</label>
              <div className="mt-1 text-sm font-semibold">{donation.receiptNumber}</div>
              <div className="text-xs text-gray-500">
                {donation.receiptSent ? "Receipt sent" : "Receipt not sent"}
              </div>
            </div>
          )}
        </div>

        {/* Recurring Donation */}
        {donation.recurring?.isRecurring && (
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h2 className="text-lg font-semibold">Recurring Donation</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Frequency</label>
                <div className="mt-1 text-sm">{donation.recurring.frequency || "—"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Next Payment</label>
                <div className="mt-1 text-sm">
                  {donation.recurring.nextPaymentDate
                    ? new Date(donation.recurring.nextPaymentDate).toLocaleDateString()
                    : "—"}
                </div>
              </div>
              {donation.recurring.subscriptionId && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Subscription ID</label>
                  <div className="mt-1 text-sm font-mono text-xs">
                    {donation.recurring.subscriptionId}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address */}
        {donation.address && (
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h2 className="text-lg font-semibold">Address</h2>
            <div className="text-sm">
              {[
                donation.address.street,
                donation.address.city,
                donation.address.state,
                donation.address.country,
                donation.address.postalCode,
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            </div>
          </div>
        )}

        {/* Admin Notes */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Admin Notes</h2>
          <div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this donation..."
              rows={6}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Link href="/admin/payments/donations">
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

