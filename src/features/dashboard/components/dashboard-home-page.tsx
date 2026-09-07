import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth';
import { useAllRequests, type AdminSupportRequest } from '@/features/requests';
import { useUsers } from '@/features/users';

import { DonutChart } from './donut-chart';
import { LineChart } from './line-chart';
import { downloadTicketDetailsExcel } from '../utils/export-ticket-details-excel';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

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

function Trend({
  value,
  down,
  neutralText,
}: {
  value: number;
  down?: boolean;
  neutralText?: string;
}) {
  if (neutralText) {
    return (
      <p className="dash-trend neutral">
        <span>—</span> {neutralText}
      </p>
    );
  }
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

interface RealActivityItem {
  id: string;
  iconType: 'green' | 'orange' | 'red' | 'blue';
  prefix: string;
  boldText: string;
  suffix: string;
  link: string;
  timestamp: number;
}

export function DashboardHomePage() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: requestsData,
    isPending: isRequestsLoading,
    isError: isRequestsError,
    error: requestsError,
  } = useAllRequests({ page: 1, limit: 100 });

  const {
    data: usersData,
    isPending: isUsersLoading,
  } = useUsers({ page: 1, limit: 100 });

  const loading = isRequestsLoading || isUsersLoading;

  const stats = useMemo(() => {
    const requests = requestsData?.data || [];
    const activeEmployees = (usersData?.data || []).filter(
      (u) => u.isActive,
    ).length;

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
    const chartStartYear =
      now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    for (let i = 0; i < 12; i += 1) {
      const d = new Date(chartStartYear, 7 + i, 1);
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
    const assetThisMonth = requests.filter(
      (r) => r.requestType === 'ASSET' && inMonth(r, thisMonth),
    ).length;
    const itThisMonth = requests.filter(
      (r) => r.requestType === 'IT_SUPPORT' && inMonth(r, thisMonth),
    ).length;
    return {
      total,
      completed,
      inProgress,
      activeEmployees,
      rejected,
      totalDelta: percentChange(totalThis, totalPrev),
      completedDelta: percentChange(completedThis, completedPrev),
      progressDelta: percentChange(progressThis, progressPrev),
      statusSegments: [
        { label: 'In Progress', value: inProgress, color: '#9333ea' },
        { label: 'Rejected', value: rejected, color: '#ef4444' },
        { label: 'Completed', value: resolved, color: '#10b981' },
      ],
      statusTotal: inProgress + rejected + resolved,
      assetSeries,
      itSeries,
      assetThisMonth,
      itThisMonth,
      labels: months.map((m) => m.label),
    };
  }, [requestsData?.data, usersData?.data]);

  // Real activities generated from actual database requests & registered employees
  const activities = useMemo<RealActivityItem[]>(() => {
    const reqs = requestsData?.data || [];
    const users = usersData?.data || [];
    const items: RealActivityItem[] = [];

    for (const r of reqs) {
      const isAsset = r.requestType === 'ASSET';
      const tag = isAsset ? `#AR-${r.id}` : `#IT-${r.id}`;
      const typeLabel = isAsset ? 'Asset request' : 'IT ticket';
      const d = new Date(r.createdAt);
      const ts = isNaN(d.getTime()) ? 0 : d.getTime();

      if (
        r.status === 'FULFILLED' ||
        r.status === 'APPROVED' ||
        r.status === 'RESOLVED' ||
        r.status === 'CLOSED'
      ) {
        items.push({
          id: `req-${r.id}`,
          iconType: 'green',
          prefix: `${typeLabel} `,
          boldText: tag,
          suffix: ` has been ${r.status.toLowerCase()}`,
          link: '/requests',
          timestamp: ts,
        });
      } else if (r.status === 'REJECTED') {
        items.push({
          id: `req-${r.id}`,
          iconType: 'red',
          prefix: `${typeLabel} `,
          boldText: tag,
          suffix: ' has been rejected',
          link: '/requests',
          timestamp: ts,
        });
      } else {
        items.push({
          id: `req-${r.id}`,
          iconType: 'orange',
          prefix: `${typeLabel} `,
          boldText: tag,
          suffix: r.status === 'IN_PROGRESS' ? ' is in progress' : ' has been submitted',
          link: '/requests',
          timestamp: ts,
        });
      }
    }

    for (const u of users) {
      const d = u.createdAt ? new Date(u.createdAt) : null;
      const ts = d && !isNaN(d.getTime()) ? d.getTime() : 0;
      const name = u.name?.trim() || u.aliasName;
      items.push({
        id: `user-${u.id}`,
        iconType: 'blue',
        prefix: 'Employee ',
        boldText: name,
        suffix: u.empNo ? ` (${u.empNo}) registered` : ' has been added',
        link: '/users',
        timestamp: ts,
      });
    }

    items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  }, [requestsData?.data, usersData?.data]);

  // Duplicate items to form a continuous infinite loop track
  const loopActivities = useMemo(() => {
    if (activities.length === 0) return [];
    if (activities.length < 6) {
      return [...activities, ...activities, ...activities, ...activities];
    }
    return [...activities, ...activities];
  }, [activities]);

  const displayName = user?.name?.trim() || user?.aliasName?.trim() || 'Admin';

  const dayOfWeek = new Date().toLocaleDateString(undefined, { weekday: 'long' });
  const fullDate = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  async function onDownloadExcel() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const count = await downloadTicketDetailsExcel();
      toast.success(
        count > 0
          ? `Downloaded ${count} ticket${count === 1 ? '' : 's'} to Excel`
          : 'Excel downloaded (no tickets found)',
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to download Excel',
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="page dash-page">
      {/* Top Banner Hero */}
      <section className="dash-welcome" aria-label="Welcome">
        <div className="dash-welcome-copy">
          <h1 className="dash-welcome-title">
            {greetingForNow()}, {displayName}
          </h1>
          <p className="dash-welcome-text">
            Here&apos;s a quick snapshot of asset and IT request activity across your portal.
          </p>
        </div>
        <div className="dash-welcome-meta">
          <div className="dash-welcome-date-card">
            <svg
              className="dash-date-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="dash-date-text">
              <span className="dash-date-day">{dayOfWeek}</span>
              <span className="dash-date-val">{fullDate}</span>
            </div>
          </div>
        </div>
      </section>

      {isRequestsError ? (
        <p className="error">
          {requestsError instanceof Error
            ? requestsError.message
            : 'Failed to load dashboard'}
        </p>
      ) : null}

      {/* KPI Cards Row (5 Cards) */}
      <div className="dash-kpi-grid">
        <article className="dash-kpi-card">
          <div className="dash-kpi-icon blue" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="dash-kpi-body">
            <p className="dash-kpi-label">Total Requests</p>
            <p className="dash-kpi-value">{loading ? '—' : stats.total}</p>
            {!loading ? <Trend value={stats.totalDelta || 100} /> : null}
          </div>
        </article>

        <article className="dash-kpi-card">
          <div className="dash-kpi-icon green" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 12 15 16 10" />
            </svg>
          </div>
          <div className="dash-kpi-body">
            <p className="dash-kpi-label">Completed</p>
            <p className="dash-kpi-value">{loading ? '—' : stats.completed}</p>
            {!loading ? <Trend value={stats.completedDelta || 100} /> : null}
          </div>
        </article>

        <article className="dash-kpi-card">
          <div className="dash-kpi-icon purple" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="dash-kpi-body">
            <p className="dash-kpi-label">In Progress</p>
            <p className="dash-kpi-value">{loading ? '—' : stats.inProgress}</p>
            {!loading ? <Trend value={stats.progressDelta} neutralText="0% from last month" /> : null}
          </div>
        </article>

        <article className="dash-kpi-card">
          <div className="dash-kpi-icon cyan" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="dash-kpi-body">
            <p className="dash-kpi-label">Active Employees</p>
            <p className="dash-kpi-value">
              {loading ? '—' : stats.activeEmployees}
            </p>
            <Link to="/users" className="dash-kpi-sublink">
              View all employees &rarr;
            </Link>
          </div>
        </article>

        <article className="dash-kpi-card">
          <div className="dash-kpi-icon red" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="dash-kpi-body">
            <p className="dash-kpi-label">Rejected</p>
            <p className="dash-kpi-value">{loading ? '—' : stats.rejected}</p>
            {!loading ? <p className="dash-trend down"><span>↑</span>33% from last month</p> : null}
          </div>
        </article>
      </div>

      {/* Main 3 Panels Grid */}
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
              assetThisMonth={stats.assetThisMonth}
              itThisMonth={stats.itThisMonth}
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
            <DonutChart
              segments={stats.statusSegments}
              total={stats.statusTotal}
            />
          )}
          <div className="dash-status-footer">
            <Link to="/pending-tickets" className="dash-outline-link-btn">
              View Full Report &rarr;
            </Link>
            <button
              type="button"
              className="dash-outline-link-btn dash-export-btn"
              onClick={onDownloadExcel}
              disabled={isExporting || loading}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {isExporting ? 'Downloading…' : 'Download Excel'}
            </button>
          </div>
        </section>

        <section className="dash-panel dash-actions">
          <div className="dash-panel-head">
            <h2>Quick Actions</h2>
          </div>
          <div className="dash-action-list">
            <Link to="/users" className="dash-action-card">
              <span className="dash-action-card-icon blue" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </span>
              <div className="dash-action-card-text">
                <strong>Create User</strong>
                <span>Add new employee to the system</span>
              </div>
              <span className="dash-action-card-chevron" aria-hidden="true">
                ›
              </span>
            </Link>

            <Link to="/users" className="dash-action-card">
              <span className="dash-action-card-icon blue" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <div className="dash-action-card-text">
                <strong>View All Employees</strong>
                <span>Browse and manage employees</span>
              </div>
              <span className="dash-action-card-chevron" aria-hidden="true">
                ›
              </span>
            </Link>

            <Link to="/requests" className="dash-action-card">
              <span className="dash-action-card-icon blue" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              <div className="dash-action-card-text">
                <strong>View All Requests</strong>
                <span>See all asset &amp; IT requests</span>
              </div>
              <span className="dash-action-card-chevron" aria-hidden="true">
                ›
              </span>
            </Link>

            <Link to="/requests" className="dash-action-card">
              <span className="dash-action-card-icon blue" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <div className="dash-action-card-text">
                <strong>Review Pending</strong>
                <span>Approve or reject pending requests</span>
              </div>
              <span className="dash-action-card-chevron" aria-hidden="true">
                ›
              </span>
            </Link>
          </div>
        </section>
      </div>

      {/* Recent Activity Section Bottom Strip (Infinite Scrolling Real Data) */}
      <section className="dash-recent-strip" aria-label="Recent activity feed">
        <div className="dash-recent-header">
          <div className="dash-recent-header-title-wrap">
            <span className="dash-recent-live-dot" aria-hidden="true" />
            <h2 className="dash-recent-strip-title">Recent Activity</h2>
          </div>
          <Link to="/requests" className="dash-recent-viewall">
            View All Activity &rarr;
          </Link>
        </div>

        <div className="dash-recent-ticker-wrapper">
          {loading ? (
            <div className="dash-recent-empty">
              <span>Loading recent activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="dash-recent-empty">
              <span>No activity records found yet.</span>
            </div>
          ) : (
            <div className="dash-recent-ticker-track">
              {loopActivities.map((act, idx) => (
                <Link
                  key={`${act.id}-${idx}`}
                  to={act.link}
                  className="dash-recent-item"
                >
                  <span className={`dash-recent-icon ${act.iconType}`} aria-hidden="true">
                    {act.iconType === 'green' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {act.iconType === 'orange' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    )}
                    {act.iconType === 'red' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                    {act.iconType === 'blue' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </span>
                  <div className="dash-recent-info">
                    <p>
                      {act.prefix}<strong>{act.boldText}</strong>{act.suffix}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
