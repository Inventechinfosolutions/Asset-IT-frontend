interface LineChartProps {
  assetSeries: number[];
  itSeries: number[];
  labels: string[];
  assetThisMonth: number;
  itThisMonth: number;
}

export function LineChart({
  assetSeries,
  itSeries,
  labels,
  assetThisMonth,
  itThisMonth,
}: LineChartProps) {
  const width = 760;
  const height = 320;
  const pad = { top: 28, right: 26, bottom: 38, left: 42 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxY = Math.max(5, ...assetSeries, ...itSeries);
  const step = Math.ceil(maxY / 5);
  const yMax = step * 5;

  const xAt = (i: number) =>
    pad.left +
    (labels.length <= 1 ? innerW / 2 : (i / (labels.length - 1)) * innerW);
  const yAt = (v: number) => pad.top + innerH - (v / yMax) * innerH;

  function pathFor(series: number[]) {
    if (!series.length) return '';
    if (series.length === 1) {
      return `M ${xAt(0)} ${yAt(series[0])}`;
    }

    let d = `M ${xAt(0)} ${yAt(series[0])}`;
    for (let i = 0; i < series.length - 1; i += 1) {
      const x0 = xAt(i);
      const y0 = yAt(series[i]);
      const x1 = xAt(i + 1);
      const y1 = yAt(series[i + 1]);
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  }

  function areaFor(series: number[]) {
    if (!series.length) return '';
    const line = pathFor(series);
    const last = series.length - 1;
    return `${line} L ${xAt(last)} ${pad.top + innerH} L ${xAt(0)} ${pad.top + innerH} Z`;
  }

  const ticks = [0, 1, 2, 3, 4, 5].map((i) => (yMax / 5) * i);

  return (
    <div className="dash-chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="dash-chart-svg"
        role="img"
        aria-label="Monthly asset requests and IT tickets"
      >
        <defs>
          <linearGradient id="asset-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4285f4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4285f4" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="it-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4035" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ef4035" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          rx="12"
          className="dash-chart-plot-bg"
        />
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={yAt(t)}
              y2={yAt(t)}
              className="dash-grid-line"
            />
            <text
              x={pad.left - 8}
              y={yAt(t) + 4}
              className="dash-axis-label"
              textAnchor="end"
            >
              {Math.round(t)}
            </text>
          </g>
        ))}
        {labels.map((label, i) => (
          <line
            key={`vertical-${label}`}
            x1={xAt(i)}
            x2={xAt(i)}
            y1={pad.top}
            y2={pad.top + innerH}
            className="dash-grid-line dash-grid-line-vertical"
          />
        ))}
        <path d={areaFor(assetSeries)} className="dash-area-asset" />
        <path d={areaFor(itSeries)} className="dash-area-it" />
        <path
          d={pathFor(assetSeries)}
          className="dash-line-asset"
          fill="none"
        />
        <path
          d={pathFor(itSeries)}
          className="dash-line-it"
          fill="none"
        />
        {assetSeries.map((v, i) => (
          <g key={`a-${i}`}>
            <circle cx={xAt(i)} cy={yAt(v)} r="6" className="dash-dot-asset" />
            <text
              x={xAt(i)}
              y={yAt(v) - 13}
              className="dash-point-label"
              textAnchor="middle"
            >
              {v}
            </text>
          </g>
        ))}
        {itSeries.map((v, i) => (
          <g key={`i-${i}`}>
            <circle cx={xAt(i)} cy={yAt(v)} r="6" className="dash-dot-it" />
            <text
              x={xAt(i)}
              y={yAt(v) + 22}
              className="dash-point-label it"
              textAnchor="middle"
            >
              {v}
            </text>
          </g>
        ))}
        {labels.map((label, i) => (
          <text
            key={label}
            x={xAt(i)}
            y={height - 10}
            className="dash-axis-label"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>
      <div className="dash-chart-summary">
        <div className="dash-chart-summary-card asset">
          <span className="dash-chart-summary-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 7h12l1 13H5L6 7Z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
          </span>
          <strong>Asset Requests</strong>
          <b>{assetThisMonth}</b>
          <span>This Month</span>
        </div>
        <div className="dash-chart-summary-card it">
          <span className="dash-chart-summary-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m9 9 6 6M15 9l-6 6" />
            </svg>
          </span>
          <strong>IT Tickets</strong>
          <b>{itThisMonth}</b>
          <span>This Month</span>
        </div>
      </div>
    </div>
  );
}
