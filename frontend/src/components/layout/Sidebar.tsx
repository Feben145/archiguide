
// Sidebar component for the main navigation sidebar
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Monitor,
  Settings,
} from 'lucide-react'

const NAV = [
  {
    section: 'Workspace',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },

  {
    section: 'IT Assets',
    items: [
      {
        label: 'Asset Registry',
        href: '/assets',
        icon: Monitor,
      },
      // {
      //   label: 'Vendors & Licenses',
      //   href: '/vendors',
      //   icon: Building2,
      // },
    ],
  },

  {
    section: null,
    items: [
      {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1">
        {NAV.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <div className="px-4 pt-4 pb-1 text-[10px] font-semibold text-text-4 uppercase tracking-widest">
                {group.section}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon

              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + '/')

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={clsx(
                      'flex items-center gap-2.5 px-4 py-2 mx-1 rounded-lg text-[13px] transition-all cursor-pointer border-r-2',
                      active
                        ? 'bg-accent/10 text-accent border-accent'
                        : 'text-text-2 hover:bg-border-1 hover:text-text-1 border-transparent'
                    )}
                  >
                    <Icon size={15} className="flex-shrink-0" />

                    <span className="flex-1">
                      {item.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
