import { NextResponse } from 'next/server';

const TEMPLATES: Record<string, { label: string; fields: { key: string; label: string; unit: string; defaultValue?: number }[] }> = {
  SOLAR: {
    label: 'Solar Rooftop',
    fields: [
      { key: 'systemSizeKW', label: 'System Size', unit: 'kW' },
      { key: 'costPerKW', label: 'Cost per kW', unit: '₹', defaultValue: 50000 },
      { key: 'subsidyPercent', label: 'Subsidy', unit: '%', defaultValue: 40 },
      { key: 'tariffRate', label: 'Grid Tariff', unit: '₹/kWh' },
      { key: 'dailyGenerationHrs', label: 'Avg. Daily Sun Hours', unit: 'hrs', defaultValue: 4.5 },
      { key: 'degradationRate', label: 'Annual Degradation', unit: '%', defaultValue: 0.5 },
      { key: 'lifetimeYears', label: 'System Lifetime', unit: 'years', defaultValue: 25 },
    ],
  },
  VFD: {
    label: 'VFD Installation',
    fields: [
      { key: 'motorHP', label: 'Motor Size', unit: 'HP' },
      { key: 'loadPercent', label: 'Avg. Load', unit: '%', defaultValue: 60 },
      { key: 'operatingHrsPerMonth', label: 'Operating Hours', unit: 'hrs/month', defaultValue: 400 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'vfdCost', label: 'VFD Cost', unit: '₹' },
      { key: 'savingsPercent', label: 'Expected Savings', unit: '%', defaultValue: 30 },
    ],
  },
  LED: {
    label: 'LED Lighting Retrofit',
    fields: [
      { key: 'fixtureCount', label: 'Number of Fixtures', unit: 'nos' },
      { key: 'oldWattage', label: 'Old Wattage per Fixture', unit: 'W' },
      { key: 'newWattage', label: 'New LED Wattage', unit: 'W' },
      { key: 'operatingHrsPerDay', label: 'Operating Hours', unit: 'hrs/day', defaultValue: 12 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'costPerFixture', label: 'Cost per LED Fixture', unit: '₹', defaultValue: 800 },
    ],
  },
  POWER_FACTOR: {
    label: 'Power Factor Correction',
    fields: [
      { key: 'currentPF', label: 'Current Power Factor', unit: '' },
      { key: 'targetPF', label: 'Target Power Factor', unit: '', defaultValue: 0.98 },
      { key: 'monthlyDemandKVA', label: 'Monthly Demand', unit: 'kVA' },
      { key: 'avgMonthlyPenalty', label: 'Avg. Monthly PF Penalty', unit: '₹' },
      { key: 'panelCost', label: 'APFC Panel Cost', unit: '₹' },
    ],
  },
  COMPRESSED_AIR: {
    label: 'Compressed Air Optimization',
    fields: [
      { key: 'compressorKW', label: 'Compressor Power', unit: 'kW' },
      { key: 'leakPercent', label: 'Current Leak Rate', unit: '%', defaultValue: 25 },
      { key: 'targetLeakPercent', label: 'Target Leak Rate', unit: '%', defaultValue: 5 },
      { key: 'operatingHrsPerMonth', label: 'Operating Hours', unit: 'hrs/month', defaultValue: 400 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'repairCost', label: 'Leak Repair Cost', unit: '₹' },
    ],
  },
  MOTOR: {
    label: 'IE3 Motor Replacement',
    fields: [
      { key: 'motorHP', label: 'Motor Size', unit: 'HP' },
      { key: 'oldEfficiency', label: 'Old Motor Efficiency', unit: '%', defaultValue: 85 },
      { key: 'newEfficiency', label: 'New Motor Efficiency', unit: '%', defaultValue: 93.6 },
      { key: 'operatingHrsPerMonth', label: 'Operating Hours', unit: 'hrs/month', defaultValue: 350 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'motorCost', label: 'New Motor Cost', unit: '₹' },
    ],
  },
  TRANSFORMER: {
    label: 'Transformer Replacement',
    fields: [
      { key: 'ratingKVA', label: 'Transformer Rating', unit: 'kVA' },
      { key: 'oldNoLoadLoss', label: 'Old No-Load Loss', unit: 'W' },
      { key: 'newNoLoadLoss', label: 'New No-Load Loss', unit: 'W' },
      { key: 'oldLoadLoss', label: 'Old Load Loss (at full load)', unit: 'W' },
      { key: 'newLoadLoss', label: 'New Load Loss (at full load)', unit: 'W' },
      { key: 'avgLoadPercent', label: 'Avg. Loading', unit: '%', defaultValue: 60 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'transformerCost', label: 'New Transformer Cost', unit: '₹' },
    ],
  },
};

export async function GET() {
  return NextResponse.json(TEMPLATES);
}
