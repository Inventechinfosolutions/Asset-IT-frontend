import { useCallback, useEffect, useState, type FormEvent } from 'react';

import {
  createUser,
  fetchUsers,
  updateUser,
  type ManagedUser,
} from '../api';
import { PaginationBar } from '../components/PaginationBar';
import { PasswordInput } from '../components/PasswordInput';
import { Toast } from '../components/Toast';

const emptyForm = {
  username: '',
  password: '',
  isPermanent: true,
  empNo: '',
  isActive: true,
};

export function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const clearToast = useCallback(() => setToast(''), []);

  async function loadUsers(
    nextPage = page,
    nextSearch = search,
    nextLimit = limit,
  ) {
    setListLoading(true);
    try {
      const result = await fetchUsers({
        page: nextPage,
        limit: nextLimit,
        search: nextSearch,
      });
      setUsers(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers(page, search, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, limit]);

  function onLimitChange(nextLimit: number) {
    setPage(1);
    setLimit(nextLimit);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

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

  function openCreateForm() {
    setError('');
    setEditingUser(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(user: ManagedUser) {
    setError('');
    setEditingUser(user);
    setForm({
      username: user.username,
      password: '',
      isPermanent: user.employmentType !== 'CONTRACT',
      empNo: user.empNo || '',
      isActive: user.isActive,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingUser(null);
    setError('');
    setForm(emptyForm);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (form.isPermanent && !form.empNo.trim()) {
      setError('Employee number is required for permanent staff');
      return;
    }

    if (!editingUser && !form.password.trim()) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim().replace(/\s+/g, ' ').toLowerCase(),
        isPermanent: form.isPermanent,
        isActive: form.isActive,
        ...(form.isPermanent ? { empNo: form.empNo.trim() } : {}),
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
      };

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        setToast('Employee updated successfully');
      } else {
        await createUser({
          ...payload,
          password: form.password.trim(),
        });
        setToast('Employee created successfully');
      }

      closeForm();
      await loadUsers(page, search, limit);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingUser
            ? 'Failed to update Employee'
            : 'Failed to create Employee',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <Toast message={toast} onClose={clearToast} />

      <div className="page-header page-header-row">
        <div />
        <button type="button" onClick={openCreateForm}>
          Create Employee
        </button>
      </div>

      {error && !showForm ? <p className="error">{error}</p> : null}

      <section className="panel">
        <h2>Users</h2>
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
        ) : users.length === 0 ? (
          <p className="muted">No users found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Employee type</th>
                    <th>Emp no</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <span className="cell-name">{u.username}</span>
                      </td>
                      <td>
                        {u.employmentType === 'PERMANENT' ? (
                          <span className="badge badge-permanent">Permanent</span>
                        ) : u.employmentType === 'CONTRACT' ? (
                          <span className="badge badge-contract">Contract</span>
                        ) : (
                          <span className="cell-muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className="cell-mono">{u.empNo || '—'}</span>
                      </td>
                      <td>
                        <span
                          className={
                            u.isActive
                              ? 'badge badge-role'
                              : 'badge badge-rejected'
                          }
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-role">{u.role}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => openEditForm(u)}
                          aria-label={`Edit ${u.username}`}
                          title="Edit"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
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
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-form-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-header-row">
              <h2 id="user-form-title">
                {editingUser ? 'Edit Employee' : 'Create Employee'}
              </h2>
            </div>

            <form onSubmit={onSubmit} className="form">
              <label>
                Username
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                  minLength={3}
                  maxLength={100}
                  pattern="[a-zA-Z0-9._\- ]+"
                  title="Letters, numbers, spaces, dots, underscores, and hyphens only"
                  autoFocus
                />
              </label>

              <label>
                Password
                <PasswordInput
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required={!editingUser}
                  minLength={6}
                />
              </label>

              <fieldset className="type-toggle">
                <legend>Employee type</legend>
                <div className="check-row">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.isPermanent === true}
                      onChange={() =>
                        setForm({
                          ...form,
                          isPermanent: true,
                        })
                      }
                    />
                    Permanent
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.isPermanent === false}
                      onChange={() =>
                        setForm({
                          ...form,
                          isPermanent: false,
                          empNo: '',
                        })
                      }
                    />
                    Contract
                  </label>
                </div>
              </fieldset>

              {form.isPermanent ? (
                <label>
                  Employee number
                  <input
                    value={form.empNo}
                    onChange={(e) =>
                      setForm({ ...form, empNo: e.target.value })
                    }
                    required
                    
                  />
                </label>
              ) : null}

              <label className="check">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active
              </label>

              {error ? <p className="error">{error}</p> : null}

              <div className="modal-actions">
                <button type="button" className="ghost" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading
                    ? editingUser
                      ? 'Saving…'
                      : 'Creating…'
                    : editingUser
                      ? 'Save changes'
                      : 'Save user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
