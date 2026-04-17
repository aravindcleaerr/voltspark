export const ENERGY_TYPES = [
  { value: 'ELECTRICITY', label: 'Electricity', defaultUnit: 'kWh' },
  { value: 'FUEL', label: 'Fuel (Diesel/Petrol)', defaultUnit: 'Liters' },
  { value: 'GAS', label: 'Gas (LPG/PNG)', defaultUnit: 'kg' },
  { value: 'COMPRESSED_AIR', label: 'Compressed Air', defaultUnit: 'm³' },
  { value: 'OTHER', label: 'Other', defaultUnit: '' },
] as const;

export const ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'EMPLOYEE', label: 'Employee' },
] as const;

export const PERIOD_TYPES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
] as const;

export const SHIFTS = [
  { value: 'MORNING', label: 'Morning (6AM-2PM)' },
  { value: 'AFTERNOON', label: 'Afternoon (2PM-10PM)' },
  { value: 'NIGHT', label: 'Night (10PM-6AM)' },
] as const;

export const TRAINING_TYPES = [
  { value: 'AWARENESS', label: 'Awareness' },
  { value: 'SKILL_BUILDING', label: 'Skill Building' },
  { value: 'REFRESHER', label: 'Refresher' },
  { value: 'INDUCTION', label: 'Induction' },
] as const;

export const TRAINING_STATUSES = [
  { value: 'SCHEDULED', label: 'Scheduled', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'yellow' },
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
] as const;

export const AUDIT_TYPES = [
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'EXTERNAL', label: 'External' },
  { value: 'SURVEILLANCE', label: 'Surveillance' },
] as const;

export const AUDIT_STATUSES = [
  { value: 'PLANNED', label: 'Planned', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'yellow' },
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'CLOSED', label: 'Closed', color: 'gray' },
] as const;

export const FINDING_CATEGORIES = [
  { value: 'OBSERVATION', label: 'Observation', color: 'blue' },
  { value: 'MINOR_NC', label: 'Minor NC', color: 'yellow' },
  { value: 'MAJOR_NC', label: 'Major NC', color: 'red' },
  { value: 'OPPORTUNITY', label: 'Improvement Opportunity', color: 'green' },
] as const;

export const CAPA_TYPES = [
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'PREVENTIVE', label: 'Preventive' },
] as const;

export const CAPA_SOURCES = [
  { value: 'AUDIT_FINDING', label: 'Audit Finding' },
  { value: 'DEVIATION', label: 'Energy Deviation' },
  { value: 'CUSTOMER_COMPLAINT', label: 'Customer Complaint' },
  { value: 'INTERNAL', label: 'Internal Observation' },
] as const;

export const CAPA_PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'gray' },
  { value: 'MEDIUM', label: 'Medium', color: 'blue' },
  { value: 'HIGH', label: 'High', color: 'yellow' },
  { value: 'CRITICAL', label: 'Critical', color: 'red' },
] as const;

export const CAPA_STATUSES = [
  { value: 'OPEN', label: 'Open', color: 'red' },
  { value: 'RCA_IN_PROGRESS', label: 'RCA In Progress', color: 'yellow' },
  { value: 'ACTION_PLANNED', label: 'Action Planned', color: 'blue' },
  { value: 'IN_IMPLEMENTATION', label: 'In Implementation', color: 'purple' },
  { value: 'VERIFICATION', label: 'Verification', color: 'orange' },
  { value: 'CLOSED', label: 'Closed', color: 'green' },
  { value: 'REOPENED', label: 'Reopened', color: 'red' },
] as const;

export const RCA_METHODS = [
  { value: 'FIVE_WHY', label: '5-Why Analysis' },
  { value: 'FISHBONE', label: 'Fishbone (Ishikawa)' },
] as const;

export const INDUSTRY_TYPES = [
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'TEXTILE', label: 'Textile' },
  { value: 'PHARMACEUTICAL', label: 'Pharmaceutical' },
  { value: 'FOOD_PROCESSING', label: 'Food Processing' },
  { value: 'CHEMICAL', label: 'Chemical' },
  { value: 'STEEL', label: 'Steel & Metal' },
  { value: 'CEMENT', label: 'Cement' },
  { value: 'PAPER', label: 'Paper & Pulp' },
  { value: 'IT_SERVICES', label: 'IT / Services' },
  { value: 'COMMERCIAL', label: 'Commercial Building' },
  { value: 'HOSPITAL', label: 'Hospital / Healthcare' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const DEVIATION_THRESHOLD_WARNING = 10;
export const DEVIATION_THRESHOLD_CRITICAL = 20;

// ============================================================
// IOT METERING CONSTANTS
// ============================================================

export const IOT_GATEWAY_TYPES = [
  { value: 'ESX_UNIVERSAL', label: 'Schneider ESX Panel Server Universal' },
  { value: 'PAS600', label: 'Schneider PAS600 Panel Server (Basic)' },
  { value: 'RASPBERRY_PI', label: 'Raspberry Pi Gateway' },
  { value: 'INDUSTRIAL_PC', label: 'Industrial PC' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const IOT_METER_MAKES = [
  { value: 'SCHNEIDER', label: 'Schneider Electric' },
  { value: 'ABB', label: 'ABB' },
  { value: 'SIEMENS', label: 'Siemens' },
  { value: 'SECURE', label: 'Secure Meters' },
  { value: 'ELMEASURE', label: 'Elmeasure' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const IOT_METER_TYPES = [
  { value: 'INCOMER', label: 'Incomer / Main Panel' },
  { value: 'SUBMETER', label: 'Sub-meter / Feeder' },
  { value: 'DG', label: 'DG Set' },
  { value: 'SOLAR', label: 'Solar Inverter' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const IOT_PROTOCOLS = [
  { value: 'REST', label: 'REST API (direct push)' },
  { value: 'MQTT_WEBHOOK', label: 'MQTT → Webhook' },
  { value: 'MQTT_DIRECT', label: 'MQTT Direct (future)' },
] as const;

export const IOT_ALERT_TYPES = [
  { value: 'DEMAND_WARNING', label: 'Demand Warning', color: 'yellow' },
  { value: 'DEMAND_CRITICAL', label: 'Demand Critical', color: 'orange' },
  { value: 'DEMAND_BREACH', label: 'Demand Breach', color: 'red' },
  { value: 'PF_LOW', label: 'Low Power Factor', color: 'yellow' },
  { value: 'VOLTAGE_SAG', label: 'Voltage Sag', color: 'orange' },
  { value: 'VOLTAGE_SWELL', label: 'Voltage Swell', color: 'orange' },
  { value: 'THD_HIGH', label: 'High THD', color: 'yellow' },
  { value: 'METER_OFFLINE', label: 'Meter Offline', color: 'red' },
  { value: 'GATEWAY_OFFLINE', label: 'Gateway Offline', color: 'red' },
] as const;

export const IOT_ALERT_SEVERITIES = [
  { value: 'INFO', label: 'Info', color: 'blue' },
  { value: 'WARNING', label: 'Warning', color: 'yellow' },
  { value: 'CRITICAL', label: 'Critical', color: 'red' },
] as const;
