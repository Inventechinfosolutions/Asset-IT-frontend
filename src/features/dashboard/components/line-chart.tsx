interface LineChartProps {
  assetSeries: number[];
  itSeries: number[];
  labels: string[];
}

export function LineChart({
  assetSeries,
  itSeries,
  labels,
}: LineChartProps) {
  const width = 720;
  const height = 280;
  const pad = { top: 22, right: 24, bottom: 28, left: 34 };
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
      >
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
              {t}
            </text>
          </g>
        ))}
        <path d={areaFor(assetSeries)} className="dash-area-asset" />
        <path d={areaFor(itSeries)} className="dash-area-it" />
        <path
          d={pathFor(assetSeries)}
          className="dash-line-asset"
          fill="none"
        />
        <path d={pathFor(itSeries)} className="dash-line-it" fill="none" />
        {assetSeries.map((v, i) => (
          <g key={`a-${i}`}>
            <circle cx={xAt(i)} cy={yAt(v)} r="4" className="dash-dot-asset" />
            <text
              x={xAt(i)}
              y={yAt(v) - 10}
              className="dash-point-label"
              textAnchor="middle"
            >
              {v}
            </text>
          </g>
        ))}
        {itSeries.map((v, i) => (
          <g key={`i-${i}`}>
            <circle cx={xAt(i)} cy={yAt(v)} r="4" className="dash-dot-it" />
            <text
              x={xAt(i)}
              y={yAt(v) - 10}
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
    </div>
  );
}
