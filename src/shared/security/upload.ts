/**
 * Secure File Upload Utilities
 * 
 * Validates and processes file uploads with security constraints.
 */

import { AppError } from '../errors';

/**
 * Allowed MIME types by category
 */
export const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  videos: [
    'video/mp4',
    'video/webm',
    'video/ogg',
  ],
} as const;

/**
 * File size limits by category (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  images: 10 * 1024 * 1024,      // 10 MB
  documents: 50 * 1024 * 1024,   // 50 MB
  videos: 500 * 1024 * 1024,     // 500 MB
  default: 10 * 1024 * 1024,     // 10 MB
} as const;

/**
 * File upload validation options
 */
export interface UploadValidationOptions {
  allowedTypes?: string[];
  maxSize?: number;
  category?: keyof typeof ALLOWED_MIME_TYPES;
}

/**
 * Validated file info
 */
export interface ValidatedFile {
  name: string;
  size: number;
  mimeType: string;
  extension: string;
  buffer: Buffer;
}

/**
 * Validate file upload
 */
export function validateUpload(
  file: File | { name: string; type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> },
  options: UploadValidationOptions = {}
): Promise<ValidatedFile> {
  return new Promise(async (resolve, reject) => {
    try {
      const { category = 'images' } = options;
      const allowedTypes: readonly string[] = options.allowedTypes ?? ALLOWED_MIME_TYPES[category] ?? [];
      const maxSize = options.maxSize ?? FILE_SIZE_LIMITS[category] ?? FILE_SIZE_LIMITS.default;

      // Validate MIME type
      if (!allowedTypes.includes(file.type)) {
        throw AppError.validation(`File type ${file.type} is not allowed`, [
          { field: 'file', message: `Allowed types: ${allowedTypes.join(', ')}` },
        ]);
      }

      // Validate size
      if (file.size > maxSize) {
        const maxMB = Math.round(maxSize / (1024 * 1024));
        throw AppError.validation(`File size exceeds limit`, [
          { field: 'file', message: `Maximum size: ${maxMB} MB` },
        ]);
      }

      // Get extension from name
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      
      // Validate extension matches MIME type
      const validExtensions = getValidExtensions(file.type);
      if (validExtensions.length > 0 && !validExtensions.includes(extension)) {
        throw AppError.validation(`File extension does not match type`, [
          { field: 'file', message: `Expected: ${validExtensions.join(', ')}` },
        ]);
      }

      // Read file buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Validate magic bytes (file signature)
      if (!validateMagicBytes(buffer, file.type)) {
        throw AppError.validation(`File content does not match declared type`, [
          { field: 'file', message: 'File may be corrupted or spoofed' },
        ]);
      }

      resolve({
        name: sanitizeFileName(file.name),
        size: file.size,
        mimeType: file.type,
        extension,
        buffer,
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get valid extensions for MIME type
 */
function getValidExtensions(mimeType: string): string[] {
  const extensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'image/svg+xml': ['svg'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'video/mp4': ['mp4'],
    'video/webm': ['webm'],
    'video/ogg': ['ogg', 'ogv'],
  };

  return extensionMap[mimeType] ?? [];
}

/**
 * Validate file magic bytes
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 8) return false;

  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
    'video/mp4': [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]], // ftyp at offset 4
  };

  const sigs = signatures[mimeType];
  if (!sigs) return true; // No signature check for unsupported types

  return sigs.some((sig) => {
    return sig.every((byte, index) => buffer[index] === byte);
  });
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(name: string): string {
  // Remove path components
  const baseName = name.split(/[/\\]/).pop() ?? name;
  
  // Remove dangerous characters
  const sanitized = baseName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim();

  // Limit length
  if (sanitized.length > 100) {
    const ext = sanitized.split('.').pop() ?? '';
    const nameWithoutExt = sanitized.slice(0, -(ext.length + 1));
    return `${nameWithoutExt.slice(0, 90)}.${ext}`;
  }

  return sanitized;
}

/**
 * Generate unique file name
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = originalName.split('.').pop()?.toLowerCase() ?? '';
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  return `${baseName}_${timestamp}_${random}.${ext}`;
}

/**
 * Get folder path for uploads
 */
export function getUploadFolder(category: string = 'general'): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `uploads/${category}/${year}/${month}`;
}

