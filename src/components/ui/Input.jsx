import { cn } from '../../utils/cn'
import { useId } from 'react'

export function Input({
  label,
  error,
  required,
  className,
  id,
  ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full px-4 py-2 border rounded-lg',
          'focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none',
          'transition-all duration-200',
          error ? 'border-red-500' : 'border-gray-300',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
