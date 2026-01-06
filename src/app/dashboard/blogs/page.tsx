"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Dropzone } from "@/components/ui/dropzone";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Trash2,
  Pencil,
  Plus,
  FileText,
  Eye,
  EyeOff,
  Search,
  X,
  Upload
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchAdminBlogs(page = 1, limit = 10) {
  const res = await fetch(`/api/admin/blogs?page=${page}&limit=${limit}`);
  if (!res.ok) throw await res.json();
  return res.json();
}

async function createBlog(payload: Partial<Blog>) {
  const res = await fetch("/api/blogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function updateBlog(id: string, payload: Partial<Blog>) {
  const res = await fetch(`/api/blogs/by-id/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function deleteBlog(id: string) {
  const res = await fetch(`/api/blogs/by-id/${id}`, { method: "DELETE" });
  if (!res.ok) throw await res.json();
  return res.json();
}

const emptyForm: Partial<Blog> = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "",
  published: false,
};

// Custom Modal Component
function Modal({ isOpen, onClose, title, description, children }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {description && <p className="text-slate-400 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
  const [form, setForm] = useState<Partial<Blog>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editConfirm, setEditConfirm] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminBlogs", page],
    queryFn: () => fetchAdminBlogs(page, 10),
    staleTime: 60_000,
  });

  const createMut = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminBlogs"] });
      setForm(emptyForm);
      setIsModalOpen(false);
      toast.success("Blog created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create blog");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Blog> }) => updateBlog(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminBlogs"] });
      setEditingId(null);
      setForm(emptyForm);
      setIsModalOpen(false);
      toast.success("Blog updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update blog");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminBlogs"] });
      setDeleteConfirm(null);
      toast.success("Blog deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete blog");
    },
  });

  const blogs: Blog[] = data?.data?.blogs ?? [];
  const pagination = data?.data?.pagination;

  const filteredBlogs = blogs.filter(blog => {
    const matchesTab =
      activeTab === "all" ? true :
        activeTab === "published" ? blog.published :
          !blog.published;

    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleSubmit = () => {
    if (!form.title || !form.category || !form.excerpt || !form.content) {
      alert("Please fill all required fields");
      return;
    }

    if (editingId) {
      updateMut.mutate({ id: editingId, payload: form });
    } else {
      createMut.mutate(form);
    }
  };

  const handleFileChange = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setFilePreview(URL.createObjectURL(file));
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/blogs/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          toast.error('Upload failed');
          throw new Error('Upload failed');
        }

        const { url } = await res.json();
        setForm((f) => ({ ...f, coverImage: url }));
        toast.success("Image uploaded successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Image upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleEditClick = (blog: Blog) => {
    setEditConfirm(blog);
  };

  const confirmEdit = () => {
    if (editConfirm) {
      setEditingId(editConfirm.id);
      setForm({
        title: editConfirm.title,
        excerpt: editConfirm.excerpt,
        content: editConfirm.content,
        coverImage: editConfirm.coverImage,
        category: editConfirm.category,
        published: editConfirm.published,
      });
      setIsModalOpen(true);
      setEditConfirm(null);
      setFilePreview(null);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
    setFilePreview(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFilePreview(null);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMut.mutate(deleteConfirm);
    }
  };

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.published).length,
    draft: blogs.filter(b => !b.published).length,
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
            Blog Management
          </h1>
          <p className="text-slate-400">Create, edit, and manage your blog posts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Blogs</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Published</p>
                <p className="text-3xl font-bold">{stats.published}</p>
              </div>
              <Eye className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Drafts</p>
                <p className="text-3xl font-bold">{stats.draft}</p>
              </div>
              <EyeOff className="w-10 h-10 text-amber-400 opacity-50" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Create Blog
            </button>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "all"
                ? "bg-blue-500/10 text-blue-400 border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
            >
              All Blogs ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "published"
                ? "bg-green-500/10 text-green-400 border-b-2 border-green-500"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
            >
              Published ({stats.published})
            </button>
            <button
              onClick={() => setActiveTab("draft")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "draft"
                ? "bg-amber-500/10 text-amber-400 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
            >
              Drafts ({stats.draft})
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-slate-400 text-sm border-b border-slate-800">
                      <th className="text-left py-3 px-4 font-medium">Title</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((index) => (
                      <tr key={index} className="border-b border-slate-800/50 animate-pulse">
                        <td className="py-4 px-4">
                          <div className="h-5 w-48 bg-slate-700 rounded mb-2"></div>
                          <div className="h-3 w-32 bg-slate-800 rounded"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-6 w-20 bg-slate-700 rounded"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-6 w-24 bg-slate-700 rounded"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-8 w-16 bg-slate-700 rounded-lg"></div>
                            <div className="h-8 w-20 bg-slate-700 rounded-lg"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                  {(error as any)?.error || 'Failed to load blogs'}
                </div>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No blogs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-slate-400 text-sm border-b border-slate-800">
                      <th className="text-left py-3 px-4 font-medium">Title</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs.map((blog) => (
                      <tr key={blog.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-white">{blog.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{blog.slug}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">
                            {blog.category}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {blog.published ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-md border border-green-500/20">
                              <Eye className="w-3 h-3" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-md border border-amber-500/20">
                              <EyeOff className="w-3 h-3" />
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(blog)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800">
                <div className="text-sm text-slate-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Blog" : "Create New Blog"}
        description={editingId ? "Update your blog post details" : "Fill in the details to create a new blog post"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg text-white placeholder:text-slate-500 outline-none transition-colors"
                placeholder="Enter blog title"
                value={form.title || ""}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image</label>
              <Dropzone
                onFiles={handleFileChange}
                accept="image/png, image/jpeg"
                className="h-48"
                disabled={uploading}
              >
                {filePreview ? (
                  <div className="relative w-full h-full">
                    <Image src={filePreview} alt="Preview" fill style={{ objectFit: "cover" }} className="rounded-lg" />
                    {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}
                  </div>
                ) : form.coverImage ? (
                  <div className="relative w-full h-full">
                    <Image src={form.coverImage} alt="Cover" fill style={{ objectFit: "cover" }} className="rounded-lg" />
                  </div>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center justify-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-400">Drag & drop an image, or click to select</p>
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </Dropzone>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg text-white placeholder:text-slate-500 outline-none transition-colors"
                placeholder="e.g., Technology"
                value={form.category || ""}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Excerpt *</label>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg text-white placeholder:text-slate-500 outline-none transition-colors resize-none"
                placeholder="Brief description of the blog post"
                rows={3}
                value={form.excerpt || ""}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Content *</label>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg text-white placeholder:text-slate-500 outline-none transition-colors resize-none"
                placeholder="Full blog content (supports markdown)"
                rows={8}
                value={form.content || ""}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-slate-300">Publish immediately</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMut.isPending || updateMut.isPending}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {createMut.isPending || updateMut.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                editingId ? "Update Blog" : "Create Blog"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Confirmation Dialog */}
      <AlertDialog open={!!editConfirm} onOpenChange={() => setEditConfirm(null)}>
        <AlertDialogContent className="bg-slate-900 border border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Blog Post</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to edit "{editConfirm?.title}"?
              <br />
              <div className="mt-2 text-sm text-slate-300">
                <strong>Description:</strong> {editConfirm?.excerpt}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEdit}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-900 border border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete this blog post? This action cannot be undone and will permanently remove the blog from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {deleteMut.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}