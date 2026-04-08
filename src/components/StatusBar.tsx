"use client"

import * as React from "react"
import {
  CheckCircle2,
  Terminal,
  Cpu,
  Bell,
} from "lucide-react"

export function StatusBar() {
  return (
    <footer className="h-6 flex items-center justify-between px-3 bg-jpe-primary text-[10px] text-white font-medium select-none">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-white/20 px-2 h-full">
          <Terminal className="w-3 h-3" />
          READY
        </div>
        <div className="flex items-center gap-1 opacity-90">
          <CheckCircle2 className="w-3 h-3" />
          Synced to Cloud
        </div>
        <div className="flex items-center gap-1 opacity-90">
          <Cpu className="w-3 h-3" />
          Engine: v1.0.0 Stable
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 opacity-90">
          Ln 14, Col 21
        </div>
        <div className="flex items-center gap-1 opacity-90">
          UTF-8
        </div>
        <div className="flex items-center gap-1 opacity-90">
          JPE Syntax
        </div>
        <div className="flex items-center gap-1 bg-white/20 px-2 h-full">
          <Bell className="w-3 h-3" />
        </div>
      </div>
    </footer>
  )
}
