import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createSupportRequest,
  fetchMyRequests,
  formatRequestStatus,
  type SupportRequest,
} from '../api';
import { PaginationBar } from '../components/PaginationBar';
import { EyeIcon } from '../components/RequestActionIcons';
import { Toast } from '../components/Toast';

type RequestType = 'ASSET' | 'IT_SUPPORT';

const TITLE_MAX = 200;
const LOCATION_MAX = 500;
const DESCRIPTION_MAX = 2000;

const emptyForm = {
  requestType: 'ASSET' as RequestType,
  title: '',
  location: '',
  description: '',
};

function statusBadgeClass(status: string) {
  if (status === 'FULFILLED' || status === 'APPROVED' || status === 'RESOLVED') {
    return 'badge badge-role';
  }
  if (status === 'REJECTED') return 'badge badge-rejected';
  if (status === 'SUBMITTED') return 'badge badge-submitted';
  if (status === 'CLOSED') return 'badge badge-closed';
  return 'badge badge-contract';
}

export function UserPortalPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const clearToast = useCallback(() => setToast(''), []);

  async function loadRequests(
    nextPage = page,
    nextSearch = search,
    nextLimit = limit,
  ) {
    setListLoading(true);
    try {
      const result = await fetchMyRequests({
        page: nextPage,
        limit: nextLimit,
        search: nextSearch,
      });
      setRequests(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests(page, search, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, limit]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function onLimitChange(nextLimit: number) {
    setPage(1);
    setLimit(nextLimit);
  }

  useEffect(() => {
    if (!showForm) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeForm();
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [showForm]);

  function openForm() {
    setError('');
    setForm(emptyForm);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setError('');
    setForm(emptyForm);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const title = form.title.trim();
    const location = form.location.trim();
    const description = form.description.trim();

    if (!title) {
      setError('Title is required');
      return;
    }
    if (title.length > TITLE_MAX) {
      setError(`Title must be at most ${TITLE_MAX} characters`);
      return;
    }
    if (!location) {
      setError('Address/location is required');
      return;
    }
    if (location.length > LOCATION_MAX) {
      setError(`Address/location must be at most ${LOCATION_MAX} characters`);
      return;
    }
    if (!description) {
      setError('Description is required');
      return;
    }
    if (description.length > DESCRIPTION_MAX) {
      setError(`Description must be at most ${DESCRIPTION_MAX} characters`);
      return;
    }

    setLoading(true);
    try {
      const requestType = form.requestType;
      await createSupportRequest({
        requestType,
        title,
        location,
        description,
      });
      setForm(emptyForm);
      setShowForm(false);
      setToast(
        requestType === 'ASSET'
          ? 'Asset request submitted successfully'
          : 'IT support ticket submitted successfully',
      );
      setPage(1);
      await loadRequests(1, search, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <Toast message={toast} onClose={clearToast} />

      <div className="page-header page-header-row">
        <div />
        <button type="button" className="btn-raise" onClick={openForm}>
          Raise Request
        </button>
      </div>

      {error && !showForm ? <p className="error">{error}</p> : null}

      <section className="panel">
        <h2>My Requests</h2>
        <div className="table-toolbar">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
          />
        </div>

        {listLoading ? (
          <p className="muted">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="muted">No requests found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Address</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className="cell-mono">{r.id}</span>
                      </td>
                      <td>
                        <span
                          className={
                            r.requestType === 'ASSET'
                              ? 'badge badge-permanent'
                              : 'badge badge-it'
                          }
                        >
                          {r.requestType === 'ASSET' ? 'Asset' : 'IT Support'}
                        </span>
                      </td>
                      <td>
                        <span className="cell-name">{r.title || '—'}</span>
                      </td>
                      <td>
                        <div className="cell-description-scroll">
                          {r.location || '—'}
                        </div>
                      </td>
                      <td>
                        <div className="cell-description-scroll">
                          {r.description}
                        </div>
                      </td>
                      <td>
                        <span className={statusBadgeClass(r.status)}>
                          {formatRequestStatus(r.status)}
                        </span>
                      </td>
                      <td className="cell-muted">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => navigate(`/portal/requests/${r.id}`)}
                            aria-label={`View request ${r.id}`}
                            title="View"
                          >
                            <EyeIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={onLimitChange}
            />
          </>
        )}
      </section>

      {showForm ? (
        <div
          className="modal-backdrop"
          onClick={closeForm}
          role="presentation"
        >
          <div
            className="modal modal-raise"
            role="dialog"
            aria-modal="true"
            aria-labelledby="raise-request-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-header-row">
              <h2 id="raise-request-title">Raise Request</h2>
             
            </div>

            <form onSubmit={onSubmit} className="form">
              <fieldset className="type-toggle">
                <legend>Request type</legend>
                <div className="check-row">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.requestType === 'ASSET'}
                      onChange={() =>
                        setForm({ ...form, requestType: 'ASSET' })
                      }
                    />
                    Asset request
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.requestType === 'IT_SUPPORT'}
                      onChange={() =>
                        setForm({ ...form, requestType: 'IT_SUPPORT' })
                      }
                    />
                    IT support ticket
                  </label>
                </div>
              </fieldset>

              <label>
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value.slice(0, TITLE_MAX),
                    })
                  }
                  required
                  maxLength={TITLE_MAX}
                  placeholder="Short title for your request"
                  autoFocus
                />
              </label>

              <label>
                Address / Location
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      location: e.target.value.slice(0, LOCATION_MAX),
                    })
                  }
                  required
                  maxLength={LOCATION_MAX}
                  placeholder="Enter address or location"
                />
              </label>

              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value.slice(0, DESCRIPTION_MAX),
                    })
                  }
                  required
                  maxLength={DESCRIPTION_MAX}
                  rows={5}
                  placeholder="Describe your request or issue"
                />
              </label>

              {error ? <p className="error">{error}</p> : null}

              <div className="modal-actions">
                <button type="button" className="ghost" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
