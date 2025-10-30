"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Toolkit {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string;
  difficultyLevel?: string;
  estimatedTime?: string;
  tags?: string[];
  status: string;
  isFeatured: boolean;
  isPublic: boolean;
  featuredImage?: string;
  thumbnailImage?: string;
}

export default function EditToolkitPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'featured' | 'thumbnail' | null>(null);

  const [toolkit, setToolkit] = useState<Toolkit | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('legal');
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [featuredImage, setFeaturedImage] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/toolkits/${id}`);
        const type = res.headers.get('content-type') || '';
        if (!type.includes('application/json')) throw new Error('Unexpected response');
        const data = await res.json();
        const t: Toolkit = data.data;
        setToolkit(t);
        setTitle(t.title);
        setDescription(t.description);
        setShortDescription(t.shortDescription || '');
        setCategory(t.category);
        setDifficultyLevel(t.difficultyLevel || 'beginner');
        setEstimatedTime(t.estimatedTime || '');
        setTags((t.tags || []).join(', '));
        setStatus(t.status);
        setIsFeatured(!!t.isFeatured);
        setIsPublic(!!t.isPublic);
        setFeaturedImage(t.featuredImage || '');
        setThumbnailImage(t.thumbnailImage || '');
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const type = res.headers.get('content-type') || '';
    if (!type.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Upload failed (${res.status}).`);
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Upload failed');
    return data?.[0]?.url as string;
  };

  const handleSave = async () => {
    if (!title || !description) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/toolkits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          shortDescription: shortDescription || undefined,
          category,
          difficultyLevel,
          estimatedTime: estimatedTime || undefined,
          tags: tags.split(',').map(s => s.trim()).filter(Boolean),
          status,
          isFeatured,
          isPublic,
          featuredImage: featuredImage || undefined,
          thumbnailImage: thumbnailImage || undefined,
        }),
      });
      const type = res.headers.get('content-type') || '';
      if (!type.includes('application/json')) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to save');
      router.push('/admin/content/toolkits');
    } catch (e) {
      console.error(e);
      alert('Failed to save toolkit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Toolkit</h1>
          <p className="text-gray-600">Update details, images, and visibility</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[140px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="advocacy">Advocacy</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty Level</label>
              <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Time</label>
              <Input value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="e.g. 2 hours" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Comma-separated" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Featured Image</label>
              {featuredImage && <img src={featuredImage} alt="Featured" className="h-24 w-24 object-cover rounded mb-2" />}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setUploading('featured');
                      const url = await uploadImage(file);
                      setFeaturedImage(url);
                    } catch (err) {
                      console.error(err);
                      alert('Failed to upload featured image');
                    } finally {
                      setUploading(null);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
              {thumbnailImage && <img src={thumbnailImage} alt="Thumbnail" className="h-24 w-24 object-cover rounded mb-2" />}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setUploading('thumbnail');
                      const url = await uploadImage(file);
                      setThumbnailImage(url);
                    } catch (err) {
                      console.error(err);
                      alert('Failed to upload thumbnail image');
                    } finally {
                      setUploading(null);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input id="isFeatured" type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <label htmlFor="isFeatured" className="text-sm">Featured</label>
            </div>
            <div className="flex items-center gap-2">
              <input id="isPublic" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <label htmlFor="isPublic" className="text-sm">Public</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => router.push('/admin/content/toolkits')}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || uploading !== null}>{saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


