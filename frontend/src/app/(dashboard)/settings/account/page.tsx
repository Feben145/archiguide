
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  Lock,
  Save,
  User,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

type ProfileForm = {
  username: string
  email: string
  first_name: string
  last_name: string
}

type PasswordForm = {
  old_password: string
  new_password: string
  confirm_password: string
}

export default function AccountSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [profile, setProfile] = useState<ProfileForm>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  })

  const [password, setPassword] = useState<PasswordForm>({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // -------------------------------------------------------------------------
  // Load current user
  // -------------------------------------------------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/users/me/')

        const data = response.data

        setProfile({
          username: data.username ?? '',
          email: data.email ?? '',
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
        })
      } catch (error: any) {
        console.error(
          'Failed to load profile:',
          error?.response?.data || error
        )

        setProfileError(
          'Unable to load your profile.'
        )
      } finally {
        setLoadingProfile(false)
      }
    }

    loadProfile()
  }, [])

  // -------------------------------------------------------------------------
  // Profile helpers
  // -------------------------------------------------------------------------

  const setProfileField =
    (field: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfile(current => ({
        ...current,
        [field]: e.target.value,
      }))
    }

  const setPasswordField =
    (field: keyof PasswordForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(current => ({
        ...current,
        [field]: e.target.value,
      }))
    }

  // -------------------------------------------------------------------------
  // Save profile
  // -------------------------------------------------------------------------

  const handleSaveProfile = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setProfileMessage('')
    setProfileError('')
    setSavingProfile(true)

    try {
      await api.patch('/users/me/', {
        username: profile.username,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      })

      setProfileMessage(
        'Profile updated successfully.'
      )
    } catch (error: any) {
      console.error(
        'Failed to update profile:',
        error?.response?.data || error
      )

      const data = error?.response?.data

      setProfileError(
        data?.detail ||
        data?.error ||
        'Failed to update your profile.'
      )
    } finally {
      setSavingProfile(false)
    }
  }

  // -------------------------------------------------------------------------
  // Change password
  // -------------------------------------------------------------------------

  const handleChangePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setPasswordMessage('')
    setPasswordError('')

    if (
      password.new_password !==
      password.confirm_password
    ) {
      setPasswordError(
        'New passwords do not match.'
      )
      return
    }

    if (password.new_password.length < 8) {
      setPasswordError(
        'New password must be at least 8 characters.'
      )
      return
    }

    setChangingPassword(true)

    try {
      await api.post(
        '/users/change_password/',
        {
          old_password: password.old_password,
          new_password: password.new_password,
        }
      )

      setPassword({
        old_password: '',
        new_password: '',
        confirm_password: '',
      })

      setPasswordMessage(
        'Password changed successfully.'
      )
    } catch (error: any) {
      console.error(
        'Failed to change password:',
        error?.response?.data || error
      )

      const data = error?.response?.data

      setPasswordError(
        data?.detail ||
        data?.error ||
        'Failed to change your password.'
      )
    } finally {
      setChangingPassword(false)
    }
  }

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------

  if (loadingProfile) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={20}
              className="animate-spin text-accent"
            />
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
      <div className="max-w-4xl mx-auto">

        {/* Header */}
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
            Account
          </h1>

          <p className="mt-1 text-sm text-text-3">
            Manage your profile information and password.
          </p>

        </div>

        <div className="space-y-5">

          {/* ---------------------------------------------------------------- */}
          {/* Edit Profile */}
          {/* ---------------------------------------------------------------- */}

          <section className="rounded-xl border border-border-2 bg-bg-2">

            <div className="px-6 py-5 border-b border-border-1">
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <User size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-text-1">
                    Edit Profile
                  </h2>

                  <p className="text-xs text-text-3 mt-0.5">
                    Update your personal account information.
                  </p>
                </div>

              </div>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">
                    First Name
                  </label>

                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={setProfileField('first_name')}
                    className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">
                    Last Name
                  </label>

                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={setProfileField('last_name')}
                    className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">
                    Username
                  </label>

                  <input
                    type="text"
                    value={profile.username}
                    onChange={setProfileField('username')}
                    className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">
                    Email
                  </label>

                  <input
                    type="email"
                    value={profile.email}
                    onChange={setProfileField('email')}
                    className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                  />
                </div>

              </div>

              {profileError && (
                <div className="mt-4 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                  {profileError}
                </div>
              )}

              {profileMessage && (
                <div className="mt-4 text-xs text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  {profileMessage}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  {savingProfile ? (
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

          {/* ---------------------------------------------------------------- */}
          {/* Change Password */}
          {/* ---------------------------------------------------------------- */}

          <section className="rounded-xl border border-border-2 bg-bg-2">

            <div className="px-6 py-5 border-b border-border-1">
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Lock size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-text-1">
                    Change Password
                  </h2>

                  <p className="text-xs text-text-3 mt-0.5">
                    Update your account password.
                  </p>
                </div>

              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="p-6"
            >

              <div className="space-y-4 max-w-xl">

                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">
                    Current Password
                  </label>

                  <input
                    type="password"
                    value={password.old_password}
                    onChange={setPasswordField('old_password')}
                    required
                    className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={password.new_password}
                    onChange={setPasswordField('new_password')}
                    required
                    className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    value={password.confirm_password}
                    onChange={setPasswordField('confirm_password')}
                    required
                    className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                  />
                </div>

              </div>

              {passwordError && (
                <div className="mt-4 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="mt-4 text-xs text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  {passwordMessage}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  {changingPassword && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  Change Password
                </button>
              </div>

            </form>
          </section>

        </div>
      </div>
    </main>
  )
}

