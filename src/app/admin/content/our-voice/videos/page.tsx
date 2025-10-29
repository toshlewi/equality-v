"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Upload, X, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Video {
  _id?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl: string;
  duration?: number;
  author?: string;
  views?: number;
  tags?: string[];
  publishedAt?: string;
  status?: 'draft' | 'published';
  visible?: boolean;
}

export default function AdminVideosPage() {
  const router = useRouter();
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState<Video>({ title: "", videoUrl: "", visible: true, status: 'published' });
  const [uploading, setUploading] = useState<'video' | 'thumbnail' | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/our-voices/videos?includeDrafts=true');
    const json = await res.json();
    if (json.success) setItems(json.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }

    setUploading('video');
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
          setForm(prev => ({ ...prev, videoUrl: uploaded[0].url }));
          setVideoPreview(URL.createObjectURL(file));
        }
      } else {
        alert('Failed to upload video');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading video');
    } finally {
      setUploading(null);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading('thumbnail');
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
          setForm(prev => ({ ...prev, thumbnail: uploaded[0].url }));
          setThumbnailPreview(URL.createObjectURL(file));
        }
      } else {
        alert('Failed to upload thumbnail');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading thumbnail');
    } finally {
      setUploading(null);
    }
  };

  const resetForm = () => {
    setForm({ title: "", videoUrl: "", visible: true, status: 'published' });
    setEditing(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
  };

  const startEdit = (item: Video) => {
    setForm({ ...item });
    setEditing(item);
    if (item.videoUrl) setVideoPreview(item.videoUrl);
    if (item.thumbnail) setThumbnailPreview(item.thumbnail);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.videoUrl) {
      alert('Please upload a video');
      return;
    }

    const method = editing?._id ? 'PUT' : 'POST';
    const url = editing?._id ? `/api/our-voices/videos/${editing._id}` : '/api/our-voices/videos';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      resetForm();
      load();
    } else {
      alert('Failed to save video');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    const res = await fetch(`/api/our-voices/videos/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  const toggleVisibility = async (item: Video) => {
    if (!item._id) return;
    const res = await fetch(`/api/our-voices/videos/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !item.visible }),
    });
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
        <h1 className="text-2xl font-semibold">Our Voices — Video Resources</h1>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="bg-white rounded-lg border p-6 mb-8 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium mb-1">Author</label>
            <input
              value={form.author || ''}
              onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description || ''}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Video File *</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading === 'video'}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading === 'video' ? 'Uploading...' : 'Upload Video'}
                </Button>
                {form.videoUrl && (
                  <span className="text-sm text-gray-600 truncate max-w-xs">{form.videoUrl}</span>
                )}
              </div>
              {(videoPreview || form.videoUrl) && (
                <div className="relative w-full aspect-video border rounded overflow-hidden bg-gray-100">
                  <video
                    src={videoPreview || form.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploading === 'thumbnail'}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading === 'thumbnail' ? 'Uploading...' : 'Upload Thumbnail'}
                </Button>
                {form.thumbnail && (
                  <span className="text-sm text-gray-600 truncate max-w-xs">{form.thumbnail}</span>
                )}
              </div>
              {(thumbnailPreview || form.thumbnail) && (
                <div className="relative w-full aspect-video border rounded overflow-hidden bg-gray-100">
                  <img
                    src={thumbnailPreview || form.thumbnail}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
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
              checked={form.status === 'published'}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.checked ? 'published' : 'draft' }))}
            />
            Published
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {editing?._id ? 'Update Video' : 'Add Video'}
          </Button>
          {editing?._id && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="grid md:grid-cols-3 gap-4">
        {loading ? (
          <div>Loading…</div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No videos yet. Add your first video above.
          </div>
        ) : items.map(item => (
          <div key={item._id} className="bg-white border rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              ) : item.videoUrl ? (
                <video src={item.videoUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <VideoIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="font-medium line-clamp-1 mb-1" title={item.title}>{item.title}</div>
              <div className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</div>
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase text-gray-500">{item.status}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-2 border rounded hover:bg-gray-50"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleVisibility(item)}
                    className="p-2 border rounded hover:bg-gray-50"
                    title="Toggle visibility"
                  >
                    {item.visible !== false ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => item._id && onDelete(item._id)}
                    className="p-2 border rounded text-red-600 hover:bg-gray-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
