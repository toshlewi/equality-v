"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Volume2, 
  File,
  Check,
  AlertCircle
} from "lucide-react";

// Form validation schema
const storySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  content: z.string().min(50, "Story must be at least 50 characters").max(10000, "Story must be less than 10,000 characters"),
  submitterName: z.string().optional(),
  submitterEmail: z.string().email("Please enter a valid email address").optional(),
  submitterPhone: z.string().optional(),
  anonymous: z.boolean().default(false),
  // Accept either a CSV string from the input or an array
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  consentToPublish: z.boolean().refine(val => val === true, "You must consent to publish your story"),
  contentRights: z.boolean().refine(val => val === true, "You must confirm you own the content rights"),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions")
});

type StoryFormData = z.infer<typeof storySchema>;

interface FileUpload {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio' | 'pdf';
  preview?: string;
  size: number;
}

export default function TellYourStorySection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema) as any,
    defaultValues: {
      anonymous: false,
      consentToPublish: false,
      contentRights: false,
      termsAccepted: false
    }
  });

  const isAnonymous = watch('anonymous');

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const fileType = getFileType(file.type);
      if (!fileType) {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }

      if (file.size > getMaxFileSize(fileType)) {
        alert(`File too large: ${file.name}. Maximum size is ${getMaxFileSize(fileType) / (1024 * 1024)}MB`);
        return;
      }

      const fileUpload: FileUpload = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: fileType,
        size: file.size,
        preview: fileType === 'image' ? URL.createObjectURL(file) : undefined
      };

      setUploadedFiles(prev => [...prev, fileUpload]);
    });
  };

  const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'pdf' | null => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    return null;
  };

  const getMaxFileSize = (type: string): number => {
    switch (type) {
      case 'image': return 5 * 1024 * 1024; // 5MB
      case 'video': return 200 * 1024 * 1024; // 200MB
      case 'audio': return 50 * 1024 * 1024; // 50MB
      case 'pdf': return 20 * 1024 * 1024; // 20MB
      default: return 5 * 1024 * 1024;
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const onSubmit = async (data: StoryFormData) => {
    setIsSubmitting(true);
    try {
      // Step 1: Upload files if any
      let uploaded: { name: string; url: string; type: string; size: number; thumbnailUrl?: string }[] = [];
      if (uploadedFiles.length > 0) {
        const uploadPromises = uploadedFiles.map(async (fileUpload) => {
          const formData = new FormData();
          formData.append('files', fileUpload.file);

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) throw new Error('File upload failed');

          const uploadResult = await uploadRes.json();
          if (Array.isArray(uploadResult) && uploadResult.length > 0) {
            const uploaded = uploadResult[0];
            return {
              name: uploaded.name,
              url: uploaded.url,
              type: uploaded.type,
              size: uploaded.size,
              thumbnailUrl: fileUpload.type === 'image' ? uploaded.url : undefined,
            };
          }
          return null;
        });

        const results = await Promise.all(uploadPromises);
        uploaded = results
          .filter((f): f is NonNullable<typeof f> => f !== null)
          .map((f) => ({
            name: String(f.name || ''),
            url: String(f.url || ''),
            type: String(f.type || ''),
            size: typeof f.size === 'number' ? f.size : 0,
            thumbnailUrl: f.thumbnailUrl ? String(f.thumbnailUrl) : undefined,
          }));
      }

      // Step 2: Submit story to API
      const tagsArray = data.tags 
        ? (typeof data.tags === 'string' ? data.tags.split(',').map(t=>t.trim()).filter(Boolean) : Array.isArray(data.tags) ? data.tags : [])
        : [];

      const payload: any = {
        title: data.title,
        content: data.content,
        anonymous: data.anonymous,
        tags: tagsArray,
        consentToPublish: data.consentToPublish,
        contentRights: data.contentRights,
        termsAccepted: data.termsAccepted,
      };

      // Only include submitter info if not anonymous
      if (!data.anonymous) {
        if (data.submitterName) payload.submitterName = data.submitterName;
        if (data.submitterEmail) payload.submitterEmail = data.submitterEmail;
      }
      
      if (data.submitterPhone) payload.submitterPhone = data.submitterPhone;

      // Only include mediaFiles if there are uploaded files
      if (uploaded.length > 0) {
        payload.mediaFiles = uploaded.map(u => ({
          filename: u.name,
          originalName: u.name,
          mimeType: u.type,
          fileSize: u.size,
          url: u.url,
          thumbnailUrl: u.thumbnailUrl,
          mediaType: u.type.startsWith('image/') ? 'image' as const :
                     u.type.startsWith('video/') ? 'video' as const :
                     u.type.startsWith('audio/') ? 'audio' as const : 'pdf' as const,
        }));
      }

      console.log('Submitting story payload:', { ...payload, mediaFiles: payload.mediaFiles?.length || 0 });

      const submitRes = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const submitJson = await submitRes.json();

      if (!submitRes.ok || !submitJson.success) {
        // Format validation errors for display
        if (submitJson.details && Array.isArray(submitJson.details)) {
          const errorMessages = submitJson.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ');
          throw new Error(errorMessages || submitJson.error || 'Submission failed');
        }
        throw new Error(submitJson.error || 'Submission failed');
      }

      setSubmitSuccess(true);
      reset();
      setUploadedFiles([]);
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(error.message || 'There was an error submitting your story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Volume2 className="w-5 h-5" />;
      case 'pdf': return <File className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (submitSuccess) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="font-fredoka text-3xl font-bold text-brand-teal mb-4">
              Thank You for Sharing Your Story!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Your story has been submitted successfully. Our team will review it and 
              may contact you if we need any additional information. We'll notify you 
              once it's published.
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="bg-brand-yellow text-brand-teal px-8 py-4 rounded-lg font-semibold transition-colors hover:bg-brand-orange hover:text-white"
            >
              Submit Another Story
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-20 pb-0 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-brand-teal mb-4">
            Tell Your Story
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your experiences, insights, and journey with our community. 
            Your story has the power to inspire, heal, and create change.
          </p>
        </motion.div>

        {/* Submission Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
            {/* Story Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Story Title *
              </label>
              <input
                {...register('title')}
                id="title"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                placeholder="Give your story a compelling title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Story Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Your Story *
              </label>
              <textarea
                {...register('content')}
                id="content"
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                placeholder="Share your story, experiences, insights, or journey. Be as detailed as you feel comfortable with."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="submitterName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name {!isAnonymous && '*'}
                </label>
                <input
                  {...register('submitterName')}
                  id="submitterName"
                  type="text"
                  disabled={isAnonymous}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent disabled:bg-gray-100"
                  placeholder={isAnonymous ? "Name will be hidden" : "Enter your name"}
                />
                {errors.submitterName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.submitterName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="submitterEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address {!isAnonymous && '*'}
                </label>
                <input
                  {...register('submitterEmail')}
                  id="submitterEmail"
                  type="email"
                  disabled={isAnonymous}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent disabled:bg-gray-100"
                  placeholder={isAnonymous ? "Email will be hidden" : "Enter your email"}
                />
                {errors.submitterEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.submitterEmail.message}
                  </p>
                )}
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                {...register('anonymous')}
                type="checkbox"
                id="anonymous"
                className="h-4 w-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                Submit anonymously (your name and email will not be published)
              </label>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="mediaFiles" className="block text-sm font-medium text-gray-700 mb-2">
                Media Files (Optional)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-brand-yellow bg-brand-yellow/10' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Images (5MB max), Videos (200MB max), Audio (50MB max), PDFs (20MB max)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-brand-yellow text-brand-teal px-6 py-2 rounded-lg font-medium hover:bg-brand-orange hover:text-white transition-colors"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  id="mediaFiles"
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-700">{file.file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <input
                {...register('tags')}
                id="tags"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                placeholder="Enter tags separated by commas (e.g., empowerment, healing, community)"
              />
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  {...register('consentToPublish')}
                  type="checkbox"
                  id="consentToPublish"
                  className="h-4 w-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded mt-1"
                />
                <label htmlFor="consentToPublish" className="ml-2 block text-sm text-gray-700">
                  I consent to have my story published on the Equality Vanguard website and social media platforms. *
                </label>
              </div>
              {errors.consentToPublish && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.consentToPublish.message}
                </p>
              )}

              <div className="flex items-start">
                <input
                  {...register('contentRights')}
                  type="checkbox"
                  id="contentRights"
                  className="h-4 w-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded mt-1"
                />
                <label htmlFor="contentRights" className="ml-2 block text-sm text-gray-700">
                  I confirm that I own the rights to all content I'm submitting and that it doesn't infringe on anyone else's rights. *
                </label>
              </div>
              {errors.contentRights && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.contentRights.message}
                </p>
              )}

              <div className="flex items-start">
                <input
                  {...register('termsAccepted')}
                  type="checkbox"
                  id="termsAccepted"
                  className="h-4 w-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded mt-1"
                />
                <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-700">
                  I have read and agree to the <a href="/terms" className="text-brand-orange hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-brand-orange hover:underline">Privacy Policy</a>. *
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.termsAccepted.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                className="bg-brand-yellow text-brand-teal px-12 py-4 rounded-lg font-semibold transition-colors hover:bg-brand-orange hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Your Story'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
