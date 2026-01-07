import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const FieldGroup = ({ className, ...props }) => (
  <div className={cn("grid gap-4", className)} {...props} />
)

const Field = ({ className, ...props }) => (
  <div className={cn("grid gap-2", className)} {...props} />
)

const FieldLabel = ({ className, ...props }) => (
  <Label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
)

const FieldDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)

export { Field, FieldGroup, FieldLabel, FieldDescription }
