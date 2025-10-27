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
  BookOpen,
  MoreVertical,
  Calendar,
  User,
  Tag,
  Star,
  Library,
  X
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

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  coverUrl: string;
  isbn: string;
  description: string;
  shortDescription: string;
  publisher: string;
  language: string;
  pages: number;
  category: string;
  tags: string[];
  isFeatured: boolean;
  isInLibrary: boolean;
  isAvailable: boolean;
  isBookClubSelection: boolean;
  bookClubDate: string;
  rating: number;
  reviewCount: number;
  status: string;
  createdAt: string;
}

interface BooksResponse {
  success: boolean;
  data: {
    books: Book[];
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

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      // For admin, we need to fetch all statuses when showing "all"
      const apiParams = new URLSearchParams(params);
      if (statusFilter === 'all') {
        apiParams.delete('status');
      }
      const response = await fetch(`/api/books?${apiParams}`);
      const data: BooksResponse = await response.json();

      if (data.success) {
        setBooks(data.data.books);
        setTotalPages(data.data.pagination.pages);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
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
    router.push(`/admin/content/books/${id}`);
  };

  const handleView = (book: any) => {
    // Open the book in a new tab on the main site
    const url = `/matriarchive/alkah-library/book-library/${book.slug}`;
    window.open(url, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchBooks();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchBooks();
      }
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      review: 'default',
      published: 'default',
      rejected: 'destructive'
    } as const;

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      review: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      fiction: 'bg-purple-100 text-purple-800',
      'non-fiction': 'bg-blue-100 text-blue-800',
      poetry: 'bg-pink-100 text-pink-800',
      essays: 'bg-green-100 text-green-800',
      memoir: 'bg-orange-100 text-orange-800',
      academic: 'bg-gray-100 text-gray-800',
      other: 'bg-yellow-100 text-yellow-800'
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ALKAH Library</h1>
          <p className="text-gray-600">Manage your book collection and book club selections</p>
        </div>
        <Button onClick={() => router.push('/admin/content/books/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Books</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Library</p>
                <p className="text-2xl font-bold">
                  {books.filter(b => b.isInLibrary).length}
                </p>
              </div>
              <Library className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Book Club</p>
                <p className="text-2xl font-bold">
                  {books.filter(b => b.isBookClubSelection).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-2xl font-bold">
                  {books.filter(b => b.status === 'review').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
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
                  placeholder="Search books..."
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
                <SelectItem value="fiction">Fiction</SelectItem>
                <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                <SelectItem value="poetry">Poetry</SelectItem>
                <SelectItem value="essays">Essays</SelectItem>
                <SelectItem value="memoir">Memoir</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Books ({total})</CardTitle>
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
          ) : books.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No books found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {books.map((book) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Book Cover */}
                  <div className="aspect-[3/4] bg-gray-100 relative">
                    {book.coverUrl || book.coverImage ? (
                      <img
                        src={book.coverUrl || book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-1 left-1">
                      {getStatusBadge(book.status)}
                    </div>
                    
                    {/* Featured Badge */}
                    {book.isFeatured && (
                      <div className="absolute top-1 right-1">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-600 text-xs">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Book Info */}
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-gray-600 text-xs mb-1 truncate">by {book.author}</p>
                    
                    {/* Rating */}
                    {book.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(Math.round(book.rating / book.reviewCount))}
                        <span className="text-xs text-gray-500">
                          ({book.reviewCount})
                        </span>
                      </div>
                    )}
                    
                    {/* Book Details */}
                    <div className="space-y-0.5 text-xs text-gray-500 mb-1">
                      {book.year && <p className="truncate">Published: {book.year}</p>}
                      {book.pages && <p className="truncate">{book.pages} pages</p>}
                    </div>
                    
                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {getCategoryBadge(book.category)}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-end">
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(book)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(book._id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {book.status !== 'published' && (
                          <DropdownMenuItem onClick={() => handleToggleStatus(book._id, 'published')}>
                            <Eye className="w-4 h-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {book.status !== 'review' && (
                          <DropdownMenuItem onClick={() => handleToggleStatus(book._id, 'review')}>
                            <Eye className="w-4 h-4 mr-2" />
                            Mark as In Review
                          </DropdownMenuItem>
                        )}
                        {book.status !== 'rejected' && (
                          <DropdownMenuItem onClick={() => handleToggleStatus(book._id, 'rejected')}>
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        )}
                        {book.status === 'published' && (
                          <DropdownMenuItem onClick={() => handleToggleStatus(book._id, 'pending')}>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(book._id)}
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
