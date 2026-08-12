'use client'
import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  open:       boolean
  onClose:    () => void
  title:      string
  children:   ReactNode
  size?:      'sm' | 'md' | 'lg' | 'xl'
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={clsx(
        'bg-bg-2 border border-border-3 rounded-xl p-6 w-full mx-4 max-h-[85vh] overflow-y-auto',
        'animate-in fade-in slide-in-from-bottom-4 duration-200',
        SIZES[size],
      )}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-syne font-bold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-3 hover:text-text-1 hover:bg-bg-3 rounded-md p-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
