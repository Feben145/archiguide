'use client'
import { useState, FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Loader2, Lock } from 'lucide-react'

export default function LoginPage() {
  const { login }                   = useAuth()
  const [username, setUsername]     = useState('')
  const [password, setPassword]     = useState('')
  const [error,    setError]        = useState('')
  const [loading,  setLoading]      = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-syne font-black text-3xl mb-1">
            <span className="text-accent">IT</span><span className="text-accent-2">-track</span>
          </div>
          <div className="text-text-3 text-sm">IT Asset Registration Platform</div>
        </div>

        <div className="bg-bg-2 border border-border-2 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-accent" />
            <span className="font-semibold text-[15px]">Sign In</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-text-2 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                placeholder="your.username"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-2 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-danger text-xs bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Sign In
            </button>
          </form>

          
        </div>

        
      </div>
    </div>
  )
}
