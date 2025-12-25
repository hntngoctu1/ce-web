'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Loader2, Upload } from 'lucide-react';

export interface MediaAsset {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
  createdAt: string;
}

interface MediaLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: MediaAsset) => void;
}

export function MediaLibraryDialog({ open, onOpenChange, onSelect }: MediaLibraryDialogProps) {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/media');
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      } else {
        setError(data.error || 'Failed to load media');
      }
    } catch (err) {
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  const handleUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) => [data, ...prev]);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="media-upload">Upload image</Label>
                <Input
                  id="media-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP. Max 15MB.</p>
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button variant="outline" size="sm" onClick={fetchMedia} disabled={loading}>
                <Upload className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardContent>
          </Card>

          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-medium">Library</div>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              )}
            </div>
            <ScrollArea className="h-[420px]">
              {items.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="mb-2 h-10 w-10" />
                  <p>No media yet. Upload to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-4">
                  {items.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className="group relative overflow-hidden rounded-lg border focus:outline-none focus:ring-2 focus:ring-ce-primary"
                      onClick={() => onSelect(asset)}
                    >
                      <div className="aspect-video bg-slate-100">
                        <img
                          src={asset.url}
                          alt={asset.altText || asset.fileName}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 text-xs">
                        <span className="line-clamp-1">{asset.fileName}</span>
                        <Badge variant="secondary">{Math.round(asset.size / 1024)} KB</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
