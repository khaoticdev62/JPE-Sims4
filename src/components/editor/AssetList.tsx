"use client";

import React, { useMemo, useState, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import { AutoSizer } from 'react-virtualized-auto-sizer'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useProjectStore } from '@/stores/useProjectStore'
import { PackageService } from '@/services/PackageService'
import type { VirtualFile } from '@/services/PackageService'
import { Search, Filter, HardDrive, FileCode, Type, Info, Download, DownloadCloud } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AssetListProps {
  packagePath: string;
  onOpenResource: (file: VirtualFile) => void;
  onExtractResource?: (resource: VirtualFile) => void;
  onExtractAll?: () => void;
}

export function AssetList({ packagePath, onOpenResource, onExtractResource, onExtractAll }: AssetListProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const { activePackageData } = useProjectStore()
  const [resourceNames, setResourceNames] = useState<Record<string, string>>({})

  const virtualFiles = useMemo(() => {
    return PackageService.getVirtualFiles(packagePath)
  }, [packagePath, activePackageData])

  const filteredAssets = useMemo(() => {
    return virtualFiles.filter(asset => {
      const name = resourceNames[asset.id] || ''
      const matchesSearch = asset.id.toLowerCase().includes(search.toLowerCase()) || 
                           asset.name.toLowerCase().includes(search.toLowerCase()) ||
                           name.toLowerCase().includes(search.toLowerCase())
      const matchesType = !typeFilter || asset.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [virtualFiles, search, typeFilter, resourceNames])

  // Step 2: Implement Background Name Harvesting (Batching)
  const { activePackageBuffer } = useProjectStore()
  
  useEffect(() => {
    if (!activePackageBuffer || virtualFiles.length === 0) return

    let isMounted = true
    const harvestNames = async () => {
      const names: Record<string, string> = { ...resourceNames }
      
      // Process in batches of 50 to keep UI responsive
      const batchSize = 50
      for (let i = 0; i < virtualFiles.length; i += batchSize) {
        if (!isMounted) break
        
        const batch = virtualFiles.slice(i, i + batchSize)
        let changed = false
        
        await Promise.all(batch.map(async (asset) => {
          if (resourceNames[asset.id] || asset.type !== 'xml') return
          
          const name = await PackageService.getResourceName(asset.resource, activePackageBuffer)
          if (name) {
            names[asset.id] = name
            changed = true
          }
        }))
        
        if (changed && isMounted) {
          setResourceNames({ ...names })
          // Yield to UI thread
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }
    }
    
    harvestNames()
    return () => { isMounted = false }
  }, [virtualFiles, activePackageBuffer])

  // Virtualized Row Renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const asset = filteredAssets[index]
    if (!asset) return null

    return (
      <div style={style} className="border-b border-slate-800/50 overflow-hidden">
        <div 
          className="flex items-center h-full px-6 group hover:bg-indigo-500/5 transition-colors cursor-pointer"
          onClick={() => onOpenResource(asset)}
        >
          <div className="w-[100px] shrink-0">
            <Badge 
              variant="outline" 
              className={`
                ${asset.type === 'xml' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : ''}
                ${asset.type === 'stbl' ? 'border-sky-500/20 text-sky-500 bg-sky-500/5' : ''}
                ${asset.type === 'image' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : ''}
                ${asset.type === 'binary' ? 'border-slate-500/20 text-slate-400 bg-slate-500/5' : ''}
                px-2 py-0 h-5 text-[10px] font-black uppercase
              `}
            >
              {asset.type}
            </Badge>
          </div>
          
          <div className="flex-1 flex flex-col justify-center min-w-0 pr-4">
            <span className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
              {resourceNames[asset.id] || asset.name}
            </span>
            <span className="text-[10px] text-slate-500 font-mono truncate">
              {asset.id}
            </span>
          </div>

          <div className="w-[120px] shrink-0 text-slate-400 text-sm font-mono tracking-tight">
            0x{asset.resource.group.toString(16).toUpperCase()}
          </div>

          <div className="w-[140px] shrink-0 text-slate-200 text-sm font-mono font-semibold">
            0x{asset.resource.instance.toString(16).toUpperCase()}
          </div>

          <div className="w-[100px] shrink-0 text-right text-xs text-slate-400 tabular-nums">
            {(asset.resource.size / 1024).toFixed(1)} KB
            {asset.resource.isCompressed && (
              <div className="text-indigo-400/60 text-[9px] font-bold uppercase tracking-tighter">Compressed</div>
            )}
          </div>

          {/* Extract button (visible on hover) */}
          {onExtractResource && (
            <button
              className="w-[36px] shrink-0 flex items-center justify-center text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
              onClick={(e) => {
                e.stopPropagation()
                onExtractResource(asset)
              }}
              title="Extract resource"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="flex flex-col h-full bg-slate-900 border-slate-800 shadow-2xl rounded-none overflow-hidden">
      {/* Header / Controls */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              Package Asset List
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold">
                {filteredAssets.length.toLocaleString()} Assets
              </Badge>
            </h2>
            <p className="text-xs text-slate-400 font-mono truncate max-w-sm">
              {packagePath.split(/[/\\]/).pop()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search by ID or Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm h-9"
            />
          </div>
          
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            <Button 
               variant={typeFilter === null ? 'secondary' : 'ghost'} 
               size="sm" 
               onClick={() => setTypeFilter(null)}
               className="h-7 text-xs font-medium"
            >
              All
            </Button>
            <Button 
               variant={typeFilter === 'xml' ? 'secondary' : 'ghost'} 
               size="sm" 
               onClick={() => setTypeFilter('xml')}
               className="h-7 text-xs font-medium flex items-center gap-1"
            >
              <FileCode className="w-3 h-3" />
              Tuning
            </Button>
            <Button 
               variant={typeFilter === 'stbl' ? 'secondary' : 'ghost'} 
               size="sm" 
               onClick={() => setTypeFilter('stbl')}
               className="h-7 text-xs font-medium flex items-center gap-1"
            >
              <Type className="w-3 h-3" />
              Strings
            </Button>
            <Button
               variant={typeFilter === 'image' ? 'secondary' : 'ghost'}
               size="sm"
               onClick={() => setTypeFilter('image')}
               className="h-7 text-xs font-medium flex items-center gap-1"
            >
              <FileCode className="w-3 h-3" />
              Images
            </Button>
          </div>

          {/* Extract All button */}
          {onExtractAll && filteredAssets.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onExtractAll}
              className="h-7 text-xs font-medium flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              Extract All ({filteredAssets.length})
            </Button>
          )}
        </div>
      </div>

      {/* Asset Table Header */}
      <div className="flex items-center bg-slate-950/50 backdrop-blur-sm border-b border-slate-800 px-6 py-2">
        <div className="w-[100px] text-slate-400 uppercase text-[9px] font-black tracking-widest">Type</div>
        <div className="flex-1 text-slate-400 uppercase text-[9px] font-black tracking-widest">Resource Identifier / Name</div>
        <div className="w-[120px] text-slate-400 uppercase text-[9px] font-black tracking-widest">Group</div>
        <div className="w-[140px] text-slate-400 uppercase text-[9px] font-black tracking-widest">Instance</div>
        <div className="w-[100px] text-right text-slate-400 uppercase text-[9px] font-black tracking-widest">Size</div>
      </div>

      {/* Virtualized Table Body */}
      <div className="flex-1 bg-slate-950/20">
        {filteredAssets.length > 0 ? (
          <div className="w-full h-full"> {/* Container for AutoSizer */}
            {/* @ts-expect-error - AutoSizer types are conflicting with current React version but runtime is correct */}
            <AutoSizer>
              {({ height, width }: any) => (
                <List
                  height={height || 500}
                  itemCount={filteredAssets.length}
                  itemSize={56}
                  width={width || 800}
                  className="custom-scrollbar"
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <Filter className="w-12 h-12 mb-4 text-slate-600" />
            <p className="text-slate-400 text-sm font-medium">No assets found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-1 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            Performance Mode: WebGL Virtualization Active
          </span>
        </div>
        <div className="font-mono">
          {filteredAssets.length} of {virtualFiles.length} items
        </div>
      </div>
    </Card>
  )
}
