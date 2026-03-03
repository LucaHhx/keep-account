const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#EC4899', '#9CA3AF'];

interface DonutChartProps {
  items: { percentage: number }[];
  centerLabel: string;
  centerValue: string;
}

export default function DonutChart({ items, centerLabel, centerValue }: DonutChartProps) {
  // Build conic-gradient stops
  const stops: string[] = [];
  let cursor = 0;
  const limited = items.slice(0, 7);

  limited.forEach((item, i) => {
    const start = cursor;
    cursor += item.percentage;
    const end = cursor;
    stops.push(`${COLORS[i]} ${start}% ${end}%`);
  });

  // Fill remaining to 100% with last color if total < 100
  if (cursor < 100) {
    stops.push(`${COLORS[Math.min(limited.length, 6)]} ${cursor}% 100%`);
  }

  const gradient = stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(#e5e7eb 0% 100%)';

  return (
    <div className="flex justify-center mb-5">
      <div
        className="w-[180px] h-[180px] lg:w-[220px] lg:h-[220px] rounded-full relative"
        style={{ background: gradient }}
      >
        {/* Inner circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] lg:w-[140px] lg:h-[140px] rounded-full bg-white dark:bg-gray-800" />
        {/* Center text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">{centerLabel}</div>
          <div className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-50">{centerValue}</div>
        </div>
      </div>
    </div>
  );
}

export { COLORS };
