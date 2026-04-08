"use client";

import { useState, useEffect } from 'react'
import { useBuildStore } from '@/stores/useBuildStore'
import { useEditorStore } from '@/stores/useEditorStore'
import BuildProgress from './BuildProgress'
import BuildResults from './BuildResults'
import BuildErrorList from './BuildErrorList'
import BuildLog from './BuildLog'

/**
 * Main build panel showing progress, results, errors, and detailed log
 */
export default function BuildPanel() {
  const {
    buildStatus,
    progress,
    currentFile,
    results,
    errors,
    log,
  } = useBuildStore()

  const { openTab } = useEditorStore()
  const [elapsedTime, setElapsedTime] = useState(0)

  // Update elapsed time during build
  useEffect(() => {
    if (buildStatus !== 'running') return

    const startTime = Date.now()
    // Initial reset handled by unmount or state init

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 100)

    return () => clearInterval(interval)
  }, [buildStatus])

  // Handle navigation to error in editor
  const handleNavigateToError = (fileId: string, _line: number) => {
    openTab({
      id: `tab-${fileId}`,
      fileId,
      name: fileId,
      isDirty: false,
    })
  }

  if (buildStatus === 'idle') {
    return (
      <div className="p-4 text-center text-text-secondary text-sm">
        <div>No build in progress</div>
        <div className="text-xs mt-2">Use Project → Build Project to start</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Progress Section */}
      {buildStatus === 'running' && (
        <BuildProgress
          progress={progress}
          currentFile={currentFile}
          buildTime={elapsedTime}
        />
      )}

      {/* Results Section */}
      {buildStatus === 'completed' && results && (
        <>
          <BuildResults results={results} />
          <BuildErrorList errors={errors} onNavigateToError={handleNavigateToError} />
        </>
      )}

      {/* Failed Section */}
      {buildStatus === 'failed' && (
        <div className="p-4 bg-state-error/10 border border-state-error rounded-lg">
          <h3 className="text-sm font-semibold text-state-error">Build Failed</h3>
          <p className="text-xs text-text-secondary mt-2">
            See the build log below for details.
          </p>
        </div>
      )}

      {/* Build Log */}
      {(buildStatus === 'running' || buildStatus === 'failed' || (buildStatus === 'completed' && log.length > 0)) && (
        <BuildLog log={log} />
      )}
    </div>
  )
}
