import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-blue-100 text-blue-800 border border-blue-200',
        secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
        success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        destructive: 'bg-rose-100 text-rose-800 border border-rose-200',
        warning: 'bg-amber-100 text-amber-800 border border-amber-200',
        info: 'bg-sky-100 text-sky-800 border border-sky-200',
        outline: 'text-foreground border border-input',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
