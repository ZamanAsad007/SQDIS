import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'
import { ImageOff } from 'lucide-react'

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt?: string
  fallbackSrc?: string
  placeholder?: React.ReactNode
}

export const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(
  ({ src, alt = '', fallbackSrc, placeholder, className, ...props }, ref) => {
    return (
      <LazyImageContent
        key={src}
        ref={ref}
        src={src}
        alt={alt}
        fallbackSrc={fallbackSrc}
        placeholder={placeholder}
        className={className}
        {...props}
      />
    )
  }
)

const LazyImageContent = React.forwardRef<HTMLImageElement, LazyImageProps>(
  ({ src, alt = '', fallbackSrc, placeholder, className, ...props }, ref) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
    const [currentSrc, setCurrentSrc] = useState<string>(src)

    const handleError = () => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc)
      } else {
        setStatus('error')
      }
    }

    return (
      <div className={cn('relative overflow-hidden inline-block', className)}>
        {status === 'loading' && (
          placeholder || <Skeleton className="absolute inset-0 h-full w-full rounded-inherit" />
        )}

        {status === 'error' ? (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 p-4 text-xs">
            <ImageOff className="h-5 w-5" />
          </div>
        ) : (
          <img
            ref={ref}
            src={currentSrc}
            alt={alt}
            onLoad={() => setStatus('loaded')}
            onError={handleError}
            className={cn(
              'h-full w-full object-cover transition-opacity duration-300',
              status === 'loaded' ? 'opacity-100' : 'opacity-0'
            )}
            {...props}
          />
        )}
      </div>
    )
  }
)

LazyImageContent.displayName = 'LazyImageContent'
LazyImage.displayName = 'LazyImage'
