import { z } from 'zod'

// ─── Reusable field schemas ────────────────────────────────
const emailSchema = z
  .string()
  .min(1, 'Email wajib diisi')
  .email('Format email tidak valid')

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
  .regex(/[0-9]/, 'Password harus mengandung angka')

const phoneSchema = z
  .string()
  .regex(/^(\+62|62|0)[0-9]{8,12}$/, 'Nomor telepon tidak valid (contoh: 081234567890)')

// ─── Auth Schemas ─────────────────────────────────────────
export const loginSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, 'Password wajib diisi'),
})

export const registerSchema = z
  .object({
    name:            z.string().min(2, 'Nama minimal 2 karakter').max(60, 'Nama terlalu panjang'),
    email:           emailSchema,
    password:        passwordSchema,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    role:            z.enum(['seeker', 'employer'], { required_error: 'Pilih role Anda' }),
    referralCode:    z.string().optional(),
    agreeTerms:      z.boolean().refine(v => v === true, 'Anda harus menyetujui syarat & ketentuan'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password:        passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

// ─── Job Schemas ──────────────────────────────────────────
export const jobPostSchema = z.object({
  title:        z.string().min(5, 'Judul pekerjaan minimal 5 karakter').max(100),
  description:  z.string().min(50, 'Deskripsi minimal 50 karakter'),
  requirements: z.string().min(20, 'Persyaratan minimal 20 karakter'),
  location:     z.string().min(3, 'Lokasi wajib diisi'),
  type:         z.enum(['fulltime', 'parttime', 'contract', 'freelance', 'internship', 'remote']),
  category:     z.string().min(1, 'Kategori wajib dipilih'),
  experience:   z.enum(['fresh', '1-2', '3-5', '5+']),
  salaryMin:    z.number().min(0).optional(),
  salaryMax:    z.number().min(0).optional(),
  deadline:     z.string().min(1, 'Batas lamaran wajib diisi'),
  slots:        z.number().min(1, 'Minimal 1 posisi').max(500),
  tags:         z.array(z.string()).optional(),
})

// ─── Profile Schemas ──────────────────────────────────────
export const seekerProfileSchema = z.object({
  name:      z.string().min(2).max(60),
  phone:     phoneSchema.optional().or(z.literal('')),
  location:  z.string().optional(),
  bio:       z.string().max(500).optional(),
  headline:  z.string().max(120).optional(),
  website:   z.string().url('URL tidak valid').optional().or(z.literal('')),
  linkedin:  z.string().url('URL tidak valid').optional().or(z.literal('')),
  github:    z.string().url('URL tidak valid').optional().or(z.literal('')),
})

export const companyProfileSchema = z.object({
  name:        z.string().min(2, 'Nama perusahaan minimal 2 karakter').max(100),
  industry:    z.string().min(1, 'Industri wajib dipilih'),
  size:        z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  website:     z.string().url('URL tidak valid').optional().or(z.literal('')),
  location:    z.string().min(3, 'Lokasi wajib diisi'),
  description: z.string().min(30, 'Deskripsi perusahaan minimal 30 karakter').max(2000),
  founded:     z.string().optional(),
})

// ─── Helper ───────────────────────────────────────────────
export const getFieldError = (errors, field) =>
  errors?.[field]?.message ?? null
