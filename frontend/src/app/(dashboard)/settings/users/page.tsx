
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  Plus,
  Search,
  Shield,
  User,
  UserCheck,
  UserX,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

type UserRecord = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  organization?: number
  organization_name?: string
}

type UserForm = {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  role: string
  is_active: boolean
}

const emptyForm: UserForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  role: 'architect',
  is_active: true,
}

export default function UsersSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'

  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const [editingUser, setEditingUser] =
    useState<UserRecord | null>(null)

  const [form, setForm] =
    useState<UserForm>(emptyForm)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // -------------------------------------------------------------------------
  // Load users
  // -------------------------------------------------------------------------

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const response = await api.get('/users/')

      const data = response.data

      setUsers(
        Array.isArray(data)
          ? data
          : data.results ?? []
      )
    } catch (error: any) {
      console.error(
        'Failed to load users:',
        error?.response?.data || error
      )

      setError(
        error?.response?.data?.detail ||
        'Failed to load users.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false)
      return
    }

    fetchUsers()
  }, [isAdmin])

  // -------------------------------------------------------------------------
  // Form helpers
  // -------------------------------------------------------------------------

  const setField =
    (field: keyof UserForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement
      >
    ) => {
      setForm(current => ({
        ...current,
        [field]:
          e.target.type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : e.target.value,
      }))
    }

  const openCreate = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const openEdit = (record: UserRecord) => {
    setEditingUser(record)

    setForm({
      username: record.username ?? '',
      email: record.email ?? '',
      first_name: record.first_name ?? '',
      last_name: record.last_name ?? '',
      password: '',
      role: record.role ?? 'architect',
      is_active: record.is_active ?? true,
    })

    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return

    setModalOpen(false)
    setEditingUser(null)
    setForm(emptyForm)
    setError('')
  }

  // -------------------------------------------------------------------------
  // Save user
  // -------------------------------------------------------------------------

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError('')
    setMessage('')
    setSaving(true)

    try {
      if (editingUser) {
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          role: form.role,
          is_active: form.is_active,
        }

        await api.patch(
          `/users/${editingUser.id}/`,
          payload
        )
      } else {
        if (!form.password) {
          throw new Error(
            'Password is required when creating an account.'
          )
        }

        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          password: form.password,
          role: form.role,
          is_active: form.is_active,
        }

        /*
         * The existing RegisterView is intended for registration.
         * Since account creation is now an admin function, use the
         * authenticated users endpoint.
         */
        await api.post('/users/', payload)
      }

      await fetchUsers()

      setModalOpen(false)
      setEditingUser(null)
      setForm(emptyForm)

      setMessage(
        editingUser
          ? 'User updated successfully.'
          : 'Account created successfully.'
      )
    } catch (error: any) {
      console.error(
        'Failed to save user:',
        error?.response?.data || error
      )

      const data = error?.response?.data

      setError(
        error?.message ||
        data?.detail ||
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        'Failed to save user.'
      )
    } finally {
      setSaving(false)
    }
  }

  // -------------------------------------------------------------------------
  // Filter
  // -------------------------------------------------------------------------

  const filteredUsers = users.filter(record => {
    const value = search.toLowerCase()

    return (
      record.username?.toLowerCase().includes(value) ||
      record.email?.toLowerCase().includes(value) ||
      record.first_name?.toLowerCase().includes(value) ||
      record.last_name?.toLowerCase().includes(value) ||
      record.role?.toLowerCase().includes(value)
    )
  })

  // -------------------------------------------------------------------------
  // Non-admin
  // -------------------------------------------------------------------------

  if (!isAdmin) {
    return (
      <main className="p-6">
        <div className="max-w-6xl mx-auto">

          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="inline-flex items-center gap-2 text-xs text-text-3 hover:text-text-1 transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            Back to Settings
          </button>

          <div className="rounded-xl border border-border-2 bg-bg-2 p-8 text-center">

            <Shield
              size={28}
              className="mx-auto text-text-4 mb-3"
            />

            <h1 className="text-sm font-semibold text-text-1">
              User Management
            </h1>

            <p className="mt-1 text-xs text-text-3">
              Only administrators can manage users.
            </p>

          </div>

        </div>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Page
  // -------------------------------------------------------------------------

  return (
    <main className="p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">

          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="inline-flex items-center gap-2 text-xs text-text-3 hover:text-text-1 transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            Back to Settings
          </button>

          <div className="flex items-start justify-between gap-4">

            <div>
              <h1 className="text-xl font-semibold text-text-1">
                Manage Users
              </h1>

              <p className="mt-1 text-sm text-text-3">
                Create accounts and manage users in your organization.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-border-1 text-center">
                        <a href="/auth/register" className="text-sm font-medium text-primary-600">Create account</a>
                    </div>

          </div>

        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 text-xs text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            {message}
          </div>
        )}

        {error && !modalOpen && (
          <div className="mb-4 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-4 flex items-center">

          <div className="relative w-full max-w-sm">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4"
            />

            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-bg-2 border border-border-2 rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
            />

          </div>

        </div>

        {/* Table */}
        <section className="rounded-xl border border-border-2 bg-bg-2 overflow-hidden">

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2
                size={20}
                className="animate-spin text-accent"
              />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">

              <User
                size={25}
                className="mx-auto text-text-4 mb-3"
              />

              <p className="text-sm text-text-3">
                No users found.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b border-border-1">

                    <th className="px-5 py-3 text-[11px] font-semibold text-text-3 uppercase">
                      User
                    </th>

                    <th className="px-5 py-3 text-[11px] font-semibold text-text-3 uppercase">
                      Email
                    </th>

                    <th className="px-5 py-3 text-[11px] font-semibold text-text-3 uppercase">
                      Role
                    </th>

                    <th className="px-5 py-3 text-[11px] font-semibold text-text-3 uppercase">
                      Status
                    </th>

                    <th className="px-5 py-3 text-[11px] font-semibold text-text-3 uppercase text-right">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.map(record => (
                    <tr
                      key={record.id}
                      className="border-b border-border-1 last:border-b-0 hover:bg-bg-3/50 transition-colors"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                            <User size={14} />
                          </div>

                          <div>
                            <div className="text-sm font-medium text-text-1">
                              {record.first_name || record.last_name
                                ? `${record.first_name ?? ''} ${record.last_name ?? ''}`.trim()
                                : record.username}
                            </div>

                            <div className="text-[11px] text-text-3">
                              @{record.username}
                            </div>
                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4 text-xs text-text-2">
                        {record.email || '—'}
                      </td>

                      <td className="px-5 py-4">

                        <span className="text-xs font-medium text-text-1">
                          {record.role === 'admin'
                            ? 'Administrator'
                            : 'Architect'}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={
                            record.is_active
                              ? 'inline-flex items-center gap-1.5 text-xs text-green-600'
                              : 'inline-flex items-center gap-1.5 text-xs text-text-4'
                          }
                        >
                          {record.is_active ? (
                            <UserCheck size={13} />
                          ) : (
                            <UserX size={13} />
                          )}

                          {record.is_active
                            ? 'Active'
                            : 'Inactive'}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() => openEdit(record)}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          Edit
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Create / Edit Modal */}
        {/* ---------------------------------------------------------------- */}

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-xl rounded-xl border border-border-2 bg-bg-2 shadow-xl">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border-1">

                <div>
                  <h2 className="text-sm font-semibold text-text-1">
                    {editingUser
                      ? 'Edit User'
                      : 'Create Account'}
                  </h2>

                  <p className="mt-0.5 text-xs text-text-3">
                    {editingUser
                      ? 'Update user information and access.'
                      : 'Create a new user account for your organization.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="text-text-3 hover:text-text-1 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>

              </div>

              {/* Form */}
              <form
                onSubmit={handleSave}
                className="p-6"
              >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-xs font-medium text-text-2 mb-1.5">
                      First Name
                    </label>

                    <input
                      type="text"
                      value={form.first_name}
                      onChange={setField('first_name')}
                      required
                      className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-2 mb-1.5">
                      Last Name
                    </label>

                    <input
                      type="text"
                      value={form.last_name}
                      onChange={setField('last_name')}
                      required
                      className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-2 mb-1.5">
                      Username
                    </label>

                    <input
                      type="text"
                      value={form.username}
                      onChange={setField('username')}
                      required
                      className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-2 mb-1.5">
                      Email
                    </label>

                    <input
                      type="email"
                      value={form.email}
                      onChange={setField('email')}
                      required
                      className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent"
                    />
                  </div>

                  {!editingUser && (
                    <div className="md:col-span-2">

                      <label className="block text-xs font-medium text-text-2 mb-1.5">
                        Password
                      </label>

                      <input
                        type="password"
                        value={form.password}
                        onChange={setField('password')}
                        required
                        className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent"
                        placeholder="Initial password"
                      />

                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-text-2 mb-1.5">
                      Role
                    </label>

                    <select
                      value={form.role}
                      onChange={setField('role')}
                      className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent"
                    >
                      <option value="architect">
                        Architect
                      </option>

                      <option value="admin">
                        Administrator
                      </option>
                    </select>
                  </div>

                  <div className="flex items-end pb-2">

                    <label className="flex items-center gap-2 cursor-pointer">

                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={setField('is_active')}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />

                      <span className="text-xs text-text-2">
                        Active account
                      </span>

                    </label>

                  </div>

                </div>

                {error && (
                  <div className="mt-4 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-lg text-sm text-text-2 hover:bg-bg-3 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                  >
                    {saving && (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    )}

                    {editingUser
                      ? 'Save Changes'
                      : 'Create Account'}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </main>
  )
}

