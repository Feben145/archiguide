import { clsx } from 'clsx'

interface CardProps {
  children:   React.ReactNode
  className?: string
  onClick?:   () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-bg-2 border border-border-2 rounded-xl p-5',
        onClick && 'cursor-pointer hover:border-border-3 transition-colors',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardSm({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-bg-3 border border-border-1 rounded-lg p-4',
        onClick && 'cursor-pointer hover:border-border-2 transition-colors',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  label:      string
  value:      React.ReactNode
  sub?:       React.ReactNode
  className?: string
}

export function StatCard({ label, value, sub, className }: StatCardProps) {
  return (
    <div className={clsx('bg-bg-3 border border-border-1 rounded-lg p-4', className)}>
      <div className="text-[10px] font-semibold text-text-4 uppercase tracking-widest">{label}</div>
      <div className="font-syne text-2xl font-bold mt-1 leading-none">{value}</div>
      {sub && <div className="text-[11px] text-text-3 mt-1">{sub}</div>}
    </div>
  )
}
