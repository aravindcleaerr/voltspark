'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

type ContextPoint = {
  ts: string;
  voltageAvg?: number | null;
  currentAvg?: number | null;
  powerFactor?: number | null;
};

export default function WaveformContextChart({
  data,
  eventTimeIso,
}: {
  data: ContextPoint[];
  eventTimeIso: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <XAxis dataKey="ts" tick={{ fontSize: 10 }} />
        <YAxis yAxisId="v" orientation="left" tick={{ fontSize: 10 }} label={{ value: 'V', angle: -90, position: 'insideLeft', fontSize: 10 }} />
        <YAxis yAxisId="i" orientation="right" tick={{ fontSize: 10 }} label={{ value: 'A', angle: 90, position: 'insideRight', fontSize: 10 }} />
        <Tooltip
          formatter={(v, name) => name === 'powerFactor' ? Number(v).toFixed(3) : Number(v).toFixed(1)}
          contentStyle={{ fontSize: 11, padding: '4px 8px' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <ReferenceLine x={eventTimeIso} yAxisId="v" stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'event', fontSize: 10, fill: '#dc2626' }} />
        <Line yAxisId="v" type="monotone" dataKey="voltageAvg" stroke="#6366f1" dot={false} strokeWidth={2} isAnimationActive={false} name="Voltage (V)" />
        <Line yAxisId="i" type="monotone" dataKey="currentAvg" stroke="#10b981" dot={false} strokeWidth={2} isAnimationActive={false} name="Current (A)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
