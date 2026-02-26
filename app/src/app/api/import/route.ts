import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/** POST — bulk import data from CSV */
export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  if (user.clientRole === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { type, rows } = body;

  if (!type || !rows || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'type and rows[] required' }, { status: 400 });
  }

  let imported = 0;
  let errors: string[] = [];

  if (type === 'consumption') {
    // Expected columns: date, energySource, value, unit, cost, shift, notes
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Find energy source by name
        const source = await prisma.energySource.findFirst({
          where: { clientId, name: { contains: row.energySource } },
        });
        if (!source) {
          errors.push(`Row ${i + 1}: Energy source "${row.energySource}" not found`);
          continue;
        }
        await prisma.consumptionEntry.create({
          data: {
            clientId,
            energySourceId: source.id,
            recordedById: user.id,
            date: new Date(row.date),
            value: parseFloat(row.value),
            unit: row.unit || source.unit,
            cost: row.cost ? parseFloat(row.cost) : (source.costPerUnit ? parseFloat(row.value) * source.costPerUnit : null),
            shift: row.shift || null,
            notes: row.notes || `Imported from CSV`,
          },
        });
        imported++;
      } catch (e: any) {
        errors.push(`Row ${i + 1}: ${e.message?.slice(0, 80)}`);
      }
    }
  } else if (type === 'utility-bills') {
    // Expected columns: month, year, provider, unitsConsumed, demandKVA, powerFactor, totalAmount, etc.
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        await prisma.utilityBill.create({
          data: {
            clientId,
            month: parseInt(row.month),
            year: parseInt(row.year),
            provider: row.provider || null,
            tariffCategory: row.tariffCategory || null,
            unitsConsumed: parseFloat(row.unitsConsumed) || 0,
            demandKVA: row.demandKVA ? parseFloat(row.demandKVA) : null,
            powerFactor: row.powerFactor ? parseFloat(row.powerFactor) : null,
            energyCharges: row.energyCharges ? parseFloat(row.energyCharges) : null,
            demandCharges: row.demandCharges ? parseFloat(row.demandCharges) : null,
            pfPenalty: row.pfPenalty ? parseFloat(row.pfPenalty) : null,
            totalAmount: parseFloat(row.totalAmount) || 0,
            hasPfPenalty: (parseFloat(row.pfPenalty) || 0) > 0,
            hasDemandOvershoot: false,
            hasAnomaly: false,
            enteredById: user.id,
            notes: 'Imported from CSV',
          },
        });
        imported++;
      } catch (e: any) {
        errors.push(`Row ${i + 1}: ${e.message?.slice(0, 80)}`);
      }
    }
  } else if (type === 'training') {
    // Expected columns: title, type, trainer, scheduledDate, status, description
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        await prisma.trainingProgram.create({
          data: {
            clientId,
            title: row.title,
            type: row.type || 'AWARENESS',
            trainer: row.trainer || null,
            scheduledDate: new Date(row.scheduledDate),
            status: row.status || 'SCHEDULED',
            description: row.description || null,
            notes: 'Imported from CSV',
          },
        });
        imported++;
      } catch (e: any) {
        errors.push(`Row ${i + 1}: ${e.message?.slice(0, 80)}`);
      }
    }
  } else {
    return NextResponse.json({ error: `Unknown import type: ${type}` }, { status: 400 });
  }

  return NextResponse.json({ imported, errors: errors.slice(0, 20), totalErrors: errors.length });
}
