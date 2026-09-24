'use client'
import { ImageOff } from 'lucide-react'
import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Hot-linked listing photo: shimmer while loading, fade in when ready, graceful fallback if the CDN fails.
 * The wrapper fills its parent, so give the parent a size/aspect ratio.
 */
export function SmartImg({ className, wrapperClassName, alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement> & { wrapperClassName?: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  return (
    <span className={cn('relative block h-full w-full overflow-hidden bg-surface-3', wrapperClassName)}>
      {state === 'loading' ? <span className="absolute inset-0 animate-[shimmer_1.6s_linear_infinite] bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.08),transparent)] bg-[length:200%_100%]" aria-hidden /> : null}
      {state === 'error' ? (
        <span className="absolute inset-0 grid place-items-center text-muted"><ImageOff className="size-7" /></span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...props}
          alt={alt}
          referrerPolicy="no-referrer"
          decoding="async"
          ref={(el) => { if (el?.complete && el.naturalWidth > 0 && state === 'loading') setState('ok') }}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className={cn('h-full w-full object-cover transition-opacity duration-500', state === 'ok' ? 'opacity-100' : 'opacity-0', className)}
        />
      )}
    </span>
  )
}
