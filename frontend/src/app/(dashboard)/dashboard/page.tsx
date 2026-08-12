'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

import { Card, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

import {
  Server,
  HardDrive,
  Network,
  DatabaseBackup,
  Cloud,
  FolderKanban,
  Users,
  Package,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'


// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface Asset {
  id: string
  name: string
  asset_type: string
  quantity?: number
  status?: string
}

interface DashboardStats {
  totalAssets: number
  totalQuantity: number
  projects: number
  users: number

  byType: {
    server: number
    storage: number
    network: number
    backup: number
    cloud_service: number
  }
}


// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const isAdmin = user?.role === 'admin'

  const [stats, setStats] = useState<DashboardStats | null>(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')


  // ---------------------------------------------------------------------------
  // Load dashboard data
  // ---------------------------------------------------------------------------

  const loadDashboard = useCallback(async () => {
    try {
      setError('')

      const requests = [
        api.get('/v1/assets/'),
        api.get('/projects/'),
      ]

      // Users are only required for admin dashboard
      if (isAdmin) {
        requests.push(api.get('/users/'))
      }

      const responses = await Promise.all(requests)

      const assetsResponse = responses[0]
      const projectsResponse = responses[1]
      const usersResponse = isAdmin ? responses[2] : null


      // -----------------------------------------------------------------------
      // DRF may return either:
      //
      // [
      //   {...},
      //   {...}
      // ]
      //
      // OR
      //
      // {
      //   count: 10,
      //   results: [...]
      // }
      // -----------------------------------------------------------------------

      const assets: Asset[] =
        Array.isArray(assetsResponse.data)
          ? assetsResponse.data
          : assetsResponse.data?.results ?? []


      const projects = Array.isArray(projectsResponse.data)
        ? projectsResponse.data
        : projectsResponse.data?.results ?? []


      const users = usersResponse
        ? (
            Array.isArray(usersResponse.data)
              ? usersResponse.data
              : usersResponse.data?.results ?? []
          )
        : []


      // -----------------------------------------------------------------------
      // Calculate asset quantity
      // -----------------------------------------------------------------------

      const totalQuantity = assets.reduce(
        (sum, asset) =>
          sum + (Number(asset.quantity) || 1),
        0
      )


      // -----------------------------------------------------------------------
      // Calculate asset types
      // -----------------------------------------------------------------------

      const byType = {
        server: 0,
        storage: 0,
        network: 0,
        backup: 0,
        cloud_service: 0,
      }


      assets.forEach(asset => {
        if (asset.asset_type in byType) {
          byType[
            asset.asset_type as keyof typeof byType
          ]++
        }
      })


      setStats({
        totalAssets: assets.length,
        totalQuantity,
        projects: projects.length,
        users: users.length,
        byType,
      })

    } catch (err: any) {
      console.error(
        'Failed to load dashboard:',
        err?.response?.data || err
      )

      setError(
        err?.response?.data?.detail ||
        'Failed to load dashboard data.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [isAdmin])


  // ---------------------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (authLoading) return

    if (!user) return

    loadDashboard()
  }, [
    authLoading,
    user,
    loadDashboard,
  ])


  // ---------------------------------------------------------------------------
  // Refresh
  // ---------------------------------------------------------------------------

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboard()
  }


  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (authLoading || loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-xl font-semibold text-text-1">
            Asset Dashboard
          </h1>

          <p className="text-sm text-text-3 mt-1">
            Overview of registered IT assets and infrastructure.
          </p>
        </div>

        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-sm text-text-3">
              <RefreshCw
                size={15}
                className="animate-spin"
              />

              Loading dashboard...
            </div>
          </div>
        </Card>

      </div>
    )
  }


  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">


      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex items-start justify-between">

        <div>
          <h1 className="text-xl font-semibold text-text-1">
            Asset Dashboard
          </h1>

          <p className="text-sm text-text-3 mt-1">
            Overview of registered IT assets and infrastructure.
          </p>
        </div>


        <Button
          icon={
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />
          }
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>

      </div>


      {/* ------------------------------------------------------------------ */}
      {/* Error */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <Card>

          <div className="flex items-center gap-2 text-sm text-danger">

            <AlertCircle size={15} />

            <span>{error}</span>

          </div>

        </Card>
      )}


      {/* ------------------------------------------------------------------ */}
      {/* Summary */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">


       


        <ClickableStatCard
          label="Total Asset"
          value={stats?.totalQuantity ?? 0}
          icon={<Package size={16} />}
          onClick={() => router.push('/assets')}
        />


        <ClickableStatCard
          label="Projects"
          value={stats?.projects ?? 0}
          icon={<FolderKanban size={16} />}
          onClick={() => router.push('/assets')}
        />


        {/*{isAdmin && (
          <ClickableStatCard
            label="Users"
            value={stats?.users ?? 0}
            icon={<Users size={16} />}
            onClick={() => router.push('/users')}
          />
        )} */}

      </div>


      {/* ------------------------------------------------------------------ */}
      {/* Asset Types */}
      {/* ------------------------------------------------------------------ */}

      <Card>

        <div className="mb-4">

          <h2 className="font-semibold text-[15px]">
            Asset Types
          </h2>

          <p className="text-xs text-text-3 mt-1">
            Registered infrastructure by asset category.
          </p>

        </div>


        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">


          <AssetTypeCard
            icon={<Server size={17} />}
            label="Servers"
            value={stats?.byType.server ?? 0}
            onClick={() =>
              router.push('/assets?type=server')
            }
          />


          <AssetTypeCard
            icon={<HardDrive size={17} />}
            label="Storage"
            value={stats?.byType.storage ?? 0}
            onClick={() =>
              router.push('/assets?type=storage')
            }
          />


          <AssetTypeCard
            icon={<Network size={17} />}
            label="Network"
            value={stats?.byType.network ?? 0}
            onClick={() =>
              router.push('/assets?type=network')
            }
          />


          <AssetTypeCard
            icon={<DatabaseBackup size={17} />}
            label="Backup"
            value={stats?.byType.backup ?? 0}
            onClick={() =>
              router.push('/assets?type=backup')
            }
          />


          <AssetTypeCard
            icon={<Cloud size={17} />}
            label="Cloud"
            value={stats?.byType.cloud_service ?? 0}
            onClick={() =>
              router.push('/assets?type=cloud_service')
            }
          />

        </div>

      </Card>


      {/* ------------------------------------------------------------------ */}
      {/* Role-specific section */}
      {/* ------------------------------------------------------------------ */}

      {isAdmin ? (

        <Card>

          <h2 className="font-semibold text-[15px] mb-1">
            Administration
          </h2>

          <p className="text-xs text-text-3 mb-4">
            Manage organization users, projects, and asset
            registration.
          </p>


          <div className="flex flex-wrap gap-2">

            <Button
              icon={<Users size={14} />}
              onClick={() => router.push('/settings')}
            >
              Manage Users
            </Button>


            <Button
              icon={<FolderKanban size={14} />}
              onClick={() => router.push('/assets')}
            >
              Manage Projects
            </Button>


            <Button
              icon={<Package size={14} />}
              onClick={() => router.push('/assets')}
            >
              Asset Registry
            </Button>

          </div>

        </Card>

      ) : (

        <Card>

          <h2 className="font-semibold text-[15px] mb-1">
            My Workspace
          </h2>

          <p className="text-xs text-text-3 mb-4">
            View and manage assets associated with your
            assigned projects.
          </p>


          <Button
            icon={<Package size={14} />}
            onClick={() => router.push('/assets')}
          >
            View Assets
          </Button>

        </Card>

      )}

    </div>
  )
}


// -----------------------------------------------------------------------------
// Clickable Stat Card
// -----------------------------------------------------------------------------

function ClickableStatCard({
  label,
  value,
  icon,
  onClick,
}: {
  label: string
  value: number
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full"
    >
      <div className="rounded-lg border border-border-2 bg-bg-2 p-4 transition-all hover:border-accent hover:bg-bg-3">

        <div className="flex items-center justify-between">

          <span className="text-xs text-text-3">
            {label}
          </span>

          <span className="text-text-3">
            {icon}
          </span>

        </div>


        <div className="mt-2 text-2xl font-semibold text-text-1">
          {value.toLocaleString()}
        </div>

      </div>
    </button>
  )
}


// -----------------------------------------------------------------------------
// Asset Type Card
// -----------------------------------------------------------------------------

function AssetTypeCard({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full"
    >

      <div className="rounded-lg border border-border-2 bg-bg-2 p-4 transition-all hover:border-accent hover:bg-bg-3">


        <div className="flex items-center gap-2 text-text-2">

          {icon}

          <span className="text-sm font-medium">
            {label}
          </span>

        </div>


        <div className="mt-3 text-xl font-semibold text-text-1">
          {value.toLocaleString()}
        </div>


        <div className="text-[11px] text-text-4 mt-1">
          Assets
        </div>


      </div>

    </button>
  )
}