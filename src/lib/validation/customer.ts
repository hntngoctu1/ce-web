import { z } from 'zod';

export function normalizePhone(input: string) {
  return input.replace(/[^\d+]/g, '');
}

export function normalizeTaxId(input: string) {
  return input.replace(/[^\d]/g, '');
}

export const phoneSchema = z
  .string()
  .min(8)
  .transform((v) => normalizePhone(v))
  .refine((v) => {
    const digits = v.replace(/[^\d]/g, '');
    return digits.length >= 9 && digits.length <= 15;
  }, 'Invalid phone number');

export const emailSchema = z.string().email();

// Vietnam tax ID (MST) is commonly 10 digits or 13 digits (branch), allow optional hyphen.
export const taxIdSchema = z
  .string()
  .min(10)
  .transform((v) => normalizeTaxId(v))
  .refine((digits) => digits.length === 10 || digits.length === 13, 'Invalid tax ID');

export const customerTypeSchema = z.enum(['PERSONAL', 'BUSINESS']);

export const addressKindSchema = z.enum(['SHIPPING', 'BILLING']);

export const addressInputSchema = z.object({
  kind: addressKindSchema.default('SHIPPING'),
  label: z.string().min(2).max(60).optional(),

  recipientName: z.string().min(2).max(120),
  recipientEmail: emailSchema.optional(),
  recipientPhone: phoneSchema,

  companyName: z.string().min(2).max(200).optional(),
  taxId: taxIdSchema.optional(),

  addressLine1: z.string().min(5).max(250),
  addressLine2: z.string().min(2).max(250).optional(),
  ward: z.string().min(2).max(120).optional(),
  district: z.string().min(2).max(120).optional(),
  city: z.string().min(2).max(120).optional(),
  province: z.string().min(2).max(120).optional(),
  postalCode: z.string().min(4).max(20).optional(),
  country: z.string().min(2).max(120).default('Vietnam'),

  isDefault: z.boolean().optional(),
});

export const profileUpdateSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    phone: phoneSchema.optional(),

    customerType: customerTypeSchema.optional(),
    companyName: z.string().min(2).max(200).optional(),
    taxId: taxIdSchema.optional(),
    companyEmail: emailSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.customerType === 'BUSINESS') {
      // For B2B we expect companyName and taxId when explicitly switching/setting to BUSINESS.
      if (!val.companyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyName'],
          message: 'Company name is required for BUSINESS',
        });
      }
      if (!val.taxId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['taxId'],
          message: 'Tax ID is required for BUSINESS',
        });
      }
    }
  });

export const buyerInfoSchema = z
  .object({
    customerType: customerTypeSchema.default('PERSONAL'),
    companyName: z.string().min(2).max(200).optional(),
    taxId: taxIdSchema.optional(),
    companyEmail: emailSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.customerType === 'BUSINESS') {
      if (!val.companyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyName'],
          message: 'Company name is required for BUSINESS',
        });
      }
      if (!val.taxId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['taxId'],
          message: 'Tax ID is required for BUSINESS',
        });
      }
    }
  });
