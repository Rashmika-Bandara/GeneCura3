import { z } from 'zod'

// Common validation schemas
export const idSchema = z.string()
  .regex(/^[A-Z0-9_-]{4,20}$/, 'ID must be 4-20 characters with only uppercase letters, numbers, underscores, and hyphens')

export const emailSchema = z.string()
  .email('Please enter a valid email address')

export const phoneSchema = z.string()
  .regex(/^(\+\d{1,3})?[\d\-\s()]{10,15}$/, 'Please enter a valid phone number')
  .optional()

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number')

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')

export const dateOfBirthSchema = z.string()
  .refine(date => {
    const birthDate = new Date(date)
    const today = new Date()
    return birthDate < today
  }, 'Date of birth must be in the past')

// Doctor validation schema
export const doctorSignupSchema = z.object({
  doctor_id: idSchema,
  name: nameSchema,
  licence_id: z.string().min(1, 'License ID is required'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: emailSchema,
  mobile_number: phoneSchema,
  specialization: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.number().min(0, 'Experience cannot be negative').optional(),
  hospital: z.string().optional(),
  date_of_birth: dateOfBirthSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const doctorLoginSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required')
})

// Clinical Geneticist validation schema
export const geneticistSignupSchema = z.object({
  geneticist_id: idSchema,
  name: nameSchema,
  licence_id: z.string().min(1, 'License ID is required'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: emailSchema,
  mobile_number: phoneSchema,
  qualifications: z.string().optional(),
  experience: z.number().min(0, 'Experience cannot be negative').optional(),
  working_place: z.string().optional(),
  date_of_birth: dateOfBirthSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Clinical Pharmacologist validation schema
export const pharmacologistSignupSchema = z.object({
  pharmacologist_id: idSchema,
  name: nameSchema,
  licence_id: z.string().min(1, 'License ID is required'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: emailSchema,
  mobile_number: phoneSchema,
  qualifications: z.string().optional(),
  experience: z.number().min(0, 'Experience cannot be negative').optional(),
  working_place: z.string().optional(),
  date_of_birth: dateOfBirthSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Patient validation schema
export const patientSchema = z.object({
  patient_id: idSchema,
  patient_name: nameSchema,
  gene_id: z.string().optional(),
  gene_name: z.string().optional(),
  drug_reaction_history: z.string().optional(),
  weight: z.number().min(1, 'Weight must be at least 1kg').max(500, 'Weight must be less than 500kg').optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional()
  }).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  health_condition: z.string().optional(),
  current_medication: z.string().optional(),
  mobile_number: phoneSchema,
  allergies: z.string().optional(),
  medicine_id: z.string().optional(),
  medicine_name: z.string().optional()
})

// Gene validation schema
export const geneSchema = z.object({
  gene_id: idSchema,
  gene_name: z.string().min(1, 'Gene name is required'),
  genetic_variant_type: z.string().optional(),
  metabolizer_status: z.string().optional()
})

// Medicine validation schema
export const medicineSchema = z.object({
  medicine_id: idSchema,
  name: z.string().min(1, 'Medicine name is required'),
  purpose: z.string().optional(),
  drug_interactions: z.string().optional(),
  allergy_risks: z.string().optional()
})

// Prescription validation schema
export const prescriptionSchema = z.object({
  patient_id: z.string().min(1, 'Patient ID is required'),
  medicine_id: z.string().min(1, 'Medicine ID is required'),
  special_notes: z.string().optional()
})

// Report validation schema
export const reportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  pdf_file: z.any().optional()
})

// Metabolizer Detail validation schema
export const metabolizerSchema = z.object({
  status_label: z.enum(['poor', 'normal', 'rapid', 'ultra-rapid'], {
    errorMap: () => ({ message: 'Please select a valid metabolizer status' })
  }),
  notes: z.string().optional()
})

// Admin decision validation schema
export const adminDecisionSchema = z.object({
  final_decision: z.string().min(10, 'Decision must be at least 10 characters'),
  approved: z.boolean(),
  report_file: z.any().optional()
})
