import { useEffect, useState, type FormEvent } from 'react';

import type { ManagedUser } from '../types/user';
import { useActiveDepartments } from '@/features/departments';

interface UserModalProps {
  isOpen: boolean;
  editingUser: ManagedUser | null;
  onClose: () => void;
  onSubmit: (formData: {
    firstName: string;
    lastName?: string;
    aliasName: string;
    department: string;
    mobile?: string;
    isActive: boolean;
  }) => Promise<void>;
  isLoading: boolean;
}

const MOBILE_PATTERN = /^[6-9]\d{9}$/;

function sanitizeMobile(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

const emptyForm = {
  firstName: '',
  lastName: '',
  aliasName: '',
  department: '',
  mobile: '',
  isActive: true,
};

export function UserModal({
  isOpen,
  editingUser,
  onClose,
  onSubmit,
  isLoading,
}: UserModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [prevEditingUser, setPrevEditingUser] = useState<ManagedUser | null>(
    null,
  );
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const { data: activeDepartments = [] } = useActiveDepartments();

  if (isOpen !== prevIsOpen || editingUser !== prevEditingUser) {
    setPrevIsOpen(isOpen);
    setPrevEditingUser(editingUser);
    setFormError('');
    if (editingUser) {
      setForm({
        firstName: editingUser.firstName || editingUser.name || '',
        lastName: editingUser.lastName || '',
        aliasName: editingUser.aliasName,
        department: editingUser.department || '',
        mobile: editingUser.mobile || '',
        isActive: editingUser.isActive,
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

  useEffect(() => {
    if (!isOpen || activeDepartments.length === 0) return;

    setForm((current) => {
      if (
        !current.department ||
        activeDepartments.includes(current.department)
      ) {
        return current;
      }
      return { ...current, department: '' };
    });
  }, [isOpen, activeDepartments]);

  if (!isOpen) return null;

  const departmentOptions = [...activeDepartments].sort((a, b) =>
    a.localeCompare(b),
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const aliasName = form.aliasName.trim().replace(/\s+/g, ' ').toLowerCase();
    const department = form.department.trim();
    const mobile = sanitizeMobile(form.mobile);

    if (!firstName) {
      setFormError('First name is required');
      return;
    }

    if (!aliasName) {
      setFormError('Alias name is required');
      return;
    }

    if (!department) {
      setFormError('Department is required');
      return;
    }

    if (mobile && !MOBILE_PATTERN.test(mobile)) {
      setFormError('Enter a valid 10-digit mobile number');
      return;
    }

    try {
      await onSubmit({
        firstName,
        aliasName,
        department,
        isActive: form.isActive,
        ...(lastName ? { lastName } : {}),
        mobile: mobile || undefined,
      });
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
        aria-labelledby="user-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-blue">
          <h2 id="user-form-title">
            {editingUser ? 'Edit User' : 'Create User'}
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
              <span className="form-field-label">First Name</span>
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
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
              required
              maxLength={100}
              autoFocus
            />
          </div>

          <label>
            Last Name
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              maxLength={100}
            />
          </label>

          <label>
            Alias Name
            <input
              type="text"
              value={form.aliasName}
              onChange={(e) => setForm({ ...form, aliasName: e.target.value })}
              required
              minLength={3}
              maxLength={100}
              pattern="[a-zA-Z0-9._\- ]+"
              title="Letters, numbers, spaces, dots, underscores, and hyphens only"
            />
          </label>

          <label>
            Mobile Number
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={form.mobile}
              onChange={(e) =>
                setForm({ ...form, mobile: sanitizeMobile(e.target.value) })
              }
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              placeholder="10-digit number (optional)"
              title="Enter a valid 10-digit mobile number starting with 6–9"
            />
          </label>

          <label>
            Department
            <select
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              required
            >
              <option value="">Select department</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          {formError ? <p className="error">{formError}</p> : null}

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading
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
  );
}
