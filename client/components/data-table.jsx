"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const mockLogs = [
  { id: 1, action: "EXTRACT", type: "Identity", content: "User prefers dark mode interfaces.", date: "2 mins ago" },
  { id: 2, action: "UPDATE", type: "Fact", content: "Updated project location to 'San Francisco'.", date: "15 mins ago" },
  { id: 3, action: "SEARCH", type: "Query", content: "What are the core features of Cortex?", date: "1 hour ago" },
  { id: 4, action: "EXTRACT", type: "Event", content: "Started building the frontend redesign.", date: "4 hours ago" },
]

export function DataTable() {
  return (
    <div className="px-4 lg:px-6 py-6">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-900">
           <h3 className="text-sm font-bold tracking-tight">Neural Transaction Log</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-transparent border-zinc-100 dark:border-zinc-900">
                <TableHead className="w-[100px] text-[10px] font-bold text-zinc-500 py-3 uppercase tracking-wider">Protocol</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Class</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Payload</TableHead>
                <TableHead className="text-right text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors border-zinc-100 dark:border-zinc-900">
                  <TableCell className="py-3">
                    <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] font-medium text-zinc-500">{log.type}</TableCell>
                  <TableCell className="text-[11px] text-zinc-700 dark:text-zinc-300 max-w-sm truncate">{log.content}</TableCell>
                  <TableCell className="text-right text-[10px] text-zinc-400 font-medium">{log.date.toUpperCase()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
