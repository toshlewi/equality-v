"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    category: 'workshop',
    startDate: '',
    endDate: '',
    isFree: true,
    price: 0,
    location: { isVirtual: true },
    featuredImage: '',
    bannerImage: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingRecapImages, setUploadingRecapImages] = useState(false);
  const [uploadingRecapVideo, setUploadingRecapVideo] = useState(false);

  const update = (key: string, value: any) => setForm((s: any) => ({ ...s, [key]: value }));

  const submit = async () => {
    setSaving(true);
    const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) router.push('/admin/events');
  };

  const handleRecapImageUploads = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingRecapImages(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'images/events/recap');
        const r = await fetch('/api/uploads/direct', { method: 'POST', body: fd });
        const j = await r.json();
        if (!j.success) throw new Error('Upload failed');
        uploaded.push(j.data.url);
      }
      setForm((s: any) => ({
        ...s,
        recap: {
          ...(s.recap || {}),
          galleryImages: [
            ...(((s.recap || {}).galleryImages) || []),
            ...uploaded
          ]
        }
      }));
    } catch (e) {
      console.error('Recap image upload failed', e);
    } finally {
      setUploadingRecapImages(false);
    }
  };

  const handleRecapVideoUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingRecapVideo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'videos/events/recap');
      const r = await fetch('/api/uploads/direct', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.success) throw new Error('Upload failed');
      update('recap', { ...(form.recap || {}), videoUrl: j.data.url });
    } catch (e) {
      console.error('Recap video upload failed', e);
    } finally {
      setUploadingRecapVideo(false);
    }
  };

  const handleImageUpload = async (file: File | null, key: 'featuredImage' | 'bannerImage') => {
    if (!file) return;
    const setUploading = key === 'featuredImage' ? setUploadingFeatured : setUploadingBanner;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'images/events');
      const r = await fetch('/api/uploads/direct', { method: 'POST', body: formData });
      const j = await r.json();
      if (!j.success) throw new Error('Upload failed');
      update(key, j.data.url);
    } catch (e) {
      console.error('Image upload failed', e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
          <Textarea placeholder="Description" value={form.description} onChange={(e) => update('description', e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Start Date</label>
              <Input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-600">End Date</label>
              <Input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
            </div>
          </div>
          <Select value={form.category} onValueChange={(v) => update('category', v)}>
            <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="fundraiser">Fundraiser</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <div className="space-y-2 p-3 border rounded">
            <div className="font-medium">Recap</div>
            <div className="flex items-center gap-2">
              <input id="recapEnabled" type="checkbox" checked={form.recap?.enabled || false} onChange={(e) => update('recap', { ...(form.recap||{}), enabled: e.target.checked })} />
              <label htmlFor="recapEnabled">Enable recap</label>
            </div>
            {form.recap?.enabled && (
              <>
                <Select value={form.recap?.type || 'gallery'} onValueChange={(v) => update('recap', { ...(form.recap||{}), type: v })}>
                  <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="Recap type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gallery">Gallery</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
                {form.recap?.type === 'video' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input type="file" accept="video/*" onChange={(e) => handleRecapVideoUpload(e.target.files?.[0] || null)} />
                      <Button type="button" variant="outline" disabled>{uploadingRecapVideo ? 'Uploading…' : 'Upload video'}</Button>
                    </div>
                    {form.recap?.videoUrl && (
                      <div className="text-sm text-gray-600">Video uploaded</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input type="file" accept="image/*" multiple onChange={(e) => handleRecapImageUploads(e.target.files)} />
                      <Button type="button" variant="outline" disabled>{uploadingRecapImages ? 'Uploading…' : 'Upload images'}</Button>
                    </div>
                    {Array.isArray(form.recap?.galleryImages) && form.recap.galleryImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {form.recap.galleryImages.map((url: string) => (
                          <img key={url} src={url} className="w-20 h-20 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <Textarea placeholder="Short recap summary" value={form.recap?.summary || ''} onChange={(e) => update('recap', { ...(form.recap||{}), summary: e.target.value })} />
              </>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">Featured Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] || null, 'featuredImage')} />
              </div>
              <Button type="button" variant="outline" disabled>{uploadingFeatured ? 'Uploading…' : 'Upload'}</Button>
            </div>
            {form.featuredImage && (
              <div className="flex items-center gap-3">
                <img src={form.featuredImage} alt="Featured preview" className="w-20 h-20 object-cover rounded" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">Banner Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] || null, 'bannerImage')} />
              </div>
              <Button type="button" variant="outline" disabled>{uploadingBanner ? 'Uploading…' : 'Upload'}</Button>
            </div>
            {form.bannerImage && (
              <div className="flex items-center gap-3">
                <img src={form.bannerImage} alt="Banner preview" className="w-32 h-20 object-cover rounded" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input id="isFree" type="checkbox" checked={form.isFree} onChange={(e) => update('isFree', e.target.checked)} />
              <label htmlFor="isFree">Free event</label>
            </div>
            {!form.isFree && (
              <Input type="number" placeholder="Ticket Price" value={form.price} onChange={(e) => update('price', Number(e.target.value))} />
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


