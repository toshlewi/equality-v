"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    currency: 'USD',
    compareAtPrice: '',
    sku: '',
    category: 'merchandise',
    subcategory: '',
    status: 'draft',
    tags: [] as string[],
    inventory: {
      trackQuantity: false,
      quantity: 0,
      lowStockThreshold: 5,
      allowBackorder: false
    },
    images: [] as Array<{ url: string; alt: string; isPrimary: boolean }>,
    isDigital: false,
    isPhysical: true,
    isFeatured: false,
    isNew: false,
    isOnSale: false
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      const data = await res.json();
      
      if (data.success) {
        const product = data.data;
        setForm({
          name: product.name || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          price: product.price?.toString() || '',
          currency: product.currency || 'USD',
          compareAtPrice: product.compareAtPrice?.toString() || '',
          sku: product.sku || '',
          category: product.category || 'merchandise',
          subcategory: product.subcategory || '',
          status: product.status || 'draft',
          tags: product.tags || [],
          inventory: product.inventory || {
            trackQuantity: false,
            quantity: 0,
            lowStockThreshold: 5,
            allowBackorder: false
          },
          images: product.images || [],
          isDigital: product.isDigital || false,
          isPhysical: product.isPhysical !== false,
          isFeatured: product.isFeatured || false,
          isNew: product.isNew || false,
          isOnSale: product.isOnSale || false
        });
      } else {
        console.error("Failed to fetch product:", data.error);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setForm((s: any) => ({
        ...s,
        [parent]: { ...s[parent], [child]: value }
      }));
    } else {
      setForm((s: any) => ({ ...s, [key]: value }));
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'images/products');
      
      const res = await fetch('/api/uploads/direct', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        const newImage = {
          url: data.data.url,
          alt: form.name || 'Product image',
          isPrimary: form.images.length === 0
        };
        setForm((s: any) => ({
          ...s,
          images: [...s.images, newImage]
        }));
      } else {
        alert('Image upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((s: any) => ({
      ...s,
      images: s.images.filter((_: any, i: number) => i !== index)
    }));
  };

  const setPrimaryImage = (index: number) => {
    setForm((s: any) => ({
      ...s,
      images: s.images.map((img: any, i: number) => ({
        ...img,
        isPrimary: i === index
      }))
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((s: any) => ({
        ...s,
        tags: [...s.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm((s: any) => ({
      ...s,
      tags: s.tags.filter((t: string) => t !== tag)
    }));
  };

  const submit = async () => {
    if (!form.name || !form.description || !form.price) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
        tags: form.tags
      };

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/admin/shop/products/${productId}`);
      } else {
        alert(`Error: ${data.error || 'Failed to update product'}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/shop/products/${productId}`}>
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={form.shortDescription}
                  onChange={(e) => update('shortDescription', e.target.value)}
                  placeholder="Brief description (max 300 characters)"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Detailed product description"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={form.currency} onValueChange={(value) => update('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="KES">KES</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="compareAtPrice">Compare At Price</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(e) => update('compareAtPrice', e.target.value)}
                  placeholder="Original price (optional)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="imageUpload">Upload Image</Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {form.images.map((image, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPrimaryImage(idx)}
                          className="bg-white/90 hover:bg-white"
                        >
                          Set Primary
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(idx)}
                          className="bg-red-500/90 hover:bg-red-600 text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Category */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value) => update('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={form.category} onValueChange={(value) => update('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="merchandise">Merchandise</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={form.subcategory}
                  onChange={(e) => update('subcategory', e.target.value)}
                  placeholder="Optional subcategory"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => update('sku', e.target.value)}
                  placeholder="Product SKU"
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="trackQuantity">Track Quantity</Label>
                <Switch
                  id="trackQuantity"
                  checked={form.inventory.trackQuantity}
                  onCheckedChange={(checked) => update('inventory.trackQuantity', checked)}
                />
              </div>
              {form.inventory.trackQuantity && (
                <>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={form.inventory.quantity}
                      onChange={(e) => update('inventory.quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      min="0"
                      value={form.inventory.lowStockThreshold}
                      onChange={(e) => update('inventory.lowStockThreshold', parseInt(e.target.value) || 5)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowBackorder">Allow Backorder</Label>
                    <Switch
                      id="allowBackorder"
                      checked={form.inventory.allowBackorder}
                      onCheckedChange={(checked) => update('inventory.allowBackorder', checked)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isDigital">Digital Product</Label>
                <Switch
                  id="isDigital"
                  checked={form.isDigital}
                  onCheckedChange={(checked) => update('isDigital', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isPhysical">Physical Product</Label>
                <Switch
                  id="isPhysical"
                  checked={form.isPhysical}
                  onCheckedChange={(checked) => update('isPhysical', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={form.isFeatured}
                  onCheckedChange={(checked) => update('isFeatured', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isNew">New Product</Label>
                <Switch
                  id="isNew"
                  checked={form.isNew}
                  onCheckedChange={(checked) => update('isNew', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isOnSale">On Sale</Label>
                <Switch
                  id="isOnSale"
                  checked={form.isOnSale}
                  onCheckedChange={(checked) => update('isOnSale', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag"
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <span className="text-sm">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <Button onClick={submit} className="w-full" disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

