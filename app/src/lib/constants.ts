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

export const DEVIATION_THRESHOLD_WARNING = 10;
export const DEVIATION_THRESHOLD_CRITICAL = 20;
