"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaFile {
  url: string;
  mediaType?: 'image' | 'video' | 'audio' | 'pdf';
  type?: string; // fallback
  name?: string;
  thumbnailUrl?: string;
}

interface StoryDetail {
  _id: string;
  title: string;
  text?: string;
  anonymous: boolean;
  submitterName?: string;
  submitterEmail?: string;
  status: 'pending' | 'in_review' | 'approved' | 'published' | 'rejected';
  tags: string[];
  mediaFiles?: MediaFile[];
  files?: MediaFile[];
  createdAt: string;
  publishedAt?: string;
}

export default function StoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stories/${params.id}`);
      const json = await res.json();
      if (json.success) {
        setStory(json.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params.id]);

  const updateStatus = async (status: StoryDetail['status']) => {
    if (!story) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stories/${story._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) load();
    } finally {
      setSaving(false);
    }
  };

  const renderMedia = (m: MediaFile, idx: number) => {
    const type = (m.mediaType || m.type || '').toLowerCase();
    if (type.startsWith('image')) {
      return (
        <div key={idx} className="rounded-lg overflow-hidden border">
          <img src={m.url} alt={m.name || `image-${idx}`} className="w-full h-auto" />
        </div>
      );
    }
    if (type.startsWith('video')) {
      return (
        <div key={idx} className="rounded-lg overflow-hidden border">
          <video src={m.url} controls className="w-full h-auto" />
        </div>
      );
    }
    if (type.startsWith('audio')) {
      return (
        <div key={idx} className="rounded-lg overflow-hidden border p-4">
          <audio src={m.url} controls className="w-full" />
        </div>
      );
    }
    if (type === 'pdf' || m.url.toLowerCase().endsWith('.pdf')) {
      return (
        <div key={idx} className="rounded-lg overflow-hidden border">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
            <div className="flex items-center gap-2 text-gray-700">
              <FileText className="w-4 h-4" />
              <span>{m.name || `Document ${idx + 1}`}</span>
            </div>
            <a href={m.url} download className="text-sm inline-flex items-center gap-1 text-blue-600 hover:underline">
              <Download className="w-4 h-4" /> Download
            </a>
          </div>
          <iframe src={`/api/view-pdf?path=${encodeURIComponent(m.url)}`} className="w-full h-[600px]" />
        </div>
      );
    }
    // default fallback
    return (
      <div key={idx} className="rounded-lg overflow-hidden border p-4">
        <a href={m.url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Open media</a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="animate-pulse h-96 w-full bg-gray-100 rounded" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.push('/admin/content/our-voice')} className="mb-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>Story not found.</div>
      </div>
    );
  }

  const allMedia = (story.mediaFiles || story.files || []) as MediaFile[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/content/our-voice')} className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Stories
          </Button>
          <h1 className="text-2xl font-semibold">{story.title}</h1>
          <span className="text-xs px-2 py-1 rounded bg-gray-100 border">{story.status}</span>
        </div>
        <div className="flex items-center gap-2">
          {story.status !== 'in_review' && (
            <Button variant="outline" disabled={saving} onClick={() => updateStatus('in_review')} className="inline-flex items-center gap-2">
              <Eye className="w-4 h-4" /> Move to In Review
            </Button>
          )}
          {story.status !== 'approved' && (
            <Button variant="outline" disabled={saving} onClick={() => updateStatus('approved')} className="inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Approve
            </Button>
          )}
          {story.status !== 'published' ? (
            <Button disabled={saving} onClick={() => updateStatus('published')} className="inline-flex items-center gap-2">
              <Eye className="w-4 h-4" /> Publish
            </Button>
          ) : (
            <Button variant="outline" disabled={saving} onClick={() => updateStatus('approved')} className="inline-flex items-center gap-2">
              <EyeOff className="w-4 h-4" /> Unpublish
            </Button>
          )}
        </div>
      </div>

      {/* Submitter */}
      <div className="bg-white rounded-lg border p-4">
        <div className="text-sm text-gray-600">
          <div><strong>Submitted by:</strong> {story.anonymous ? 'Anonymous' : (story.submitterName || 'Unknown')}</div>
          {story.submitterEmail && <div><strong>Email:</strong> {story.submitterEmail}</div>}
          <div><strong>Tags:</strong> {(story.tags || []).join(', ') || '—'}</div>
          <div><strong>Created:</strong> {new Date(story.createdAt).toLocaleString()}</div>
          {story.publishedAt && <div><strong>Published:</strong> {new Date(story.publishedAt).toLocaleString()}</div>}
        </div>
      </div>

      {/* Content */}
      {story.text && (
        <div className="bg-white rounded-lg border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Story Text</h2>
          <p className="whitespace-pre-wrap text-gray-800">{story.text}</p>
        </div>
      )}

      {/* Media */}
      {allMedia.length > 0 && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Media</h2>
          <div className="space-y-6">
            {allMedia.map(renderMedia)}
          </div>
        </div>
      )}
    </div>
  );
}


