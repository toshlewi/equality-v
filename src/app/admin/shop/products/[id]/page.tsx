"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Edit, Eye, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  currency: string;
  compareAtPrice?: number;
  sku?: string;
  category: string;
  subcategory?: string;
  status: string;
  inventory: {
    trackQuantity: boolean;
    quantity: number;
    lowStockThreshold: number;
    allowBackorder: boolean;
  };
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      const data = await res.json();
      
      if (data.success) {
        setProduct(data.data);
      } else {
        console.error("Failed to fetch product:", data.error);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/shop/products/${productId}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          </Link>
          <Link href={`/shop/${product.slug}`} target="_blank">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" /> View Public
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {product.images && product.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.images.map((image, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={image.url}
                        alt={image.alt || product.name}
                        className="w-full h-full object-cover"
                      />
                      {image.isPrimary && (
                        <Badge className="absolute top-2 left-2">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.shortDescription && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Short Description</label>
                  <p className="text-gray-900 mt-1">{product.shortDescription}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Full Description</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900 whitespace-pre-wrap">{product.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <p className="text-gray-900">{product.sku || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <div className="mt-1">
                  <Badge variant="outline">{product.category}</Badge>
                  {product.subcategory && (
                    <Badge variant="outline" className="ml-2">{product.subcategory}</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                  {product.isFeatured && (
                    <Badge variant="default" className="ml-2">Featured</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Price</label>
                <p className="text-gray-900 text-lg font-semibold">
                  {product.currency} {product.price.toFixed(2)}
                </p>
                {product.compareAtPrice && (
                  <p className="text-gray-500 text-sm line-through">
                    {product.currency} {product.compareAtPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Track Quantity</label>
                <p className="text-gray-900">
                  {product.inventory.trackQuantity ? 'Yes' : 'No'}
                </p>
              </div>
              {product.inventory.trackQuantity && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <p className="text-gray-900 text-lg font-semibold">
                      {product.inventory.quantity}
                    </p>
                    {product.inventory.quantity <= product.inventory.lowStockThreshold && (
                      <Badge variant="destructive" className="mt-1">Low Stock</Badge>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Low Stock Threshold</label>
                    <p className="text-gray-900">{product.inventory.lowStockThreshold}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allow Backorder</label>
                    <p className="text-gray-900">
                      {product.inventory.allowBackorder ? 'Yes' : 'No'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(product.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(product.updatedAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Slug:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs">{product.slug}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

