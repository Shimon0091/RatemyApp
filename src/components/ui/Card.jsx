import { cn } from '../../utils/cn'

export function Card({
  children,
  className,
  hover = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-soft',
        'transition-all duration-300',
        hover && 'hover:shadow-medium hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}

export default Card
