import { z } from 'zod';

// ============================================================
// GATEWAY SCHEMAS
// ============================================================

export const createGatewaySchema = z.object({
  name: z.string().min(1).max(100),
  serialNumber: z.string().max(100).optional(),
  gatewayType: z.enum(['PAS600', 'RASPBERRY_PI', 'INDUSTRIAL_PC', 'OTHER']).default('PAS600'),
  make: z.string().max(50).optional(),
  firmwareVersion: z.string().max(50).optional(),
  ipAddress: z.string().max(45).optional(),
  location: z.string().max(200).optional(),
  mqttBrokerUrl: z.string().max(500).optional(),
  mqttTopicPrefix: z.string().max(200).optional(),
  mqttClientId: z.string().max(200).optional(),
  pushIntervalSeconds: z.number().int().min(5).max(3600).default(60),
  protocol: z.enum(['REST', 'MQTT_WEBHOOK', 'MQTT_DIRECT']).default('MQTT_WEBHOOK'),
});

export const updateGatewaySchema = createGatewaySchema.partial();

// ============================================================
// METER SCHEMAS
// ============================================================

export const createMeterSchema = z.object({
  gatewayId: z.string().min(1),
  energySourceId: z.string().optional(),
  name: z.string().min(1).max(100),
  meterSerial: z.string().max(100).optional(),
  modbusAddress: z.number().int().min(1).max(247).optional(),
  make: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  meterType: z.enum(['INCOMER', 'SUBMETER', 'DG', 'SOLAR', 'OTHER']).default('SUBMETER'),
  ctRatio: z.number().positive().optional(),
  ptRatio: z.number().positive().optional(),
  ratedVoltage: z.number().positive().optional(),
  demandWarningPct: z.number().min(0).max(100).optional(),
  demandCriticalPct: z.number().min(0).max(100).optional(),
  pfLowThreshold: z.number().min(0).max(1).optional(),
  panelName: z.string().max(100).optional(),
  circuitName: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
});

export const updateMeterSchema = createMeterSchema.partial().omit({ gatewayId: true });

// ============================================================
// METER READING SCHEMAS
// ============================================================

export const meterReadingSchema = z.object({
  meterSerial: z.string().optional(),
  modbusAddress: z.number().int().min(1).max(247).optional(),
  meterId: z.string().optional(),
  timestamp: z.string().datetime({ offset: true }).or(z.string().datetime()),
  // Power
  activePowerKW: z.number(),
  apparentPowerKVA: z.number().optional(),
  reactivePowerKVAR: z.number().optional(),
  powerFactor: z.number().min(-1).max(1).optional(),
  // Voltage
  voltageR: z.number().optional(),
  voltageY: z.number().optional(),
  voltageB: z.number().optional(),
  voltageAvg: z.number().optional(),
  // Current
  currentR: z.number().optional(),
  currentY: z.number().optional(),
  currentB: z.number().optional(),
  currentAvg: z.number().optional(),
  // Energy
  energyKwh: z.number().optional(),
  energyKwhExport: z.number().optional(),
  energyKvarhImport: z.number().optional(),
  energyKvarhExport: z.number().optional(),
  // Demand
  demandKW: z.number().optional(),
  demandKVA: z.number().optional(),
  maxDemandKW: z.number().optional(),
  maxDemandKVA: z.number().optional(),
  // Quality
  frequencyHz: z.number().optional(),
  thdVoltage: z.number().optional(),
  thdCurrent: z.number().optional(),
  voltageUnbalance: z.number().optional(),
  currentUnbalance: z.number().optional(),
  // Extra
  extraDataJson: z.string().optional(),
}).refine(
  (data) => data.meterSerial || data.modbusAddress || data.meterId,
  { message: 'At least one of meterSerial, modbusAddress, or meterId is required' }
);

export const ingestBatchSchema = z.object({
  gatewaySerial: z.string().optional(),
  readings: z.array(meterReadingSchema).min(1).max(100),
});
