'use client';

import { useState, useCallback, useRef } from 'react';
import { Camera, Video, X, Upload, Loader2, Image as ImageIcon, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  file?: File;
  url: string;
  thumbnail?: string;
  uploading?: boolean;
  error?: string;
}

interface MediaUploadProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxImages?: number;
  maxVideos?: number;
  maxFileSize?: number; // MB
  maxVideoDuration?: number; // seconds
  disabled?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export function MediaUpload({
  value,
  onChange,
  maxImages = 10,
  maxVideos = 3,
  maxFileSize = 10, // 10MB
  maxVideoDuration = 120, // 2 minutes
  disabled = false,
}: MediaUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const imageCount = value.filter((m) => m.type === 'IMAGE').length;
  const videoCount = value.filter((m) => m.type === 'VIDEO').length;

  const generateId = () => `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const validateFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return { valid: false, error: `File quá lớn. Tối đa ${maxFileSize}MB` };
    }

    // Check file type
    const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return { valid: false, error: 'Định dạng không hỗ trợ' };
    }

    // Check limits
    if (isImage && imageCount >= maxImages) {
      return { valid: false, error: `Tối đa ${maxImages} ảnh` };
    }

    if (isVideo && videoCount >= maxVideos) {
      return { valid: false, error: `Tối đa ${maxVideos} video` };
    }

    // Check video duration
    if (isVideo) {
      const duration = await getVideoDuration(file);
      if (duration > maxVideoDuration) {
        return { valid: false, error: `Video tối đa ${maxVideoDuration}s` };
      }
    }

    return { valid: true };
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const createThumbnail = async (file: File): Promise<string> => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }

    // Video thumbnail
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      video.preload = 'metadata';
      
      video.onloadeddata = () => {
        video.currentTime = 1; // Get frame at 1 second
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
        window.URL.revokeObjectURL(video.src);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'reviews');

    // Upload to API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.data.url;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newItems: MediaItem[] = [];

    for (const file of fileArray) {
      const validation = await validateFile(file);
      
      if (!validation.valid) {
        // Add with error
        newItems.push({
          id: generateId(),
          type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          file,
          url: URL.createObjectURL(file),
          error: validation.error,
        });
        continue;
      }

      const thumbnail = await createThumbnail(file);
      const item: MediaItem = {
        id: generateId(),
        type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        file,
        url: URL.createObjectURL(file),
        thumbnail,
        uploading: true,
      };

      newItems.push(item);
    }

    onChange([...value, ...newItems]);

    // Upload files in background
    for (const item of newItems) {
      if (item.error || !item.file) continue;

      try {
        const url = await uploadFile(item.file);
        onChange((prev) =>
          prev.map((m) =>
            m.id === item.id ? { ...m, url, uploading: false } : m
          )
        );
      } catch (error) {
        onChange((prev) =>
          prev.map((m) =>
            m.id === item.id ? { ...m, uploading: false, error: 'Upload thất bại' } : m
          )
        );
      }
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeItem = (id: string) => {
    const item = value.find((m) => m.id === id);
    if (item?.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
    onChange(value.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 transition-all',
          dragActive
            ? 'border-ce-primary bg-ce-primary/5'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex gap-2">
            <div className="rounded-full bg-ce-primary/10 p-3">
              <Camera className="h-6 w-6 text-ce-primary" />
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          
          <div>
            <p className="font-medium text-gray-700">
              Kéo thả hoặc click để upload
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Ảnh: {imageCount}/{maxImages} | Video: {videoCount}/{maxVideos}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageCount >= maxImages}
            >
              <ImageIcon className="mr-1 h-4 w-4" />
              Thêm ảnh
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => videoInputRef.current?.click()}
              disabled={videoCount >= maxVideos}
            >
              <Video className="mr-1 h-4 w-4" />
              Thêm video
            </Button>
          </div>

          <p className="text-xs text-gray-400">
            JPG, PNG, WebP, GIF, MP4, WebM. Tối đa {maxFileSize}MB/file
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept={ACCEPTED_VIDEO_TYPES.join(',')}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {value.map((item) => (
            <div
              key={item.id}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border',
                item.error ? 'border-red-300 bg-red-50' : 'border-gray-200'
              )}
            >
              {/* Thumbnail */}
              <img
                src={item.thumbnail || item.url}
                alt=""
                className="h-full w-full object-cover"
              />

              {/* Video indicator */}
              {item.type === 'VIDEO' && !item.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="rounded-full bg-white/90 p-2">
                    <Play className="h-4 w-4 text-gray-800" fill="currentColor" />
                  </div>
                </div>
              )}

              {/* Uploading indicator */}
              {item.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}

              {/* Error indicator */}
              {item.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/80 p-2">
                  <p className="text-center text-xs text-white">{item.error}</p>
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Click to preview */}
              {!item.uploading && !item.error && (
                <button
                  type="button"
                  onClick={() => setPreviewMedia(item)}
                  className="absolute inset-0"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewMedia(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setPreviewMedia(null)}
          >
            <X className="h-6 w-6" />
          </button>

          {previewMedia.type === 'IMAGE' ? (
            <img
              src={previewMedia.url}
              alt=""
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={previewMedia.url}
              controls
              autoPlay
              className="max-h-[90vh] max-w-[90vw] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}

