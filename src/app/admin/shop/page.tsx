"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Plus, Eye } from "lucide-react";

export default function ShopManagementPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Shop Management</h1>
        <p className="text-gray-600">Manage products and orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products Card */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Products</h2>
                <p className="text-sm text-gray-600">Manage inventory and listings</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/shop/products" className="flex-1">
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </Link>
            <Link href="/admin/shop/products/new">
              <Button className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Orders</h2>
                <p className="text-sm text-gray-600">View and manage customer orders</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/shop/orders" className="flex-1">
              <Button className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
