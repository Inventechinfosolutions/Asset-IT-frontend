import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useActiveAssets } from '@/features/assets';
import { useZones } from '@/features/zones';

import {
  AssetLinePicker,
  AssetLinesTable,
  type SelectedAssetLine,
} from './asset-line-picker';
import { useCreateRequest } from '../hooks/use-request-mutations';
import type { RequestType } from '../types/request';

const TITLE_MAX = 200;
const LOCATION_MAX = 500;
const DESCRIPTION_MAX = 2000;

const emptyForm = {
  requestType: 'DEVICE' as RequestType,
  selectedAssets: [] as SelectedAssetLine[],
  title: '',
  zone: '',
  location: '',
  description: '',
};

export function RaiseRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [zoneOpen, setZoneOpen] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);

  const createRequestMutation = useCreateRequest();
  const { data: activeAssets = [], isPending: assetsPending } = useActiveAssets(
    form.requestType === 'DEVICE',
  );
  const { data: zones = [], isPending: zonesPending } = useZones();

  const isDevice = form.requestType === 'DEVICE';
  const zoneDisabled = zonesPending || zones.length === 0;
  const zoneLabel = form.zone
    ? form.zone
    : zonesPending
      ? 'Loading zones…'
      : 'Select zone';

  useEffect(() => {
    if (!zoneOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (!zoneRef.current?.contains(e.target as Node)) {
        setZoneOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setZoneOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [zoneOpen]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const title = form.title.trim();
    const zone = form.zone.trim();
    const location = form.location.trim();
    const description = form.description.trim();

    if (!title) {
      setFormError('Title is required');
      return;
    }
    if (title.length > TITLE_MAX) {
      setFormError(`Title must be at most ${TITLE_MAX} characters`);
      return;
    }
    if (!zone) {
      setFormError('Zone is required');
      return;
    }
    if (!location) {
      setFormError('Address/location is required');
      return;
    }
    if (location.length > LOCATION_MAX) {
      setFormError(`Address/location must be at most ${LOCATION_MAX} characters`);
      return;
    }
    if (description.length > DESCRIPTION_MAX) {
      setFormError(`Description must be at most ${DESCRIPTION_MAX} characters`);
      return;
    }
    if (isDevice && form.selectedAssets.length === 0) {
      setFormError('Select at least one asset');
      return;
    }

    try {
      await createRequestMutation.mutateAsync({
        requestType: form.requestType,
        title,
        zone,
        location,
        description,
        ...(isDevice ? { selectedAssets: form.selectedAssets } : {}),
      });
      navigate('/portal');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Submit failed');
    }
  }

  return (
    <div className="page raise-request-page">
      <div className="page-header page-header-row">
        <div>
          <h1>Raise Request</h1>
          <p className="muted">Submit a new device or IT support request</p>
        </div>
        
      </div>

      <section className="raise-request-card">
        <form onSubmit={onSubmit} className="raise-request-form">
          <div className="raise-request-type-row">
            <span className="raise-request-section-label">Request type</span>
            <div className="raise-request-check-row">
              <label className="check">
                <input
                  type="checkbox"
                  checked={isDevice}
                  onChange={() =>
                    setForm({
                      ...form,
                      requestType: 'DEVICE',
                    })
                  }
                />
                Device request
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={!isDevice}
                  onChange={() =>
                    setForm({
                      ...form,
                      requestType: 'IT_SUPPORT',
                      selectedAssets: [],
                    })
                  }
                />
                IT support ticket
              </label>
            </div>
          </div>

          <div
            className={
              isDevice
                ? 'raise-request-grid is-asset'
                : 'raise-request-grid is-it'
            }
          >
            {isDevice ? (
              <div className="raise-field raise-field-assets">
                <span className="raise-field-label">
                  Devices<span className="req" aria-hidden="true">*</span>
                </span>
                <AssetLinePicker
                  options={activeAssets}
                  value={form.selectedAssets}
                  onChange={(selectedAssets) =>
                    setForm({ ...form, selectedAssets })
                  }
                  loading={assetsPending}
                  disabled={assetsPending || activeAssets.length === 0}
                />
                {form.selectedAssets.length === 0 ? (
                  <span className="field-hint-left">
                    {assetsPending
                      ? 'Loading assets…'
                      : activeAssets.length === 0
                        ? 'No active assets available'
                        : 'Required — add one or more assets'}
                  </span>
                ) : null}
              </div>
            ) : null}

            <label className="raise-field raise-field-title">
              <span className="raise-field-label">
                Title<span className="req" aria-hidden="true">*</span>
              </span>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value.slice(0, TITLE_MAX),
                  })
                }
                required
                maxLength={TITLE_MAX}
                placeholder="Short title for your request"
                autoFocus
              />
            </label>

            {isDevice && form.selectedAssets.length > 0 ? (
              <div className="raise-field raise-field-asset-table">
                <AssetLinesTable
                  rows={form.selectedAssets}
                  onQuantityChange={(index, quantity) => {
                    if (quantity < 1) {
                      setForm({
                        ...form,
                        selectedAssets: form.selectedAssets.filter(
                          (_, i) => i !== index,
                        ),
                      });
                      return;
                    }
                    setForm({
                      ...form,
                      selectedAssets: form.selectedAssets.map((row, i) =>
                        i === index
                          ? { ...row, quantity: Math.min(999, quantity) }
                          : row,
                      ),
                    });
                  }}
                />
              </div>
            ) : null}

            <div className="raise-field raise-field-zone">
              <span className="raise-field-label">
                Zone<span className="req" aria-hidden="true">*</span>
              </span>
              <div className="table-filter-dropdown raise-zone-dropdown" ref={zoneRef}>
                <button
                  type="button"
                  className="table-filter-trigger raise-zone-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={zoneOpen}
                  aria-label="Select zone"
                  disabled={zoneDisabled}
                  onClick={() => setZoneOpen((open) => !open)}
                >
                  <span className={form.zone ? undefined : 'raise-zone-placeholder'}>
                    {zoneLabel}
                  </span>
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
                {zoneOpen && !zoneDisabled ? (
                  <div className="table-filter-menu" role="listbox">
                    {zones.map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        role="option"
                        aria-selected={form.zone === zone}
                        className={
                          form.zone === zone
                            ? 'table-filter-option is-selected'
                            : 'table-filter-option'
                        }
                        onClick={() => {
                          setForm({ ...form, zone });
                          setZoneOpen(false);
                        }}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <label className="raise-field raise-field-location">
              <span className="raise-field-label">Address / Location</span>
              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location: e.target.value.slice(0, LOCATION_MAX),
                  })
                }
                required
                maxLength={LOCATION_MAX}
                placeholder="Enter address or location"
              />
            </label>

            <label className="raise-field raise-field-description">
              <span className="raise-field-label">Description</span>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value.slice(0, DESCRIPTION_MAX),
                  })
                }
                maxLength={DESCRIPTION_MAX}
                rows={5}
                placeholder="Describe your request or issue"
              />
            </label>
          </div>

          {formError ? <p className="error raise-request-error">{formError}</p> : null}

          <div className="raise-request-actions">
            <button
              type="button"
              className="ghost"
              onClick={() => navigate('/portal')}
            >
              Cancel
            </button>
            <button type="submit" disabled={createRequestMutation.isPending}>
              {createRequestMutation.isPending ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
