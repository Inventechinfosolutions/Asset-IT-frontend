import { useEffect, useState, type FormEvent } from 'react';

import { PasswordInput } from '@/features/auth';

import type { ManagedUser } from '../types/user';

interface UserModalProps {
  isOpen: boolean;
  editingUser: ManagedUser | null;
  onClose: () => void;
  onSubmit: (formData: {
    username: string;
    password?: string;
    isPermanent: boolean;
    empNo?: string;
    isActive: boolean;
  }) => Promise<void>;
  isLoading: boolean;
}

const emptyForm = {
  username: '',
  password: '',
  isPermanent: true,
  empNo: '',
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

  if (isOpen !== prevIsOpen || editingUser !== prevEditingUser) {
    setPrevIsOpen(isOpen);
    setPrevEditingUser(editingUser);
    setFormError('');
    if (editingUser) {
      setForm({
        username: editingUser.username,
        password: '',
        isPermanent: editingUser.employmentType !== 'CONTRACT',
        empNo: editingUser.empNo || '',
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

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (form.isPermanent && !form.empNo.trim()) {
      setFormError('Employee number is required for permanent staff');
      return;
    }

    if (!editingUser && !form.password.trim()) {
      setFormError('Password is required');
      return;
    }

    try {
      await onSubmit({
        username: form.username.trim().replace(/\s+/g, ' ').toLowerCase(),
        isPermanent: form.isPermanent,
        isActive: form.isActive,
        ...(form.isPermanent ? { empNo: form.empNo.trim() } : {}),
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
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
            {editingUser ? 'Edit Employee' : 'Create Employee'}
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
          <label>
            Username
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
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
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  onChange={() => setForm({ ...form, isPermanent: true })}
                />
                Permanent
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.isPermanent === false}
                  onChange={() =>
                    setForm({ ...form, isPermanent: false, empNo: '' })
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
                onChange={(e) => setForm({ ...form, empNo: e.target.value })}
                required
              />
            </label>
          ) : null}

          <label className="check">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
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
