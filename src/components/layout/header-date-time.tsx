import { useEffect, useState } from 'react';

export function HeaderDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayName = now.toLocaleDateString(undefined, { weekday: 'short' });
  const dateFormatted = now.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div
      className="shell-header-datetime"
      aria-label={`Current date and time: ${dayName}, ${dateFormatted} ${timeFormatted}`}
    >
      <span className="header-datetime-icon" aria-hidden="true">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
      <div className="header-datetime-text">
        <span className="header-datetime-day">
          {dayName}, {dateFormatted}
        </span>
        <span className="header-datetime-time">{timeFormatted}</span>
      </div>
    </div>
  );
}
