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
    location: { isVirtual: true }
  });
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: any) => setForm((s: any) => ({ ...s, [key]: value }));

  const submit = async () => {
    setSaving(true);
    const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) router.push('/admin/events');
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


