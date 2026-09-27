import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { LabelHTMLAttributes } from 'react'

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-sm font-medium text-slate-700 dark:text-slate-300',
        className
      )}
      {...props}
    />
  )
)
Label.displayName = 'Label'
