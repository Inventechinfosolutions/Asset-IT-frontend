import { useEffect } from 'react';

type ToastProps = {
  message: string;
  onClose: () => void;
  durationMs?: number;
};

export function Toast({ message, onClose, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onClose]);

  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}
