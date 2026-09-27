import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'success'
  | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variants: Record<ButtonVariant, string> = {
  default:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500',
  outline:
    'border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500',
  ghost:
    'hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 rounded-md text-sm',
  md: 'h-10 px-4 rounded-lg text-sm',
  lg: 'h-12 px-5 rounded-xl text-base',
  icon: 'h-9 w-9 rounded-full',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
      variants[variant],
      sizes[size],
      className
    )
    if (asChild) {
      return <Slot ref={ref} className={classes} {...props} />
    }
    return (
      <button ref={ref} className={classes} {...props} />
    )
  }
)
Button.displayName = 'Button'
