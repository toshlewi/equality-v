"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminEventItem {
  _id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  featuredImage?: string;
  showInPastCarousel?: boolean;
  pastCarouselOrder?: number;
  status?: string;
}

export default function AdminPastEventsCarouselPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<AdminEventItem[]>([]);
  const bcRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    bcRef.current = new BroadcastChannel('ev-events');
    
    (async () => {
      try {
        const res = await fetch('/api/events?time=past&limit=200', { cache: 'no-store' });
        if (!res.ok) {
          console.error('Failed to fetch events:', res.status);
          return;
        }
        const j = await res.json();
        if (j.success) {
          const rows: AdminEventItem[] = (j.data.events || [])
            .map((e: any) => ({
              _id: e._id,
              title: e.title,
              startDate: e.startDate,
              endDate: e.endDate,
              featuredImage: e.featuredImage,
              showInPastCarousel: !!e.showInPastCarousel,
              pastCarouselOrder: e.pastCarouselOrder || 0,
              status: e.status || 'draft',
            }))
            .sort((a, b) => (a.pastCarouselOrder || 0) - (b.pastCarouselOrder || 0));
          setItems(rows);
          console.log('Loaded events for carousel management:', rows.length);
        } else {
          console.error('Failed to load events:', j.message);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      bcRef.current?.close();
    };
  }, []);

  const updateItem = (id: string, patch: Partial<AdminEventItem>) => {
    setItems(prev => prev.map(i => i._id === id ? { ...i, ...patch } : i));
  };

  const togglePublish = async (id: string) => {
    const item = items.find(i => i._id === id);
    if (!item) return;
    
    const newStatus = item.status === 'published' ? 'completed' : 'published';
    
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to update status');
      }
      
      updateItem(id, { status: newStatus });
      
      // Notify public pages
      if (bcRef.current) {
        bcRef.current.postMessage({ type: 'past_events_updated' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const results = await Promise.allSettled(items.map(async (i) => {
        const body = {
          showInPastCarousel: !!i.showInPastCarousel,
          pastCarouselOrder: Number(i.pastCarouselOrder) || 0,
        };
        const res = await fetch(`/api/events/${i._id}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(body) 
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Failed to update');
        }
        return json;
      }));
      
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('Some events failed to save:', failed);
        alert(`Failed to save ${failed.length} event(s). Please try again.`);
        return;
      }
      
      // Notify public pages to refresh past events carousel
      if (bcRef.current) {
        bcRef.current.postMessage({ type: 'past_events_updated' });
      }
      
      // Show success message
      alert('Past events carousel updated successfully!');
    } catch (error) {
      console.error('Error saving past events:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString() : '';

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Past Events Carousel</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Select which past events appear in the homepage carousel and set their order.</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => router.back()}>Back</Button>
                  <Button onClick={saveAll} disabled={saving}>{saving ? 'Saving…' : 'Save All'}</Button>
                </div>
              </div>
              <div className="border rounded">
                <div className="grid grid-cols-12 gap-2 p-3 border-b text-sm font-medium">
                  <div className="col-span-5">Event</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Show in carousel</div>
                  <div className="col-span-1">Order</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {items.map((e) => (
                  <div key={e._id} className="grid grid-cols-12 gap-2 p-3 border-b items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      {e.featuredImage && (
                        <img src={e.featuredImage} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div className="truncate" title={e.title}>{e.title}</div>
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {formatDate(e.startDate)}{e.endDate ? ` – ${formatDate(e.endDate)}` : ''}
                    </div>
                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        e.status === 'published' ? 'bg-green-100 text-green-800' :
                        e.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {e.status || 'draft'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="checkbox"
                        checked={!!e.showInPastCarousel}
                        onChange={(ev) => updateItem(e._id, { showInPastCarousel: ev.target.checked })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={String(e.pastCarouselOrder || 0)}
                        onChange={(ev) => updateItem(e._id, { pastCarouselOrder: Number(ev.target.value) })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        size="sm"
                        variant={e.status === 'published' ? 'default' : 'outline'}
                        onClick={() => togglePublish(e._id)}
                      >
                        {e.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={saveAll} disabled={saving}>{saving ? 'Saving…' : 'Save All'}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
