
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const aValue = value || props.defaultValue || []
  const values = Array.isArray(aValue) ? aValue : [aValue]

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
        {values.length > 1 ? (
          <>
            <SliderPrimitive.Range className="absolute h-full" style={{ left: '0%', right: `${100 - values[0]}%`, backgroundColor: 'hsl(var(--chart-1))' }} />
            <SliderPrimitive.Range className="absolute h-full" style={{ left: `${values[0]}%`, right: `${100 - values[1]}%`, backgroundColor: 'hsl(var(--chart-2))' }} />
            <SliderPrimitive.Range className="absolute h-full" style={{ left: `${values[1]}%`, right: '0%', backgroundColor: 'hsl(var(--chart-3))' }} />
          </>
        ) : (
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        )}
      </SliderPrimitive.Track>
      {values.map((v, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
