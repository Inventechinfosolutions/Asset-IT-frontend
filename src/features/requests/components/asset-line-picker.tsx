import { useEffect, useRef, useState } from 'react';

export interface SelectedAssetLine {
  assetType: string;
  name: string;
  quantity: number;
}

interface AssetLinePickerProps {
  options: string[];
  value: SelectedAssetLine[];
  onChange: (next: SelectedAssetLine[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

const OTHER = 'Other';
const NAME_MAX = 100;
const QTY_MAX = 999;

function isChecked(rows: SelectedAssetLine[], assetType: string) {
  if (assetType === OTHER) {
    return rows.some((row) => row.assetType === OTHER);
  }
  return rows.some((row) => row.assetType === assetType);
}

export function AssetLinesTable({
  rows,
  onQuantityChange,
}: {
  rows: SelectedAssetLine[];
  onQuantityChange?: (index: number, quantity: number) => void;
}) {
  if (rows.length === 0) return null;

  const editable = Boolean(onQuantityChange);

  return (
    <div className="asset-line-table-wrap">
      <table className="asset-line-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.assetType}-${row.name}-${index}`}>
              <td>{row.name}</td>
              <td>
                {editable ? (
                  <div className="asset-qty-stepper">
                    <button
                      type="button"
                      className="asset-qty-btn"
                      aria-label={`Decrease ${row.name} quantity`}
                      onClick={() =>
                        onQuantityChange?.(index, row.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="asset-qty-value">{row.quantity}</span>
                    <button
                      type="button"
                      className="asset-qty-btn"
                      aria-label={`Increase ${row.name} quantity`}
                      disabled={row.quantity >= QTY_MAX}
                      onClick={() =>
                        onQuantityChange?.(index, row.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                ) : (
                  row.quantity
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AssetLinePicker({
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
}: AssetLinePickerProps) {
  const [open, setOpen] = useState(false);
  const [showOtherName, setShowOtherName] = useState(false);
  const [otherName, setOtherName] = useState('');
  const [localError, setLocalError] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const controlsDisabled = disabled || loading || options.length === 0;
  const selectedCount = value.length;
  const triggerLabel =
    selectedCount === 0
      ? loading
        ? 'Loading assets…'
        : 'Select assets'
      : selectedCount === 1
        ? value[0].name
        : `${selectedCount} assets selected`;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function toggleAsset(assetType: string) {
    setLocalError('');

    if (assetType === OTHER) {
      const hasOther = value.some((row) => row.assetType === OTHER);
      if (hasOther) {
        onChange(value.filter((row) => row.assetType !== OTHER));
        setShowOtherName(false);
        setOtherName('');
      } else {
        setShowOtherName(true);
        setOtherName('');
      }
      return;
    }

    if (isChecked(value, assetType)) {
      onChange(value.filter((row) => row.assetType !== assetType));
    } else {
      onChange([...value, { assetType, name: assetType, quantity: 1 }]);
    }
  }

  function addOtherAsset() {
    const trimmed = otherName.trim();
    if (!trimmed) {
      setLocalError('Enter asset name for Other');
      return;
    }
    if (trimmed.length > NAME_MAX) {
      setLocalError(`Asset name must be at most ${NAME_MAX} characters`);
      return;
    }

    const exists = value.some(
      (row) =>
        row.assetType === OTHER &&
        row.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      setLocalError('This asset name is already added');
      return;
    }

    onChange([
      ...value,
      { assetType: OTHER, name: trimmed, quantity: 1 },
    ]);
    setOtherName('');
    setShowOtherName(false);
    setLocalError('');
  }

  const otherChecked = showOtherName || isChecked(value, OTHER);

  return (
    <div className="asset-line-picker" ref={rootRef}>
      <div className="asset-dropdown">
        <button
          type="button"
          className="asset-dropdown-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={controlsDisabled}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{triggerLabel}</span>
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

        {open ? (
          <div
            className="asset-dropdown-panel"
            role="listbox"
            aria-multiselectable="true"
          >
            {options.map((asset) => {
              const checked =
                asset === OTHER ? otherChecked : isChecked(value, asset);
              return (
                <label
                  key={asset}
                  className={
                    checked
                      ? 'asset-dropdown-option is-selected'
                      : 'asset-dropdown-option'
                  }
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAsset(asset)}
                  />
                  <span>{asset}</span>
                </label>
              );
            })}
          </div>
        ) : null}
      </div>

      {showOtherName ? (
        <label className="asset-line-other">
          <span className="raise-field-label">
            Asset Name<span className="req" aria-hidden="true">*</span>
          </span>
          <div className="asset-line-other-row">
            <input
              type="text"
              value={otherName}
              autoFocus
              onChange={(e) => setOtherName(e.target.value.slice(0, NAME_MAX))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOtherAsset();
                }
              }}
              disabled={controlsDisabled}
              maxLength={NAME_MAX}
              placeholder="Enter asset name"
            />
            <button
              type="button"
              className="asset-line-other-add"
              onClick={addOtherAsset}
              disabled={controlsDisabled || !otherName.trim()}
            >
              Add
            </button>
          </div>
        </label>
      ) : null}

      {localError ? <p className="error asset-line-error">{localError}</p> : null}
    </div>
  );
}
