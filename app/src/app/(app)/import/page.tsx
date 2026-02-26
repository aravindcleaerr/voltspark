'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

type ImportType = 'consumption' | 'utility-bills' | 'training';

const IMPORT_TYPES: { value: ImportType; label: string; columns: string; template: string }[] = [
  {
    value: 'consumption',
    label: 'Consumption Data',
    columns: 'date, energySource, value, unit, cost, shift, notes',
    template: 'date,energySource,value,unit,cost,shift,notes\n2025-01-15,Grid Power,1250,kWh,,Morning,\n2025-01-16,Grid Power,1180,kWh,,Afternoon,',
  },
  {
    value: 'utility-bills',
    label: 'Utility Bills',
    columns: 'month, year, provider, unitsConsumed, demandKVA, powerFactor, totalAmount, pfPenalty',
    template: 'month,year,provider,unitsConsumed,demandKVA,powerFactor,totalAmount,pfPenalty\n1,2025,BESCOM,12500,180,0.92,98000,0\n2,2025,BESCOM,11800,175,0.94,92000,0',
  },
  {
    value: 'training',
    label: 'Training Programs',
    columns: 'title, type, trainer, scheduledDate, status, description',
    template: 'title,type,trainer,scheduledDate,status,description\nEnergy Awareness,AWARENESS,External Trainer,2025-02-15,SCHEDULED,Monthly awareness session',
  },
];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  }).filter(row => Object.values(row).some(v => v));
}

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportType>('consumption');
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[]; totalErrors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      setParsedRows(parseCSV(text));
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handlePaste = (text: string) => {
    setCsvText(text);
    setParsedRows(parseCSV(text));
    setResult(null);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setResult(null);
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: importType, rows: parsedRows }),
    });
    const data = await res.json();
    setResult(data);
    setImporting(false);
  };

  const downloadTemplate = () => {
    const config = IMPORT_TYPES.find(t => t.value === importType);
    if (!config) return;
    const blob = new Blob([config.template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const config = IMPORT_TYPES.find(t => t.value === importType);

  return (
    <div className="space-y-6">
      <PageHeader title="Bulk Import" subtitle="Import data from CSV files" />

      {/* Import Type Selection */}
      <div className="flex gap-2 flex-wrap">
        {IMPORT_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => { setImportType(t.value); setParsedRows([]); setCsvText(''); setResult(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${importType === t.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-brand-600" /> Upload CSV
          </h3>
          <button onClick={downloadTemplate} className="btn-secondary text-xs flex items-center gap-1">
            <Download className="h-3.5 w-3.5" /> Template
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          Expected columns: <code className="bg-gray-100 px-1 rounded">{config?.columns}</code>
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-2">Drop a CSV file here or click to upload</p>
          <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs">Choose File</button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Or paste CSV data directly</label>
          <textarea
            value={csvText}
            onChange={e => handlePaste(e.target.value)}
            rows={6}
            className="input font-mono text-xs"
            placeholder={config?.template}
          />
        </div>
      </div>

      {/* Preview */}
      {parsedRows.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Preview ({parsedRows.length} rows)</h3>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  {Object.keys(parsedRows[0]).map(h => <th key={h} className="pb-2 pr-3 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {Object.values(row).map((v, j) => <td key={j} className="py-1.5 pr-3">{v || '—'}</td>)}
                  </tr>
                ))}
                {parsedRows.length > 10 && (
                  <tr><td colSpan={Object.keys(parsedRows[0]).length} className="py-2 text-center text-gray-400">...and {parsedRows.length - 10} more rows</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <button onClick={handleImport} disabled={importing} className="btn-primary text-sm mt-4">
            {importing ? 'Importing...' : `Import ${parsedRows.length} rows`}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`card border-l-4 ${result.totalErrors > 0 ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
          <div className="flex items-center gap-3 mb-2">
            {result.totalErrors === 0 ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            )}
            <div>
              <p className="font-semibold">{result.imported} rows imported successfully</p>
              {result.totalErrors > 0 && <p className="text-sm text-yellow-600">{result.totalErrors} errors</p>}
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2 space-y-1">
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600">{err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
