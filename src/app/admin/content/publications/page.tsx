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
  Download,
  X
} from 'lucide-react';
import PDFViewer from '@/components/PDFViewer';
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

interface Publication {
  _id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  pdfUrl: string;
  status: string;
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
}

interface PublicationsResponse {
  success: boolean;
  data: {
    publications: Publication[];
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

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPDF, setSelectedPDF] = useState<{url: string, title: string, author: string} | null>(null);
  const router = useRouter();

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '100', // Get more for admin view
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      // For admin, we need to fetch all statuses when showing "all"
      const apiParams = new URLSearchParams(params);
      if (statusFilter === 'all') {
        // Fetch all statuses by not filtering
        apiParams.delete('status');
      }
      const response = await fetch(`/api/publications?${apiParams}`);
      const data: PublicationsResponse = await response.json();

      if (data.success) {
        setPublications(data.data.publications);
        setTotalPages(data.data.pagination.pages);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
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
    router.push(`/admin/content/publications/${id}`);
  };

  const handleView = (publication: any) => {
    // Open the publication in a new tab on the main site
    const url = `/matriarchive/publications/${publication.slug}`;
    window.open(url, '_blank');
  };

  const handleViewPDF = (publication: Publication) => {
    if (publication.pdfUrl) {
      // Open PDF directly in a new tab
      window.open(publication.pdfUrl, '_blank');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this publication?')) return;
    
    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchPublications();
      }
    } catch (error) {
      console.error('Error deleting publication:', error);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchPublications();
      }
    } catch (error) {
      console.error('Error updating publication status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      review: 'default',
      published: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      article: 'bg-blue-100 text-blue-800',
      blog: 'bg-green-100 text-green-800',
      report: 'bg-purple-100 text-purple-800',
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
          <h1 className="text-3xl font-bold">Publications</h1>
          <p className="text-gray-600">Manage your publications and articles</p>
        </div>
        <Button onClick={() => router.push('/admin/content/publications/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Publication
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Publications</p>
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
                  {publications.filter(p => p.status === 'published').length}
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
                  {publications.filter(p => p.status === 'draft').length}
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
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-2xl font-bold">
                  {publications.filter(p => p.status === 'review').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {[
              { value: 'all', label: 'All Publications', count: total },
              { value: 'pending', label: 'Pending', count: publications.filter(p => p.status === 'pending').length },
              { value: 'review', label: 'In Review', count: publications.filter(p => p.status === 'review').length },
              { value: 'published', label: 'Published', count: publications.filter(p => p.status === 'published').length },
              { value: 'rejected', label: 'Rejected', count: publications.filter(p => p.status === 'rejected').length }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setStatusFilter(tab.value === 'all' ? 'all' : tab.value);
                  setCurrentPage(1);
                }}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.value
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search publications..."
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
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publications List */}
      <Card>
        <CardHeader>
          <CardTitle>Publications ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No publications found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {publications.map((publication) => (
                <motion.div
                  key={publication._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-2 hover:shadow-md transition-shadow flex gap-2"
                >
                  {publication.featuredImage && (
                    <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden">
                      <img 
                        src={publication.featuredImage} 
                        alt={publication.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{publication.title}</h3>
                        {publication.isFeatured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-xs mb-1 line-clamp-1">
                        {publication.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">{publication.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="truncate">{formatDate(publication.publishedAt || publication.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1">
                        {getStatusBadge(publication.status)}
                        {getCategoryBadge(publication.category)}
                        {publication.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {publication.pdfUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPDF(publication)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(publication)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Publication
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(publication._id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {publication.pdfUrl && (
                            <DropdownMenuItem onClick={() => handleViewPDF(publication)}>
                              <FileText className="w-4 h-4 mr-2" />
                              View PDF
                            </DropdownMenuItem>
                          )}
                          {publication.status !== 'published' && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(publication._id, 'published')}>
                              <Eye className="w-4 h-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {publication.status !== 'review' && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(publication._id, 'review')}>
                              <Eye className="w-4 h-4 mr-2" />
                              Mark as In Review
                            </DropdownMenuItem>
                          )}
                          {publication.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(publication._id, 'rejected')}>
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          {publication.status === 'published' && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(publication._id, 'pending')}>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Unpublish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(publication._id)}
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

      {/* PDF Viewer Modal */}
      {selectedPDF && (
        <PDFViewer
          pdfUrl={selectedPDF.url}
          title={selectedPDF.title}
          author={selectedPDF.author}
          onClose={() => setSelectedPDF(null)}
        />
      )}
    </div>
  );
}
