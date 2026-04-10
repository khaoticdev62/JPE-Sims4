'use client'

import dynamic from 'next/dynamic'

const EditorLayout = dynamic(() => import('@/components/layout/EditorLayout'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0a0c10]">
      <div className="text-cyan font-black tracking-widest animate-pulse uppercase">
        Initializing Studio...
      </div>
    </div>
  )
})

export default function StudioPage() {
  return <EditorLayout />
}
