import * as React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-white shadow hover:bg-primary-600": variant === 'default',
            "border border-gray-200 bg-white shadow-sm hover:bg-gray-100": variant === 'outline',
            "hover:bg-gray-100 hover:text-gray-900": variant === 'ghost',
            "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === 'secondary',
            "h-12 px-6 py-2": size === 'default',
            "h-9 rounded-md px-3": size === 'sm',
            "h-14 rounded-2xl px-8 text-base": size === 'lg',
            "h-12 w-12": size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
