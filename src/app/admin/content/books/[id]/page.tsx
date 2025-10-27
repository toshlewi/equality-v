"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, BookOpen, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface BookFormData {
  title: string;
  author: string;
  genre: string;
  year: number;
  category: string;
  coverUrl: string;
  description: string;
  shortDescription: string;
  isbn?: string;
  publisher?: string;
  language: string;
  pages?: number;
  tags: string[];
  isFeatured: boolean;
  isInLibrary: boolean;
  isAvailable: boolean;
  isBookClubSelection: boolean;
  status: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image';
}

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    genre: '',
    year: new Date().getFullYear(),
    category: 'non-fiction',
    coverUrl: '',
    description: '',
    shortDescription: '',
    isbn: '',
    publisher: '',
    language: 'English',
    pages: undefined,
    tags: [],
    isFeatured: false,
    isInLibrary: true,
    isAvailable: true,
    isBookClubSelection: false,
    status: 'pending'
  });

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${bookId}`);
      const result = await response.json();

      if (result.success) {
        const book = result.data;
        setFormData({
          title: book.title || '',
          author: book.author || '',
          genre: book.genre || '',
          year: book.year || new Date().getFullYear(),
          category: book.category || 'non-fiction',
          coverUrl: book.coverUrl || '',
          description: book.description || '',
          shortDescription: book.shortDescription || '',
          isbn: book.isbn || '',
          publisher: book.publisher || '',
          language: book.language || 'English',
          pages: book.pages,
          tags: book.tags || [],
          isFeatured: book.isFeatured || false,
          isInLibrary: book.isInLibrary !== undefined ? book.isInLibrary : true,
          isAvailable: book.isAvailable !== undefined ? book.isAvailable : true,
          isBookClubSelection: book.isBookClubSelection || false,
          status: book.status || 'pending'
        });
      } else {
        console.error('Error fetching book:', result.error);
        router.push('/admin/content/books');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      router.push('/admin/content/books');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BookFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedFiles([{
            file,
            preview: reader.result as string,
            type: 'image'
          }]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = () => {
    setUploadedFiles([]);
  };

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) return;
    
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('files', uploadedFiles[0].file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result) && result.length > 0) {
          setFormData(prev => ({ ...prev, coverUrl: result[0].url }));
        }
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/content/books');
      } else {
        console.error('Error updating book:', result.error, result.details);
        const errorMessage = result.details 
          ? `Validation errors: ${result.details.join(', ')}`
          : result.error || 'Unknown error';
        alert(`Error updating book: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Error updating book. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Book</h1>
          <p className="text-gray-600">Edit book details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      placeholder="2024"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pages">Pages</Label>
                    <Input
                      id="pages"
                      type="number"
                      value={formData.pages || ''}
                      onChange={(e) => handleInputChange('pages', parseInt(e.target.value) || undefined)}
                      placeholder="300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    placeholder="e.g., Feminism, African Literature"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiction">Fiction</SelectItem>
                      <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                      <SelectItem value="poetry">Poetry</SelectItem>
                      <SelectItem value="essays">Essays</SelectItem>
                      <SelectItem value="memoir">Memoir</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Full description of the book"
                    rows={5}
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Brief summary (max 300 characters)"
                    rows={2}
                    maxLength={300}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.coverUrl && (
                  <div className="flex items-center justify-center">
                    <img 
                      src={formData.coverUrl} 
                      alt="Current cover"
                      className="w-48 h-64 object-cover rounded"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="fileUpload">Upload New Cover Image</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">New Image Preview</p>
                      <Button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={uploading}
                        size="sm"
                      >
                        {uploading ? 'Uploading...' : 'Upload to Server'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative border rounded p-2">
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeFile}
                            className="absolute top-2 right-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isFeatured">Featured Book</Label>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isInLibrary">In Library</Label>
                  <Switch
                    id="isInLibrary"
                    checked={formData.isInLibrary}
                    onCheckedChange={(checked) => handleInputChange('isInLibrary', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isAvailable">Available</Label>
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => handleInputChange('isAvailable', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isBookClubSelection">Book Club Selection</Label>
                  <Switch
                    id="isBookClubSelection"
                    checked={formData.isBookClubSelection}
                    onCheckedChange={(checked) => handleInputChange('isBookClubSelection', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn || ''}
                    onChange={(e) => handleInputChange('isbn', e.target.value)}
                    placeholder="978-0-123456-78-9"
                  />
                </div>

                <div>
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher || ''}
                    onChange={(e) => handleInputChange('publisher', e.target.value)}
                    placeholder="Publisher name"
                  />
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    placeholder="English"
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
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag"
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    Add
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/admin/content/books')}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

