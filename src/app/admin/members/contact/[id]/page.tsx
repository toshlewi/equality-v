"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Mail, MessageSquare } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  notes?: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    notes: '',
    response: ''
  });

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}`);
      const data = await res.json();
      
      if (data.success) {
        setContact(data.data);
        setFormData({
          status: data.data.status,
          priority: data.data.priority,
          notes: data.data.notes || '',
          response: data.data.response || ''
        });
      }
    } catch (error) {
      console.error("Error fetching contact:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setContact(data.data);
        alert('Contact updated successfully');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      alert('Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6">
        <p>Contact not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Contact Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{contact.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{contact.email}</p>
              </div>
              {contact.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{contact.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <p className="text-gray-900">{contact.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Badge variant="outline" className="mt-1">{contact.category}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900 whitespace-pre-wrap">{contact.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Form */}
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Response Message
                </label>
                <Textarea
                  value={formData.response}
                  onChange={(e) => setFormData(prev => ({ ...prev, response: e.target.value }))}
                  placeholder="Enter your response to the contact..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes..."
                  rows={4}
                />
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(contact.createdAt).toLocaleString()}
                </span>
              </div>
              {contact.respondedAt && (
                <div>
                  <span className="text-gray-600">Responded:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(contact.respondedAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(contact.updatedAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

