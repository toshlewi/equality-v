"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function NewNewsPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({ title: '', content: '', excerpt: '', category: 'announcement', author: { name: '' }, featuredImage: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (key: string, value: any) => setForm((s: any) => ({ ...s, [key]: value }));

  const submit = async () => {
    setSaving(true);
    const res = await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) router.push('/admin/news');
  };

  const handleThumbnailSelect = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'images');
      const r = await fetch('/api/uploads/direct', { method: 'POST', body: formData });
      const j = await r.json();
      if (!j.success) throw new Error('Upload failed');
      update('featuredImage', j.data.url);
    } catch (e) {
      console.error('Thumbnail upload failed', e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create News</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
          <Input placeholder="Author name" value={form.author?.name || ''} onChange={(e) => update('author', { ...(form.author||{}), name: e.target.value })} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Excerpt (Short Summary)</label>
            <Textarea 
              placeholder="Write a brief summary or excerpt of the news article (optional)..."
              value={form.excerpt || ''} 
              onChange={(e) => update('excerpt', e.target.value)}
              rows={3}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              This will be displayed in the news grid preview. Leave empty to auto-generate from content.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleThumbnailSelect(e.target.files?.[0] || null)}
              />
              <Button type="button" variant="outline" disabled>{uploading ? 'Uploading…' : 'Upload thumbnail'}</Button>
            </div>
            {form.featuredImage && (
              <div className="flex items-center gap-3">
                <img src={form.featuredImage} alt="Thumbnail preview" className="w-20 h-20 object-cover rounded" />
                <Input placeholder="Thumbnail image URL" value={form.featuredImage} onChange={(e) => update('featuredImage', e.target.value)} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Content</label>
            <Textarea 
              placeholder="Write your news article content here..."
              value={form.content} 
              onChange={(e) => update('content', e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              rows={20}
            />
            <p className="text-xs text-gray-500">
              You can write your article content directly here. Use line breaks for paragraphs. 
              HTML formatting is supported.
            </p>
          </div>
          <Select value={form.category} onValueChange={(v) => update('category', v)}>
            <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="achievement">Achievement</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


