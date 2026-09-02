import { useEffect, useState, type FormEvent } from 'react';

import type { Department } from '../types/department';

interface DepartmentModalProps {
  isOpen: boolean;
  editingDepartment: Department | null;
  onClose: () => void;
  onSubmit: (formData: { name: string; isActive: boolean }) => Promise<void>;
  isLoading: boolean;
}

const emptyForm = {
  name: '',
  isActive: true,
};

export function DepartmentModal({
  isOpen,
  editingDepartment,
  onClose,
  onSubmit,
  isLoading,
}: DepartmentModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [prevEditingDepartment, setPrevEditingDepartment] =
    useState<Department | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (isOpen !== prevIsOpen || editingDepartment !== prevEditingDepartment) {
    setPrevIsOpen(isOpen);
    setPrevEditingDepartment(editingDepartment);
    setFormError('');
    if (editingDepartment) {
      setForm({
        name: editingDepartment.name,
        isActive: editingDepartment.isActive,
      });
    } else {
      setForm(emptyForm);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const name = form.name.trim();
    if (!name) {
      setFormError('Department name is required');
      return;
    }

    try {
      await onSubmit({ name, isActive: form.isActive });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Operation failed');
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="department-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-blue">
          <h2 id="department-form-title">
            {editingDepartment ? 'Edit Department' : 'Create Department'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
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

        <form onSubmit={handleSubmit} className="form">
          <div className="form-first-name-group">
            <div className="form-first-name-header">
              <span className="form-field-label">Department Name</span>
              <label className="check form-active-check">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active
              </label>
            </div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={100}
              autoFocus
            />
          </div>

          {formError ? <p className="error">{formError}</p> : null}

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading
                ? editingDepartment
                  ? 'Saving…'
                  : 'Creating…'
                : editingDepartment
                  ? 'Save changes'
                  : 'Save department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
