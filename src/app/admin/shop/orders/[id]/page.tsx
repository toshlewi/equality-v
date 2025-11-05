"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, DollarSign, Package, Truck, Mail, User, MapPin } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    shippingAddress?: {
      firstName: string;
      lastName: string;
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      phone?: string;
    };
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  notes?: string;
  specialInstructions?: string;
  refunds: Array<{
    amount: number;
    reason: string;
    status: string;
    processedAt: string;
    refundId?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    paymentStatus: '',
    trackingNumber: '',
    trackingUrl: '',
    carrier: '',
    notes: '',
    specialInstructions: ''
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      
      if (data.success) {
        setOrder(data.data);
        setFormData({
          status: data.data.status,
          paymentStatus: data.data.paymentStatus,
          trackingNumber: data.data.trackingNumber || '',
          trackingUrl: data.data.trackingUrl || '',
          carrier: data.data.carrier || '',
          notes: data.data.notes || '',
          specialInstructions: data.data.specialInstructions || ''
        });
      } else {
        console.error("Failed to fetch order:", data.error);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setOrder(data.data);
        alert('Order updated successfully');
        fetchOrder();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async () => {
    const amount = prompt('Refund amount (leave empty for full refund):');
    const reason = prompt('Refund reason (duplicate, fraudulent, requested_by_customer):', 'requested_by_customer');
    
    if (!reason || !['duplicate', 'fraudulent', 'requested_by_customer'].includes(reason)) {
      alert('Invalid reason');
      return;
    }

    if (!confirm(`Process refund of ${amount ? `$${amount}` : 'full amount'}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refund',
          amount: amount ? parseFloat(amount) : undefined,
          reason
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Refund processed successfully');
        fetchOrder();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      alert('Failed to process refund');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p>Order not found</p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "processing": return "secondary";
      case "shipped": return "default";
      case "delivered": return "default";
      case "cancelled": return "destructive";
      case "refunded": return "outline";
      default: return "outline";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "failed": return "destructive";
      case "refunded": return "outline";
      case "partially_refunded": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">
              Created {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {order.paymentStatus === 'paid' && order.status !== 'refunded' && (
            <Button variant="outline" onClick={handleRefund}>
              <DollarSign className="w-4 h-4 mr-2" /> Process Refund
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {order.currency} {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.currency} {item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">
                  {order.customerInfo.firstName} {order.customerInfo.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{order.customerInfo.email}</p>
              </div>
              {order.customerInfo.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{order.customerInfo.phone}</p>
                </div>
              )}
              {order.customerInfo.billingAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Billing Address
                  </label>
                  <p className="text-gray-900">
                    {order.customerInfo.billingAddress.street}<br />
                    {order.customerInfo.billingAddress.city}, {order.customerInfo.billingAddress.state} {order.customerInfo.billingAddress.postalCode}<br />
                    {order.customerInfo.billingAddress.country}
                  </p>
                </div>
              )}
              {order.customerInfo.shippingAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Shipping Address
                  </label>
                  <p className="text-gray-900">
                    {order.customerInfo.shippingAddress.firstName} {order.customerInfo.shippingAddress.lastName}<br />
                    {order.customerInfo.shippingAddress.street}<br />
                    {order.customerInfo.shippingAddress.city}, {order.customerInfo.shippingAddress.state} {order.customerInfo.shippingAddress.postalCode}<br />
                    {order.customerInfo.shippingAddress.country}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Refunds */}
          {order.refunds && order.refunds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.refunds.map((refund, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{order.currency} {refund.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Reason: {refund.reason}</p>
                          <p className="text-sm text-gray-600">
                            Processed: {new Date(refund.processedAt).toLocaleString()}
                          </p>
                          {refund.refundId && (
                            <p className="text-xs text-gray-500 mt-1">Refund ID: {refund.refundId}</p>
                          )}
                        </div>
                        <Badge variant={refund.status === 'processed' ? 'default' : 'secondary'}>
                          {refund.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <p className="text-gray-900 mt-1">{order.paymentMethod}</p>
                {order.paymentId && (
                  <p className="text-xs text-gray-500 mt-1">Payment ID: {order.paymentId}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <Label htmlFor="trackingUrl">Tracking URL</Label>
                <Input
                  id="trackingUrl"
                  value={formData.trackingUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackingUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="carrier">Carrier</Label>
                <Input
                  id="carrier"
                  value={formData.carrier}
                  onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value }))}
                  placeholder="UPS, FedEx, DHL, etc."
                />
              </div>
              {order.shippedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Shipped At</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(order.shippedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {order.deliveredAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Delivered At</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(order.deliveredAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{order.currency} {order.subtotal.toFixed(2)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{order.currency} {order.tax.toFixed(2)}</span>
                </div>
              )}
              {order.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{order.currency} {order.shipping.toFixed(2)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-{order.currency} {order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{order.currency} {order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Special instructions for this order..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.processedAt && (
                <div>
                  <span className="text-gray-600">Processed:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(order.processedAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(order.updatedAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

