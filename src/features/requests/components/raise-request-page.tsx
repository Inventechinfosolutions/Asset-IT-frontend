import { useState, type FormEvent } from 'react';
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
  requestType: 'ASSET' as RequestType,
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

  const createRequestMutation = useCreateRequest();
  const { data: activeAssets = [], isPending: assetsPending } = useActiveAssets(
    form.requestType === 'ASSET',
  );
  const { data: zones = [], isPending: zonesPending } = useZones();

  const isAsset = form.requestType === 'ASSET';

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
    if (isAsset && form.selectedAssets.length === 0) {
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
        ...(isAsset ? { selectedAssets: form.selectedAssets } : {}),
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
          <p className="muted">Submit a new asset or IT support request</p>
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
                  checked={isAsset}
                  onChange={() =>
                    setForm({
                      ...form,
                      requestType: 'ASSET',
                    })
                  }
                />
                Asset request
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={!isAsset}
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
              isAsset
                ? 'raise-request-grid is-asset'
                : 'raise-request-grid is-it'
            }
          >
            {isAsset ? (
              <div className="raise-field raise-field-assets">
                <span className="raise-field-label">
                  Assets<span className="req" aria-hidden="true">*</span>
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

            {isAsset && form.selectedAssets.length > 0 ? (
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

            <label className="raise-field raise-field-zone">
              <span className="raise-field-label">
                Zone<span className="req" aria-hidden="true">*</span>
              </span>
              <select
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
                required
                disabled={zonesPending || zones.length === 0}
              >
                <option value="">
                  {zonesPending ? 'Loading zones…' : 'Select zone'}
                </option>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </label>

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
