"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewToolkitPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('legal');
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tags, setTags] = useState<string>('');
  const [publishNow, setPublishNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title || !description) return;
    setSubmitting(true);
    try {
      // Upload featured image if a file is selected
      let featuredImageUrl = featuredImage || undefined;
      if (featuredImageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('files', featuredImageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const contentType = uploadRes.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await uploadRes.text();
          throw new Error(`Image upload failed (${uploadRes.status}).`);
        }
        const uploaded = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploaded?.error || 'Image upload failed');
        featuredImageUrl = uploaded?.[0]?.url;
      }

      const res = await fetch('/api/toolkits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          shortDescription: shortDescription || undefined,
          category,
          difficultyLevel,
          estimatedTime: estimatedTime || undefined,
          featuredImage: featuredImageUrl,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const resType = res.headers.get('content-type') || '';
      if (!resType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Failed to create (${res.status}).`);
      }
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to create');

      const created = data.data;

      if (publishNow) {
        await fetch(`/api/toolkits/${created._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published', isPublic: true }),
        });
      }

      router.push('/admin/content/toolkits');
    } catch (e) {
      console.error(e);
      alert('Failed to create toolkit');
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Toolkit</h1>
          <p className="text-gray-600">Add a new toolkit or guide and publish it</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Toolkit title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <Input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One-liner (max 300 chars)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this toolkit about?"
              className="min-h-[140px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
                  <SelectValue placeholder="Select level" />
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
              <label className="block text-sm font-medium mb-1">Featured Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFeaturedImageFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setFeaturedImage(reader.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setFeaturedImage('');
                  }
                }}
              />
              {featuredImage && (
                <div className="mt-2">
                  <img src={featuredImage} alt="Preview" className="h-24 w-24 object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Comma-separated tags" />
          </div>

          <div className="flex items-center gap-2">
            <input id="publishNow" type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
            <label htmlFor="publishNow" className="text-sm">Publish now</label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => router.push('/admin/content/toolkits')}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting || uploadingImage || !title || !description}>
              {submitting ? 'Creating...' : uploadingImage ? 'Uploading image...' : 'Create Toolkit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


