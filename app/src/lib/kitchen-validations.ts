import { z } from 'zod';

export const createKitchenSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().optional(),
  discomCode: z.string().min(1),
  connectionType: z.enum(['LT_COMMERCIAL', 'HT']).default('LT_COMMERCIAL'),
  contractedDemandKVA: z.number().positive(),
  sanctionedLoadKW: z.number().positive().optional(),
  demandChargePerKVA: z.number().min(0).optional(),
  mdPenaltyMultiplier: z.number().min(1).default(2.0),
  pfTarget: z.number().min(0.5).max(1.0).default(0.90),
  pfPenaltyRatePercent: z.number().min(0).optional(),
  pfIncentiveRatePercent: z.number().min(0).optional(),
  tariffRatePerKwh: z.number().min(0).optional(),
  todSlabsJson: z.string().optional(),
  billingCycleDay: z.number().int().min(1).max(28).default(1),
  warningThresholdPct: z.number().min(50).max(100).default(80),
  criticalThresholdPct: z.number().min(50).max(100).default(92),
});

export const updateKitchenSchema = createKitchenSchema.partial();

export const createZoneSchema = z.object({
  name: z.string().min(1).max(100),
  zoneType: z.string().default('OTHER'),
  meterId: z.string().optional(),
  titanDoChannel: z.number().int().min(1).max(2).optional().nullable(),
  priorityTier: z.number().int().min(1).max(3).default(2),
  maxLoadKW: z.number().positive().optional(),
  haccpEnabled: z.boolean().default(false),
  haccpAiChannel: z.number().int().min(1).max(2).optional().nullable(),
  targetTempC: z.number().optional().nullable(),
  minTempC: z.number().optional().nullable(),
  maxTempC: z.number().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const updateZoneSchema = createZoneSchema.partial();

export const titanReadingSchema = z.object({
  timestamp: z.string().or(z.date()),
  activePowerKW: z.number(),
  apparentPowerKVA: z.number().optional(),
  reactivePowerKVAR: z.number().optional(),
  powerFactor: z.number().min(0).max(1).optional(),
  voltageR: z.number().optional(),
  voltageY: z.number().optional(),
  voltageB: z.number().optional(),
  currentR: z.number().optional(),
  currentY: z.number().optional(),
  currentB: z.number().optional(),
  frequencyHz: z.number().optional(),
  energyKwh: z.number().optional(),
  demandMaxKVA: z.number().optional(),
  demandCurrentKVA: z.number().optional(),
  thdVoltage: z.number().optional(),
  thdCurrent: z.number().optional(),
  ai1Value: z.number().optional(),
  ai2Value: z.number().optional(),
  do1State: z.boolean().optional(),
  do2State: z.boolean().optional(),
});

export const titanReadingBatchSchema = z.object({
  readings: z.array(titanReadingSchema).min(1).max(100),
});

export const loadManagementConfigSchema = z.object({
  autoShedEnabled: z.boolean(),
  warningThresholdPct: z.number().min(50).max(100),
  criticalThresholdPct: z.number().min(50).max(100),
  shedTier3AtPct: z.number().min(50).max(100),
  shedTier2AtPct: z.number().min(50).max(100),
  restoreBelowPct: z.number().min(30).max(100),
});
