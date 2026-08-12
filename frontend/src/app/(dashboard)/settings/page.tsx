'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Building2,
  Users,
  Bell,
  ChevronRight,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Settings() {
  const router = useRouter()
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'

  const settingsItems = [
    {
      title: 'Account',
      description: 'Manage your account preferences and profile information.',
      icon: User,
      enabled: true,
      path: '/settings/account',
    },
    {
      title: 'Organization',
      description: 'Manage your organization information and settings.',
      icon: Building2,
      enabled: isAdmin,
      path: '/settings/organization',
    },
    {
      title: 'Users',
      description: 'Manage users, roles, and organizational access.',
      icon: Users,
      enabled: isAdmin,
      path: '/settings/users',
    },
    {
      title: 'Notifications',
      description: 'Configure how you receive alerts and updates.',
      icon: Bell,
      enabled: true,
      path: '/settings/notifications',
    },
  ]

  const handleClick = (
    enabled: boolean,
    path: string
  ) => {
    if (!enabled) return

    router.push(path)
  }

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-text-1">
            Settings
          </h1>

          <p className="mt-1 text-sm text-text-3">
            Manage your account, organization, users, and preferences.
          </p>
        </div>

        {/* Settings */}
        <section className="grid gap-4">

          {settingsItems.map(item => {
            const Icon = item.icon

            return (
              <button
                key={item.title}
                type="button"
                disabled={!item.enabled}
                onClick={() =>
                  handleClick(item.enabled, item.path)
                }
                className={`
                  w-full text-left
                  rounded-xl
                  border
                  p-5
                  flex items-center gap-4
                  transition-colors
                  ${
                    item.enabled
                      ? 'border-border-2 bg-bg-2 hover:border-accent hover:bg-bg-3 cursor-pointer'
                      : 'border-border-1 bg-bg-2/50 opacity-50 cursor-not-allowed'
                  }
                `}
              >

                {/* Icon */}
                <div
                  className={`
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-lg
                    ${
                      item.enabled
                        ? 'bg-accent/10 text-accent'
                        : 'bg-bg-3 text-text-4'
                    }
                  `}
                >
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">

                    <h2
                      className={`
                        text-sm font-semibold
                        ${
                          item.enabled
                            ? 'text-text-1'
                            : 'text-text-4'
                        }
                      `}
                    >
                      {item.title}
                    </h2>

                    {!item.enabled && (
                      <span className="flex items-center gap-1 text-[10px] text-text-4">
                        <Lock size={10} />
                        Admin only
                      </span>
                    )}

                  </div>

                  <p
                    className={`
                      mt-1 text-xs
                      ${
                        item.enabled
                          ? 'text-text-3'
                          : 'text-text-4'
                      }
                    `}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Arrow */}
                {item.enabled && (
                  <ChevronRight
                    size={17}
                    className="shrink-0 text-text-3"
                  />
                )}

              </button>
            )
          })}

        </section>

      </div>
    </main>
  )
}