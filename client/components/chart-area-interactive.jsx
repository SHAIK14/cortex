"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Mock data for demonstration
const chartData = [
  { date: "2024-04-01", memories: 22, context_hits: 15 },
  { date: "2024-04-02", memories: 25, context_hits: 18 },
  { date: "2024-04-03", memories: 28, context_hits: 12 },
  { date: "2024-04-04", memories: 32, context_hits: 26 },
  { date: "2024-04-05", memories: 35, context_hits: 29 },
  { date: "2024-04-06", memories: 38, context_hits: 34 },
  { date: "2024-04-07", memories: 42, context_hits: 18 },
  { date: "2024-04-10", memories: 50, context_hits: 40 },
  { date: "2024-05-01", memories: 85, context_hits: 22 },
  { date: "2024-06-01", memories: 120, context_hits: 41 },
  { date: "2024-06-30", memories: 154, context_hits: 38 },
]

const chartConfig = {
  memories: {
    label: "Total Memories",
    theme: {
      light: "hsl(250 100% 60%)", // Premium Indigo for light mode
      dark: "hsl(50 100% 55%)",  // Vibrant Yellow for dark mode
    },
  },
  context_hits: {
    label: "Context Hits",
    theme: {
      light: "hsl(250 100% 60% / 0.4)",
      dark: "hsl(50 100% 55% / 0.2)",
    },
  },
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/50 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Neural Growth</CardTitle>
          <CardDescription className="text-xs">
            Memory accumulation and retrieval efficiency.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden sm:flex scale-90 origin-right"
          >
            <ToggleGroupItem value="90d" className="text-xs">90D</ToggleGroupItem>
            <ToggleGroupItem value="30d" className="text-xs">30D</ToggleGroupItem>
            <ToggleGroupItem value="7d" className="text-xs">7D</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[80px] sm:hidden h-8 text-xs" size="sm">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d" className="text-xs">90D</SelectItem>
              <SelectItem value="30d" className="text-xs">30D</SelectItem>
              <SelectItem value="7d" className="text-xs">7D</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-0 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillMemories" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-memories)"
                  stopOpacity={0.15}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-memories)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillHits" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-context_hits)"
                  stopOpacity={0.05}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-context_hits)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-zinc-100 dark:stroke-zinc-900" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              className="text-[10px] text-zinc-400"
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="context_hits"
              type="monotone"
              fill="url(#fillHits)"
              stroke="var(--color-context_hits)"
              strokeWidth={1}
              stackId="a"
            />
            <Area
              dataKey="memories"
              type="monotone"
              fill="url(#fillMemories)"
              stroke="var(--color-memories)"
              strokeWidth={1.5}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
