import { useEffect, useState } from 'react';

import { PaginationBar } from '@/components/ui/pagination-bar';

import { DepartmentModal } from './department-modal';
import {
  useCreateDepartment,
  useUpdateDepartment,
} from '../hooks/use-department-mutations';
import { useDepartments } from '../hooks/use-departments';
import type { Department } from '../types/department';

export function DepartmentsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, isError, error } = useDepartments({
    page,
    limit,
    search: search || undefined,
    isActive: showInactive ? false : true,
  });

  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();

  const isMutating =
    createDepartmentMutation.isPending || updateDepartmentMutation.isPending;

  function openCreateForm() {
    setEditingDepartment(null);
    setShowModal(true);
  }

  function openEditForm(department: Department) {
    setEditingDepartment(department);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingDepartment(null);
  }

  async function handleFormSubmit(formData: {
    name: string;
    isActive: boolean;
  }) {
    if (editingDepartment) {
      await updateDepartmentMutation.mutateAsync({
        id: editingDepartment.id,
        input: formData,
      });
    } else {
      await createDepartmentMutation.mutateAsync(formData);
    }
    closeModal();
  }

  const departments = data?.data || [];
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
            Create Department
          </button>
        </div>
      </div>

      {isError ? (
        <p className="error">
          {error instanceof Error ? error.message : 'Failed to load departments'}
        </p>
      ) : null}

      <section className="panel">
        <h2>Departments</h2>
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
        ) : departments.length === 0 ? (
          <p className="muted">No departments found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((department, index) => (
                    <tr key={department.id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>
                        <span className="cell-name">{department.name}</span>
                      </td>
                      <td>
                        <span
                          className={
                            department.isActive
                              ? 'badge badge-role'
                              : 'badge badge-rejected'
                          }
                        >
                          {department.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => openEditForm(department)}
                          aria-label={`Edit ${department.name}`}
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
            />
          </>
        )}
      </section>

      <DepartmentModal
        isOpen={showModal}
        editingDepartment={editingDepartment}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        isLoading={isMutating}
      />
    </div>
  );
}
