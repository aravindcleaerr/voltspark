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

