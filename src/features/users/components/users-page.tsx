import { useEffect, useRef, useState } from 'react';

import { PaginationBar } from '@/components/ui/pagination-bar';

import { UserModal } from './user-modal';
import { ResetPasswordDialog } from './reset-password-dialog';
import {
  useCreateUser,
  useResetUserPassword,
  useUpdateUser,
} from '../hooks/use-user-mutations';
import { useUsers } from '../hooks/use-users';
import type { ManagedUser } from '../types/user';

type EmploymentTypeFilter = '' | 'Permanent' | 'Contract';

const EMPLOYMENT_TYPE_FILTERS: {
  value: EmploymentTypeFilter;
  label: string;
}[] = [
  { value: '', label: 'All' },
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Contract', label: 'Contract' },
];

export function UsersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [employmentTypeFilter, setEmploymentTypeFilter] =
    useState<EmploymentTypeFilter>('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<ManagedUser | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!filterOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (!filterRef.current?.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setFilterOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [filterOpen]);

  const { data, isPending, isError, error } = useUsers({
    page,
    limit,
    search: search || undefined,
    isActive: showInactive ? false : true,
    employmentType: employmentTypeFilter || undefined,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const resetPasswordMutation = useResetUserPassword();

  const isMutating =
    createUserMutation.isPending ||
    updateUserMutation.isPending ||
    resetPasswordMutation.isPending;

  const selectedFilterLabel =
    EMPLOYMENT_TYPE_FILTERS.find((item) => item.value === employmentTypeFilter)
      ?.label || 'All';

  function openCreateForm() {
    setEditingUser(null);
    setShowModal(true);
  }

  function openEditForm(user: ManagedUser) {
    setEditingUser(user);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingUser(null);
  }

  async function handleFormSubmit(formData: {
    firstName: string;
    lastName?: string;
    aliasName: string;
    department: string;
    employmentType: 'Permanent' | 'Contract';
    empNo?: string;
    mobile?: string;
    isActive: boolean;
  }) {
    if (editingUser) {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        input: formData,
      });
    } else {
      await createUserMutation.mutateAsync(formData);
    }
    closeModal();
  }

  async function handleResetPassword() {
    if (!resetPasswordUser) return;
    await resetPasswordMutation.mutateAsync(resetPasswordUser.id);
    setResetPasswordUser(null);
  }

  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div />
        <div className="page-header-actions">
          <label className="page-filter-toggle">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => {
                setPage(1);
                setShowInactive(e.target.checked);
              }}
            />
            <span className="page-filter-toggle-box" aria-hidden="true" />
            Inactive
          </label>
          <button type="button" onClick={openCreateForm}>
            Create User
          </button>
        </div>
      </div>

      {isError ? (
        <p className="error">
          {error instanceof Error ? error.message : 'Failed to load users'}
        </p>
      ) : null}

      <section className="panel">
        <h2>Users</h2>
        <div className="table-toolbar">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
          />
          <div className="table-filter-dropdown" ref={filterRef}>
            <button
              type="button"
              className="table-filter-trigger"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              aria-label="Filter by employee type"
              onClick={() => setFilterOpen((open) => !open)}
            >
              <span>{selectedFilterLabel}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {filterOpen ? (
              <div className="table-filter-menu" role="listbox">
                {EMPLOYMENT_TYPE_FILTERS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="option"
                    aria-selected={employmentTypeFilter === item.value}
                    className={
                      employmentTypeFilter === item.value
                        ? 'table-filter-option is-selected'
                        : 'table-filter-option'
                    }
                    onClick={() => {
                      setPage(1);
                      setEmploymentTypeFilter(item.value);
                      setFilterOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {isPending ? (
          <p className="muted">Loading…</p>
        ) : users.length === 0 ? (
          <p className="muted">No users found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Emp No</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => (
                    <tr key={u.id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>
                        <span className="cell-name">
                          {[u.firstName || u.name, u.lastName]
                            .filter(Boolean)
                            .join(' ')}
                        </span>
                      </td>
                      <td>
                        <span className="cell-mono">{u.empNo || '—'}</span>
                      </td>
                      <td>{u.department || '—'}</td>
                      <td>
                        {u.employmentType === 'Permanent' ||
                        u.employmentType === 'Contract' ? (
                          <span
                            className={
                              u.employmentType === 'Permanent'
                                ? 'badge badge-permanent'
                                : 'badge badge-contract'
                            }
                          >
                            {u.employmentType}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className="cell-mono">{u.mobile || '—'}</span>
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
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => openEditForm(u)}
                            aria-label={`Edit ${u.aliasName}`}
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
                          <button
                            type="button"
                            className="btn-icon btn-icon-action"
                            onClick={() => setResetPasswordUser(u)}
                            aria-label={`Reset password for ${u.aliasName}`}
                            title="Reset password"
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
                              <path d="M3 7v6h6" />
                              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.36 2.64L3 13" />
                            </svg>
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
            />
          </>
        )}
      </section>

      <UserModal
        isOpen={showModal}
        editingUser={editingUser}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        isLoading={isMutating}
      />

      <ResetPasswordDialog
        user={resetPasswordUser}
        isOpen={Boolean(resetPasswordUser)}
        isLoading={resetPasswordMutation.isPending}
        onClose={() => setResetPasswordUser(null)}
        onConfirm={handleResetPassword}
      />
    </div>
  );
}
