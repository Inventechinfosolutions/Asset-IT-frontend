import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 outline-none select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#0066cc] text-white hover:bg-[#0071e3] shadow-sm',
        secondary:
          'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] border border-[#e0e0e0]',
        outline:
          'border border-[#0066cc] text-[#0066cc] hover:bg-[#0066cc]/10',
        ghost: 'hover:bg-black/5 text-[#1d1d1f]',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
        pill: 'bg-[#0066cc] text-white hover:bg-[#0071e3] rounded-full px-5 py-2',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-lg',
        sm: 'h-8 px-3 text-xs rounded-md',
        lg: 'h-10 px-6 rounded-lg text-base',
        icon: 'size-9 rounded-lg',
        pill: 'h-9 px-5 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
