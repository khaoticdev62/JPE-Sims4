'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import TitleBar from '@/components/layout/TitleBar'

const JpeManualView = dynamic(() => import('@/components/manual/JpeManualView').then(mod => mod.JpeManualView), {
  ssr: false
})

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
