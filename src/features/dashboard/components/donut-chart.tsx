interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  total: number;
}

export function DonutChart({ segments, total }: DonutChartProps) {
  const size = 180;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const { computedSegments } = segments.reduce<{
    offset: number;
    computedSegments: Array<Segment & { length: number; dashoffset: number }>;
  }>(
    (acc, seg) => {
      const portion = total === 0 ? 0 : seg.value / total;
      const gap = total === 0 || portion === 0 ? 0 : 3.5;
      const length = Math.max(0, portion * circumference - gap);
      const dashoffset = -acc.offset;
      return {
        offset: acc.offset + portion * circumference,
        computedSegments: [
          ...acc.computedSegments,
          { ...seg, length, dashoffset },
        ],
      };
    },
    { offset: 0, computedSegments: [] },
  );

  return (
    <div className="dash-donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="dash-donut">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#e8eef7"
          strokeWidth={stroke}
        />
        {computedSegments.map((seg) => (
          <circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
            strokeDashoffset={seg.dashoffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="dash-donut-caption"
        >
          Total
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          className="dash-donut-total"
        >
          {total}
        </text>
      </svg>
      <ul className="dash-donut-legend">
        {segments.map((seg) => {
          const pct =
            total === 0 ? 0 : Math.round((seg.value / total) * 100);
          return (
            <li key={seg.label} className="dash-legend-item">
              <span
                className="dash-legend-dot"
                style={{ background: seg.color }}
              />
              <span className="dash-legend-label">{seg.label}</span>
              <span className="dash-legend-meta">
                {seg.value} · {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
