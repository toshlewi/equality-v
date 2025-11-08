"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  BookOpen, 
  Upload, 
  X, 
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

// Form validation schema
const suggestionSchema = z.object({
  title: z.string().min(1, "Book title is required").max(300, "Title must be less than 300 characters"),
  author: z.string().min(1, "Author name is required").max(200, "Author name must be less than 200 characters"),
  year: z.number().min(1800, "Year must be after 1800").max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  category: z.enum(["fiction", "non-fiction", "biography", "poetry", "academic", "children", "other"]),
  genre: z.string().optional(),
  summary: z.string().min(1, "Summary is required").max(1000, "Summary must be less than 1000 characters"),
  reason: z.string().min(1, "Reason for recommendation is required").max(500, "Reason must be less than 500 characters"),
  suggestedByName: z.string().min(1, "Your name is required"),
  suggestedByEmail: z.string().email("Valid email is required"),
  suggestedByPhone: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions")
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export default function BookSuggestionPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema)
  });

  const watchedCategory = watch("category");

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const uploadedFiles = await response.json();
        setUploadedFiles(prev => [...prev, ...uploadedFiles]);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = async (data: SuggestionFormData) => {
    setSubmitting(true);
    try {
      const suggestionData = {
        ...data,
        coverImage: uploadedFiles.find(file => file.type.startsWith('image/')),
        status: "pending"
      };

      const response = await fetch("/api/book-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(suggestionData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubmitSuccess(true);
          reset();
          setUploadedFiles([]);
        } else {
          throw new Error(result.error || "Suggestion failed");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Suggestion failed");
      }
    } catch (error) {
      console.error("Error submitting book suggestion:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      alert(`Error submitting book suggestion: ${errorMessage}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="font-fredoka text-3xl font-bold text-brand-teal mb-4">
              Suggestion Submitted!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your book suggestion! We&apos;ll review it and add it to our library 
              if it aligns with our collection criteria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/matriarchive/alkah-library"
                className="bg-brand-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Back to Library
              </Link>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="border border-brand-teal text-brand-teal px-6 py-3 rounded-lg font-semibold hover:bg-brand-teal hover:text-white transition-colors"
              >
                Suggest Another
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-brand-teal to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/matriarchive/alkah-library"
              className="inline-flex items-center space-x-2 text-blue-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to ALKAH Library</span>
            </Link>
            <h1 className="font-fredoka text-4xl md:text-5xl font-bold mb-4">
              Suggest a Book
            </h1>
            <p className="text-xl text-blue-100">
              Recommend books that should be part of our transformative collection 
              of feminist literature and Pan-African texts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Suggestion Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Book Details */}
              <div>
                <h2 className="font-fredoka text-2xl font-bold text-brand-teal mb-6">
                  Book Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Title *
                    </label>
                    <input
                      {...register("title")}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="Enter book title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author *
                    </label>
                    <input
                      {...register("author")}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="Enter author name"
                    />
                    {errors.author && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.author.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Year *
                    </label>
                    <input
                      {...register("year", { valueAsNumber: true })}
                      type="number"
                      min="1800"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="Enter publication year"
                    />
                    {errors.year && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.year.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      {...register("category")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="fiction">Fiction</option>
                      <option value="non-fiction">Non-Fiction</option>
                      <option value="biography">Biography</option>
                      <option value="poetry">Poetry</option>
                      <option value="academic">Academic</option>
                      <option value="children">Children</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre/Tags (Optional)
                  </label>
                  <input
                    {...register("genre")}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    placeholder="e.g., Feminism, African Literature, Social Justice"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary *
                  </label>
                  <textarea
                    {...register("summary")}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    placeholder="Provide a brief summary of the book"
                  />
                  {errors.summary && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.summary.message}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you recommend this book? *
                  </label>
                  <textarea
                    {...register("reason")}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    placeholder="Explain why this book would be valuable for our library"
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.reason.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <h2 className="font-fredoka text-2xl font-bold text-brand-teal mb-6">
                  Book Cover (Optional)
                </h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Upload the book cover image to help us identify the book
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="bg-brand-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                  >
                    {uploading ? "Uploading..." : "Upload Cover Image"}
                  </label>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-700 mb-3">Uploaded Files:</h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <BookOpen className="w-5 h-5 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Your Information */}
              <div>
                <h2 className="font-fredoka text-2xl font-bold text-brand-teal mb-6">
                  Your Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      {...register("suggestedByName")}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="Enter your name"
                    />
                    {errors.suggestedByName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.suggestedByName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      {...register("suggestedByEmail")}
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="Enter your email"
                    />
                    {errors.suggestedByEmail && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.suggestedByEmail.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    {...register("suggestedByPhone")}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <div className="flex items-start space-x-3">
                  <input
                    {...register("agreeToTerms")}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link href="/terms" className="text-brand-teal hover:underline">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-brand-teal hover:underline">
                      Privacy Policy
                    </Link>
                    . I confirm that I have the right to suggest this book and that the information provided is accurate.
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.agreeToTerms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/matriarchive/alkah-library"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-teal text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Suggestion"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
