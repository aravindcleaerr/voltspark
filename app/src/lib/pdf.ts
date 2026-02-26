import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

interface PDFOptions {
  title: string;
  subtitle?: string;
  companyName?: string;
  generatedDate?: string;
}

function setupDoc(opts: PDFOptions) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(opts.companyName || 'Company', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Energy Management System', pageWidth / 2, 27, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(opts.title, pageWidth / 2, 36, { align: 'center' });

  if (opts.subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(opts.subtitle, pageWidth / 2, 42, { align: 'center' });
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated on ${opts.generatedDate || new Date().toLocaleDateString()}`, pageWidth / 2, opts.subtitle ? 48 : 42, { align: 'center' });

  // Line separator
  const lineY = opts.subtitle ? 52 : 46;
  doc.setDrawColor(200);
  doc.line(15, lineY, pageWidth - 15, lineY);

  return { doc, startY: lineY + 6, pageWidth };
}

function addSectionTitle(doc: jsPDF, title: string, y: number, pageWidth: number): number {
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 80, 160);
  doc.text(title, 15, y);
  doc.setTextColor(0);
  return y + 8;
}

function addKPIRow(doc: jsPDF, items: { label: string; value: string }[], y: number): number {
  if (y > 260) { doc.addPage(); y = 20; }
  const colWidth = 170 / items.length;
  items.forEach((item, i) => {
    const x = 15 + i * colWidth;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(item.label, x, y);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(item.value, x, y + 5);
  });
  return y + 14;
}

function addFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('Powered by VoltSpark', pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.text(`Page ${i} of ${pages}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
  }
}

// ==============================
// Standard Report PDF
// ==============================

export function generateStandardReportPDF(reportData: any, companyName: string) {
  const { doc, startY, pageWidth } = setupDoc({
    title: reportData.title || 'Report',
    companyName,
  });

  let y = startY;

  if (reportData.type === 'energy-register' && reportData.data) {
    autoTable(doc, {
      startY: y,
      head: [['Source', 'Type', 'Unit', 'Location', 'Meter #', 'Targets']],
      body: reportData.data.map((s: any) => [
        s.name, s.type, s.unit, s.location || '—', s.meterNumber || '—', String(s.targets?.length || 0),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 80, 160] },
      margin: { left: 15, right: 15 },
    });
  }

  if (reportData.type === 'consumption-summary' && reportData.data) {
    autoTable(doc, {
      startY: y,
      head: [['Source', 'Type', 'Total', 'Entries', 'Deviations']],
      body: reportData.data.map((d: any) => [
        d.source, d.type, `${d.total?.toFixed(1)} ${d.unit}`, String(d.count), String(d.deviations),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 80, 160] },
      margin: { left: 15, right: 15 },
    });
  }

  if (reportData.type === 'training-compliance' && reportData.data) {
    autoTable(doc, {
      startY: y,
      head: [['Program', 'Type', 'Date', 'Status', 'Attended']],
      body: reportData.data.map((p: any) => {
        const attended = p.attendance?.filter((a: any) => a.attended).length || 0;
        return [p.title, p.type, new Date(p.scheduledDate).toLocaleDateString(), p.status, `${attended}/${p._count?.attendance || 0}`];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 80, 160] },
      margin: { left: 15, right: 15 },
    });
  }

  if (reportData.type === 'audit-summary' && reportData.data) {
    autoTable(doc, {
      startY: y,
      head: [['Audit', 'Type', 'Date', 'Status', 'Findings']],
      body: reportData.data.map((a: any) => [
        a.title, a.type, new Date(a.auditDate).toLocaleDateString(), a.status, String(a._count?.findings || 0),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 80, 160] },
      margin: { left: 15, right: 15 },
    });
  }

  if (reportData.type === 'capa-summary' && reportData.data) {
    autoTable(doc, {
      startY: y,
      head: [['CAPA #', 'Title', 'Type', 'Priority', 'Status', 'Assigned']],
      body: reportData.data.map((c: any) => [
        c.capaNumber, c.title, c.type, c.priority, c.status, c.assignedTo?.name || '—',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 80, 160] },
      margin: { left: 15, right: 15 },
    });
  }

  if (reportData.type === 'compliance-overview' && reportData.data) {
    const rows = Object.entries(reportData.data).map(([key, value]) => [
      key.replace(/([A-Z])/g, ' $1').trim(),
      `${String(value)}${key.includes('Rate') ? '%' : ''}`,
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 80, 160] },
      margin: { left: 15, right: 15 },
    });
  }

  addFooter(doc);
  doc.save(`${reportData.type || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`);
}

// ==============================
// Impact Report PDF
// ==============================

export function generateImpactReportPDF(impactData: any, companyName: string) {
  const sections = impactData.sections || {};
  const { doc, startY, pageWidth } = setupDoc({
    title: 'Impact Report',
    subtitle: `Period: ${impactData.period || 'All Time'}`,
    companyName,
  });

  let y = startY;

  // Executive Summary
  if (sections.executiveSummary) {
    y = addSectionTitle(doc, '1. Executive Summary', y, pageWidth);
    y = addKPIRow(doc, [
      { label: 'Compliance Score', value: `${sections.executiveSummary.complianceScore ?? 0}%` },
      { label: 'Total Savings', value: fmt(sections.executiveSummary.totalSavings ?? 0) },
      { label: 'Energy Sources', value: String(sections.executiveSummary.energySourcesTracked ?? 0) },
      { label: 'Active Improvements', value: String(sections.executiveSummary.activeImprovements ?? 0) },
    ], y);
  }

  // Energy Performance
  if (sections.energyPerformance) {
    y = addSectionTitle(doc, '2. Energy Performance', y, pageWidth);
    y = addKPIRow(doc, [
      { label: 'Total Entries', value: String(sections.energyPerformance.totalEntries) },
      { label: 'Total Cost', value: fmt(sections.energyPerformance.totalCost ?? 0) },
      { label: 'Deviation Rate', value: `${sections.energyPerformance.deviationRate ?? 0}%` },
    ], y);

    if (sections.energyPerformance.bySource?.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Source', 'Type', 'Total Consumption', 'Cost']],
        body: sections.energyPerformance.bySource.map((s: any) => [
          s.source, s.type, `${s.totalValue?.toFixed(1)} ${s.unit}`, fmt(s.totalCost ?? 0),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 130, 76] },
        margin: { left: 15, right: 15 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // Compliance Status
  if (sections.complianceStatus) {
    y = addSectionTitle(doc, '3. Compliance Status', y, pageWidth);
    y = addKPIRow(doc, [
      { label: 'Active Frameworks', value: String(sections.complianceStatus.activeFrameworks) },
      { label: 'Overall Completion', value: `${sections.complianceStatus.overallCompletion ?? 0}%` },
      { label: 'Active Certifications', value: String(sections.complianceStatus.activeCertifications) },
      { label: 'Inspections Completed', value: String(sections.complianceStatus.inspectionsCompleted) },
    ], y);
  }

  // Safety Performance
  if (sections.safetyPerformance) {
    y = addSectionTitle(doc, '4. Safety Performance', y, pageWidth);
    y = addKPIRow(doc, [
      { label: 'Total Incidents', value: String(sections.safetyPerformance.totalIncidents) },
      { label: 'Resolved', value: String(sections.safetyPerformance.resolved) },
      { label: 'Critical/High', value: String(sections.safetyPerformance.criticalHigh) },
      { label: 'Resolution Rate', value: `${sections.safetyPerformance.resolutionRate ?? 0}%` },
    ], y);
  }

  // Financial Impact
  if (sections.financialImpact) {
    y = addSectionTitle(doc, '5. Financial Impact', y, pageWidth);
    y = addKPIRow(doc, [
      { label: 'Total Investment', value: fmt(sections.financialImpact.totalInvestment ?? 0) },
      { label: 'Cumulative Savings', value: fmt(sections.financialImpact.cumulativeSavings ?? 0) },
      { label: 'Monthly Savings', value: fmt(sections.financialImpact.monthlySavings ?? 0) },
    ], y);
    y = addKPIRow(doc, [
      { label: 'Avg Utility Bill', value: fmt(sections.financialImpact.avgBillAmount ?? 0) },
      { label: 'Total Utility Spend', value: fmt(sections.financialImpact.totalBillAmount ?? 0) },
      { label: 'ROI Proposals', value: String(sections.financialImpact.roiProposals ?? 0) },
    ], y);

    if (sections.financialImpact.topSavingsMeasures?.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Measure', 'Category', 'Savings']],
        body: sections.financialImpact.topSavingsMeasures.map((m: any) => [
          m.name, m.category, fmt(m.cumulativeSavings ?? 0),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 130, 76] },
        margin: { left: 15, right: 15 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // Improvement Roadmap
  if (sections.improvementRoadmap) {
    y = addSectionTitle(doc, '6. Improvement Roadmap', y, pageWidth);
    y = addKPIRow(doc, [
      { label: 'Total Plans', value: String(sections.improvementRoadmap.totalPlans) },
      { label: 'Total Items', value: String(sections.improvementRoadmap.totalItems) },
      { label: 'Completed', value: String(sections.improvementRoadmap.completedItems) },
      { label: 'Overdue', value: String(sections.improvementRoadmap.overdueItems) },
    ], y);
  }

  // Recommendations
  if (sections.recommendations?.length > 0) {
    y = addSectionTitle(doc, '7. Recommendations', y, pageWidth);
    sections.recommendations.forEach((rec: string, i: number) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - 30);
      doc.text(lines, 15, y);
      y += lines.length * 5 + 3;
    });
  }

  // Training & CAPA
  if (sections.trainingAndCAPA) {
    y = addSectionTitle(doc, '8. Training & CAPA Summary', y, pageWidth);
    y = addKPIRow(doc, [
      { label: 'Training Programs', value: String(sections.trainingAndCAPA.totalPrograms) },
      { label: 'Completed', value: String(sections.trainingAndCAPA.completedPrograms) },
      { label: 'Avg Attendance', value: `${sections.trainingAndCAPA.avgAttendanceRate ?? 0}%` },
    ], y);
    y = addKPIRow(doc, [
      { label: 'Total CAPAs', value: String(sections.trainingAndCAPA.totalCAPAs) },
      { label: 'Closed CAPAs', value: String(sections.trainingAndCAPA.closedCAPAs) },
      { label: 'Closure Rate', value: `${sections.trainingAndCAPA.capaClosureRate ?? 0}%` },
    ], y);
  }

  addFooter(doc);
  doc.save(`impact-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

// ==============================
// Compliance Summary PDF (for shareable view)
// ==============================

export function generateComplianceSummaryPDF(data: any) {
  const d = data.data;
  const { doc, startY, pageWidth } = setupDoc({
    title: data.title || 'Compliance Dashboard',
    subtitle: `Real-time compliance status`,
    companyName: d.companyName,
    generatedDate: new Date(data.generatedAt).toLocaleDateString(),
  });

  let y = startY;

  // Company Info
  if (d.client) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    const info: string[] = [];
    if (d.client.address) info.push(d.client.address);
    if (d.client.industry) info.push(`Industry: ${d.client.industry}`);
    if (d.client.employeeCount) info.push(`${d.client.employeeCount} employees`);
    if (info.length) {
      doc.text(info.join('  |  '), pageWidth / 2, y, { align: 'center' });
      y += 8;
    }
  }

  // Overall Compliance Score
  if (d.compliance?.length > 0) {
    const overallScore = Math.round(d.compliance.reduce((s: number, c: any) => s + c.score, 0) / d.compliance.length);
    y = addSectionTitle(doc, 'Overall Compliance Score', y, pageWidth);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(overallScore >= 80 ? 30 : overallScore >= 60 ? 180 : 200, overallScore >= 80 ? 130 : overallScore >= 60 ? 140 : 50, overallScore >= 80 ? 76 : 20);
    doc.text(`${overallScore}%`, pageWidth / 2, y + 8, { align: 'center' });
    y += 20;

    // Framework breakdown
    autoTable(doc, {
      startY: y,
      head: [['Framework', 'Score', 'Status', 'Requirements Met']],
      body: d.compliance.map((c: any) => [
        c.framework, `${c.score}%`, c.status, `${c.compliantRequirements}/${c.totalRequirements}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 80, 160] },
      margin: { left: 15, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Certifications
  if (d.certifications?.length > 0) {
    y = addSectionTitle(doc, 'Certifications', y, pageWidth);
    autoTable(doc, {
      startY: y,
      head: [['Certificate', 'Category', 'Issuing Body', 'Status', 'Expiry']],
      body: d.certifications.map((c: any) => [
        c.name, c.category, c.issuingBody || '—', c.status.replace('_', ' '),
        c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '—',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [100, 50, 150] },
      margin: { left: 15, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Safety
  if (d.safety) {
    y = addSectionTitle(doc, 'Safety Performance', y, pageWidth);
    y = addKPIRow(doc, [
      { label: 'Incident Resolution', value: `${d.safety.resolutionRate}%` },
      { label: 'Inspections Completed', value: String(d.safety.completedInspections) },
      { label: 'Total Incidents', value: String(d.safety.totalIncidents) },
    ], y);
  }

  // Improvements
  if (d.improvements) {
    y = addSectionTitle(doc, 'Energy Improvements', y, pageWidth);
    y = addKPIRow(doc, [
      { label: 'Measures', value: String(d.improvements.totalMeasures) },
      { label: 'Implemented', value: String(d.improvements.implemented) },
      { label: 'Total Savings', value: fmt(d.improvements.totalSavings) },
      { label: 'Investment', value: fmt(d.improvements.totalInvestment) },
    ], y);
  }

  addFooter(doc);
  doc.save(`compliance-summary-${d.companyName?.replace(/\s+/g, '-') || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`);
}
