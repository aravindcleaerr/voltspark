/**
 * Shared equipment cast for the Drivewave SMT line.
 * Same data must be used by all four apps so equipment codes match across DBs.
 *
 * Equipment numbers research-grounded from public SMT industry sources.
 * Costs in INR; convert to EUR at 1 EUR = 90 INR for the dual-currency display.
 */

export type EquipmentSpec = {
  code: string;            // unique across all apps
  name: string;            // human-readable
  category: 'SMT Inspection' | 'SMT Placement' | 'SMT Reflow' | 'Test' | 'Conveyance';
  criticality: 'A' | 'B' | 'C';   // A = line-stopper
  manufacturer: string;    // generic class label, never a real brand
  purchasePriceInr: number;
  lifespanYears: number;
  kwAvg: number;           // average continuous power (for VoltSpark seeding)
  kwPeak: number;          // peak power (for THD/PF computations)
  pmFreqDays: number;      // primary PM cadence (some have multiple — handled in scripted events)
  installedDate: string;   // YYYY-MM-DD — at least 3 years before demo
};

export const EUR_INR_RATE = 90;

export const EQUIPMENT_CAST: EquipmentSpec[] = [
  {
    code: 'SPI-01',
    name: 'Solder Paste Inspection — Cyberoptics-class 3D SPI',
    category: 'SMT Inspection',
    criticality: 'B',
    manufacturer: 'Cyberoptics-class',
    purchasePriceInr: 3_500_000,
    lifespanYears: 8,
    kwAvg: 2.0,
    kwPeak: 3.0,
    pmFreqDays: 30,
    installedDate: '2022-04-15',
  },
  {
    code: 'PNP-01',
    name: 'Pick-and-Place — Yamaha-class High-Speed',
    category: 'SMT Placement',
    criticality: 'A',
    manufacturer: 'Yamaha-class',
    purchasePriceInr: 28_000_000,
    lifespanYears: 10,
    kwAvg: 7.0,
    kwPeak: 11.0,
    pmFreqDays: 7,            // weekly nozzle/feeder check (primary); monthly full PM tracked in events
    installedDate: '2022-04-15',
  },
  {
    code: 'PNP-02',
    name: 'Pick-and-Place — Yamaha-class Flexible',
    category: 'SMT Placement',
    criticality: 'A',
    manufacturer: 'Yamaha-class',
    purchasePriceInr: 22_000_000,
    lifespanYears: 10,
    kwAvg: 6.0,
    kwPeak: 9.0,
    pmFreqDays: 7,
    installedDate: '2022-04-15',
  },
  {
    code: 'REF-01',
    name: 'Reflow Oven — BTU-class 12-Zone',
    category: 'SMT Reflow',
    criticality: 'A',
    manufacturer: 'BTU-class',
    purchasePriceInr: 13_500_000,
    lifespanYears: 12,
    kwAvg: 95.0,              // dominant energy load
    kwPeak: 130.0,
    pmFreqDays: 30,
    installedDate: '2022-04-15',
  },
  {
    code: 'AOI-01',
    name: 'Automated Optical Inspection — Koh Young-class',
    category: 'SMT Inspection',
    criticality: 'B',
    manufacturer: 'Koh Young-class',
    purchasePriceInr: 7_500_000,
    lifespanYears: 8,
    kwAvg: 3.0,
    kwPeak: 4.5,
    pmFreqDays: 90,
    installedDate: '2022-04-15',
  },
  {
    code: 'ICT-01',
    name: 'In-Circuit Test — Teradyne-class',
    category: 'Test',
    criticality: 'B',
    manufacturer: 'Teradyne-class',
    purchasePriceInr: 6_000_000,
    lifespanYears: 8,
    kwAvg: 2.5,
    kwPeak: 4.0,
    pmFreqDays: 30,
    installedDate: '2022-06-01',
  },
  {
    code: 'FCT-01',
    name: 'Functional Test — Custom End-of-Line Stand',
    category: 'Test',
    criticality: 'B',
    manufacturer: 'Custom-class',
    purchasePriceInr: 4_500_000,
    lifespanYears: 8,
    kwAvg: 4.0,
    kwPeak: 6.0,
    pmFreqDays: 30,
    installedDate: '2022-06-01',
  },
  {
    code: 'CONV-01',
    name: 'Inter-stage SMD Conveyor',
    category: 'Conveyance',
    criticality: 'C',
    manufacturer: 'Generic',
    purchasePriceInr: 800_000,
    lifespanYears: 15,
    kwAvg: 0.5,
    kwPeak: 0.8,
    pmFreqDays: 90,
    installedDate: '2022-04-15',
  },
];

export const DRIVEWAVE = {
  customerName: 'Drivewave Automotive Pvt Ltd',
  customerSlug: 'drivewave',
  industry: 'Automotive Electronics — Tier-1 Supplier',
  plantName: 'Pune SMT-1',
  plantAddress: 'Talegaon Industrial Belt, Pune, Maharashtra, India',
  product: 'Engine Control Unit (ECU) PCBA — passenger car',
  lineId: 'LINE-01',
  shiftsPerDay: 3,
  workingDaysPerWeek: 6,    // Sun off
  unitsPlannedPerShift: 800,
  contractDemandKva: 250,
  gridTariffRateInr: 8.5,   // ₹/kWh average
  powerFactorTarget: 0.95,
};
