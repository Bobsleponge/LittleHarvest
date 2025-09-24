import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
}

export function LoadingButton({ loading, children, className }: LoadingButtonProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </div>
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2 mb-2" />
      <div className="h-4 bg-muted rounded w-5/6" />
    </div>
  )
}

interface LoadingGridProps {
  count?: number
  className?: string
}

export function LoadingGrid({ count = 6, className }: LoadingGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-48 bg-muted rounded-md mb-4" />
          <div className="h-6 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-full mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-muted rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingPageProps {
  title?: string
  description?: string
}

export function LoadingPage({ title = 'Loading...', description }: LoadingPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-1/4" />
          {description && <div className="h-4 bg-muted rounded w-1/2" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-muted rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
