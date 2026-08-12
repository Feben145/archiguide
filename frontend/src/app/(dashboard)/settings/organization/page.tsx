'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Loader2,
  Save,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

type Organization = {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'

  const [organization, setOrganization] =
    useState<Organization | null>(null)

  const [name, setName] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // -------------------------------------------------------------------------
  // Load organization
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false)
      return
    }

    const loadOrganization = async () => {
      try {
        const response = await api.get('/organizations/')

        const data = response.data

        // DRF ViewSet normally returns a paginated response if pagination
        // is configured. Handle both paginated and non-paginated responses.
        const organizationData = Array.isArray(data)
          ? data[0]
          : data.results?.[0]

        if (!organizationData) {
          setError(
            'No organization is associated with your account.'
          )
          return
        }

        setOrganization(organizationData)
        setName(organizationData.name ?? '')
      } catch (error: any) {
        console.error(
          'Failed to load organization:',
          error?.response?.data || error
        )

        setError(
          error?.response?.data?.detail ||
          'Failed to load organization.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadOrganization()
  }, [isAdmin])

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError('')
    setMessage('')

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Organization name is required.')
      return
    }

    if (!organization?.id) {
      setError('Organization could not be identified.')
      return
    }

    setSaving(true)

    try {
      const response = await api.patch(
        `/organizations/${organization.id}/`,
        {
          name: trimmedName,
        }
      )

      setOrganization(response.data)
      setName(response.data.name ?? trimmedName)

      setMessage(
        'Organization updated successfully.'
      )
    } catch (error: any) {
      console.error(
        'Failed to update organization:',
        error?.response?.data || error
      )

      const data = error?.response?.data

      setError(
        data?.detail ||
        data?.name?.[0] ||
        'Failed to update organization.'
      )
    } finally {
      setSaving(false)
    }
  }

  // -------------------------------------------------------------------------
  // Non-admin
  // -------------------------------------------------------------------------

  if (!isAdmin) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">

          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="inline-flex items-center gap-2 text-xs text-text-3 hover:text-text-1 transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            Back to Settings
          </button>

          <div className="rounded-xl border border-border-2 bg-bg-2 p-8 text-center">
            <Building2
              size={28}
              className="mx-auto text-text-4 mb-3"
            />

            <h1 className="text-sm font-semibold text-text-1">
              Organization Settings
            </h1>

            <p className="mt-1 text-xs text-text-3">
              Only administrators can manage organization settings.
            </p>
          </div>

        </div>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto flex justify-center py-20">
          <Loader2
            size={20}
            className="animate-spin text-accent"
          />
        </div>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Page
  // -------------------------------------------------------------------------

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">

          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="inline-flex items-center gap-2 text-xs text-text-3 hover:text-text-1 transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            Back to Settings
          </button>

          <h1 className="text-xl font-semibold text-text-1">
            Organization
          </h1>

          <p className="mt-1 text-sm text-text-3">
            Manage your organization information.
          </p>

        </div>

        <section className="rounded-xl border border-border-2 bg-bg-2">

          <div className="px-6 py-5 border-b border-border-1">
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Building2 size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-text-1">
                  Organization Details
                </h2>

                <p className="text-xs text-text-3 mt-0.5">
                  Update the organization associated with this workspace.
                </p>
              </div>

            </div>
          </div>

          <form
            onSubmit={handleSave}
            className="p-6"
          >

            <div className="max-w-xl">

              <label className="block text-xs font-medium text-text-2 mb-1.5">
                Organization Name
              </label>

              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                placeholder="Organization name"
              />

            </div>

            {error && (
              <div className="mt-4 max-w-xl text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-4 max-w-xl text-xs text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                {message}
              </div>
            )}

            <div className="mt-5 flex justify-end">

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {saving ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={14} />
                )}

                Save Changes
              </button>

            </div>

          </form>

        </section>

      </div>
    </main>
  )
}

