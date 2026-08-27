import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  fetchAllRequests,
  fetchUsers,
  formatRequestStatus,
  type AdminSupportRequest,
} from '../api';
import { useAuth } from '../auth';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function statusBadgeClass(status: string) {
  if (status === 'FULFILLED' || status === 'APPROVED' || status === 'RESOLVED') {
    return 'badge badge-role';
  }
  if (status === 'REJECTED') return 'badge badge-rejected';
  if (status === 'SUBMITTED' || status === 'IN_PROGRESS') {
    return 'badge badge-submitted';
  }
  if (status === 'CLOSED') return 'badge badge-closed';
  return 'badge badge-contract';
}

function isCompleted(status: AdminSupportRequest['status']) {
  return (
    status === 'FULFILLED' ||
    status === 'APPROVED' ||
    status === 'RESOLVED' ||
    status === 'CLOSED'
  );
}

function isInProgress(status: AdminSupportRequest['status']) {
  return status === 'SUBMITTED' || status === 'IN_PROGRESS';
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function LineChart({
  assetSeries,
  itSeries,
  labels,
}: {
  assetSeries: number[];
  itSeries: number[];
  labels: string[];
}) {
  const width = 720;
  const height = 300;
  const pad = { top: 28, right: 16, bottom: 32, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxY = Math.max(5, ...assetSeries, ...itSeries);
  const step = Math.ceil(maxY / 5);
  const yMax = step * 5;

  const xAt = (i: number) =>
    pad.left + (labels.length <= 1 ? innerW / 2 : (i / (labels.length - 1)) * innerW);
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
      <svg viewBox={`0 0 ${width} ${height}`} className="dash-chart-svg" role="img">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={yAt(t)}
              y2={yAt(t)}
              className="dash-grid-line"
            />
            <text x={pad.left - 8} y={yAt(t) + 4} className="dash-axis-label" textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        <path d={areaFor(assetSeries)} className="dash-area-asset" />
        <path d={areaFor(itSeries)} className="dash-area-it" />
        <path d={pathFor(assetSeries)} className="dash-line-asset" fill="none" />
        <path d={pathFor(itSeries)} className="dash-line-it" fill="none" />
        {assetSeries.map((v, i) => (
          <g key={`a-${i}`}>
            <circle cx={xAt(i)} cy={yAt(v)} r="4" className="dash-dot-asset" />
            <text x={xAt(i)} y={yAt(v) - 10} className="dash-point-label" textAnchor="middle">
              {v}
            </text>
          </g>
        ))}
        {itSeries.map((v, i) => (
          <g key={`i-${i}`}>
            <circle cx={xAt(i)} cy={yAt(v)} r="4" className="dash-dot-it" />
            <text x={xAt(i)} y={yAt(v) - 10} className="dash-point-label it" textAnchor="middle">
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

function DonutChart({
  segments,
  total,
}: {
  segments: { label: string; value: number; color: string }[];
  total: number;
}) {
  const size = 180;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

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
        {segments.map((seg) => {
          const portion = total === 0 ? 0 : seg.value / total;
          const gap = total === 0 || portion === 0 ? 0 : 3.5;
          const length = Math.max(0, portion * circumference - gap);
          const dashoffset = -offset;
          offset += portion * circumference;
          return (
            <circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={dashoffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" className="dash-donut-caption">
          Total
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="dash-donut-total">
          {total}
        </text>
      </svg>
      <ul className="dash-donut-legend">
        {segments.map((seg) => {
          const pct = total === 0 ? 0 : Math.round((seg.value / total) * 100);
          return (
            <li key={seg.label} className="dash-legend-item">
              <span className="dash-legend-dot" style={{ background: seg.color }} />
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

export function DashboardHomePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AdminSupportRequest[]>([]);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [requestResult, userResult] = await Promise.all([
          fetchAllRequests({ page: 1, limit: 100 }),
          fetchUsers({ page: 1, limit: 100 }),
        ]);
        if (!cancelled) {
          setRequests(requestResult.data);
          setActiveEmployees(userResult.data.filter((u) => u.isActive).length);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = monthKey(now);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = monthKey(prev);

    const inMonth = (r: AdminSupportRequest, key: string) =>
      monthKey(new Date(r.createdAt)) === key;

    const total = requests.length;
    const completed = requests.filter((r) => isCompleted(r.status)).length;
    const inProgress = requests.filter((r) => isInProgress(r.status)).length;

    const totalThis = requests.filter((r) => inMonth(r, thisMonth)).length;
    const totalPrev = requests.filter((r) => inMonth(r, prevMonth)).length;
    const completedThis = requests.filter(
      (r) => isCompleted(r.status) && inMonth(r, thisMonth),
    ).length;
    const completedPrev = requests.filter(
      (r) => isCompleted(r.status) && inMonth(r, prevMonth),
    ).length;
    const progressThis = requests.filter(
      (r) => isInProgress(r.status) && inMonth(r, thisMonth),
    ).length;
    const progressPrev = requests.filter(
      (r) => isInProgress(r.status) && inMonth(r, prevMonth),
    ).length;

    const rejected = requests.filter((r) => r.status === 'REJECTED').length;
    const resolved = requests.filter(
      (r) =>
        r.status === 'RESOLVED' ||
        r.status === 'CLOSED' ||
        r.status === 'FULFILLED' ||
        r.status === 'APPROVED',
    ).length;

    const months: { label: string; year: number; month: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: MONTHS[d.getMonth()],
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }

    const assetSeries = months.map(
      (m) =>
        requests.filter((r) => {
          const d = new Date(r.createdAt);
          return (
            r.requestType === 'ASSET' &&
            d.getFullYear() === m.year &&
            d.getMonth() === m.month
          );
        }).length,
    );
    const itSeries = months.map(
      (m) =>
        requests.filter((r) => {
          const d = new Date(r.createdAt);
          return (
            r.requestType === 'IT_SUPPORT' &&
            d.getFullYear() === m.year &&
            d.getMonth() === m.month
          );
        }).length,
    );

    const assetCount = requests.filter((r) => r.requestType === 'ASSET').length;
    const itCount = requests.filter((r) => r.requestType === 'IT_SUPPORT').length;
    const recentRequests = [...requests]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 6);

    return {
      total,
      completed,
      inProgress,
      activeEmployees,
      assetCount,
      itCount,
      rejected,
      recentRequests,
      totalDelta: percentChange(totalThis, totalPrev),
      completedDelta: percentChange(completedThis, completedPrev),
      progressDelta: percentChange(progressThis, progressPrev),
      statusSegments: [
        { label: 'In Progress', value: inProgress, color: '#7c3aed' },
        { label: 'Rejected', value: rejected, color: '#f43f5e' },
        { label: 'Completed', value: resolved, color: '#10b981' },
      ],
      statusTotal: inProgress + rejected + resolved,
      assetSeries,
      itSeries,
      labels: months.map((m) => m.label),
    };
  }, [requests, activeEmployees]);

  function Trend({ value, down }: { value: number; down?: boolean }) {
    const positive = down ? value <= 0 : value >= 0;
    const abs = Math.abs(value);
    return (
      <p className={`dash-trend ${positive ? 'up' : 'down'}`}>
        <span aria-hidden="true">{positive ? '↑' : '↓'}</span>
        {abs}% from last month
      </p>
    );
  }

  function greetingForNow() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  const displayName = user?.name?.trim() || user?.username?.trim() || 'Admin';

  return (
    <div className="page dash-page">
      <section className="dash-welcome" aria-label="Welcome">
        <div className="dash-welcome-copy">
          
          <h1 className="dash-welcome-title">
            {greetingForNow()}, {displayName}
          </h1>
          <p className="dash-welcome-text">
            Here is a quick snapshot of asset and IT request activity across
            your portal.
          </p>
        </div>
        <div className="dash-welcome-meta">
          <span className="dash-welcome-date">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <div className="dash-kpi-grid">
        <article className="dash-kpi-card">
          <div className="dash-kpi-icon blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <p className="dash-kpi-label">Total Requests</p>
            <p className="dash-kpi-value">{loading ? '—' : stats.total}</p>
            {!loading ? <Trend value={stats.totalDelta} /> : null}
          </div>
        </article>

        <article className="dash-kpi-card">
          <div className="dash-kpi-icon green" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <p className="dash-kpi-label">Completed</p>
            <p className="dash-kpi-value">{loading ? '—' : stats.completed}</p>
            {!loading ? <Trend value={stats.completedDelta} /> : null}
          </div>
        </article>

        <article className="dash-kpi-card">
          <div className="dash-kpi-icon yellow" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="dash-kpi-label">In Progress</p>
            <p className="dash-kpi-value">{loading ? '—' : stats.inProgress}</p>
            {!loading ? <Trend value={stats.progressDelta} /> : null}
          </div>
        </article>

        <article className="dash-kpi-card">
          <div className="dash-kpi-icon blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="dash-kpi-label">Active Employees</p>
            <p className="dash-kpi-value">
              {loading ? '—' : stats.activeEmployees}
            </p>
          </div>
        </article>

        <article className="dash-kpi-card">
          <div className="dash-kpi-icon red" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>
          <div>
            <p className="dash-kpi-label">Rejected</p>
            <p className="dash-kpi-value">{loading ? '—' : stats.rejected}</p>
          </div>
        </article>
      </div>

      <div className="dash-main-grid">
        <section className="dash-panel dash-overview">
          <div className="dash-panel-head">
            <h2>Requests &amp; Tickets Overview</h2>
            <div className="dash-legend-inline">
              <span>
                <i className="dash-swatch asset" /> Asset Requests
              </span>
              <span>
                <i className="dash-swatch it" /> IT Tickets
              </span>
            </div>
          </div>
          {loading ? (
            <p className="muted">Loading chart…</p>
          ) : (
            <LineChart
              assetSeries={stats.assetSeries}
              itSeries={stats.itSeries}
              labels={stats.labels}
            />
          )}
        </section>

        <section className="dash-panel dash-status">
          <div className="dash-panel-head">
            <h2>Requests by Status</h2>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <DonutChart segments={stats.statusSegments} total={stats.statusTotal} />
          )}
        </section>

        <section className="dash-panel dash-actions">
          <div className="dash-panel-head">
            <h2>Quick Actions</h2>
          </div>
          <div className="dash-action-list">
            <Link to="/users" className="dash-action-item">
              <span className="dash-action-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </span>
              <span>Create Employee</span>
              <span className="dash-action-chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/users" className="dash-action-item">
              <span className="dash-action-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span>View All Employees</span>
              <span className="dash-action-chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/requests" className="dash-action-item">
              <span className="dash-action-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              <span>View All Requests</span>
              <span className="dash-action-chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/requests" className="dash-action-item">
              <span className="dash-action-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span>Review Pending</span>
              <span className="dash-action-chevron" aria-hidden="true">›</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
