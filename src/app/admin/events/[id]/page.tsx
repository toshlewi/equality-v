"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function EditEventPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [form, setForm] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      if (data.success) setForm(data.data);
    })();
  }, [id]);

  if (!form) return <div className="p-6">Loading...</div>;

  const update = (key: string, value: any) => setForm((s: any) => ({ ...s, [key]: value }));
  const submit = async () => {
    setSaving(true);
    const res = await fetch(`/api/events/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) router.push('/admin/events');
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
          <Textarea placeholder="Description" value={form.description} onChange={(e) => update('description', e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Start Date</label>
              <Input type="date" value={form.startDate?.slice(0,10)} onChange={(e) => update('startDate', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-600">End Date</label>
              <Input type="date" value={form.endDate?.slice(0,10)} onChange={(e) => update('endDate', e.target.value)} />
            </div>
          </div>
          <Select value={form.status} onValueChange={(v) => update('status', v)}>
            <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Featured Image URL" value={form.featuredImage || ''} onChange={(e) => update('featuredImage', e.target.value)} />
            <Input placeholder="Banner Image URL" value={form.bannerImage || ''} onChange={(e) => update('bannerImage', e.target.value)} />
          </div>
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
                  <Input placeholder="Video URL" value={form.recap?.videoUrl || ''} onChange={(e) => update('recap', { ...(form.recap||{}), videoUrl: e.target.value })} />
                ) : (
                  <Textarea placeholder="Gallery image URLs (comma separated)" value={(form.recap?.galleryImages || []).join(',')} onChange={(e) => update('recap', { ...(form.recap||{}), galleryImages: e.target.value.split(',').map((s)=>s.trim()).filter(Boolean) })} />
                )}
                <Textarea placeholder="Short recap summary" value={form.recap?.summary || ''} onChange={(e) => update('recap', { ...(form.recap||{}), summary: e.target.value })} />
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


