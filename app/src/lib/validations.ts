import { z } from 'zod';

export const createEnergySourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['ELECTRICITY', 'FUEL', 'GAS', 'COMPRESSED_AIR', 'OTHER']),
  unit: z.string().min(1, 'Unit is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  meterNumber: z.string().optional(),
});

export const updateEnergySourceSchema = createEnergySourceSchema.partial();

export const createEnergyTargetSchema = z.object({
  energySourceId: z.string().min(1),
  period: z.string().min(1, 'Period is required'),
  periodType: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']),
  targetValue: z.number().positive('Target must be positive'),
  unit: z.string().min(1),
  baselineValue: z.number().optional(),
  reductionPercent: z.number().optional(),
  notes: z.string().optional(),
});

export const createConsumptionEntrySchema = z.object({
  energySourceId: z.string().min(1),
  date: z.string().min(1),
  value: z.number().positive('Value must be positive'),
  unit: z.string().min(1),
  meterReading: z.number().optional(),
  previousReading: z.number().optional(),
  shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']).optional(),
  notes: z.string().optional(),
});

export const createTrainingProgramSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  type: z.enum(['AWARENESS', 'SKILL_BUILDING', 'REFRESHER', 'INDUCTION']),
  trainer: z.string().optional(),
  scheduledDate: z.string().min(1),
  duration: z.number().positive().optional(),
  location: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const createAuditSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(['INTERNAL', 'EXTERNAL', 'SURVEILLANCE']),
  auditDate: z.string().min(1),
  leadAuditorId: z.string().optional(),
  externalAuditor: z.string().optional(),
  scope: z.string().optional(),
  nextAuditDate: z.string().optional(),
});

export const createAuditFindingSchema = z.object({
  auditId: z.string().min(1),
  category: z.enum(['OBSERVATION', 'MINOR_NC', 'MAJOR_NC', 'OPPORTUNITY']),
  area: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  evidence: z.string().optional(),
  recommendation: z.string().optional(),
  dueDate: z.string().optional(),
});

export const createCAPASchema = z.object({
  type: z.enum(['CORRECTIVE', 'PREVENTIVE']),
  source: z.enum(['AUDIT_FINDING', 'DEVIATION', 'CUSTOMER_COMPLAINT', 'INTERNAL']),
  sourceReference: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  assignedToId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  actionDueDate: z.string().optional(),
});

export const updateCAPASchema = z.object({
  status: z.string().optional(),
  assignedToId: z.string().optional(),
  priority: z.string().optional(),
  rcaMethod: z.string().optional(),
  rcaDetails: z.string().optional(),
  rootCause: z.string().optional(),
  correctiveAction: z.string().optional(),
  preventiveAction: z.string().optional(),
  actionDueDate: z.string().optional(),
  actionCompletedDate: z.string().optional(),
  verificationMethod: z.string().optional(),
  verificationDate: z.string().optional(),
  verificationResult: z.string().optional(),
  verifiedBy: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  trainingProgramId: z.string().min(1),
  attendance: z.array(z.object({
    userId: z.string().min(1),
    attended: z.boolean(),
    score: z.number().optional(),
    feedback: z.string().optional(),
  })),
});
