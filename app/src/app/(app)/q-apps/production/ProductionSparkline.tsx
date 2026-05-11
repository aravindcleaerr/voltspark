'use client';
import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, ReferenceLine } from 'recharts';

type DataPoint = { shift: string; oee: number; fpy: number; ppm: number };

export default function ProductionSparkline({ data }: { data: DataPoint[] }) {
  const avgOee = data.length ? data.reduce((s, d) => s + d.oee, 0) / data.length : 0;
  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">OEE &amp; FPY Trend — last {data.length} shifts</p>
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-indigo-500 rounded" /> OEE</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-emerald-500 rounded" /> FPY</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="shift" tick={false} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v) => `${(Number(v) * 100).toFixed(1)}%`}
            labelStyle={{ fontSize: 11, color: '#6b7280' }}
            contentStyle={{ fontSize: 11, padding: '4px 8px' }}
          />
          <ReferenceLine y={avgOee} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Line type="monotone" dataKey="oee" stroke="#6366f1" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line type="monotone" dataKey="fpy" stroke="#10b981" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-1">Dashed line = avg OEE ({(avgOee * 100).toFixed(1)}%). Hover for per-shift values.</p>
    </div>
  );
}
