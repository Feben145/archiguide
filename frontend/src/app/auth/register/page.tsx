// frontend/src/app/auth/register/page.tsx
'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Loader2, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '', job_title: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await api.post('/auth/register/', form)
      router.push('/auth/login?registered=1')
    } catch (err: any) {
      setError(Object.values(err.response?.data || {}).flat().join(' ') || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-text-2 mb-1.5">{label}</label>
      <input type={type} value={(form as any)[key]} onChange={set(key)} required
        placeholder={placeholder}
        className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors" />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-syne font-black text-3xl mb-1">
            <span className="text-accent">Archi</span><span className="text-accent-2">Guide</span>
          </div>
          <div className="text-text-3 text-sm">Create your account</div>
        </div>

        <div className="bg-bg-2 border border-border-2 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserPlus size={16} className="text-accent" />
            <span className="font-semibold text-[15px]">Register</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {field('First Name', 'first_name', 'text', 'John')}
              {field('Last Name',  'last_name',  'text', 'Doe')}
            </div>
            {field('Username',  'username',  'text',     'john.doe')}
            {field('Email',     'email',     'email',    'john@company.com')}
            {field('Job Title', 'job_title', 'text',     'Solutions Architect')}
            {field('Password',  'password',  'password', '••••••••')}
            {field('Confirm',   'password2', 'password', '••••••••')}

            {error && (
              <div className="text-danger text-xs bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-1">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-border-1 text-center">
            <a href="/auth/login" className="text-accent text-xs hover:underline">Back to sign in</a>
          </div>
        </div>
      </div>
    </div>
  )
}
