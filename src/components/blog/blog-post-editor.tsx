'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TiptapEditor } from './tiptap-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Clock,
  Calendar,
  Star,
  ImageIcon,
  FileText,
  ChevronRight,
  History,
  Globe,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { MediaLibraryDialog, MediaAsset } from './media-library-dialog';

interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleVi: string;
  excerptEn: string | null;
  excerptVi: string | null;
  contentEn: string | null;
  contentVi: string | null;
  coverImage: string | null;
  status: string;
  visibility: string;
  isFeatured: boolean;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  wordCount: number | null;
  readTimeMin: number | null;
  categoryId: string | null;
  category: { id: string; nameEn: string } | null;
  author: { id: string; name: string | null } | null;
  coverMedia: { id: string; url: string } | null;
  translations: Array<{
    id: string;
    locale: string;
    title: string;
    slug: string;
    excerpt: string | null;
    contentJson: string | null;
    contentHtml: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
  }>;
  revisions: Array<{
    id: string;
    locale: string;
    title: string | null;
    message: string | null;
    createdAt: Date;
  }>;
}

interface Category {
  id: string;
  nameEn: string;
  nameVi: string;
  slug: string;
}

interface BlogPostEditorProps {
  post: BlogPost | null;
  categories: Category[];
  isNew: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  REVIEW: { label: 'Review', color: 'bg-amber-100 text-amber-700' },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  PUBLISHED: { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-100 text-gray-600' },
};

export function BlogPostEditor({ post, categories, isNew }: BlogPostEditorProps) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<'en' | 'vi'>('en');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState<
    Array<{
      id: string;
      locale: string;
      title: string | null;
      excerpt: string | null;
      snapshotJson: string | null;
      snapshotHtml: string | null;
      message: string | null;
      createdAt: string;
    }>
  >([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const autosaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    titleEn: post?.titleEn || '',
    titleVi: post?.titleVi || '',
    slug: post?.slug || '',
    excerptEn: post?.excerptEn || '',
    excerptVi: post?.excerptVi || '',
    contentJsonEn:
      post?.translations.find((t) => t.locale === 'en')?.contentJson || post?.contentEn || '',
    contentHtmlEn: post?.translations.find((t) => t.locale === 'en')?.contentHtml || '',
    contentJsonVi:
      post?.translations.find((t) => t.locale === 'vi')?.contentJson || post?.contentVi || '',
    contentHtmlVi: post?.translations.find((t) => t.locale === 'vi')?.contentHtml || '',
    categoryId: post?.categoryId || '',
    isFeatured: post?.isFeatured || false,
    visibility: post?.visibility || 'PUBLIC',
    coverImageId: post?.coverMedia?.id || null,
    coverImageUrl: post?.coverMedia?.url || post?.coverImage || '',
    seoTitleEn: post?.translations.find((t) => t.locale === 'en')?.seoTitle || '',
    seoDescriptionEn: post?.translations.find((t) => t.locale === 'en')?.seoDescription || '',
    seoTitleVi: post?.translations.find((t) => t.locale === 'vi')?.seoTitle || '',
    seoDescriptionVi: post?.translations.find((t) => t.locale === 'vi')?.seoDescription || '',
    scheduledAt: post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
  });

  const [status, setStatus] = useState(post?.status || 'DRAFT');
  const [wordCount, setWordCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (isNew && formData.titleEn && !formData.slug) {
      const slug = formData.titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.titleEn, isNew, formData.slug]);

  // Autosave
  useEffect(() => {
    if (!hasChanges || isNew) return;

    if (autosaveTimeout.current) {
      clearTimeout(autosaveTimeout.current);
    }

    autosaveTimeout.current = setTimeout(() => {
      handleSave(true);
    }, 15000); // 15 seconds

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [hasChanges, formData]);

  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleContentChange = useCallback((locale: 'en' | 'vi', json: string, html: string) => {
    if (locale === 'en') {
      setFormData((prev) => ({
        ...prev,
        contentJsonEn: json,
        contentHtmlEn: html,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        contentJsonVi: json,
        contentHtmlVi: html,
      }));
    }
    setHasChanges(true);

    // Update word count
    const text = html.replace(/<[^>]*>/g, '');
    setWordCount(text.split(/\s+/).filter(Boolean).length);
  }, []);

  const handleSelectMedia = useCallback((asset: MediaAsset) => {
    setFormData((prev) => ({
      ...prev,
      coverImageUrl: asset.url,
      coverImageId: asset.id,
    }));
    setShowMediaLibrary(false);
    setHasChanges(true);
  }, []);

  const handleSyncEnToVi = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      titleVi: prev.titleEn,
      excerptVi: prev.excerptEn,
      contentJsonVi: prev.contentJsonEn,
      contentHtmlVi: prev.contentHtmlEn,
      seoTitleVi: prev.seoTitleEn,
      seoDescriptionVi: prev.seoDescriptionEn,
    }));
    const text = (formData.contentHtmlEn || '').replace(/<[^>]*>/g, '');
    setWordCount(text.split(/\s+/).filter(Boolean).length);
    setHasChanges(true);
  }, [
    formData.contentHtmlEn,
    formData.excerptEn,
    formData.seoDescriptionEn,
    formData.seoTitleEn,
    formData.titleEn,
  ]);

  const handleSave = async (isAutosave = false) => {
    try {
      setSaving(true);

      const payload = {
        titleEn: formData.titleEn,
        titleVi: formData.titleVi || formData.titleEn,
        slug: formData.slug,
        excerptEn: formData.excerptEn,
        excerptVi: formData.excerptVi,
        contentEn: formData.contentHtmlEn, // Store HTML in legacy field
        contentVi: formData.contentHtmlVi,
        categoryId: formData.categoryId || null,
        isFeatured: formData.isFeatured,
        visibility: formData.visibility,
        coverImageId: formData.coverImageId || null,
        coverImage: formData.coverImageUrl,
        wordCount,
        readTimeMin: Math.ceil(wordCount / 200),
        translations: [
          {
            locale: 'en',
            title: formData.titleEn,
            slug: formData.slug,
            excerpt: formData.excerptEn,
            contentJson: formData.contentJsonEn,
            contentHtml: formData.contentHtmlEn,
            seoTitle: formData.seoTitleEn,
            seoDescription: formData.seoDescriptionEn,
          },
          {
            locale: 'vi',
            title: formData.titleVi || formData.titleEn,
            slug: `${formData.slug}-vi`,
            excerpt: formData.excerptVi || formData.excerptEn,
            contentJson: formData.contentJsonVi,
            contentHtml: formData.contentHtmlVi,
            seoTitle: formData.seoTitleVi,
            seoDescription: formData.seoDescriptionVi,
          },
        ],
      };

      let result;

      if (isNew) {
        const res = await fetch('/api/blog/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        result = await res.json();
        if (res.ok) {
          router.replace(`/admin/blog/${result.id}`);
        }
      } else {
        const res = await fetch(`/api/blog/posts/${post?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        result = await res.json();

        // Create revision for history (autosave/manual)
        if (res.ok && post?.id) {
          await fetch(`/api/blog/posts/${post?.id}/revisions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              locale: activeLocale,
              title: activeLocale === 'en' ? formData.titleEn : formData.titleVi,
              excerpt: activeLocale === 'en' ? formData.excerptEn : formData.excerptVi,
              contentJson: activeLocale === 'en' ? formData.contentJsonEn : formData.contentJsonVi,
              contentHtml: activeLocale === 'en' ? formData.contentHtmlEn : formData.contentHtmlVi,
              message: isAutosave ? 'Autosave' : 'Manual save',
            }),
          });
        }
      }

      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);

      // First save
      await handleSave();

      // Then publish
      const res = await fetch(`/api/blog/posts/${post?.id}/publish`, {
        method: 'POST',
      });

      if (res.ok) {
        setStatus('PUBLISHED');
        router.refresh();
      }
    } catch (error) {
      console.error('Error publishing:', error);
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!formData.scheduledAt) return;

    try {
      await handleSave();

      const res = await fetch(`/api/blog/posts/${post?.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: formData.scheduledAt }),
      });

      if (res.ok) {
        setStatus('SCHEDULED');
        setShowScheduleDialog(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error scheduling:', error);
    }
  };

  const statusInfo = statusConfig[status] || statusConfig.DRAFT;

  useEffect(() => {
    if (!showRevisions || !post?.id) return;
    const fetchRevisions = async () => {
      setRevisionsLoading(true);
      try {
        const res = await fetch(`/api/blog/posts/${post.id}/revisions?locale=${activeLocale}`);
        const data = await res.json();
        if (res.ok) {
          setRevisions(data || []);
        }
      } finally {
        setRevisionsLoading(false);
      }
    };
    fetchRevisions();
  }, [showRevisions, post?.id, activeLocale]);

  const handleRestoreRevision = useCallback(
    (rev: {
      locale: string;
      title: string | null;
      excerpt: string | null;
      snapshotJson: string | null;
      snapshotHtml: string | null;
    }) => {
      const html = rev.snapshotHtml || '';
      const json = rev.snapshotJson || '';
      if (rev.locale === 'en') {
        setFormData((prev) => ({
          ...prev,
          titleEn: rev.title || prev.titleEn,
          excerptEn: rev.excerpt || prev.excerptEn,
          contentJsonEn: json,
          contentHtmlEn: html,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          titleVi: rev.title || prev.titleVi,
          excerptVi: rev.excerpt || prev.excerptVi,
          contentJsonVi: json,
          contentHtmlVi: html,
        }));
      }
      const text = html.replace(/<[^>]*>/g, '');
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      setHasChanges(true);
      setShowRevisions(false);
    },
    []
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/blog">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              {hasChanges && <span className="text-xs text-amber-600">Unsaved changes</span>}
              {lastSaved && !hasChanges && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isNew && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/blog/${post?.id}/preview`} target="_blank">
                  <Eye className="mr-1 h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleSave()} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              Save Draft
            </Button>
            {!isNew && status !== 'PUBLISHED' && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowScheduleDialog(true)}>
                  <Calendar className="mr-1 h-4 w-4" />
                  Schedule
                </Button>
                <Button size="sm" onClick={handlePublish} disabled={publishing}>
                  {publishing ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-1 h-4 w-4" />
                  )}
                  Publish
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Editor - Left Side */}
          <div className="space-y-6 lg:col-span-2">
            {/* Language Tabs */}
            <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as 'en' | 'vi')}>
              <div className="mb-4 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="en" className="gap-2">
                    <Globe className="h-4 w-4" />
                    English
                  </TabsTrigger>
                  <TabsTrigger value="vi" className="gap-2">
                    <Globe className="h-4 w-4" />
                    Tiếng Việt
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" onClick={handleSyncEnToVi}>
                  Sync EN → VI
                </Button>
              </div>

              <TabsContent value="en" className="space-y-4">
                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <Label htmlFor="titleEn">Title</Label>
                      <Input
                        id="titleEn"
                        value={formData.titleEn}
                        onChange={(e) => updateField('titleEn', e.target.value)}
                        placeholder="Enter post title..."
                        className="h-12 text-xl font-semibold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground">/blog/</span>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => updateField('slug', e.target.value)}
                          placeholder="post-slug"
                          className="ml-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="excerptEn">Excerpt</Label>
                      <Textarea
                        id="excerptEn"
                        value={formData.excerptEn}
                        onChange={(e) => updateField('excerptEn', e.target.value)}
                        placeholder="Brief summary of the post..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TiptapEditor
                      content={formData.contentJsonEn}
                      onChange={(json, html) => handleContentChange('en', json, html)}
                      placeholder="Start writing your article..."
                      onSave={() => handleSave()}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vi" className="space-y-4">
                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <Label htmlFor="titleVi">Tiêu đề</Label>
                      <Input
                        id="titleVi"
                        value={formData.titleVi}
                        onChange={(e) => updateField('titleVi', e.target.value)}
                        placeholder="Nhập tiêu đề bài viết..."
                        className="h-12 text-xl font-semibold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="excerptVi">Tóm tắt</Label>
                      <Textarea
                        id="excerptVi"
                        value={formData.excerptVi}
                        onChange={(e) => updateField('excerptVi', e.target.value)}
                        placeholder="Tóm tắt ngắn gọn về bài viết..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Nội dung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TiptapEditor
                      content={formData.contentJsonVi}
                      onChange={(json, html) => handleContentChange('vi', json, html)}
                      placeholder="Bắt đầu viết bài..."
                      onSave={() => handleSave()}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Post Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge className={statusInfo.color + ' px-3 py-1 text-sm'}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(v) => updateField('visibility', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId || '__none__'}
                    onValueChange={(v) => updateField('categoryId', v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.isFeatured}
                    onChange={(e) => updateField('isFeatured', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="featured" className="flex cursor-pointer items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    Featured Post
                  </Label>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Word count:</span>
                      <span className="font-medium">{wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Read time:</span>
                      <span className="font-medium">{Math.ceil(wordCount / 200)} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Cover Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setShowMediaLibrary(true)}
                  >
                    <ImageIcon className="mr-1 h-4 w-4" />
                    Choose from library
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Use media library to keep assets consistent.
                  </span>
                </div>
                {formData.coverImageUrl ? (
                  <div className="group relative">
                    <img
                      src={formData.coverImageUrl}
                      alt="Cover"
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => {
                        updateField('coverImageUrl', '');
                        updateField('coverImageId', null);
                      }}
                    >
                      Remove
                    </Button>
                    {formData.coverImageId && (
                      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
                        Asset ID: {formData.coverImageId.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed p-8 text-center">
                    <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="mb-3 text-sm text-muted-foreground">No cover image</p>
                    <Input
                      placeholder="Enter image URL"
                      onChange={(e) => updateField('coverImageUrl', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeLocale}>
                  <TabsContent value="en" className="mt-0 space-y-4">
                    <div>
                      <Label htmlFor="seoTitleEn">SEO Title</Label>
                      <Input
                        id="seoTitleEn"
                        value={formData.seoTitleEn}
                        onChange={(e) => updateField('seoTitleEn', e.target.value)}
                        placeholder={formData.titleEn || 'SEO title...'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="seoDescriptionEn">Meta Description</Label>
                      <Textarea
                        id="seoDescriptionEn"
                        value={formData.seoDescriptionEn}
                        onChange={(e) => updateField('seoDescriptionEn', e.target.value)}
                        placeholder="Meta description for search engines..."
                        rows={3}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formData.seoDescriptionEn.length}/160 characters
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="vi" className="mt-0 space-y-4">
                    <div>
                      <Label htmlFor="seoTitleVi">SEO Title (VI)</Label>
                      <Input
                        id="seoTitleVi"
                        value={formData.seoTitleVi}
                        onChange={(e) => updateField('seoTitleVi', e.target.value)}
                        placeholder={formData.titleVi || 'Tiêu đề SEO...'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="seoDescriptionVi">Meta Description (VI)</Label>
                      <Textarea
                        id="seoDescriptionVi"
                        value={formData.seoDescriptionVi}
                        onChange={(e) => updateField('seoDescriptionVi', e.target.value)}
                        placeholder="Mô tả meta cho công cụ tìm kiếm..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Version History */}
            {!isNew && post?.revisions && post.revisions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Recent Revisions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {post.revisions.slice(0, 5).map((rev) => (
                      <div
                        key={rev.id}
                        className="flex items-center justify-between border-b py-2 text-sm last:border-0"
                      >
                        <div>
                          <span className="font-medium">{rev.message}</span>
                          <span className="ml-2 text-muted-foreground">
                            ({rev.locale.toUpperCase()})
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rev.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setShowRevisions(true)}
                  >
                    View all revisions
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <MediaLibraryDialog
        open={showMediaLibrary}
        onOpenChange={setShowMediaLibrary}
        onSelect={handleSelectMedia}
      />

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Publication</DialogTitle>
            <DialogDescription>
              Choose when this post should be automatically published.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="scheduleDate">Publish Date & Time</Label>
            <Input
              id="scheduleDate"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => updateField('scheduledAt', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revisions Dialog */}
      <Dialog open={showRevisions} onOpenChange={setShowRevisions}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Version history ({activeLocale.toUpperCase()})</DialogTitle>
            <DialogDescription>
              Autosave and manual snapshots. Restore to replace current form content.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 max-h-[60vh] space-y-3 overflow-y-auto">
            {revisionsLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading revisions...
              </div>
            )}
            {!revisionsLoading && revisions.length === 0 && (
              <div className="text-sm text-muted-foreground">No revisions yet.</div>
            )}
            {!revisionsLoading &&
              revisions.map((rev) => (
                <div key={rev.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-medium">{rev.message || 'Revision'}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRestoreRevision(rev)}>
                      Restore
                    </Button>
                  </div>
                  {rev.title && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Title:</span> {rev.title}
                    </div>
                  )}
                  {rev.excerpt && (
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {rev.excerpt}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
