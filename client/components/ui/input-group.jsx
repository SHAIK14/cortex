"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const InputGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="input-group"
      className={cn(
        "relative flex min-w-0 w-full flex-col gap-2 rounded-lg border border-input bg-background p-1 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring",
        className
      )}
      {...props}
    />
  )
})
InputGroup.displayName = "InputGroup"

const InputGroupInput = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-slot="input-group-control"
      className={cn(
        "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  )
})
InputGroupInput.displayName = "InputGroupInput"

const InputGroupAddon = React.forwardRef(({ className, align = "inline-start", ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="input-group-addon"
      className={cn(
        "flex items-center gap-1.5 px-2 text-muted-foreground",
        align === "inline-start" && "order-first",
        align === "inline-end" && "order-last",
        align === "block-start" && "order-first w-full",
        align === "block-end" && "order-last w-full pb-1 justify-end",
        className
      )}
      {...props}
    />
  )
})
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupButton = React.forwardRef(({ className, variant = "ghost", size = "xs", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("h-7 px-2 text-xs", className)}
      {...props}
    />
  )
})
InputGroupButton.displayName = "InputGroupButton"

export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton }
