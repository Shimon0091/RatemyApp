import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-primary-100 text-primary-700 border-primary-200',
  secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
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
