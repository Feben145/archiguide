//src/app/(dashboard)/layout.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading }      = useAuth()
  const router                 = useRouter()
  

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  if (loading || !user) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="font-syne text-2xl font-bold">
        <span className="text-accent">IT </span><span className="text-accent-2">Asset</span>
      </div>
    </div>
  )

    return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="h-[52px] flex-shrink-0">
        <Topbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[220px] flex-shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-6 bg-bg">
          <div className="animate-page">{children}</div>
        </main>
      </div>

      
     
    </div>
  )
}
