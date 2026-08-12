import { clsx } from 'clsx'

type Variant = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan' | 'orange' | 'gray'

const VARIANTS: Record<Variant, string> = {
  blue:   'bg-accent/10 text-blue-400 border border-accent/20',
  green:  'bg-success/10 text-emerald-400 border border-success/20',
  amber:  'bg-warning/10 text-amber-400 border border-warning/20',
  red:    'bg-danger/10 text-red-400 border border-danger/20',
  purple: 'bg-accent-2/10 text-purple-400 border border-accent-2/20',
  cyan:   'bg-accent-3/10 text-cyan-400 border border-accent-3/20',
  orange: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  gray:   'bg-white/5 text-text-3 border border-white/10',
}

interface BadgeProps {
  variant?:  Variant
  children:  React.ReactNode
  className?: string
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap',
      VARIANTS[variant],
      className,
    )}>
      {children}
    </span>
  )
}

// Helpers to map domain values to variants
export function priorityVariant(p: string): Variant {
  return ({ critical: 'red', high: 'amber', medium: 'blue', low: 'gray' } as any)[p] || 'gray'
}
export function statusVariant(s: string): Variant {
  return ({
    approved: 'green', active: 'green', passed: 'green', healthy: 'green', mitigated: 'green',
    under_review: 'amber', in_progress: 'amber', monitoring: 'amber', maintenance: 'amber',
    draft: 'blue', not_started: 'blue', planning: 'blue',
    rejected: 'red', blocked: 'red', failed: 'red', expiring: 'red', open: 'red',
    deprecated: 'gray', closed: 'gray', disposed: 'gray',
    shortlisted: 'green', evaluating: 'amber', selected: 'cyan', eliminated: 'red',
    proposed: 'amber', accepted: 'green', superseded: 'gray',
  } as any)[s] || 'gray'
}
export function categoryVariant(c: string): Variant {
  return ({
    security: 'red', compliance: 'red',
    performance: 'amber', scalability: 'amber',
    integration: 'purple', data: 'purple',
    functional: 'blue', usability: 'blue',
    technical: 'cyan', non_functional: 'gray',
  } as any)[c] || 'blue'
}
