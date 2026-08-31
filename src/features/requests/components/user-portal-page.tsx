import { useEffect, useState, type FormEvent } from 'react';

import { PaginationBar } from '@/components/ui/pagination-bar';

import { EyeIcon } from './request-action-icons';
import { RequestDetailModal } from './request-detail-modal';
import { useCreateRequest } from '../hooks/use-request-mutations';
import { useMyRequests } from '../hooks/use-requests';
import type { RequestType } from '../types/request';
import { formatRequestStatus, statusBadgeClass } from '../utils/format-status';

const TITLE_MAX = 200;
const LOCATION_MAX = 500;
const DESCRIPTION_MAX = 2000;

const emptyForm = {
  requestType: 'ASSET' as RequestType,
  title: '',
  location: '',
  description: '',
};

export function UserPortalPage() {
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null,
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, isError, error } = useMyRequests({
    page,
    limit,
    search: search || undefined,
  });

  const createRequestMutation = useCreateRequest();

  const requests = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

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
    setFormError('');
    setForm(emptyForm);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setFormError('');
    setForm(emptyForm);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const title = form.title.trim();
    const location = form.location.trim();
    const description = form.description.trim();

    if (!title) {
      setFormError('Title is required');
      return;
    }
    if (title.length > TITLE_MAX) {
      setFormError(`Title must be at most ${TITLE_MAX} characters`);
      return;
    }
    if (!location) {
      setFormError('Address/location is required');
      return;
    }
    if (location.length > LOCATION_MAX) {
      setFormError(`Address/location must be at most ${LOCATION_MAX} characters`);
      return;
    }
    if (!description) {
      setFormError('Description is required');
      return;
    }
    if (description.length > DESCRIPTION_MAX) {
      setFormError(`Description must be at most ${DESCRIPTION_MAX} characters`);
      return;
    }

    try {
      await createRequestMutation.mutateAsync({
        requestType: form.requestType,
        title,
        location,
        description,
      });
      setForm(emptyForm);
      setShowForm(false);
      setPage(1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Submit failed');
    }
  }

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div />
        <button type="button" className="btn-raise" onClick={openForm}>
          Raise Request
        </button>
      </div>

      {isError ? (
        <p className="error">
          {error instanceof Error ? error.message : 'Failed to load requests'}
        </p>
      ) : null}

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

        {isPending ? (
          <p className="muted">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="muted">No requests found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
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
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => setSelectedRequestId(r.id)}
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
            <div className="modal-header-blue">
              <h2 id="raise-request-title">Raise Request</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeForm}
                aria-label="Close dialog"
                title="Close"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
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

              {formError ? <p className="error">{formError}</p> : null}

              <div className="modal-actions">
                <button type="button" className="ghost" onClick={closeForm}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending
                    ? 'Submitting…'
                    : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <RequestDetailModal
        isOpen={selectedRequestId !== null}
        onClose={() => setSelectedRequestId(null)}
        requestId={selectedRequestId}
        isAdmin={false}
      />
    </div>
  );
}
