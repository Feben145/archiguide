'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

type AssetForm = {
  name: string
  asset_code: string
  asset_type: string
  status: string
  environment: string
  tier: string
  deployment_model: string
  quantity: number
  site_name: string
  location: string
  server_role: string
  description: string
  notes: string
}

const emptyForm: AssetForm = {
  name: '',
  asset_code: '',
  asset_type: '',
  status: '',
  environment: '',
  tier: '',
  deployment_model: '',
  quantity: 1,
  site_name: '',
  location: '',
  server_role: '',
  description: '',
  notes: '',
}

// ---------------------------------------------------------------------------
// Keep these values synchronized with your Django Asset model.
// ---------------------------------------------------------------------------

const TYPE_CHOICES = [
  ['server', 'Server'],
  ['storage', 'Storage'],
  ['network', 'Network'],
  ['backup', 'Backup'],
  ['cloud', 'Cloud'],
  ['virtual_machine', 'Virtual Machine'],
  ['desktop', 'Desktop'],
  ['software', 'Software'],
  ['other', 'Other'],
]

const STATUS_CHOICES = [
  ['planned', 'Planned'],
  ['active', 'Active'],
  ['maintenance', 'Maintenance'],
  ['retired', 'Retired'],
]

const ENVIRONMENT_CHOICES = [
  ['production', 'Production'],
  ['staging', 'Staging'],
  ['development', 'Development'],
  ['test', 'Test'],
]

const TIER_CHOICES = [
  ['tier_1', 'Tier 1'],
  ['tier_2', 'Tier 2'],
  ['tier_3', 'Tier 3'],
  ['tier_4', 'Tier 4'],
]

const DEPLOYMENT_MODEL_CHOICES = [
  ['physical', 'Physical'],
  ['virtual', 'Virtual'],
  ['cloud', 'Cloud'],
  ['hybrid', 'Hybrid'],
]

const SERVER_ROLE_CHOICES = [
  ['application', 'Application'],
  ['database', 'Database'],
  ['web', 'Web'],
  ['file', 'File'],
  ['management', 'Management'],
  ['backup', 'Backup'],
  ['other', 'Other'],
]

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  required?: boolean
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-2">
        {label}
        {required && (
          <span className="ml-1 text-danger">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-bg-1 px-3 py-2.5 text-sm text-text-1 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
}: {
  label: string
  value: string
  options: string[][]
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-2">
        {label}
        {required && (
          <span className="ml-1 text-danger">*</span>
        )}
      </label>

      <select
        value={value}
        required={required}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-bg-1 px-3 py-2.5 text-sm text-text-1 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">Select {label}</option>

        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function EditAssetPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id

  const [form, setForm] = useState<AssetForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [canModify, setCanModify] = useState(false)

  // -------------------------------------------------------------------------
  // Load asset
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!id || authLoading) return

    const loadAsset = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          `/v1/assets/${id}/`
        )

        const asset = response.data

        setCanModify(
          user?.role === 'admin' ||
          (
            user?.role === 'architect' &&
            Boolean(asset?.can_edit)
          )
        )

        setForm({
          name: asset.name ?? '',
          asset_code: asset.asset_code ?? '',
          asset_type: asset.asset_type ?? '',
          status: asset.status ?? '',
          environment: asset.environment ?? '',
          tier: asset.tier ?? '',
          deployment_model: asset.deployment_model ?? '',
          quantity: asset.quantity ?? 1,
          site_name: asset.site_name ?? '',
          location: asset.location ?? '',
          server_role: asset.server_role ?? '',
          description: asset.description ?? '',
          notes: asset.notes ?? '',
        })
      } catch (err: any) {
        console.error(
          'Failed to load asset:',
          err?.response?.data || err
        )

        setError(
          err?.response?.data?.detail ||
          'Failed to load asset.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAsset()
  }, [id, authLoading, user?.role])

  // -------------------------------------------------------------------------
  // Update field
  // -------------------------------------------------------------------------

  const updateField = (
    field: keyof AssetForm,
    value: string | number
  ) => {
    setForm(current => ({
      ...current,
      [field]: value,
    }))
  }

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!id || !canModify) return

    try {
      setSaving(true)
      setError('')

      const payload = {
        name: form.name,
        asset_code: form.asset_code,
        asset_type: form.asset_type,
        status: form.status,
        environment: form.environment,
        tier: form.tier,
        deployment_model: form.deployment_model,
        quantity: Number(form.quantity),
        site_name: form.site_name,
        location: form.location,
        server_role: form.server_role,
        description: form.description,
        notes: form.notes,
      }

      await api.patch(
        `/v1/assets/${id}/`,
        payload
      )

      router.push(`/assets/${id}`)
    } catch (err: any) {
      console.error(
        'Failed to update asset:',
        err?.response?.data || err
      )

      const data = err?.response?.data

      if (typeof data === 'object' && data) {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(', ')
              : String(value)

            return `${field}: ${message}`
          })
          .join(' | ')

        setError(
          messages ||
          'Failed to update asset.'
        )
      } else {
        setError(
          'Failed to update asset.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-sm text-text-3">
          <Loader2
            size={16}
            className="animate-spin"
          />
          Loading asset...
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Error loading
  // -------------------------------------------------------------------------

  if (error && !form.name) {
    return (
      <div className="space-y-4">

        <Link
          href={id ? `/assets/${id}` : '/assets'}
          className="inline-flex items-center gap-2 text-sm text-text-3 hover:text-text-1"
        >
          <ArrowLeft size={15} />
          Back to Asset
        </Link>

        <div className="rounded-lg border border-border bg-bg-1 p-5">
          <div className="text-sm text-danger">
            {error}
          </div>
        </div>

      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Permission
  // -------------------------------------------------------------------------

  if (!canModify) {
    return (
      <div className="space-y-4">

        <Link
          href={`/assets/${id}`}
          className="inline-flex items-center gap-2 text-sm text-text-3 hover:text-text-1"
        >
          <ArrowLeft size={15} />
          Back to Asset
        </Link>

        <div className="rounded-lg border border-border bg-bg-1 p-6">
          <div className="text-sm text-danger">
            You do not have permission to edit this asset.
          </div>
        </div>

      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Form
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between gap-4">

        <div>

          <Link
            href={`/assets/${id}`}
            className="mb-3 inline-flex items-center gap-2 text-sm text-text-3 hover:text-text-1"
          >
            <ArrowLeft size={15} />
            Back to Asset
          </Link>

          <h1 className="text-2xl font-semibold text-text-1">
            Edit Asset
          </h1>

          <p className="mt-1 text-sm text-text-3">
            Update the asset information below.
          </p>

        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ----------------------------------------------------------------- */}
        {/* Identity                                                          */}
        {/* ----------------------------------------------------------------- */}

        <section className="rounded-xl border border-border bg-bg-1 p-6">

          <h2 className="mb-5 text-base font-semibold text-text-1">
            Identity
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <Field
              label="Asset Name"
              value={form.name}
              required
              onChange={value =>
                updateField('name', value)
              }
            />

            <Field
              label="Asset Code"
              value={form.asset_code}
              required
              onChange={value =>
                updateField('asset_code', value)
              }
            />

            <SelectField
              label="Asset Type"
              value={form.asset_type}
              options={TYPE_CHOICES}
              required
              onChange={value =>
                updateField('asset_type', value)
              }
            />

            <SelectField
              label="Status"
              value={form.status}
              options={STATUS_CHOICES}
              required
              onChange={value =>
                updateField('status', value)
              }
            />

            <SelectField
              label="Environment"
              value={form.environment}
              options={ENVIRONMENT_CHOICES}
              onChange={value =>
                updateField('environment', value)
              }
            />

            <SelectField
              label="Tier"
              value={form.tier}
              options={TIER_CHOICES}
              onChange={value =>
                updateField('tier', value)
              }
            />

            <SelectField
              label="Deployment Model"
              value={form.deployment_model}
              options={DEPLOYMENT_MODEL_CHOICES}
              onChange={value =>
                updateField(
                  'deployment_model',
                  value
                )
              }
            />

            <Field
              label="Quantity"
              type="number"
              value={form.quantity}
              required
              onChange={value =>
                updateField(
                  'quantity',
                  Number(value)
                )
              }
            />

          </div>

        </section>

        {/* ----------------------------------------------------------------- */}
        {/* Location                                                          */}
        {/* ----------------------------------------------------------------- */}

        <section className="rounded-xl border border-border bg-bg-1 p-6">

          <h2 className="mb-5 text-base font-semibold text-text-1">
            Location
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <Field
              label="Site"
              value={form.site_name}
              onChange={value =>
                updateField(
                  'site_name',
                  value
                )
              }
            />

            <Field
              label="Location"
              value={form.location}
              onChange={value =>
                updateField(
                  'location',
                  value
                )
              }
            />

          </div>

        </section>

        {/* ----------------------------------------------------------------- */}
        {/* Specification                                                     */}
        {/* ----------------------------------------------------------------- */}

        <section className="rounded-xl border border-border bg-bg-1 p-6">

          <h2 className="mb-5 text-base font-semibold text-text-1">
            Specification
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <SelectField
              label="Server Role"
              value={form.server_role}
              options={SERVER_ROLE_CHOICES}
              onChange={value =>
                updateField(
                  'server_role',
                  value
                )
              }
            />

          </div>

        </section>

        {/* ----------------------------------------------------------------- */}
        {/* Notes                                                             */}
        {/* ----------------------------------------------------------------- */}

        <section className="rounded-xl border border-border bg-bg-1 p-6">

          <h2 className="mb-5 text-base font-semibold text-text-1">
            Notes
          </h2>

          <div className="space-y-5">

            <div className="space-y-1.5">

              <label className="block text-sm font-medium text-text-2">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={e =>
                  updateField(
                    'description',
                    e.target.value
                  )
                }
                rows={4}
                className="w-full rounded-lg border border-border bg-bg-1 px-3 py-2.5 text-sm text-text-1 outline-none transition focus:border-primary"
              />

            </div>

            <div className="space-y-1.5">

              <label className="block text-sm font-medium text-text-2">
                Notes
              </label>

              <textarea
                value={form.notes}
                onChange={e =>
                  updateField(
                    'notes',
                    e.target.value
                  )
                }
                rows={4}
                className="w-full rounded-lg border border-border bg-bg-1 px-3 py-2.5 text-sm text-text-1 outline-none transition focus:border-primary"
              />

            </div>

          </div>

        </section>

        {/* ----------------------------------------------------------------- */}
        {/* Actions                                                           */}
        {/* ----------------------------------------------------------------- */}

        <div className="flex items-center justify-end gap-3">

          <Link
            href={`/assets/${id}`}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-2 transition hover:bg-bg-2 hover:text-text-1"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  )
}