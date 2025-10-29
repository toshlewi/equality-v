"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Edit, Eye, EyeOff, Upload, ArrowLeft, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroItem {
  _id?: string;
  title: string;
  text?: string;
  backgroundImage: string;
  type?: 'video' | 'image' | 'audio' | 'story';
  duration?: number;
  author?: string;
  views?: number;
  featured?: boolean;
  visible?: boolean;
  status?: 'draft' | 'published';
  order?: number;
}

export default function AdminHeroPage() {
  const router = useRouter();
  const [items, setItems] = useState<HeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<HeroItem>({ title: "", backgroundImage: "", type: 'image', visible: true, status: 'published' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/our-voices/hero?includeDrafts=true');
      const json = await res.json();
      if (json.success) {
        const loaded = json.data || [];
        // Sort by order and ensure we have exactly 12 items
        const sorted = loaded.sort((a: HeroItem, b: HeroItem) => (a.order || 0) - (b.order || 0));
        
        // If less than 12, initialize
        if (sorted.length < 12) {
          const initRes = await fetch('/api/our-voices/hero/init', { method: 'POST' });
          if (initRes.ok) {
            // Reload after initialization
            const reloadRes = await fetch('/api/our-voices/hero?includeDrafts=true');
            const reloadJson = await reloadRes.json();
            if (reloadJson.success) {
              const reloaded = reloadJson.data || [];
              setItems(reloaded.sort((a: HeroItem, b: HeroItem) => (a.order || 0) - (b.order || 0)));
            }
          }
        } else {
          // Ensure exactly 12 items
          setItems(sorted.slice(0, 12));
        }
      }
    } catch (error) {
      console.error('Error loading hero items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please upload an image or video file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const uploaded = await res.json();
        if (Array.isArray(uploaded) && uploaded.length > 0) {
          setForm(prev => ({ ...prev, backgroundImage: uploaded[0].url }));
          setImagePreview(URL.createObjectURL(file));
        }
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (index: number) => {
    const item = items[index];
    setForm({ ...item });
    setEditingIndex(index);
    if (item.backgroundImage) {
      setImagePreview(item.backgroundImage);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setForm({ title: "", backgroundImage: "", type: 'image', visible: true, status: 'published' });
    setImagePreview(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;

    const item = items[editingIndex];
    if (!item._id) return;

    const res = await fetch(`/api/our-voices/hero/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      cancelEdit();
      load(); // Reload to show updates immediately
    } else {
      alert('Failed to update item');
    }
  };

  const toggleVisibility = async (item: HeroItem) => {
    if (!item._id) return;
    const res = await fetch(`/api/our-voices/hero/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !item.visible }),
    });
    if (res.ok) load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/content/our-voice')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stories
          </Button>
          <h1 className="text-2xl font-semibold">Our Voices — Hero Items (Edit Only)</h1>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading hero items...</div>
      ) : (
        <>
          {/* Edit Form Modal */}
          {editingIndex !== null && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Edit Hero Item {editingIndex + 1}</h2>
                  <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      value={form.title}
                      onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Background Image *</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploading ? 'Uploading...' : 'Upload Image/Video'}
                        </Button>
                        {form.backgroundImage && (
                          <span className="text-sm text-gray-600 truncate max-w-xs">
                            {form.backgroundImage}
                          </span>
                        )}
                      </div>
                      {(imagePreview || form.backgroundImage) && (
                        <div className="relative w-full h-48 border rounded overflow-hidden">
                          <img
                            src={imagePreview || form.backgroundImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Text</label>
                    <input
                      value={form.text || ''}
                      onChange={e => setForm(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={form.type || 'image'}
                        onChange={e => setForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                        <option value="story">Story</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Author</label>
                      <input
                        value={form.author || ''}
                        onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!form.visible}
                        onChange={e => setForm(prev => ({ ...prev, visible: e.target.checked }))}
                      />
                      Visible
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!form.featured}
                        onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                      />
                      Featured
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 12 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => {
              const item = items[index];
              return (
                <div key={item?._id || `placeholder-${index}`} className="bg-white border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    {item?.backgroundImage ? (
                      <img src={item.backgroundImage} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                    {item?.featured && (
                      <div className="absolute top-2 right-2 bg-brand-orange text-white px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-medium mb-1 line-clamp-1">
                      {item?.title || `Hero Item ${index + 1}`}
                    </div>
                    {item?.text && (
                      <div className="text-sm text-gray-600 line-clamp-2 mb-2">{item.text}</div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="uppercase text-gray-500 text-xs">
                        {item?.type || 'image'} • #{index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(index)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {item?._id && (
                          <button
                            onClick={() => toggleVisibility(item)}
                            className="p-1.5 hover:bg-gray-100 rounded"
                            title="Toggle visibility"
                          >
                            {item.visible !== false ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
