'use client'
import { useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { clsx } from 'clsx'
import type { ChatMessage } from '@/lib/hooks/useAIChat'

interface AIChatProps {
  messages:   ChatMessage[]
  loading:    boolean
  onSend:     (msg: string) => void
  placeholder?: string
  height?:    string
}

export function AIChat({ messages, loading, onSend, placeholder, height = 'max-h-72' }: AIChatProps) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const val = inputRef.current?.value.trim()
      if (val) { onSend(val); inputRef.current!.value = '' }
    }
  }

  const handleClick = () => {
    const val = inputRef.current?.value.trim()
    if (val) { onSend(val); inputRef.current!.value = '' }
  }

  return (
    <div className="flex flex-col bg-bg-3 border border-border-2 rounded-xl overflow-hidden">
      <div className={clsx('overflow-y-auto p-4 flex flex-col gap-3', height)}>
        {messages.map((msg, i) => (
          <div key={i} className={clsx('flex gap-2.5 items-start', msg.role === 'user' && 'flex-row-reverse')}>
            <div className={clsx(
              'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
              msg.role === 'assistant' ? 'bg-accent text-white' : 'bg-bg-4 text-text-2'
            )}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={clsx(
              'rounded-lg px-3 py-2 text-[13px] leading-relaxed max-w-[88%]',
              msg.role === 'assistant'
                ? 'bg-bg-4 border border-accent/10 text-text-1'
                : 'bg-bg-5 border border-border-2 text-text-1'
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-bg-4 border border-accent/10 rounded-lg px-3 py-2.5 flex gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-text-3 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border-1 px-3 py-2.5 flex gap-2">
        <input
          ref={inputRef}
          onKeyDown={handleKey}
          placeholder={placeholder || 'Ask your AI architect...'}
          className="flex-1 bg-bg-4 border border-border-2 rounded-lg px-3 py-2 text-sm text-text-1 outline-none focus:border-accent placeholder:text-text-3 font-sans"
        />
        <button
          onClick={handleClick}
          disabled={loading}
          className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white rounded-lg px-3 py-2 transition-colors"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
