'use client'

import React from 'react'
import { JpeManualView } from '@/components/manual/JpeManualView'
import TitleBar from '@/components/layout/TitleBar'

export default function ManualPage() {
  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      <div className="bg-bg-secondary pr-4 shrink-0">
        <TitleBar />
      </div>
      <div className="flex-1 overflow-hidden relative">
        <JpeManualView />
      </div>
    </div>
  )
}
