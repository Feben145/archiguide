// ── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'admin'
  | 'architect'
  | 'viewer'

export interface User {
  id: number

  username: string
  email: string

  first_name: string
  last_name: string

  role: UserRole

  job_title: string
  phone: string
  avatar_initials: string

  organization: number
  organization_name: string

  division: number | null
  division_name: string | null

  department: number | null
  department_name: string | null

  section: number | null
  section_name: string | null

  is_active: boolean

  created_at: string
  updated_at: string
}


// ── Assets ───────────────────────────────────────────────────────────────────

export interface Asset {
  id: string
  asset_code: string

  name: string

  project: number | null
  project_name: string

  quantity: number

  //asset_type: AssetType
  deployment_model: string
  environment: string
  data_tier: string
  //status: ssetStatus
  tags: string[]

  site_name: string
  location: string
  rack_position: string

  cloud_provider: string
  cloud_region: string
  cloud_account_id: string
  resource_group: string

  notes: string

  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  name: string
  description: string
  organization: number
  organization_name: string
  member_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}


export interface ProjectMembership {
  id: number
  project: number
  project_name: string

  user: number
  username: string
  user_name: string

  is_active: boolean
  joined_at: string
}

// ── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count:    number
  next:     string | null
  previous: string | null
  results:  T[]
}
