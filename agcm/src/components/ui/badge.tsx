import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Workflow badges
        brouillon: "border border-gray-200 bg-gray-100 text-gray-800",
        soumis: "border border-yellow-200 bg-yellow-100 text-yellow-800",
        approuve: "border border-green-200 bg-green-100 text-green-800",
        rejete: "border border-red-200 bg-red-100 text-red-800",
        publie: "border border-blue-200 bg-blue-100 text-blue-800",
        archive: "border border-gray-200 bg-gray-200 text-gray-600",
        // Statuts
        success: "border border-green-200 bg-green-100 text-green-800",
        error: "border border-red-200 bg-red-100 text-red-800",
        warning: "border border-yellow-200 bg-yellow-100 text-yellow-800",
        info: "border border-blue-200 bg-blue-100 text-blue-800",
        // Rôles
        superAdmin: "border border-purple-200 bg-purple-100 text-purple-800",
        admin: "border border-blue-200 bg-blue-100 text-blue-800",
        member: "border border-gray-200 bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }


