import { useEffect, useState } from 'react';

import { PaginationBar } from '@/components/ui/pagination-bar';

import { UserModal } from './user-modal';
import { useCreateUser, useUpdateUser } from '../hooks/use-user-mutations';
import { useUsers } from '../hooks/use-users';
import type { ManagedUser } from '../types/user';

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, isError, error } = useUsers({
    page,
    limit,
    search: search || undefined,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isMutating =
    createUserMutation.isPending || updateUserMutation.isPending;

  function onLimitChange(nextLimit: number) {
    setPage(1);
    setLimit(nextLimit);
  }

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
    username: string;
    password?: string;
    isPermanent: boolean;
    empNo?: string;
    isActive: boolean;
  }) {
    if (editingUser) {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        input: formData,
      });
    } else {
      if (!formData.password) {
        throw new Error('Password is required');
      }
      await createUserMutation.mutateAsync({
        username: formData.username,
        password: formData.password,
        isPermanent: formData.isPermanent,
        empNo: formData.empNo,
        isActive: formData.isActive,
      });
    }
    closeModal();
  }

  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div />
        <button type="button" onClick={openCreateForm}>
          Create Employee
        </button>
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
                          <span className="badge badge-permanent">
                            Permanent
                          </span>
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

      <UserModal
        isOpen={showModal}
        editingUser={editingUser}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        isLoading={isMutating}
      />
    </div>
  );
}
