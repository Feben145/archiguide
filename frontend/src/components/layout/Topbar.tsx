
'use client'

import { useState } from 'react'
import {
  ChevronDown,
  LogOut,
  Settings,
  Sun,
  Moon,
  User,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export function Topbar() {
  const { user, logout } = useAuth()

  const [showUser, setShowUser] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  const toggleTheme = () => {
    setDarkMode(current => !current)

    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="bg-bg-2 border-b border-border-2 flex items-center px-5 gap-4 z-20 relative h-14">

      {/* Logo */}
      <div className="font-syne font-black text-[17px] tracking-tight">
        <span className="text-accent">IT</span>
        <span className="text-accent-2">Asset</span>
      </div>

      <div className="text-[10px] bg-accent/10 border border-accent/25 text-accent px-2 py-0.5 rounded-full font-medium">
        ITSD
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-2 hover:bg-bg-3 hover:text-text-1 transition-colors"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          <Sun size={16} />
        ) : (
          <Moon size={16} />
        )}
      </button>

      {/* User menu */}
      <div className="relative">

        <button
          type="button"
          onClick={() => setShowUser(current => !current)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-bg-3 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-semibold">
            {user?.avatar_initials ||
              `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
          </div>

          <div className="hidden md:block text-left">
            <div className="text-[12px] font-medium text-text-1">
              {user?.first_name} {user?.last_name}
            </div>

            <div className="text-[10px] text-text-3">
              {user?.role}
            </div>
          </div>

          <ChevronDown
            size={14}
            className="text-text-3"
          />
        </button>

        {showUser && (
          <div className="absolute top-full right-0 mt-1 bg-bg-2 border border-border-3 rounded-xl shadow-2xl z-50 min-w-[200px] py-1">

            {/* User information */}
            <div className="px-4 py-3 border-b border-border-1">
              <div className="text-[13px] font-medium text-text-1">
                {user?.first_name} {user?.last_name}
              </div>

              <div className="text-[11px] text-text-3">
                {user?.email}
              </div>

              <div className="text-[10px] text-accent mt-1 capitalize">
                {user?.role}
              </div>
            </div>

            {/* Profile */}
            <Link
              href="/settings/account"
              onClick={() => setShowUser(false)}
            >
              <div className="flex items-center gap-2 px-4 py-2 text-[13px] text-text-2 hover:bg-bg-3 hover:text-text-1 transition-colors">
                <User size={14} />
                Profile
              </div>
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              onClick={() => setShowUser(false)}
            >
              <div className="flex items-center gap-2 px-4 py-2 text-[13px] text-text-2 hover:bg-bg-3 hover:text-text-1 transition-colors">
                <Settings size={14} />
                Settings
              </div>
            </Link>

            {/* Sign out */}
            <div className="border-t border-border-1 mt-1 pt-1">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-danger hover:bg-bg-3 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>

          </div>
        )}
      </div>

    </header>
  )
}
