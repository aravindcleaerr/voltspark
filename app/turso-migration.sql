Loaded Prisma config from prisma.config.ts.

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "industry" TEXT,
    "employeeCount" INTEGER,
    "accessMode" TEXT NOT NULL DEFAULT 'COLLABORATIVE',
    "gridTariffRate" REAL,
    "solarTariffRate" REAL,
    "dgTariffRate" REAL,
    "contractDemand" REAL,
    "powerFactorTarget" REAL,
    "baselineYear" INTEGER,
    "baselineMonth" INTEGER,
    "enabledAddons" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClientAccess_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EnergySource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "meterNumber" TEXT,
    "costPerUnit" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EnergySource_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnergyTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "energySourceId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "targetValue" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "baselineValue" REAL,
    "reductionPercent" REAL,
    "actualValue" REAL,
    "costTarget" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EnergyTarget_energySourceId_fkey" FOREIGN KEY ("energySourceId") REFERENCES "EnergySource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsumptionEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "energySourceId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "cost" REAL,
    "meterReading" REAL,
    "previousReading" REAL,
    "shift" TEXT,
    "notes" TEXT,
    "hasDeviation" BOOLEAN NOT NULL DEFAULT false,
    "deviationPercent" REAL,
    "deviationSeverity" TEXT,
    "deviationNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConsumptionEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConsumptionEntry_energySourceId_fkey" FOREIGN KEY ("energySourceId") REFERENCES "EnergySource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConsumptionEntry_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "trainer" TEXT,
    "scheduledDate" DATETIME NOT NULL,
    "duration" REAL,
    "location" TEXT,
    "maxParticipants" INTEGER,
    "materialsUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "completionDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingProgram_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainingProgramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "score" REAL,
    "feedback" TEXT,
    "certificateIssued" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingAttendance_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "TrainingProgram" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "auditDate" DATETIME NOT NULL,
    "leadAuditorId" TEXT,
    "externalAuditor" TEXT,
    "scope" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "summary" TEXT,
    "completedDate" DATETIME,
    "nextAuditDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Audit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Audit_leadAuditorId_fkey" FOREIGN KEY ("leadAuditorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditId" TEXT NOT NULL,
    "findingNumber" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "area" TEXT,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "recommendation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueDate" DATETIME,
    "closedDate" DATETIME,
    "capaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AuditFinding_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CAPA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "capaNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceReference" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "rcaMethod" TEXT,
    "rcaDetails" TEXT,
    "rootCause" TEXT,
    "correctiveAction" TEXT,
    "preventiveAction" TEXT,
    "actionDueDate" DATETIME,
    "actionCompletedDate" DATETIME,
    "verificationMethod" TEXT,
    "verificationDate" DATETIME,
    "verificationResult" TEXT,
    "verifiedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CAPA_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CAPA_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CAPA_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CAPAComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "capaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CAPAComment_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "CAPA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CAPAComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppSetting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplianceFramework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FrameworkRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frameworkId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "evidenceGuidance" TEXT,
    "evidenceModule" TEXT,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FrameworkRequirement_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "ComplianceFramework" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientFramework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "assignedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" DATETIME,
    "score" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientFramework_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClientFramework_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "ComplianceFramework" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequirementStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientFrameworkId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "evidenceLinks" TEXT,
    "lastReviewedAt" DATETIME,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RequirementStatus_clientFrameworkId_fkey" FOREIGN KEY ("clientFrameworkId") REFERENCES "ClientFramework" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RequirementStatus_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "FrameworkRequirement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RequirementStatus_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InspectionTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InspectionTemplateItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "itemText" TEXT NOT NULL,
    "helpText" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PASS_FAIL',
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InspectionTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InspectionTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectionDate" DATETIME NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "overallResult" TEXT,
    "overallNotes" TEXT,
    "score" REAL,
    "completedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inspection_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inspection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InspectionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InspectionResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspectionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "result" TEXT,
    "notes" TEXT,
    "photoUrl" TEXT,
    "correctiveActionRequired" BOOLEAN NOT NULL DEFAULT false,
    "correctiveActionNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InspectionResponse_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InspectionResponse_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InspectionTemplateItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "incidentDate" DATETIME NOT NULL,
    "reportedById" TEXT NOT NULL,
    "immediateAction" TEXT,
    "rootCause" TEXT,
    "correctiveAction" TEXT,
    "preventiveAction" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "closedDate" DATETIME,
    "closedById" TEXT,
    "followUpDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Incident_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Incident_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Incident_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "issuingBody" TEXT,
    "certificateNumber" TEXT,
    "holderId" TEXT,
    "equipmentName" TEXT,
    "issueDate" DATETIME,
    "expiryDate" DATETIME,
    "renewalFrequency" TEXT,
    "reminderDays" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "documentUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Certification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UtilityBill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "provider" TEXT,
    "tariffCategory" TEXT,
    "unitsConsumed" REAL NOT NULL,
    "demandKVA" REAL,
    "powerFactor" REAL,
    "energyCharges" REAL,
    "demandCharges" REAL,
    "pfPenalty" REAL,
    "pfIncentive" REAL,
    "fuelSurcharge" REAL,
    "electricityDuty" REAL,
    "otherCharges" REAL,
    "totalAmount" REAL NOT NULL,
    "meterReadingStart" REAL,
    "meterReadingEnd" REAL,
    "isEstimated" BOOLEAN NOT NULL DEFAULT false,
    "hasPfPenalty" BOOLEAN NOT NULL DEFAULT false,
    "hasDemandOvershoot" BOOLEAN NOT NULL DEFAULT false,
    "hasAnomaly" BOOLEAN NOT NULL DEFAULT false,
    "anomalyNote" TEXT,
    "notes" TEXT,
    "enteredById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UtilityBill_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UtilityBill_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavingsMeasure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "energySourceId" TEXT,
    "investmentCost" REAL NOT NULL,
    "implementationDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "estimatedMonthlySavings" REAL,
    "actualMonthlySavings" REAL,
    "estimatedKwhSavings" REAL,
    "actualKwhSavings" REAL,
    "paybackMonths" REAL,
    "cumulativeSavings" REAL,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavingsMeasure_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavingsMeasure_energySourceId_fkey" FOREIGN KEY ("energySourceId") REFERENCES "EnergySource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SavingsMeasure_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavingsEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "measureId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "savingsAmount" REAL NOT NULL,
    "kwhSaved" REAL,
    "method" TEXT NOT NULL DEFAULT 'MANUAL',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavingsEntry_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "SavingsMeasure" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ROICalculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "inputs" TEXT NOT NULL,
    "investmentCost" REAL NOT NULL,
    "subsidyAmount" REAL,
    "netInvestment" REAL NOT NULL,
    "monthlySavings" REAL NOT NULL,
    "annualSavings" REAL NOT NULL,
    "paybackMonths" REAL NOT NULL,
    "fiveYearSavings" REAL,
    "tenYearSavings" REAL,
    "lifetimeSavings" REAL,
    "irr" REAL,
    "npv" REAL,
    "co2ReductionKg" REAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "savingsMeasureId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ROICalculation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ROICalculation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "clientFrameworkId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActionPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActionPlan_clientFrameworkId_fkey" FOREIGN KEY ("clientFrameworkId") REFERENCES "ClientFramework" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ActionPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigneeId" TEXT,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActionItem_actionPlanId_fkey" FOREIGN KEY ("actionPlanId") REFERENCES "ActionPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActionItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "linkedToType" TEXT,
    "linkedToId" TEXT,
    "description" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GovernmentScheme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "ministry" TEXT,
    "description" TEXT NOT NULL,
    "maxSubsidy" REAL,
    "subsidyPercent" REAL,
    "eligibility" TEXT,
    "documentsNeeded" TEXT,
    "applicationUrl" TEXT,
    "deadline" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SchemeApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "appliedById" TEXT NOT NULL,
    "applicationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDENTIFIED',
    "amountApplied" REAL,
    "amountApproved" REAL,
    "amountDisbursed" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SchemeApplication_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SchemeApplication_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "GovernmentScheme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SchemeApplication_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShareableView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Compliance Dashboard',
    "sections" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShareableView_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecurringSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "dayOfMonth" INTEGER,
    "dayOfWeek" INTEGER,
    "monthOfYear" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "reminderDays" INTEGER NOT NULL DEFAULT 7,
    "assignedToId" TEXT,
    "createdById" TEXT,
    "lastTriggered" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurringSchedule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecurringSchedule_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RecurringSchedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kitchen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "discomCode" TEXT NOT NULL,
    "connectionType" TEXT NOT NULL DEFAULT 'LT_COMMERCIAL',
    "contractedDemandKVA" REAL NOT NULL,
    "sanctionedLoadKW" REAL,
    "demandChargePerKVA" REAL,
    "mdPenaltyMultiplier" REAL NOT NULL DEFAULT 2.0,
    "pfTarget" REAL NOT NULL DEFAULT 0.90,
    "pfPenaltyRatePercent" REAL,
    "pfIncentiveRatePercent" REAL,
    "tariffRatePerKwh" REAL,
    "todSlabsJson" TEXT,
    "billingCycleDay" INTEGER NOT NULL DEFAULT 1,
    "warningThresholdPct" REAL NOT NULL DEFAULT 80,
    "criticalThresholdPct" REAL NOT NULL DEFAULT 92,
    "autoShedEnabled" BOOLEAN NOT NULL DEFAULT false,
    "shedTier3AtPct" REAL NOT NULL DEFAULT 80,
    "shedTier2AtPct" REAL NOT NULL DEFAULT 92,
    "restoreBelowPct" REAL NOT NULL DEFAULT 75,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Kitchen_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KitchenZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kitchenId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneType" TEXT NOT NULL DEFAULT 'OTHER',
    "meterId" TEXT,
    "titanDoChannel" INTEGER,
    "priorityTier" INTEGER NOT NULL DEFAULT 2,
    "maxLoadKW" REAL,
    "haccpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "haccpAiChannel" INTEGER,
    "targetTempC" REAL,
    "minTempC" REAL,
    "maxTempC" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KitchenZone_kitchenId_fkey" FOREIGN KEY ("kitchenId") REFERENCES "Kitchen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TitanReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kitchenId" TEXT NOT NULL,
    "zoneId" TEXT,
    "meterId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "activePowerKW" REAL NOT NULL,
    "apparentPowerKVA" REAL,
    "reactivePowerKVAR" REAL,
    "powerFactor" REAL,
    "voltageR" REAL,
    "voltageY" REAL,
    "voltageB" REAL,
    "currentR" REAL,
    "currentY" REAL,
    "currentB" REAL,
    "frequencyHz" REAL,
    "energyKwh" REAL,
    "demandMaxKVA" REAL,
    "demandCurrentKVA" REAL,
    "thdVoltage" REAL,
    "thdCurrent" REAL,
    "ai1Value" REAL,
    "ai2Value" REAL,
    "do1State" BOOLEAN,
    "do2State" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TitanReading_kitchenId_fkey" FOREIGN KEY ("kitchenId") REFERENCES "Kitchen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TitanReading_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "KitchenZone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DemandEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kitchenId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "demandKVA" REAL,
    "thresholdKVA" REAL,
    "contractedDemandKVA" REAL,
    "pf" REAL,
    "message" TEXT NOT NULL,
    "zonesAffectedJson" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DemandEvent_kitchenId_fkey" FOREIGN KEY ("kitchenId") REFERENCES "Kitchen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyKitchenSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kitchenId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalKwh" REAL NOT NULL,
    "peakDemandKVA" REAL NOT NULL,
    "avgPf" REAL,
    "demandWarnings" INTEGER NOT NULL DEFAULT 0,
    "demandBreaches" INTEGER NOT NULL DEFAULT 0,
    "estimatedBillAmount" REAL,
    "mdPenaltyAmount" REAL,
    "mdPenaltiesAvoided" REAL,
    "pfPenaltyAmount" REAL,
    "pfIncentiveAmount" REAL,
    "todPeakKwh" REAL,
    "todOffPeakKwh" REAL,
    "todSavingsAmount" REAL,
    "totalSavings" REAL,
    "haccpComplianceRate" REAL,
    "loadShedEvents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyKitchenSummary_kitchenId_fkey" FOREIGN KEY ("kitchenId") REFERENCES "Kitchen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KitchenApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kitchenId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KitchenApiKey_kitchenId_fkey" FOREIGN KEY ("kitchenId") REFERENCES "Kitchen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IoTGateway" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "gatewayType" TEXT NOT NULL DEFAULT 'PAS600',
    "make" TEXT,
    "firmwareVersion" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "mqttBrokerUrl" TEXT,
    "mqttTopicPrefix" TEXT,
    "mqttClientId" TEXT,
    "pushIntervalSeconds" INTEGER NOT NULL DEFAULT 60,
    "protocol" TEXT NOT NULL DEFAULT 'MQTT_WEBHOOK',
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IoTGateway_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IoTMeter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "energySourceId" TEXT,
    "name" TEXT NOT NULL,
    "meterSerial" TEXT,
    "modbusAddress" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "meterType" TEXT NOT NULL DEFAULT 'SUBMETER',
    "ctRatio" REAL,
    "ptRatio" REAL,
    "ratedVoltage" REAL,
    "demandWarningPct" REAL DEFAULT 80,
    "demandCriticalPct" REAL DEFAULT 92,
    "pfLowThreshold" REAL DEFAULT 0.85,
    "panelName" TEXT,
    "circuitName" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IoTMeter_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IoTMeter_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "IoTGateway" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IoTMeter_energySourceId_fkey" FOREIGN KEY ("energySourceId") REFERENCES "EnergySource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeterReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meterId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "activePowerKW" REAL NOT NULL,
    "apparentPowerKVA" REAL,
    "reactivePowerKVAR" REAL,
    "powerFactor" REAL,
    "voltageR" REAL,
    "voltageY" REAL,
    "voltageB" REAL,
    "voltageAvg" REAL,
    "currentR" REAL,
    "currentY" REAL,
    "currentB" REAL,
    "currentAvg" REAL,
    "energyKwh" REAL,
    "energyKwhExport" REAL,
    "energyKvarhImport" REAL,
    "energyKvarhExport" REAL,
    "demandKW" REAL,
    "demandKVA" REAL,
    "maxDemandKW" REAL,
    "maxDemandKVA" REAL,
    "frequencyHz" REAL,
    "thdVoltage" REAL,
    "thdCurrent" REAL,
    "voltageUnbalance" REAL,
    "currentUnbalance" REAL,
    "extraDataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeterReading_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "IoTMeter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IoTApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gatewayId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IoTApiKey_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "IoTGateway" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeterAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "meterId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "parameterName" TEXT,
    "actualValue" REAL,
    "thresholdValue" REAL,
    "message" TEXT NOT NULL,
    "acknowledgedAt" DATETIME,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeterAlert_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MeterAlert_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "IoTMeter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IoTMonthlySummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meterId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalKwh" REAL NOT NULL,
    "peakDemandKW" REAL,
    "peakDemandKVA" REAL,
    "avgPowerFactor" REAL,
    "minVoltage" REAL,
    "maxVoltage" REAL,
    "avgFrequency" REAL,
    "alertCount" INTEGER NOT NULL DEFAULT 0,
    "readingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IoTMonthlySummary_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "IoTMeter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PQEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "phase" TEXT,
    "actualValue" REAL NOT NULL,
    "thresholdValue" REAL NOT NULL,
    "nominalValue" REAL,
    "durationMs" INTEGER,
    "message" TEXT NOT NULL,
    "readingId" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PQEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PQEvent_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "IoTMeter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PQSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "voltageAvgMin" REAL,
    "voltageAvgMax" REAL,
    "voltageAvgMean" REAL,
    "voltageSagCount" INTEGER NOT NULL DEFAULT 0,
    "voltageSwellCount" INTEGER NOT NULL DEFAULT 0,
    "voltageUnbalanceMax" REAL,
    "thdVoltageMax" REAL,
    "thdVoltageMean" REAL,
    "thdCurrentMax" REAL,
    "thdCurrentMean" REAL,
    "thdExceedanceCount" INTEGER NOT NULL DEFAULT 0,
    "pfMin" REAL,
    "pfMean" REAL,
    "pfBelowTarget" INTEGER NOT NULL DEFAULT 0,
    "freqMin" REAL,
    "freqMax" REAL,
    "freqMean" REAL,
    "complianceScore" REAL,
    "totalReadings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PQSnapshot_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PQSnapshot_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "IoTMeter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscomTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "discomName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tariffRatePerKwh" REAL NOT NULL,
    "demandChargePerKVA" REAL,
    "pfTarget" REAL NOT NULL DEFAULT 0.90,
    "pfPenaltyRatePercent" REAL,
    "pfIncentiveRatePercent" REAL,
    "mdPenaltyMultiplier" REAL NOT NULL DEFAULT 2.0,
    "todSlabsJson" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_organizationId_key" ON "Membership"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccess_userId_clientId_key" ON "ClientAccess"("userId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyTarget_energySourceId_period_key" ON "EnergyTarget"("energySourceId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingAttendance_trainingProgramId_userId_key" ON "TrainingAttendance"("trainingProgramId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CAPA_capaNumber_key" ON "CAPA"("capaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_clientId_key_key" ON "AppSetting"("clientId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceFramework_code_key" ON "ComplianceFramework"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ClientFramework_clientId_frameworkId_key" ON "ClientFramework"("clientId", "frameworkId");

-- CreateIndex
CREATE UNIQUE INDEX "RequirementStatus_clientFrameworkId_requirementId_key" ON "RequirementStatus"("clientFrameworkId", "requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "UtilityBill_clientId_year_month_key" ON "UtilityBill"("clientId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "SavingsEntry_measureId_year_month_key" ON "SavingsEntry"("measureId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeApplication_clientId_schemeId_key" ON "SchemeApplication"("clientId", "schemeId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareableView_token_key" ON "ShareableView"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Kitchen_clientId_key" ON "Kitchen"("clientId");

-- CreateIndex
CREATE INDEX "TitanReading_kitchenId_timestamp_idx" ON "TitanReading"("kitchenId", "timestamp");

-- CreateIndex
CREATE INDEX "TitanReading_meterId_timestamp_idx" ON "TitanReading"("meterId", "timestamp");

-- CreateIndex
CREATE INDEX "DemandEvent_kitchenId_createdAt_idx" ON "DemandEvent"("kitchenId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyKitchenSummary_kitchenId_year_month_key" ON "MonthlyKitchenSummary"("kitchenId", "year", "month");

-- CreateIndex
CREATE INDEX "IoTGateway_clientId_idx" ON "IoTGateway"("clientId");

-- CreateIndex
CREATE INDEX "IoTMeter_clientId_idx" ON "IoTMeter"("clientId");

-- CreateIndex
CREATE INDEX "IoTMeter_gatewayId_idx" ON "IoTMeter"("gatewayId");

-- CreateIndex
CREATE INDEX "MeterReading_meterId_timestamp_idx" ON "MeterReading"("meterId", "timestamp");

-- CreateIndex
CREATE INDEX "MeterReading_timestamp_idx" ON "MeterReading"("timestamp");

-- CreateIndex
CREATE INDEX "MeterAlert_clientId_createdAt_idx" ON "MeterAlert"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "MeterAlert_meterId_createdAt_idx" ON "MeterAlert"("meterId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IoTMonthlySummary_meterId_year_month_key" ON "IoTMonthlySummary"("meterId", "year", "month");

-- CreateIndex
CREATE INDEX "PQEvent_clientId_createdAt_idx" ON "PQEvent"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "PQEvent_meterId_createdAt_idx" ON "PQEvent"("meterId", "createdAt");

-- CreateIndex
CREATE INDEX "PQEvent_type_createdAt_idx" ON "PQEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "PQSnapshot_clientId_date_idx" ON "PQSnapshot"("clientId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PQSnapshot_meterId_date_key" ON "PQSnapshot"("meterId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DiscomTemplate_code_key" ON "DiscomTemplate"("code");

