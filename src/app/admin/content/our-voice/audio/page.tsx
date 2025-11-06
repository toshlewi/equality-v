"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff as EyeOffIcon, ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioItem {
  _id?: string;
  title: string;
  description?: string;
  audioUrl: string;
  thumbnail?: string;
  duration?: number;
  author?: string;
  publishedAt?: string;
  category?: string;
  episode?: number;
  season?: number;
  status?: 'draft' | 'published';
  visible?: boolean;
}

export default function AdminAudioPage() {
  const router = useRouter();
  const [items, setItems] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AudioItem | null>(null);
  const [form, setForm] = useState<AudioItem>({ title: "", audioUrl: "" });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/our-voices/audio?includeDrafts=true');
    const json = await res.json();
    if (json.success) setItems(json.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ title: "", audioUrl: "", visible: true, status: 'published' }); setEditing(null); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing?._id ? 'PUT' : 'POST';
    const url = editing?._id ? `/api/our-voices/audio/${editing._id}` : '/api/our-voices/audio';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { resetForm(); load(); }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this audio item?')) return;
    const res = await fetch(`/api/our-voices/audio/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  const toggleVisibility = async (item: AudioItem) => {
    const res = await fetch(`/api/our-voices/audio/${item._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visible: !item.visible }) });
    if (res.ok) load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/content/our-voice')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stories
        </Button>
        <h1 className="text-2xl font-semibold">Our Voices — Audio & Podcasts</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Audio section currently uses placeholders on the main site. File upload functionality is ready when you're ready to add content.
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-lg border p-4 mb-8 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={form.title} onChange={e=>setForm(f=>({ ...f, title: e.target.value }))} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Audio File (ready for upload)</label>
          <input
            type="file"
            accept="audio/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const formData = new FormData();
                formData.append('files', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (res.ok) {
                  const uploaded = await res.json();
                  if (Array.isArray(uploaded) && uploaded.length > 0) {
                    setForm(prev => ({ ...prev, audioUrl: uploaded[0].url }));
                  }
                }
              }
            }}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const formData = new FormData();
                formData.append('files', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (res.ok) {
                  const uploaded = await res.json();
                  if (Array.isArray(uploaded) && uploaded.length > 0) {
                    setForm(prev => ({ ...prev, thumbnail: uploaded[0].url }));
                  }
                }
              }
            }}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.visible} onChange={e=>setForm(f=>({ ...f, visible: e.target.checked }))} /> Visible</label>
        </div>
        <div>
          <button type="submit" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded">
            <Plus className="w-4 h-4" /> {editing?._id ? 'Update Audio' : 'Add Audio'}
          </button>
          {editing?._id && (
            <button type="button" onClick={resetForm} className="ml-3 px-3 py-2 border rounded">Cancel</button>
          )}
        </div>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        {loading ? <div>Loading…</div> : items.map(item => (
          <div key={item._id} className="bg-white border rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-100">
              {item.thumbnail && <img src={item.thumbnail} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4">
              <div className="font-medium line-clamp-1" title={item.title}>{item.title}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{item.description}</div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="uppercase text-gray-500">{item.status}</span>
                <div className="flex items-center gap-2">
                  <button onClick={()=>{setEditing(item); setForm(item);}} className="p-2 border rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                  <button onClick={()=>toggleVisibility(item)} className="p-2 border rounded" title="Toggle visibility">{item.visible ? <Eye className="w-4 h-4"/> : <EyeOffIcon className="w-4 h-4"/>}</button>
                  <button onClick={()=>item._id && onDelete(item._id)} className="p-2 border rounded text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


