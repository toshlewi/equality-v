"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, EyeOff, Edit, Trash2, Calendar } from 'lucide-react';

interface NewsItem { _id: string; title: string; slug: string; status: string; category: string; featuredImage?: string; publishedAt?: string; }

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const router = useRouter();

  const fetchNews = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status !== 'all') params.set('status', status);
    if (category !== 'all') params.set('category', category);
    const res = await fetch(`/api/news?${params.toString()}`);
    const data = await res.json();
    if (data.success) setItems(data.data.news);
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, [q, status, category]);

  const handleTogglePublish = async (id: string, current: string) => {
    const next = current === 'published' ? 'draft' : 'published';
    await fetch(`/api/news/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
    fetchNews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news item?')) return;
    await fetch(`/api/news/${id}`, { method: 'DELETE' });
    fetchNews();
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">News</h1>
          <p className="text-gray-600">Manage news articles</p>
        </div>
        <Button onClick={() => router.push('/admin/news/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create News
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input className="pl-10" placeholder="Search news..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="achievement">Achievement</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>News ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">{[...Array(6)].map((_, i) => (<div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />))}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-gray-600">No news items</div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item._id} className="border rounded p-3 flex items-center gap-3">
                  {item.featuredImage && (
                    <img src={item.featuredImage} alt={item.title} className="w-12 h-12 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{item.title}</span>
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(item.publishedAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleTogglePublish(item._id, item.status)}>
                      {item.status === 'published' ? (<><EyeOff className="w-4 h-4 mr-1" />Unpublish</>) : (<><Eye className="w-4 h-4 mr-1" />Publish</>)}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/news/${item._id}`)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(item._id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

