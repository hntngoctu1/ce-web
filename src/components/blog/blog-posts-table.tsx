'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogBulkActions } from './blog-bulk-actions';
import {
  FileText,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  Archive,
  Calendar,
  Star,
  Plus,
} from 'lucide-react';

interface Post {
  id: string;
  slug: string;
  titleEn: string;
  titleVi: string;
  status: string;
  isFeatured: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  viewCount: number;
  category: { id: string; nameEn: string } | null;
  author: { id: string; name: string | null } | null;
  coverMedia: { url: string } | null;
  _count: { revisions: number };
}

interface BlogPostsTableProps {
  posts: Post[];
  total: number;
  totalPages: number;
  currentPage: number;
  params: Record<string, string | undefined>;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  REVIEW: { label: 'Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  PUBLISHED: { label: 'Published', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive },
};

export function BlogPostsTable({
  posts,
  total,
  totalPages,
  currentPage,
  params,
}: BlogPostsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = posts.length > 0 && selectedIds.length === posts.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < posts.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map((p) => p.id));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    const merged = { ...params, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v);
    }
    return qs.toString();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Posts ({total})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="w-8 px-3 py-3 font-medium">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-3 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Author</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 text-right font-medium">Views</th>
                  <th className="px-3 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const status = statusConfig[post.status] || statusConfig.DRAFT;
                  const isSelected = selectedIds.includes(post.id);

                  return (
                    <tr
                      key={post.id}
                      className={`border-b last:border-0 hover:bg-slate-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={isSelected}
                          onChange={() => toggleSelect(post.id)}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-3">
                          {post.coverMedia?.url ? (
                            <img
                              src={post.coverMedia.url}
                              alt=""
                              className="h-12 w-12 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100">
                              <FileText className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 font-medium">
                              {post.titleEn}
                              {post.isFeatured && (
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              )}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                              /{post.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={status.color}>
                          <status.icon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        {post.category ? (
                          <Badge variant="outline">{post.category.nameEn}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {post.author?.name || 'Unknown'}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {post.publishedAt ? (
                          <div>
                            <div>Published</div>
                            <div>{formatDate(new Date(post.publishedAt))}</div>
                          </div>
                        ) : post.scheduledAt ? (
                          <div>
                            <div className="text-blue-600">Scheduled</div>
                            <div>{formatDate(new Date(post.scheduledAt))}</div>
                          </div>
                        ) : (
                          <div>
                            <div>Created</div>
                            <div>{formatDate(new Date(post.createdAt))}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right text-muted-foreground">
                        {post.viewCount.toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/blog/${post.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {post.status === 'PUBLISHED' && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/blog/${post.slug}`} target="_blank">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-12 text-center">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {params.q || params.status || params.category
                          ? 'No posts match your filters.'
                          : 'No posts yet. Create your first blog post!'}
                      </p>
                      <div className="mt-4">
                        <Button asChild>
                          <Link href="/admin/blog/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Post
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, total)} of{' '}
                {total}
              </p>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`?${buildQuery({ page: String(currentPage - 1) })}`}>Previous</Link>
                  </Button>
                )}
                {currentPage < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`?${buildQuery({ page: String(currentPage + 1) })}`}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      <BlogBulkActions selectedIds={selectedIds} onClear={() => setSelectedIds([])} />
    </>
  );
}
