/**
 * Validation utilities for blog CMS
 */

import { z } from 'zod';

// Slug validation - lowercase, numbers, hyphens only
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only');

// Title validation
export const titleSchema = z
  .string()
  .min(3, 'Title must be at least 3 characters')
  .max(200, 'Title must be less than 200 characters');

// Blog post create schema
export const createBlogPostSchema = z.object({
  titleEn: titleSchema,
  titleVi: z.string().optional(),
  slug: slugSchema,
  excerptEn: z.string().max(500).optional(),
  excerptVi: z.string().max(500).optional(),
  categoryId: z.string().nullable().optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  coverImageId: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  translations: z
    .array(
      z.object({
        locale: z.enum(['en', 'vi']),
        title: titleSchema,
        slug: slugSchema,
        excerpt: z.string().max(500).optional(),
        contentJson: z.string().optional(),
        contentHtml: z.string().optional(),
        seoTitle: z.string().max(70).optional(),
        seoDescription: z.string().max(160).optional(),
        seoKeywords: z.string().max(200).optional(),
      })
    )
    .optional(),
});

// Blog post update schema (all fields optional)
export const updateBlogPostSchema = createBlogPostSchema.partial();

// Schedule schema
export const scheduleSchema = z.object({
  scheduledAt: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Scheduled date must be a valid future date'),
});

// Bulk action schema
export const bulkActionSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'archive', 'delete']),
  postIds: z.array(z.string().min(1).max(50)).min(1).max(100),
});

// Media upload validation
export const mediaUploadSchema = z.object({
  folder: z
    .string()
    .regex(/^[a-zA-Z0-9-_]*$/)
    .max(50)
    .optional(),
  altText: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
});

// Category schema
export const categorySchema = z.object({
  nameEn: z.string().min(2).max(100),
  nameVi: z.string().min(2).max(100),
  slug: slugSchema,
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).max(1000).optional(),
});

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate and return parsed data or throw error
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}

/**
 * Validate and return result with errors
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
  }
  return { success: true, data: result.data };
}
