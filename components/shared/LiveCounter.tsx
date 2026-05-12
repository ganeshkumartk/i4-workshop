'use client';

interface Props {
  current: number;
  total: number;
  label?: string;
}

export default function LiveCounter({ current, total, label = 'responded' }: Props) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-white/60">
        <span>{current} of {total} {label}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#BEF264] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
