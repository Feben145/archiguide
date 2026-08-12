// src/app/(dashboard)/assets/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { StatCard, Card } from '@/components/ui/Card'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { FormGroup, Input, Select, Textarea } from '@/components/ui/Input'
import { Plus, Search, Upload,Download } from 'lucide-react'
import api from '@/lib/api'
import type { Asset } from '@/lib/types'
import { ImportModal } from '@/components/ui/ImportModal'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------------------
// Choice sets — mirrored from the Django Asset model
// ---------------------------------------------------------------------------

const TYPE_CHOICES = [
  ['server', 'Server / VM / Instance'],
  ['storage', 'Storage System'],
  ['network', 'Network Device'],
  ['backup', 'Backup System / Policy'],
  ['software', 'Software License'],
  ['cloud_service', 'Cloud Service / PaaS / SaaS'],
  ['container', 'Container / K8s Workload'],
  ['endpoint', 'Endpoint / Workstation'],
  ['iot', 'IoT / Edge Device'],
  //['telecom', 'Telecom / UC Equipment'],
  ['facility', 'Facility / Power / Cooling'],
  ['other', 'Other'],
] as const

const STATUS_CHOICES = [
  ['active', 'Active'],
  ['maintenance', 'Under Maintenance'],
  ['retired', 'Retired'],
  ['expiring', 'Expiring Soon'],
  ['planned', 'Planned / In Procurement'],
  ['disposed', 'Disposed'],
  ['decommissioning', 'Being Decommissioned'],
] as const

const ENVIRONMENT_CHOICES = [
  ['prod', 'Production'],
  ['staging', 'Staging / UAT'],
  ['dev', 'Development'],
  ['dr', 'Disaster Recovery'],
  ['lab', 'Lab / Test'],
  ['sandbox', 'Sandbox'],
  ['shared', 'Shared Services'],
] as const

const TIER_CHOICES = [
  ['0', 'Tier 0 — Mission Critical'],
  ['1', 'Tier 1 — Business Critical'],
  ['2', 'Tier 2 — Business Important'],
  ['3', 'Tier 3 — Non-Critical'],
  ['4', 'Tier 4 — Transient / Disposable'],
] as const

const DEPLOYMENT_MODEL_CHOICES = [
  ['on_prem', 'On-Premises'],
  ['private_cloud', 'Private Cloud'],
  ['public_cloud', 'Public Cloud'],
  ['hybrid', 'Hybrid Cloud'],
  ['multi_cloud', 'Multi-Cloud'],
  ['edge', 'Edge / Remote Site'],
  ['colocation', 'Co-location'],
  ['managed_service', 'Managed Service'],
] as const

const TYPE_ICONS: Record<string, string> = {
  server: '🖥',
  storage: '💾',
  network: '🔀',
  backup: '🛡',
  software: '📦',
  cloud_service: '☁',
  container: '📦',
  endpoint: '💻',
  iot: '📡',
  //telecom: '☎',
  facility: '🏢',
  other: '📦',
}

// ---------------------------------------------------------------------------
// Technical specification choices
// ---------------------------------------------------------------------------

const SERVER_ROLE_CHOICES = [
  'application',
  'database',
  'web',
  'file',
  'domain',
  'backup',
  'monitoring',
  'middleware',
  'hypervisor',
  'container',
  'jump',
  'build',
  'gpu',
  'api_gateway',
  'cache',
  'edge',
  'print',
  'other',
]

const SERVER_TYPE_CHOICES = [
  'physical',
  'vm_vmware',
  'vm_hyperv',
  'vm_proxmox',
  'vm_kvm',
  'cloud_vm',
  'cloud_spot',
  'cloud_dedicated',
  'container_pod',
  'serverless',
  'paas_app',
]

const CLUSTER_CHOICES = [
  'standalone',
  'ha_2node',
  'ha_multinode',
  'lb_pool',
  'k8s_worker',
  'k8s_master',
  'rac',
  'aag',
  'scale_set',
  'other',
]

const STORAGE_TYPE_CHOICES = [
  'san',
  'nas',
  'das',
  'object',
  'cloud_block',
  'cloud_file',
  'cloud_object',
  'cloud_archive',
  'tape',
  'vsan',
  'hyperconverged',
  'backup_appliance',
  'all_flash_array',
  'hybrid_array',
]

const MEDIA_TYPE_CHOICES = [
  'nvme',
  'ssd',
  'hybrid',
  'hdd',
  'tape',
 // 'tape_lto9',
  'cloud',
]

const RAID_CHOICES = [
  'raid0',
  'raid1',
  'raid5',
  'raid6',
  'raid10',
  'raid60',
  'erasure',
  'none',
]

const PROTOCOL_CHOICES = [
  'fc',
  'iscsi',
  'nfs',
  'smb',
  'nvme_of',
  's3',
  'azure_blob',
  'fcoe',
  'mixed',
]

const DEVICE_TYPE_CHOICES = [
  'core_switch',
  'access_switch',
  'distribution',
  'spine',
  'leaf',
  'router',
  'firewall',
  'waf',
  'load_balancer',
  'vpn_gateway',
  'sd_wan_edge',
  'ids_ips',
  'proxy',
  'wan_optimizer',
  'wireless_ap',
  'wireless_ctrl',
  'cloud_vnet_gw',
  'cloud_firewall',
  'cloud_lb',
  'cloud_cdn',
  'transit_gw',
  'express_route',
  'other',
]

const REDUNDANCY_CHOICES = [
  'none',
  'lacp',
  'vpc_mlag',
  'hsrp',
  'vrrp',
  'active_active',
  'active_standby',
  'ha_pair',
  'zone_redundant',
]

const BACKUP_TYPE_CHOICES = [
  'full',
  'incremental',
  'differential',
  'synthetic_full',
  'continuous',
  'snapshot',
  'replication',
  'mixed',
]

const BACKUP_RULE_CHOICES = [
  '3_2_1',
  '3_2_1_1_0',
  '4_3_2',
  'custom',
  'none',
]

const ENCRYPTION_CHOICES = [
  'none',
  'aes128',
  'aes256',
  'vendor',
]

const CLOUD_SERVICE_TYPE_CHOICES = [
  'iaas_compute',
  'iaas_storage',
  'iaas_network',
  'paas_db',
  'paas_cache',
  'paas_queue',
  'paas_app',
  'paas_k8s',
  'paas_ai',
  'paas_analytics',
  'saas_erp',
  'saas_crm',
  'saas_collab',
  'saas_security',
  'saas_monitoring',
  'saas_other',
  'cdn',
  'dns',
  'identity',
  'api_gateway',
  'other',
]

const BILLING_CHOICES = [
  'pay_as_you_go',
  'reserved_1yr',
  'reserved_3yr',
  'spot',
  'subscription',
  'license_included',
  'byol',
  'free_tier',
]

const HA_CHOICES = [
  'single_az',
  'multi_az',
  'multi_region',
  'geo_redundant',
  'zone_redundant',
  'provider_sla',
]

const label = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const CORE_TABS = [
  'Identity',
  'Location',
  'Spec',
  'Notes',
] as const

type CoreTab = typeof CORE_TABS[number]

// ---------------------------------------------------------------------------
// Empty forms
// ---------------------------------------------------------------------------

const emptyForm = {
  // Identity
  name: '',
  asset_type: 'server',
  project: '',
  deployment_model: 'on_prem',
  environment: 'prod',
  data_tier: '1',
  status: 'active',
  tags: '',

  // Quantity
  quantity: 1,
  // Location
  site_name: '',
  location: '',
  rack_position: '',
  cloud_provider: '',
  cloud_region: '',
  cloud_account_id: '',
  resource_group: '',

  // Notes
  notes: '',
}

const emptyServerSpec = {
  server_role: 'application',
  server_type: 'physical',
  solution_name: '',
  vcpu_count: '',
  ram_gb: '',
  system_disk_gb: '',
  cloud_instance_type: '',
  os: '',
  cluster_config: 'standalone',
  primary_ip: '',
  availability_zone: '',
}

const emptyStorageSpec = {
  storage_type: 'san',
  solution_name: '',
  raw_capacity_tb: '',
  usable_capacity_tb: '',
  media_type: 'all_nvme',
  raid_level: 'raid6',
  primary_protocol: 'fc',
}

const emptyNetworkSpec = {
  device_type: 'core_switch',
  solution_name: '',
  redundancy_mode: 'ha_pair',
  ports_10g: '',
  ports_100g: '',
  management_ip: '',
  firmware_version: '',
}

const emptyBackupSpec = {
  solution_name: '',
  backup_software: '',
  backup_type: 'incremental',
  backup_rule: '3_2_1_1_0',
  controller_count: '',
  disk_count: '',
  raw_capacity_tb: '',
  usable_capacity_tb: '',
  raid_level: '',
  media_type: 'all_nvme',
  firmware_os: '',
  daily_retention_days: 7,
  weekly_retention_weeks: 4,
  monthly_retention_months: 12,
  rto_minutes: '',
  rpo_minutes: '',
  encryption: 'aes256',
}

const emptyCloudSpec = {
  service_type: 'paas_db',
  service_name: '',
  service_tier: '',
  billing_model: 'pay_as_you_go',
  monthly_cost_usd: '',
  ha_config: 'multi_az',
  vcpu_count: '',
  ram_gb: '',
  storage_gb: '',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AssetsPage() {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [newOpen, setNewOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const [search, setSearch] = useState('')
  const [typeFilter, setType] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [envFilter, setEnvFilter] = useState('')

  const [importOpen, setImportOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<CoreTab>('Identity')

  const [form, setForm] = useState(emptyForm)

  const [serverSpec, setServerSpec] = useState(emptyServerSpec)
  const [storageSpec, setStorageSpec] = useState(emptyStorageSpec)
  const [networkSpec, setNetworkSpec] = useState(emptyNetworkSpec)
  const [backupSpec, setBackupSpec] = useState(emptyBackupSpec)
  const [cloudSpec, setCloudSpec] = useState(emptyCloudSpec)

const [projects, setProjects] = useState<any[]>([])
const [projectsLoading, setProjectsLoading] = useState(false)


const [projectOpen, setProjectOpen] = useState(false)
const [creatingProject, setCreatingProject] = useState(false)

const [newProject, setNewProject] = useState({
  name: '',
  description: '',
})

  // -------------------------------------------------------------------------
  // Fetch assets and projects
  // -------------------------------------------------------------------------

 
const fetchProjects = async () => {
  setProjectsLoading(true)

  try {
    const response = await api.get('/projects/')

    const data = response.data.results || response.data

    setProjects(data)
  } catch (error: any) {
    console.error(
      'Failed to load projects:',
      error?.response?.data || error
    )
  } finally {
    setProjectsLoading(false)
  }
}
  const fetchAssets = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()

      if (typeFilter) {
        params.set('asset_type', typeFilter)
      }

      if (statusFilter) {
        params.set('status', statusFilter)
      }

      if (envFilter) {
        params.set('environment', envFilter)
      }

      if (search) {
        params.set('search', search)
      }

      const query = params.toString()

     const [assetsRes, statsRes] = await Promise.all([
  api.get(`/v1/assets/${query ? `?${query}` : ''}`),
  api.get('/v1/assets/stats/'),
])
      setAssets(
        assetsRes.data?.results || assetsRes.data || []
      )

      setStats(statsRes.data || null)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  fetchAssets()
}, [
  typeFilter,
  statusFilter,
  envFilter,
  search,
])

useEffect(() => {
  fetchProjects()
}, [])
  // -------------------------------------------------------------------------
  // Reset form
  // -------------------------------------------------------------------------

  const resetForm = () => {
    setForm({ ...emptyForm })
    setServerSpec({ ...emptyServerSpec })
    setStorageSpec({ ...emptyStorageSpec })
    setNetworkSpec({ ...emptyNetworkSpec })
    setBackupSpec({ ...emptyBackupSpec })
    setCloudSpec({ ...emptyCloudSpec })
    setActiveTab('Identity')
  }

  // -------------------------------------------------------------------------
  // Technical specification mapping
  // -------------------------------------------------------------------------

  const specForType: Record<string, { key: string; data: any }> = {
    server: {
      key: 'server_spec',
      data: serverSpec,
    },

    storage: {
      key: 'storage_spec',
      data: storageSpec,
    },

    network: {
      key: 'network_spec',
      data: networkSpec,
    },

    backup: {
      key: 'backup_spec',
      data: backupSpec,
    },

    cloud_service: {
      key: 'cloud_spec',
      data: cloudSpec,
    },
  }

  // -------------------------------------------------------------------------
  // Create project and asset
  // -------------------------------------------------------------------------
const handleCreateProject = async () => {
  const name = newProject.name.trim()

  if (!name) {
    return
  }

  setCreatingProject(true)

  try {
    const response = await api.post('/projects/', {
      name,
      description: newProject.description.trim(),
    })

    const createdProject = response.data

    setProjects(current => [
      ...current,
      createdProject,
    ])

    setForm(current => ({
      ...current,
      project: createdProject.id,
    }))

    setNewProject({
      name: '',
      description: '',
    })

    setProjectOpen(false)

  } catch (error: any) {
    console.error('PROJECT CREATE ERROR')
    console.error('Status:', error?.response?.status)
    console.error('Data:', error?.response?.data)
    console.error('Full error:', error)
  } finally {
    setCreatingProject(false)
  }
}


const handleCreate = async () => {
  setCreating(true)

  try {
    if (!form.project) {
      throw new Error('Please select a project.')
    }

    const payload: any = {
      ...form,

      quantity: Number(form.quantity),

      tags: form.tags
        ? form.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [],
    }

    const spec = specForType[form.asset_type]

    if (spec) {
      const cleanedSpec = Object.fromEntries(
        Object.entries(spec.data).filter(
          ([_, value]) =>
            value !== '' &&
            value !== undefined &&
            value !== null
        )
      )

      payload[spec.key] = cleanedSpec
    }

    await api.post('/v1/assets/', payload)

    await fetchAssets()

    setNewOpen(false)
    resetForm()
  } catch (error: any) {
    console.error(
      'Failed to create asset:',
      error?.response?.data || error
    )
  } finally {
    setCreating(false)
  }
}

// -------------------------------------------------------------------------
// Download assets as CSV
// -------------------------------------------------------------------------
const handleDownload = () => {
  if (!assets.length) {
    return
  }

  const headers = [
    'Asset ID',
    'Name',
    'Project',
    'Quantity',
    'OS / Firmware',
    'Capacity / Spec',
    'Type',
    'Deployment Model',
    'Environment',
    'Location',
    'Status',
    'Notes',
  ]

  const rows = assets.map((asset: any) => [
    asset.asset_code ?? '',
    asset.name ?? '',
    asset.project_name ?? '',
    asset.quantity ?? 1,
    getOsOrFirmware(asset),
    getCapacitySpec(asset),
    label(asset.asset_type),
    label(asset.deployment_model || 'on_prem'),
    label(asset.environment || 'prod'),
    asset.site_name || asset.location || '',
    label(asset.status),
    asset.notes ?? '',
  ])

  const escapeCsvValue = (value: any) => {
    const stringValue = String(value ?? '')

    return `"${stringValue.replace(/"/g, '""')}"`
  }

  const csv = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map(row =>
      row.map(escapeCsvValue).join(',')
    ),
  ].join('\r\n')

  const blob = new Blob(
    ['\uFEFF' + csv],
    {
      type: 'text/csv;charset=utf-8;',
    }
  )

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `asset-registry-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
  // -------------------------------------------------------------------------
  // Form helpers
  // -------------------------------------------------------------------------

  const set =
    (key: string) =>
    (e: any) =>
      setForm((current: any) => ({
        ...current,
        [key]: e.target.value,
      }))

  const setSpec =
    (setter: any) =>
    (key: string) =>
    (e: any) =>
      setter((current: any) => ({
        ...current,
        [key]: e.target.value,
      }))

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  const hardwareCount = [
    'server',
    'storage',
    'network',
    'endpoint',
    'iot',
    //'telecom',
    'facility',
    'container',
  ].reduce(
    (sum, type) => sum + (stats?.by_type?.[type] ?? 0),
    0
  )

  // function to get OS or firmware for an asset, depending on its type

  function getOsOrFirmware(asset: any) {
  switch (asset.asset_type) {
    case 'server':
      return asset.server_spec?.os || '—'

    case 'backup':
      return asset.backup_spec?.firmware_storage_os || '—'

    default:
      return '—'
  }
}
// function to get capacity specification for an asset, depending on its type
function getCapacitySpec(asset: any) {
  const quantity = Number(asset.quantity) || 1

  switch (asset.asset_type) {
    case 'server': {
      const spec = asset.server_spec
      if (!spec) return '—'

      const parts = []

      if (spec.vcpu_count != null) {
        parts.push(`${quantity * Number(spec.vcpu_count)} vCPU`)
      }

      if (spec.ram_gb != null) {
        parts.push(`${quantity * Number(spec.ram_gb)} GB RAM`)
      }

      if (spec.system_disk_gb != null) {
        parts.push(`${quantity * Number(spec.system_disk_gb)} GB Disk`)
      }

      return parts.length ? parts.join(' · ') : '—'
    }

    case 'storage': {
      const spec = asset.storage_spec
      if (!spec) return '—'

      const parts = []

      if (spec.storage_type) {
        parts.push(spec.storage_type)
      }

      if (spec.raw_capacity_tb != null) {
        parts.push(`${quantity * Number(spec.raw_capacity_tb)} TB Raw`)
      }

      if (spec.usable_capacity_tb != null) {
        parts.push(`${quantity * Number(spec.usable_capacity_tb)} TB Usable`)
      }

      if (spec.media_type) {
        parts.push(spec.media_type)
      }

      return parts.length ? parts.join(' · ') : '—'
    }

    case 'network': {
      const spec = asset.network_spec
      if (!spec) return '—'

      const parts = []

      if (spec.device_type) {
        parts.push(spec.device_type)
      }

      if (spec.redundancy_mode) {
        parts.push(spec.redundancy_mode)
      }

      if (spec.ports_10g != null) {
        parts.push(`${quantity * Number(spec.ports_10g)} × 10G`)
      }

      if (spec.ports_100g != null) {
        parts.push(`${quantity * Number(spec.ports_100g)} × 100G`)
      }

      return parts.length ? parts.join(' · ') : '—'
    }

    case 'backup': {
      const spec = asset.backup_spec
      if (!spec) return '—'

      const parts = []

      if (spec.raw_capacity_tb != null) {
        parts.push(`${quantity * Number(spec.raw_capacity_tb)} TB Raw`)
      }

      if (spec.usable_capacity_tb != null) {
        parts.push(`${quantity * Number(spec.usable_capacity_tb)} TB Usable`)
      }

      if (spec.disk_type) {
        parts.push(spec.disk_type)
      }

      return parts.length ? parts.join(' · ') : '—'
    }

    case 'cloud_service': {
      const spec = asset.cloud_spec
      if (!spec) return '—'

      const parts = []

      if (spec.vcpu_count != null) {
        parts.push(`${quantity * Number(spec.vcpu_count)} vCPU`)
      }

      if (spec.ram_gb != null) {
        parts.push(`${quantity * Number(spec.ram_gb)} GB RAM`)
      }

      if (spec.storage_gb != null) {
        const storageGb = quantity * Number(spec.storage_gb)

        parts.push(
          storageGb >= 1024
            ? `${(storageGb / 1024).toFixed(2)} TB Storage`
            : `${storageGb} GB Storage`
        )
      }

      return parts.length ? parts.join(' · ') : '—'
    }

    default:
      return '—'
  }
}



  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-5">

      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-1">
            Asset Registry
          </h1>

          <p className="text-text-3 text-sm mt-1">
            Hardware, software, cloud &amp; backup inventory · 
          </p>
        </div>

        <div className="flex gap-2">
         {/*} <Button
            icon={<Upload size={13} />}
            onClick={() => setImportOpen(true)}
          >
            Import CSV
          </Button>*/}
<Button
    icon={<Download size={13} />}
    onClick={handleDownload}
    disabled={assets.length === 0}
  >
    Download CSV
  </Button>
          <Button
            variant="primary"
            icon={<Plus size={13} />}
            onClick={() => {
              resetForm()
              setNewOpen(true)
            }}
          >
            Register Asset
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-5 gap-3 mb-5">
        <StatCard
          label="Total Assets"
          value={stats?.total ?? '—'}
        />

        <StatCard
          label="Hardware"
          value={
            <span className="text-accent-3">
              {hardwareCount}
            </span>
          }
        />

        <StatCard
          label="Software Licenses"
          value={
            <span className="text-accent">
              {stats?.by_type?.software ?? 0}
            </span>
          }
        />

        <StatCard
          label="Cloud Services"
          value={
            <span className="text-success">
              {stats?.by_type?.cloud_service ?? 0}
            </span>
          }
        />

        <StatCard
          label="Backup Policies"
          value={
            <span className="text-text-2">
              {stats?.by_type?.backup ?? 0}
            </span>
          }
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filters                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3"
          />

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="bg-bg-2 border border-border-2 rounded-lg pl-8 pr-3 py-2 text-sm text-text-1 outline-none focus:border-accent w-48"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setType(e.target.value)}
          className="bg-bg-2 border border-border-2 rounded-lg px-3 py-2 text-sm text-text-2 outline-none focus:border-accent"
        >
          <option value="">All Types</option>

          {TYPE_CHOICES.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-bg-2 border border-border-2 rounded-lg px-3 py-2 text-sm text-text-2 outline-none focus:border-accent"
        >
          <option value="">All Statuses</option>

          {STATUS_CHOICES.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>

        <select
          value={envFilter}
          onChange={e => setEnvFilter(e.target.value)}
          className="bg-bg-2 border border-border-2 rounded-lg px-3 py-2 text-sm text-text-2 outline-none focus:border-accent"
        >
          <option value="">All Environments</option>

          {ENVIRONMENT_CHOICES.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </div>


      {/* ------------------------------------------------------------------ */}
      {/* Asset Table                                                        */}
      {/* ------------------------------------------------------------------ */}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table>
           <thead>
  <tr>
    <th>Asset ID</th>
    <th>Name</th>
    <th>Project</th>
    <th>Quantity</th>
    <th>OS / Firmware</th>
    <th>Capacity / Spec</th>
    <th>Type</th>
    <th>Deployment / Env</th>
    <th>Location</th>
    <th>Status</th>
    <th>Remark</th>
  </tr>
</thead>

            <tbody>
              {assets.map((asset: any) => (
  <tr
    key={asset.id}
    onClick={() => router.push(`/assets/${asset.id}`)}
    className="cursor-pointer hover:bg-bg-3 transition-colors"
  >
                  <td>
                    <code className="font-mono text-[11.5px] text-accent">
                      {asset.asset_code}
                    </code>
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <span>
                        {TYPE_ICONS[asset.asset_type] || '📦'}
                      </span>

                      <span className="font-medium text-text-2 text-[12.5px]">
                        {asset.name}
                      </span>
                    </div>
                  </td>
                 <td className="text-text-2 text-[12px]">
                     {asset.project_name || '—'}
                 </td>

               <td className="text-text-2 text-[12px] text-center">
                  {asset.quantity ?? 1}
               </td>
               <td className="text-text-2">
  {getOsOrFirmware(asset)}
</td>

<td className="text-text-2">
  {getCapacitySpec(asset)}
</td>
                  <td>
                    <Badge variant="blue">
                      {label(asset.asset_type)}
                    </Badge>
                  </td>

                  <td className="text-text-3 text-[12px]">
                    {label(asset.deployment_model || 'on_prem')}

                    <span className="text-text-3/60">
                      {' '}
                      · {label(asset.environment || 'prod')}
                    </span>
                  </td>

                  <td className="text-text-3 text-[12px]">
                    {asset.site_name ||
                      asset.location ||
                      '—'}
                  </td>
                  <td>
                    <Badge variant={statusVariant(asset.status)}>
                      {label(asset.status)}
                    </Badge>
                  </td>

                  <td className="text-text-1 text-[12px]">
                     {asset.notes || '—'}
                  </td>
                </tr>
              ))}

              {!loading && assets.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-text-3"
                  >
                    No assets found. Register your first asset.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-text-3"
                  >
                    Loading assets...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* New Project && New Asset Modal                                                    */}
      {/* ------------------------------------------------------------------ */}

      <Modal
        open={newOpen}
        onClose={() => {
          setNewOpen(false)
          resetForm()
        }}
        title="+ Register Asset"
        size="lg"
      >
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border-2 mb-4 overflow-x-auto">
          {CORE_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-[12.5px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-accent text-text-1 font-medium'
                  : 'border-transparent text-text-3 hover:text-text-2'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Identity                                                         */}
        {/* ---------------------------------------------------------------- */}

        {activeTab === 'Identity' && (
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Asset Name" required>
              <Input
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. ERP-PROD-APP-01"
              />
            </FormGroup>

            <FormGroup label="Asset Type" required>
              <Select
                value={form.asset_type}
                onChange={set('asset_type')}
              >
                {TYPE_CHOICES.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </Select>
            </FormGroup>
         <FormGroup label="Project" required>
  <div className="flex gap-2">
    <Select
      value={form.project}
      onChange={set('project')}
    >
      <option value="">Select a project...</option>

      {projects.map(project => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </Select>

    <Button
      type="button"
      onClick={() => setProjectOpen(true)}
    >
      <Plus size={14} />
      New Project
    </Button>
  </div>
</FormGroup>


            <FormGroup label="Quantity" required>
              <Input
                type="number"
                min="1"
                value={form.quantity}
                onChange={set('quantity')}
                placeholder="e.g. 10"
              />
            </FormGroup>

            <FormGroup label="Deployment Model">
              <Select
                value={form.deployment_model}
                onChange={set('deployment_model')}
              >
                {DEPLOYMENT_MODEL_CHOICES.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup label="Environment">
              <Select
                value={form.environment}
                onChange={set('environment')}
              >
                {ENVIRONMENT_CHOICES.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup label="Data Tier">
              <Select
                value={form.data_tier}
                onChange={set('data_tier')}
              >
                {TIER_CHOICES.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup label="Status">
              <Select
                value={form.status}
                onChange={set('status')}
              >
                {STATUS_CHOICES.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </Select>
            </FormGroup>

           {/*} <FormGroup label="Tags (comma separated)">
              <Input
                value={form.tags}
                onChange={set('tags')}
                placeholder="e.g. pci-scope, tier1, legacy"
              />
            </FormGroup>
            */}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Location                                                         */}
        {/* ---------------------------------------------------------------- */}

        {activeTab === 'Location' && (
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Site Name">
              <Input
                value={form.site_name}
                onChange={set('site_name')}
                placeholder="e.g. Addis Ababa DC1"
              />
            </FormGroup>

            <FormGroup label="Location / Zone">
              <Input
                value={form.location}
                onChange={set('location')}
                placeholder="Rack/cage/zone/AZ/resource group"
              />
            </FormGroup>

            <FormGroup label="Rack Position">
              <Input
                value={form.rack_position}
                onChange={set('rack_position')}
                placeholder="e.g. Rack-4B U12"
              />
            </FormGroup>

            <FormGroup label="Cloud Provider">
              <Input
                value={form.cloud_provider}
                onChange={set('cloud_provider')}
                placeholder="HCS/ AWS / GCP"
              />
            </FormGroup>

            <FormGroup label="Cloud Region">
              <Input
                value={form.cloud_region}
                onChange={set('cloud_region')}
                placeholder="e.g. Region 3"
              />
            </FormGroup>

            <FormGroup label="Cloud Account / Subscription ID">
              <Input
                value={form.cloud_account_id}
                onChange={set('cloud_account_id')}
              />
            </FormGroup>

            <FormGroup label="Resource Group / VPC">
              <Input
                value={form.resource_group}
                onChange={set('resource_group')}
              />
            </FormGroup>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Technical Specification                                          */}
        {/* ---------------------------------------------------------------- */}

        {activeTab === 'Spec' && (
          <div>
            {/* Server */}
            {form.asset_type === 'server' && (
              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="Server Role">
                  <Select
                    value={serverSpec.server_role}
                    onChange={setSpec(setServerSpec)('server_role')}
                  >
                    {SERVER_ROLE_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Server Type">
                  <Select
                    value={serverSpec.server_type}
                    onChange={setSpec(setServerSpec)('server_type')}
                  >
                    {SERVER_TYPE_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Solution / Application Hosted">
                  <Input
                    value={serverSpec.solution_name}
                    onChange={setSpec(setServerSpec)('solution_name')}
                    placeholder="e.g. DNS OSS ERP"
                  />
                </FormGroup>

                <FormGroup label="Cluster Config">
                  <Select
                    value={serverSpec.cluster_config}
                    onChange={setSpec(setServerSpec)('cluster_config')}
                  >
                    {CLUSTER_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="vCPU Count">
                  <Input
                    type="number"
                    value={serverSpec.vcpu_count}
                    onChange={setSpec(setServerSpec)('vcpu_count')}
                  />
                </FormGroup>

                <FormGroup label="RAM (GB)">
                  <Input
                    type="number"
                    value={serverSpec.ram_gb}
                    onChange={setSpec(setServerSpec)('ram_gb')}
                  />
                </FormGroup>

                <FormGroup label="System Disk (GB)">
                  <Input
                    type="number"
                    value={serverSpec.system_disk_gb}
                    onChange={setSpec(setServerSpec)('system_disk_gb')}
                  />
                </FormGroup>

                <FormGroup label="Cloud Instance Type">
                  <Input
                    value={serverSpec.cloud_instance_type}
                    onChange={setSpec(setServerSpec)('cloud_instance_type')}
                    placeholder="e.g. Standard_D8s_v5"
                  />
                </FormGroup>

                <FormGroup label="Operating System">
                  <Input
                    value={serverSpec.os}
                    onChange={setSpec(setServerSpec)('os')}
                    placeholder="e.g. Ubuntu 24.04 LTS"
                  />
                </FormGroup>

                <FormGroup label="Availability Zone">
                  <Input
                    value={serverSpec.availability_zone}
                    onChange={setSpec(setServerSpec)('availability_zone')}
                  />
                </FormGroup>

                <FormGroup label="Primary IP">
                  <Input
                    value={serverSpec.primary_ip}
                    onChange={setSpec(setServerSpec)('primary_ip')}
                    placeholder="10.0.0.10"
                  />
                </FormGroup>
              </div>
            )}

            {/* Storage */}
            {form.asset_type === 'storage' && (
              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="Storage Type">
                  <Select
                    value={storageSpec.storage_type}
                    onChange={setSpec(setStorageSpec)('storage_type')}
                  >
                    {STORAGE_TYPE_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Solution Name">
                  <Input
                    value={storageSpec.solution_name}
                    onChange={setSpec(setStorageSpec)('solution_name')}
                    placeholder="e.g. Primary SAN"
                  />
                </FormGroup>

                <FormGroup label="Raw Capacity (TB)">
                  <Input
                    type="number"
                    value={storageSpec.raw_capacity_tb}
                    onChange={setSpec(setStorageSpec)('raw_capacity_tb')}
                  />
                </FormGroup>

                <FormGroup label="Usable Capacity (TB)">
                  <Input
                    type="number"
                    value={storageSpec.usable_capacity_tb}
                    onChange={setSpec(setStorageSpec)('usable_capacity_tb')}
                  />
                </FormGroup>

                <FormGroup label="Media Type">
                  <Select
                    value={storageSpec.media_type}
                    onChange={setSpec(setStorageSpec)('media_type')}
                  >
                    {MEDIA_TYPE_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
               
                <FormGroup label="RAID Level">
                  <Select
                    value={storageSpec.raid_level}
                    onChange={setSpec(setStorageSpec)('raid_level')}
                  >
                    {RAID_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              {/*}
                <FormGroup label="Primary Protocol">
                  <Select
                    value={storageSpec.primary_protocol}
                    onChange={setSpec(setStorageSpec)('primary_protocol')}
                  >
                    {PROTOCOL_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {value.toUpperCase()}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              */}
              </div>
            )}

            {/* Network */}
            {form.asset_type === 'network' && (
              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="Device Type">
                  <Select
                    value={networkSpec.device_type}
                    onChange={setSpec(setNetworkSpec)('device_type')}
                  >
                    {DEVICE_TYPE_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Solution Name">
                  <Input
                    value={networkSpec.solution_name}
                    onChange={setSpec(setNetworkSpec)('solution_name')}
                    placeholder="e.g. Core Network Pair"
                  />
                </FormGroup>

                <FormGroup label="Redundancy Mode">
                  <Select
                    value={networkSpec.redundancy_mode}
                    onChange={setSpec(setNetworkSpec)('redundancy_mode')}
                  >
                    {REDUNDANCY_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Firmware Version">
                  <Input
                    value={networkSpec.firmware_version}
                    onChange={setSpec(setNetworkSpec)('firmware_version')}
                  />
                </FormGroup>

                <FormGroup label="10G Ports">
                  <Input
                    type="number"
                    value={networkSpec.ports_10g}
                    onChange={setSpec(setNetworkSpec)('ports_10g')}
                  />
                </FormGroup>

                <FormGroup label="100G Ports">
                  <Input
                    type="number"
                    value={networkSpec.ports_100g}
                    onChange={setSpec(setNetworkSpec)('ports_100g')}
                  />
                </FormGroup>

                <FormGroup label="Management IP">
                  <Input
                    value={networkSpec.management_ip}
                    onChange={setSpec(setNetworkSpec)('management_ip')}
                  />
                </FormGroup>
              </div>
            )}

           {/* Backup */}
        {form.asset_type === 'backup' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

             <FormGroup label="Backup Software">
              <Input
        value={backupSpec.backup_software}
        onChange={setSpec(setBackupSpec)('backup_software')}
        placeholder="e.g. NDP"
      />
    </FormGroup>

    <FormGroup label="Backup Type">
      <Select
        value={backupSpec.backup_type}
        onChange={setSpec(setBackupSpec)('backup_type')}
      >
        {BACKUP_TYPE_CHOICES.map(value => (
          <option key={value} value={value}>
            {label(value)}
          </option>
        ))}
      </Select>
    </FormGroup>
{/*
    <FormGroup label="Backup Rule">
      <Select
        value={backupSpec.backup_rule}
        onChange={setSpec(setBackupSpec)('backup_rule')}
      >
        {BACKUP_RULE_CHOICES.map(value => (
          <option key={value} value={value}>
            {value.replace(/_/g, '-')}
          </option>
        ))}
      </Select>
    </FormGroup>
*/}
    <FormGroup label="# Controllers">
      <Input
        type="number"
        min="0"
        value={backupSpec.controller_count}
        onChange={setSpec(setBackupSpec)('controller_count')}
        placeholder="e.g. 2"
      />
    </FormGroup>

    <FormGroup label="No. Disks">
      <Input
        type="number"
        min="0"
        value={backupSpec.disk_count}
        onChange={setSpec(setBackupSpec)('disk_count')}
        placeholder="e.g. 12"
      />
    </FormGroup>

    <FormGroup label="Raw Capacity (TB)">
      <Input
        type="number"
        min="0"
        step="0.01"
        value={backupSpec.raw_capacity_tb}
        onChange={setSpec(setBackupSpec)('raw_capacity_tb')}
        placeholder="e.g. 100"
      />
    </FormGroup>

    <FormGroup label="Usable Capacity (TB)">
      <Input
        type="number"
        min="0"
        step="0.01"
        value={backupSpec.usable_capacity_tb}
        onChange={setSpec(setBackupSpec)('usable_capacity_tb')}
        placeholder="e.g. 80"
      />
    </FormGroup>

    <FormGroup label="RAID">
      <Input
        value={backupSpec.raid_level}
        onChange={setSpec(setBackupSpec)('raid_level')}
        placeholder="e.g. RAID 6"
      />
    </FormGroup>

    <FormGroup label="Disk Type">
      <Select
        value={backupSpec.media_type}
        onChange={setSpec(setBackupSpec)('media_type')}
      >
        {MEDIA_TYPE_CHOICES.map(value => (
          <option key={value} value={value}>
            {label(value)}
          </option>
        ))}
      </Select>
    </FormGroup>

    <FormGroup label="Firmware / Storage OS">
      <Input
        value={backupSpec.firmware_os}
        onChange={setSpec(setBackupSpec)('firmware_os')}
        placeholder="e.g. Dell PowerProtect OS"
      />
    </FormGroup>
    {/*}
    <FormGroup label="Weekly Retention (weeks)">
      <Input
        type="number"
        min="0"
        value={backupSpec.weekly_retention_weeks}
        onChange={setSpec(setBackupSpec)('weekly_retention_weeks')}
      />
    </FormGroup>

    <FormGroup label="Monthly Retention (months)">
      <Input
        type="number"
        min="0"
        value={backupSpec.monthly_retention_months}
        onChange={setSpec(setBackupSpec)('monthly_retention_months')}
      />
    </FormGroup>

    <FormGroup label="RTO (minutes)">
      <Input
        type="number"
        min="0"
        value={backupSpec.rto_minutes}
        onChange={setSpec(setBackupSpec)('rto_minutes')}
      />
    </FormGroup>

    <FormGroup label="RPO (minutes)">
      <Input
        type="number"
        min="0"
        value={backupSpec.rpo_minutes}
        onChange={setSpec(setBackupSpec)('rpo_minutes')}
      />
    </FormGroup>

    <FormGroup label="Encryption">
      <Select
        value={backupSpec.encryption}
        onChange={setSpec(setBackupSpec)('encryption')}
      >
        {ENCRYPTION_CHOICES.map(value => (
          <option key={value} value={value}>
            {label(value)}
          </option>-
        ))}
      </Select>
    </FormGroup>
*/}
  </div>
)}            {/* Cloud Service */}
            {form.asset_type === 'cloud_service' && (
              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="Service Type">
                  <Select
                    value={cloudSpec.service_type}
                    onChange={setSpec(setCloudSpec)('service_type')}
                  >
                    {CLOUD_SERVICE_TYPE_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Service Name">
                  <Input
                    value={cloudSpec.service_name}
                    onChange={setSpec(setCloudSpec)('service_name')}
                    placeholder="e.g. Azure SQL Managed Instance"
                  />
                </FormGroup>

                <FormGroup label="Service Tier / SKU">
                  <Input
                    value={cloudSpec.service_tier}
                    onChange={setSpec(setCloudSpec)('service_tier')}
                    placeholder="e.g. General Purpose"
                  />
                </FormGroup>

                <FormGroup label="Billing Model">
                  <Select
                    value={cloudSpec.billing_model}
                    onChange={setSpec(setCloudSpec)('billing_model')}
                  >
                    {BILLING_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="HA Config">
                  <Select
                    value={cloudSpec.ha_config}
                    onChange={setSpec(setCloudSpec)('ha_config')}
                  >
                    {HA_CHOICES.map(value => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Monthly Cost (USD)">
                  <Input
                    type="number"
                    value={cloudSpec.monthly_cost_usd}
                    onChange={setSpec(setCloudSpec)('monthly_cost_usd')}
                  />
                </FormGroup>

                <FormGroup label="vCPU">
                  <Input
                    type="number"
                    value={cloudSpec.vcpu_count}
                    onChange={setSpec(setCloudSpec)('vcpu_count')}
                  />
                </FormGroup>

                <FormGroup label="RAM (GB)">
                  <Input
                    type="number"
                    value={cloudSpec.ram_gb}
                    onChange={setSpec(setCloudSpec)('ram_gb')}
                  />
                </FormGroup>

                <FormGroup label="Storage (GB)">
                  <Input
                    type="number"
                    value={cloudSpec.storage_gb}
                    onChange={setSpec(setCloudSpec)('storage_gb')}
                  />
                </FormGroup>
              </div>
            )}

            {/* Other asset types */}
            {!specForType[form.asset_type] && (
              <div className="text-text-3 text-sm py-8 text-center">
                No dedicated technical specification form for this
                asset type — use the Notes tab to capture details.
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Notes                                                            */}
        {/* ---------------------------------------------------------------- */}

        {activeTab === 'Notes' && (
          <FormGroup label="Notes">
            <Textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Additional specifications, identifiers, support information, or other asset details..."
              style={{ minHeight: 140 }}
            />
          </FormGroup>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Modal Actions                                                    */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border-2">
          <Button
            onClick={() => {
              setNewOpen(false)
              resetForm()
            }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            loading={creating}
            onClick={handleCreate}
          >
            Register Asset
          </Button>
        </div>
      </Modal>

      <Modal
  open={projectOpen}
  onClose={() => {
    if (creatingProject) return

    setProjectOpen(false)

    setNewProject({
      name: '',
      description: '',
    })
  }}
  title="+ Create Project"
  size="md"
>
  <FormGroup label="Project Name" required>
    <Input
      value={newProject.name}
      onChange={e =>
        setNewProject(current => ({
          ...current,
          name: e.target.value,
        }))
      }
      placeholder="e.g. Huawei Workspace"
      autoFocus
    />
  </FormGroup>

  <FormGroup label="Description">
    <Textarea
      value={newProject.description}
      onChange={e =>
        setNewProject(current => ({
          ...current,
          description: e.target.value,
        }))
      }
      placeholder="Describe the project..."
      style={{ minHeight: 100 }}
    />
  </FormGroup>

  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border-2">
    <Button
      onClick={() => {
        setProjectOpen(false)

        setNewProject({
          name: '',
          description: '',
        })
      }}
    >
      Cancel
    </Button>

    <Button
      variant="primary"
      loading={creatingProject}
      disabled={!newProject.name.trim()}
      onClick={handleCreateProject}
    >
      Create Project
    </Button>
  </div>
</Modal>


      {/* ------------------------------------------------------------------ */}
      {/* Import Modal                                                       */}
      {/* ------------------------------------------------------------------ */}

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)} onSuccess={function (): void {
          throw new Error('Function not implemented.')
        } } projectId={0} type={'assets'}      />
    </div>
  )
}
