import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
  ghost: 'bg-transparent border-2 border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  outline: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'rounded-xl font-semibold transition-all duration-200',
        'shadow-soft hover:shadow-medium',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
