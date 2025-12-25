import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit-log';

// Security: Only allow safe image types (no SVG - can contain XSS)
const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const altText =
      (formData.get('alt') as string) || (formData.get('altText') as string) || undefined;
    const caption = (formData.get('caption') as string) || undefined;
    const folder = (formData.get('folder') as string) || 'general';

    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file size
    const fileSize = file.size;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Validate file type (security: only allow safe image types)
    const mimeType = file.type;
    const safeExt = ALLOWED_MIME[mimeType];
    if (!safeExt) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: JPG, PNG, WEBP, GIF' },
        { status: 400 }
      );
    }

    // Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate it's actually an image (security: prevent file type spoofing)
    try {
      await sharp(buffer).metadata();
    } catch {
      return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
    }

    // Generate secure filename (UUID - no user input)
    const uniqueId = uuidv4();
    const filename = `${uniqueId}.${safeExt}`;

    // Sanitize folder name (security: prevent path traversal)
    const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 50) || 'general';

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', safeFolder);
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Get image dimensions
    let width: number | undefined;
    let height: number | undefined;
    try {
      const metadata = await sharp(buffer).metadata();
      width = metadata.width || undefined;
      height = metadata.height || undefined;
    } catch (err) {
      console.warn('Could not read image metadata', err);
    }

    // Generate URL
    const url = `/uploads/${safeFolder}/${filename}`;

    // Create database record
    const asset = await prisma.mediaAsset.create({
      data: {
        url,
        provider: 'LOCAL',
        fileName: filename,
        mimeType,
        size: fileSize,
        width,
        height,
        altText,
        caption,
        folder: safeFolder,
        createdBy: session.user.id,
      },
    });

    // Audit log
    await logAudit(
      'media.upload',
      session.user.id,
      'MediaAsset',
      asset.id,
      {
        fileName: filename,
        mimeType,
        size: fileSize,
        folder: safeFolder,
      },
      request
    );

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}
