import React from 'react'
import clsx from 'clsx'

/*
  ERPNext-style Button Component
  =================================
  Variants:
    - primary: brand blue solid
    - secondary: neutral gray subtle background + border
    - ghost: transparent until hover
    - danger: red emphasis for destructive actions
  Sizes:
    - sm (h-8 text-xs px-3)
    - md (h-9 text-sm px-4) [default]
    - lg (h-11 text-sm font-medium px-5)
  States:
    - disabled: reduced opacity, cursor-not-allowed, no hover ring
    - loading: spinner + aria-busy; keeps width stable
  Icon Support:
    - startIcon / endIcon props (ReactNode)
    - If only children is an icon and no text, consumers should use <IconButton /> for proper sizing
  Accessibility:
    - For IconButton must pass aria-label
    - Spinner has role="status" and visually-hidden label
*/

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  children?: React.ReactNode
}

export type ButtonProps = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'type'>

const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-md select-none whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500',
  secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-300 focus-visible:ring-primary-500',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-primary-500',
  danger: 'bg-danger-500 text-white shadow-sm hover:bg-danger-600 active:bg-danger-600 focus-visible:ring-danger-500',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}

const iconSpacing = 'gap-1.5'

const Spinner: React.FC<{size: ButtonSize}> = ({ size }) => {
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <span className={clsx('absolute left-2 inline-flex', dim)}>
      <svg className={clsx('animate-spin text-white/90', dim)} viewBox="0 0 24 24" role="status" aria-label="Loading">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="sr-only">Loading</span>
    </span>
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    startIcon,
    endIcon,
    fullWidth,
    type = 'button',
    className,
    children,
    ...rest
  }, ref
) {
  const isDisabled = disabled || loading
  const withIcons = startIcon || endIcon

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        withIcons && iconSpacing,
        fullWidth && 'w-full',
        loading && 'text-transparent', // keep layout but hide text under spinner overlay
        className
      )}
      {...rest}
    >
      {loading && <Spinner size={size} />}
      {!loading && startIcon && <span className={clsx('inline-flex', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')}>{startIcon}</span>}
      <span className="inline-flex items-center">{children}</span>
      {!loading && endIcon && <span className={clsx('inline-flex', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')}>{endIcon}</span>}
    </button>
  )
})

// IconButton – icon only variant (square). Consumers must provide aria-label.
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'startIcon' | 'endIcon' | 'fullWidth'> {
  label: string
  icon: React.ReactNode
  size?: ButtonSize
  variant?: ButtonVariant
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({
  label,
  icon,
  size = 'md',
  variant = 'secondary',
  loading = false,
  disabled = false,
  className,
  type = 'button',
  ...rest
}, ref) {
  const dimension = size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-9 w-9' : 'h-11 w-11'
  const iconDim = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-5 w-5'
  return (
    <button
      ref={ref}
      aria-label={label}
      type={type}
      disabled={disabled || loading}
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        dimension,
        'p-0',
        loading && 'text-transparent',
        className
      )}
      {...rest}
    >
      {loading && <Spinner size={size} />}
      {!loading && <span className={clsx('inline-flex items-center justify-center', iconDim)}>{icon}</span>}
    </button>
  )
})

/*
USAGE EXAMPLES (Documentation)
==============================

// Primary button
<Button onClick={save}>Save</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Ghost button with icon
<Button variant="ghost" startIcon={<PlusIcon className="h-4 w-4" />}>Add Row</Button>

// Danger destructive action
<Button variant="danger" onClick={deleteInvoice}>Delete</Button>

// Loading state
<Button loading>Submitting</Button>

// Disabled state
<Button disabled variant="secondary">Disabled</Button>

// Large size with trailing icon
<Button size="lg" endIcon={<ArrowRightIcon className="h-4 w-4" />}>Continue</Button>

// Full width
<Button fullWidth>Submit</Button>

// Icon only toolbar button
<IconButton label="Refresh" icon={<ArrowPathIcon className="h-5 w-5" />} />

// Icon button in danger variant
<IconButton label="Delete" variant="danger" icon={<TrashIcon className="h-5 w-5" />} />

// Submit button in a form
<form onSubmit={handleSubmit}>
  <Button type="submit" loading={isSaving}>Save</Button>
</form>
*/
