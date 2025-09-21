

import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(50, 'Username too long'),
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password too long')
});


export const CreateCameraSchema = z.object({
  name: z.string()
    .min(1, 'Camera name is required')
    .max(100, 'Camera name too long'),
  rtspUrl: z.string()
    .url('Valid RTSP URL is required')
    .refine((url) => url.startsWith('rtsp://'), {
      message: 'URL must be an RTSP stream (rtsp://...)'
    }),
  location: z.string()
    .max(200, 'Location too long')
    .optional()
});

export const UpdateCameraSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  rtspUrl: z.string().url().refine((url) => url.startsWith('rtsp://')).optional(),
  location: z.string().max(200).optional(),
  enabled: z.boolean().optional()
});

// Alert creation schema (for worker to post alerts)
export const CreateAlertSchema = z.object({
  cameraId: z.string().min(1, 'Camera ID is required'),
  faceCount: z.number()
    .int('Face count must be an integer')
    .min(0, 'Face count cannot be negative')
    .default(1),
  confidence: z.number()
    .min(0, 'Confidence must be between 0 and 1')
    .max(1, 'Confidence must be between 0 and 1')
    .optional(),
  snapshotUrl: z.string().url().optional(),
  metadata: z.any().optional() // Could be bounding box coordinates, etc.
});

// Query parameter schemas
export const PaginationSchema = z.object({
  page: z.string()
    .default('1')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, 'Page must be positive'),
  limit: z.string()
    .default('20')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
});

//  function to handle validation errors
export const handleValidationError = (error: z.ZodError) => {
  return {
    error: 'Validation failed',
    details: error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }))
  };
};