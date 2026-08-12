'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Inter } from "next/font/google"

import {
  ArrowLeft,
  Edit,
  Trash2,
  Server,
  HardDrive,
  Network,
  Cloud,
  Database,
  Package,
  MapPin,
  FileText,
  Cpu,
  MemoryStick,
  HardDriveDownload,
  Globe,
} from 'lucide-react'

import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { Badge, statusVariant } from '@/components/ui/Badge'


// -----------------------------------------------------------------------------
// Labels
// -----------------------------------------------------------------------------
const inter = Inter({
  subsets: ["latin"],
})
const TYPE_LABELS: Record<string, string> = {
  server: 'Server',
  storage: 'Storage',
  network: 'Network',
  endpoint: 'Endpoint',
  software: 'Software',
  cloud_service: 'Cloud Service',
  backup: 'Backup',
  iot: 'IoT',
  facility: 'Facility',
  container: 'Container',
}

const DEPLOYMENT_LABELS: Record<string, string> = {
  on_prem: 'On-Premises',
  cloud: 'Cloud',
  hybrid: 'Hybrid',
}

const ENVIRONMENT_LABELS: Record<string, string> = {
  prod: 'Production',
  production: 'Production',
  test: 'Test',
  dev: 'Development',
  development: 'Development',
  staging: 'Staging',
  dr: 'Disaster Recovery',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  server: <Server size={18} />,
  storage: <HardDrive size={18} />,
  network: <Network size={18} />,
  cloud_service: <Cloud size={18} />,
  backup: <Database size={18} />,
  endpoint: <Package size={18} />,
  software: <Package size={18} />,
  iot: <Globe size={18} />,
  facility: <Package size={18} />,
  container: <Package size={18} />,
}


// -----------------------------------------------------------------------------
// Small reusable field
// -----------------------------------------------------------------------------

function DetailField({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-4 mb-1">
        {label}
      </div>

      <div className="text-[13px] text-text-1 break-words">
        {value !== null &&
        value !== undefined &&
        value !== ''
          ? String(value)
          : '—'}
      </div>
    </div>
  )
}


// -----------------------------------------------------------------------------
// Specification section
// -----------------------------------------------------------------------------

function SpecificationSection({
  asset,
}: {
  asset: any
}) {
  const type = asset.asset_type

  if (type === 'server' && asset.server_spec) {
    const spec = asset.server_spec

    return (
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Server size={17} className="text-accent" />
          <h2 className="font-semibold text-[15px]">
            Server Specification
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <DetailField
            label="Server Role"
            value={spec.server_role}
          />

          <DetailField
            label="Server Type"
            value={spec.server_type}
          />

          <DetailField
            label="Solution Name"
            value={spec.solution_name}
          />

          <DetailField
            label="vCPU Count"
            value={spec.vcpu_count}
          />

          <DetailField
            label="RAM (GB)"
            value={spec.ram_gb}
          />

          <DetailField
            label="System Disk (GB)"
            value={spec.system_disk_gb}
          />

          <DetailField
            label="Cloud Instance Type"
            value={spec.cloud_instance_type}
          />

          <DetailField
            label="Operating System"
            value={spec.os}
          />

          <DetailField
            label="Cluster Configuration"
            value={spec.cluster_config}
          />

          <DetailField
            label="Primary IP"
            value={spec.primary_ip}
          />

          <DetailField
            label="Availability Zone"
            value={spec.availability_zone}
          />
        </div>
      </Card>
    )
  }


  if (type === 'storage' && asset.storage_spec) {
    const spec = asset.storage_spec

    return (
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HardDrive size={17} className="text-accent" />
          <h2 className="font-semibold text-[15px]">
            Storage Specification
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <DetailField
            label="Storage Type"
            value={spec.storage_type}
          />

          <DetailField
            label="Solution Name"
            value={spec.solution_name}
          />

          <DetailField
            label="Raw Capacity (TB)"
            value={spec.raw_capacity_tb}
          />

          <DetailField
            label="Usable Capacity (TB)"
            value={spec.usable_capacity_tb}
          />

          <DetailField
            label="Media Type"
            value={spec.media_type}
          />

          <DetailField
            label="RAID Level"
            value={spec.raid_level}
          />

          <DetailField
            label="Primary Protocol"
            value={spec.primary_protocol}
          />
        </div>
      </Card>
    )
  }


  if (type === 'network' && asset.network_spec) {
    const spec = asset.network_spec

    return (
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Network size={17} className="text-accent" />
          <h2 className="font-semibold text-[15px]">
            Network Specification
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <DetailField
            label="Device Type"
            value={spec.device_type}
          />

          <DetailField
            label="Solution Name"
            value={spec.solution_name}
          />

          <DetailField
            label="Redundancy"
            value={spec.redundancy_mode}
          />

          <DetailField
            label="10G Ports"
            value={spec.ports_10g}
          />

          <DetailField
            label="100G Ports"
            value={spec.ports_100g}
          />

          <DetailField
            label="Management IP"
            value={spec.management_ip}
          />

          <DetailField
            label="Firmware Version"
            value={spec.firmware_version}
          />
        </div>
      </Card>
    )
  }


  if (type === 'backup' && asset.backup_spec) {
    const spec = asset.backup_spec

    return (
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Database size={17} className="text-accent" />
          <h2 className="font-semibold text-[15px]">
            Backup Specification
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <DetailField
            label="Solution Name"
            value={spec.solution_name}
          />

          <DetailField
            label="Backup Software"
            value={spec.backup_software}
          />

          <DetailField
            label="Backup Type"
            value={spec.backup_type}
          />

          <DetailField
            label="Backup Rule"
            value={spec.backup_rule}
          />

          <DetailField
            label="Daily Retention"
            value={
              spec.daily_retention_days
                ? `${spec.daily_retention_days} days`
                : null
            }
          />

          <DetailField
            label="Weekly Retention"
            value={
              spec.weekly_retention_weeks
                ? `${spec.weekly_retention_weeks} weeks`
                : null
            }
          />

          <DetailField
            label="Monthly Retention"
            value={
              spec.monthly_retention_months
                ? `${spec.monthly_retention_months} months`
                : null
            }
          />

          <DetailField
            label="RTO"
            value={
              spec.rto_minutes !== null &&
              spec.rto_minutes !== undefined
                ? `${spec.rto_minutes} minutes`
                : null
            }
          />

          <DetailField
            label="RPO"
            value={
              spec.rpo_minutes !== null &&
              spec.rpo_minutes !== undefined
                ? `${spec.rpo_minutes} minutes`
                : null
            }
          />

          <DetailField
            label="Encryption"
            value={spec.encryption}
          />

          <DetailField
            label="Controller Count"
            value={spec.controller_count}
          />

          <DetailField
            label="Raw Capacity (TB)"
            value={spec.raw_capacity_tb}
          />

          <DetailField
            label="Usable Capacity (TB)"
            value={spec.usable_capacity_tb}
          />

          <DetailField
            label="RAID Level"
            value={spec.raid_level}
          />

          <DetailField
            label="Disk Type"
            value={spec.disk_type}
          />

          <DetailField
            label="Disk Count"
            value={spec.disk_count}
          />

          <DetailField
            label="Management IP"
            value={spec.management_ip}
          />

          <DetailField
            label="Storage OS"
            value={spec.firmware_storage_os}
          />
        </div>
      </Card>
    )
  }


  if (type === 'cloud_service' && asset.cloud_spec) {
    const spec = asset.cloud_spec

    return (
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Cloud size={17} className="text-accent" />
          <h2 className="font-semibold text-[15px]">
            Cloud Specification
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <DetailField
            label="Service Type"
            value={spec.service_type}
          />

          <DetailField
            label="Service Name"
            value={spec.service_name}
          />

          <DetailField
            label="Service Tier"
            value={spec.service_tier}
          />

          <DetailField
            label="Billing Model"
            value={spec.billing_model}
          />

          <DetailField
            label="Monthly Cost (USD)"
            value={
              spec.monthly_cost_usd !== null &&
              spec.monthly_cost_usd !== undefined
                ? `$${spec.monthly_cost_usd}`
                : null
            }
          />

          <DetailField
            label="HA Configuration"
            value={spec.ha_config}
          />

          <DetailField
            label="vCPU Count"
            value={spec.vcpu_count}
          />

          <DetailField
            label="RAM (GB)"
            value={spec.ram_gb}
          />

          <DetailField
            label="Storage (GB)"
            value={spec.storage_gb}
          />
        </div>
      </Card>
    )
  }


  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Package size={17} className="text-text-3" />

        <h2 className="font-semibold text-[15px]">
          Technical Specification
        </h2>
      </div>

      <p className="text-sm text-text-3">
        No technical specification has been registered for this asset.
      </p>
    </Card>
  )
}


// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function AssetDetailPage() {
 
 
    
  const params = useParams()
  const router = useRouter()

  const { user } = useAuth()

  const [asset, setAsset] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)


  // ---------------------------------------------------------------------------
  // Load asset
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const loadAsset = async () => {
      try {
        setLoading(true)
        setError('')

        
        const response = await api.get(
  `/v1/assets/${params.id}/`
)

        setAsset(response.data)
      } catch (err: any) {
        console.error(
          'Failed to load asset:',
          err?.response?.data || err
        )

        setError(
          err?.response?.data?.detail ||
          'Failed to load asset.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadAsset()
    }
  }, [params.id])


  // ---------------------------------------------------------------------------
  // Permission
  //
  // Backend remains the final authority.
  //
  // Admin can edit/delete.
  // Architect can edit/delete only when membership is confirmed.
  //
  // ---------------------------------------------------------------------------

  const canModify =
    user?.role === 'admin' ||
    (
      user?.role === 'architect' &&
      Boolean(asset?.can_edit)
    )


  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = async () => {
    if (!asset) return

    const confirmed = window.confirm(
      `Delete "${asset.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      setError('')

      await api.delete(
  `/v1/assets/${asset.id}/`
)

      router.push('/assets')
    } catch (err: any) {
      console.error(
        'Failed to delete asset:',
        err?.response?.data || err
      )

      setError(
        err?.response?.data?.detail ||
        'You do not have permission to delete this asset.'
      )
    } finally {
      setDeleting(false)
    }
  }


  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-text-3">
          Loading asset...
        </div>
      </div>
    )
  }


  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------

  if (error && !asset) {
    return (
      <div className="space-y-4">

        <Link
          href="/assets"
          className="inline-flex items-center gap-2 text-sm text-text-3 hover:text-text-1"
        >
          <ArrowLeft size={15} />
          Back to Assets
        </Link>

        <Card>
          <div className="text-sm text-danger">
            {error}
          </div>
        </Card>

      </div>
    )
  }


  if (!asset) {
    return null
  }


  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-5">

      {/* ------------------------------------------------------------------- */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------- */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <Link
            href="/assets"
            className="inline-flex items-center gap-2 text-xs text-text-3 hover:text-text-1 mb-3"
          >
            <ArrowLeft size={14} />
            Back to Assets
          </Link>

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              {TYPE_ICONS[asset.asset_type] || (
                <Package size={18} />
              )}
            </div>

            <div>
              <h1 className="text-lg font-semibold text-text-1">
                {asset.name}
              </h1>

              <div className="flex items-center gap-2 mt-1">

                <code className="font-mono text-[11px] text-accent">
                  {asset.asset_code}
                </code>

                <Badge variant="blue">
                  {TYPE_LABELS[asset.asset_type] ||
                    asset.asset_type}
                </Badge>

              </div>
            </div>

          </div>

        </div>


        {/* Actions */}

        {canModify && (
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/assets/${asset.id}/edit`
                )
              }
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border-2 bg-bg-2 text-text-2 text-sm hover:bg-bg-3 hover:text-text-1 transition-colors"
            >
              <Edit size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-danger/20 bg-danger/5 text-danger text-sm hover:bg-danger/10 disabled:opacity-50 transition-colors"
            >
              <Trash2 size={14} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>

          </div>
        )}

      </div>


      {/* Error */}

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 text-danger text-sm px-4 py-3">
          {error}
        </div>
      )}


      {/* ------------------------------------------------------------------- */}
      {/* General Information                                                 */}
      {/* ------------------------------------------------------------------- */}

      <Card>

        <div className="flex items-center gap-2 mb-5">

          <Package
            size={17}
            className="text-accent"
          />

          <h2 className="font-semibold text-[15px]">
            Asset Information
          </h2>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

          <DetailField
            label="Asset Code"
            value={asset.asset_code}
          />

          <DetailField
            label="Name"
            value={asset.name}
          />

          <DetailField
            label="Asset Type"
            value={
              TYPE_LABELS[asset.asset_type] ||
              asset.asset_type
            }
          />

          <DetailField
            label="Quantity"
            value={asset.quantity}
          />

          <DetailField
            label="Project"
            value={asset.project_name}
          />

          <DetailField
            label="Deployment Model"
            value={
              DEPLOYMENT_LABELS[
                asset.deployment_model
              ] ||
              asset.deployment_model
            }
          />

          <DetailField
            label="Environment"
            value={
              ENVIRONMENT_LABELS[
                asset.environment
              ] ||
              asset.environment
            }
          />

          <DetailField
            label="Data Tier"
            value={asset.data_tier}
          />

          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-4 mb-1">
              Status
            </div>

            <Badge
              variant={statusVariant(asset.status)}
            >
              {asset.status || 'Unknown'}
            </Badge>
          </div>

          <DetailField
            label="Tags"
            value={
              Array.isArray(asset.tags)
                ? asset.tags.join(', ')
                : asset.tags
            }
          />

        </div>

      </Card>


      {/* ------------------------------------------------------------------- */}
      {/* Location                                                             */}
      {/* ------------------------------------------------------------------- */}

      <Card>

        <div className="flex items-center gap-2 mb-5">

          <MapPin
            size={17}
            className="text-accent"
          />

          <h2 className="font-semibold text-[15px]">
            Location
          </h2>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

          <DetailField
            label="Site"
            value={asset.site_name}
          />

          <DetailField
            label="Location"
            value={asset.location}
          />

          <DetailField
            label="Rack Position"
            value={asset.rack_position}
          />

          <DetailField
            label="Cloud Provider"
            value={asset.cloud_provider}
          />

          <DetailField
            label="Cloud Region"
            value={asset.cloud_region}
          />

          <DetailField
            label="Cloud Account ID"
            value={asset.cloud_account_id}
          />

          <DetailField
            label="Resource Group"
            value={asset.resource_group}
          />

        </div>

      </Card>


      {/* ------------------------------------------------------------------- */}
      {/* Technical specification                                              */}
      {/* ------------------------------------------------------------------- */}

      <SpecificationSection asset={asset} />


      {/* ------------------------------------------------------------------- */}
      {/* Notes                                                                */}
      {/* ------------------------------------------------------------------- */}

      <Card>

        <div className="flex items-center gap-2 mb-4">

          <FileText
            size={17}
            className="text-accent"
          />

          <h2 className="font-semibold text-[15px]">
            Notes
          </h2>

        </div>

        <div className="text-sm text-text-2 whitespace-pre-wrap">
          {asset.notes || 'No notes added.'}
        </div>

      </Card>


      {/* ------------------------------------------------------------------- */}
{/* Metadata                                                            */}
{/* ------------------------------------------------------------------- */}

<Card>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

    <DetailField
      label="Created"
      value={
        asset.created_at
          ? new Date(asset.created_at).toLocaleString()
          : null
      }
    />

    <DetailField
      label="Created By"
      value={
        asset.created_by
          ? (
              asset.created_by.first_name ||
              asset.created_by.username ||
              '—'
            )
          : null
      }
    />

    <DetailField
      label="Last Updated"
      value={
        asset.updated_at
          ? new Date(asset.updated_at).toLocaleString()
          : null
      }
    />

    <DetailField
      label="Updated By"
      value={
        asset.updated_by
          ? (
              asset.updated_by.first_name ||
              asset.updated_by.username ||
              '—'
            )
          : null
      }
    />

  </div>
</Card>

    </div>
  )
}