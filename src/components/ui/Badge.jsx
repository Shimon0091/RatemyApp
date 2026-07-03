import { cn } from '../../utils/cn'

// warm-trust system: two brand colors + neutrals (kept API-compatible)
const variants = {
  primary: 'bg-petrol-50 text-petrol border-petrol/15',
  secondary: 'bg-sand text-ink border-black/5',
  success: 'bg-petrol-50 text-petrol border-petrol/15',
  danger: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-600 border-amber/20',
  info: 'bg-petrol-50 text-petrol border-petrol/15',
  neutral: 'bg-canvas text-ink border-black/5',
}

export function Badge({
  children,
  variant = 'neutral',
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
