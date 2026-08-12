import { clsx } from 'clsx'
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base = 'w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-2.5 text-sm text-text-1 font-sans outline-none transition-colors focus:border-accent placeholder:text-text-3'

interface LabelProps { label: string; required?: boolean }

export function FormGroup({ label, required, children }: LabelProps & { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-text-2 mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(base, className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(base, className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(base, 'resize-y min-h-[80px]', className)} {...props} />
}

interface ChipGroupProps {
  options:  { label: string; value: string }[]
  value:    string
  onChange: (v: string) => void
}

export function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
            value === o.value
              ? 'bg-accent border-accent text-white'
              : 'border-border-2 text-text-2 hover:border-border-3 hover:text-text-1'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
