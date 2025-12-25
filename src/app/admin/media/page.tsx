'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload,
  Search,
  Image as ImageIcon,
  FileText,
  Film,
  Trash2,
  Copy,
  Edit,
  Loader2,
  Check,
} from 'lucide-react';

interface MediaAsset {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  folder: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch assets
  const fetchAssets = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'blog');

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const asset = await res.json();
          setAssets((prev) => [asset, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Copy URL to clipboard
  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  // Delete asset
  const deleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        setSelectedAsset(null);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Save asset metadata
  const saveAsset = async () => {
    if (!editingAsset) return;

    try {
      const res = await fetch(`/api/media/${editingAsset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          altText: editingAsset.altText,
          caption: editingAsset.caption,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setEditingAsset(null);
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Film;
    return FileText;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Upload and manage images, videos, and documents.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild disabled={uploading}>
            <label className="cursor-pointer">
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload Files
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAssets(searchQuery);
            }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by filename or alt text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Assets ({assets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : assets.length === 0 ? (
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No media files yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Upload images to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {assets.map((asset) => {
                const Icon = getIcon(asset.mimeType);

                return (
                  <div
                    key={asset.id}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border hover:ring-2 hover:ring-ce-primary"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {asset.mimeType.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.url}
                        alt={asset.altText || asset.fileName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <Icon className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-xs text-white">{asset.fileName}</p>
                      <p className="text-[10px] text-white/70">{formatSize(asset.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-2xl">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAsset.fileName}</DialogTitle>
                <DialogDescription>
                  {formatSize(selectedAsset.size)} •{' '}
                  {selectedAsset.width && selectedAsset.height
                    ? `${selectedAsset.width}×${selectedAsset.height}`
                    : selectedAsset.mimeType}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedAsset.mimeType.startsWith('image/') && (
                  <div className="overflow-hidden rounded-lg bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedAsset.url}
                      alt={selectedAsset.altText || ''}
                      className="mx-auto max-h-[300px]"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Input value={selectedAsset.url} readOnly className="flex-1 font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyUrl(selectedAsset.url)}>
                    {copied === selectedAsset.url ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Alt Text</Label>
                    <p>{selectedAsset.altText || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Caption</Label>
                    <p>{selectedAsset.caption || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Folder</Label>
                    <p>{selectedAsset.folder}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Uploaded</Label>
                    <p>{new Date(selectedAsset.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="destructive" onClick={() => deleteAsset(selectedAsset.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingAsset(selectedAsset);
                    setSelectedAsset(null);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
        <DialogContent>
          {editingAsset && (
            <>
              <DialogHeader>
                <DialogTitle>Edit {editingAsset.fileName}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="altText">Alt Text</Label>
                  <Input
                    id="altText"
                    value={editingAsset.altText || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, altText: e.target.value })}
                    placeholder="Describe the image..."
                  />
                </div>
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    value={editingAsset.caption || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, caption: e.target.value })}
                    placeholder="Caption to display..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingAsset(null)}>
                  Cancel
                </Button>
                <Button onClick={saveAsset}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
