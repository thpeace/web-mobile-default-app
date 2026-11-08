import { z } from 'zod';

export const RoleEnum = z.enum(['ADMIN', 'EMPLOYEE', 'CLIENT']);
export const RequestStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']);

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: RoleEnum,
});

export const updateUserSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  role: RoleEnum.optional(),
  isActive: z.boolean().optional(),
});

export const createRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional().nullable(),
});

export const updateRequestStatusSchema = z.object({
  status: RequestStatusEnum,
});

export const assignRequestSchema = z.object({
  employeeId: z.string().uuid('Employee ID must be a valid UUID').nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
export type AssignRequestInput = z.infer<typeof assignRequestSchema>;

