"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  MoreVertical,
  Calendar,
  User,
  Tag,
  TrendingUp,
  FileText,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Toolkit {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  tags: string[];
  featuredImage: string;
  files: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    description: string;
    isPrimary: boolean;
  }>;
  status: string;
  isFeatured: boolean;
  isPublic: boolean;
  accessLevel: string;
  downloadCount: number;
  viewCount: number;
  rating: number;
  reviewCount: number;
  targetAudience: string[];
  difficultyLevel: string;
  estimatedTime: string;
  createdAt: string;
  updatedAt: string;
}

interface ToolkitsResponse {
  success: boolean;
  data: {
    toolkits: Toolkit[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export default function ToolkitsPage() {
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchToolkits = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/toolkits?${params}`);
      const data: ToolkitsResponse = await response.json();

      if (data.success) {
        setToolkits(data.data.toolkits);
        setTotalPages(data.data.pagination.pages);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching toolkits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolkits();
  }, [currentPage, categoryFilter, statusFilter, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/content/toolkits/${id}`);
  };

  const handleView = (id: string) => {
    router.push(`/toolkits/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this toolkit?')) return;
    
    try {
      const response = await fetch(`/api/toolkits/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchToolkits();
      }
    } catch (error) {
      console.error('Error deleting toolkit:', error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const response = await fetch(`/api/toolkits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchToolkits();
      }
    } catch (error) {
      console.error('Error updating toolkit status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      archived: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      legal: 'bg-blue-100 text-blue-800',
      advocacy: 'bg-green-100 text-green-800',
      education: 'bg-purple-100 text-purple-800',
      community: 'bg-orange-100 text-orange-800',
      research: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Toolkits & Guides</h1>
          <p className="text-gray-600">Manage your toolkits and resource guides</p>
        </div>
        <Button onClick={() => router.push('/admin/content/toolkits/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Toolkit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Toolkits</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold">
                  {toolkits.filter(t => t.status === 'published').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold">
                  {toolkits.filter(t => t.status === 'draft').length}
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold">
                  {toolkits.reduce((sum, t) => sum + t.downloadCount, 0)}
                </p>
              </div>
              <Download className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search toolkits..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="advocacy">Advocacy</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toolkits Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Toolkits ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : toolkits.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No toolkits found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {toolkits.map((toolkit) => (
                <motion.div
                  key={toolkit._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Toolkit Cover */}
                  <div className="aspect-[3/2] bg-gray-100 relative">
                    {toolkit.featuredImage ? (
                      <img
                        src={toolkit.featuredImage}
                        alt={toolkit.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(toolkit.status)}
                    </div>
                    
                    {/* Featured Badge */}
                    {toolkit.isFeatured && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-600">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Toolkit Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{toolkit.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{toolkit.shortDescription}</p>
                    
                    {/* Toolkit Details */}
                    <div className="space-y-1 text-sm text-gray-500 mb-3">
                      <p>Category: {toolkit.category}</p>
                      {toolkit.difficultyLevel && <p>Level: {toolkit.difficultyLevel}</p>}
                      {toolkit.estimatedTime && <p>Time: {toolkit.estimatedTime}</p>}
                      <p>Files: {toolkit.files.length}</p>
                    </div>
                    
                    {/* Categories and Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {getCategoryBadge(toolkit.category)}
                      {toolkit.accessLevel !== 'public' && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {toolkit.accessLevel}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {toolkit.tags && toolkit.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {toolkit.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {toolkit.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{toolkit.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Download className="w-4 h-4" />
                        {toolkit.downloadCount} downloads
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(toolkit._id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(toolkit._id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(toolkit._id, toolkit.status)}
                          >
                            {toolkit.status === 'published' ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(toolkit._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

