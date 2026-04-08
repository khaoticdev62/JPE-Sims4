import React, { useMemo } from 'react'
import { useTelemetryStore } from '@/stores/useTelemetryStore'
import { Activity, Box, Users, MapPin } from 'lucide-react'
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

/**
 * Story 4.2: Quantum Mission Control Dashboard
 * High-fidelity visualization for live engine state.
 */
export function TelemetryDashboard() {
  const { snap, history, isConnected } = useTelemetryStore()

  const chartData = useMemo(() => {
    return history.map(h => ({
      time: new Date(h.timestamp).toLocaleTimeString(),
      fps: h.fps,
      scriptTime: h.scriptExecutionTime * 1000 // Convert to microseconds for better scale
    }))
  }, [history])

  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center bg-[#070810]/40 rounded-2xl border border-white/5 border-dashed">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto animate-pulse">
            <Activity className="w-6 h-6 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Engine Disconnected</h4>
            <p className="text-[10px] text-slate-600 uppercase font-bold">Awaiting Spectral Sync Bridge Ignition</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full grid grid-cols-12 gap-4 animate-in fade-in zoom-in-95 duration-500">
      {/* Real-time Performance Metrics */}
      <div className="col-span-8 bg-[#0a0c10]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col group hover:border-[#10b981]/30 transition-all shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Quantum Engine Telemetry</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Live Industrial Sync @ 250ms</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
             <div className="space-y-0.5">
               <span className="text-[9px] font-black text-slate-500 block uppercase">Global FPS</span>
               <span className="text-xl font-black text-white font-mono">{snap?.fps.toFixed(1)}</span>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div className="space-y-0.5">
               <span className="text-[9px] font-black text-slate-500 block uppercase">Script Latency</span>
               <span className="text-xl font-black text-emerald-400 font-mono">{(snap?.scriptExecutionTime || 0).toFixed(4)}ms</span>
             </div>
          </div>
        </div>

        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorFps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0c10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#10b981', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
              />
              <Area 
                type="monotone" 
                dataKey="fps" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorFps)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engine Status Grid */}
      <div className="col-span-4 space-y-4">
        <StatusCard 
          icon={<Box className="w-3.5 h-3.5" />} 
          label="Tuning Count" 
          value={snap?.loadedTuningCount.toLocaleString() || '--'} 
          subValue="Active Industrial Overrides"
        />
        <StatusCard 
          icon={<MapPin className="w-3.5 h-3.5" />} 
          label="Active Lot" 
          value={snap?.activeLot || '--'} 
          subValue="Current Spatial Focus"
        />
        <StatusCard 
          icon={<Users className="w-3.5 h-3.5" />} 
          label="Sim Population" 
          value={snap?.simCount || '--'} 
          subValue="Engine Instance Load"
        />
      </div>
    </div>
  )
}

function StatusCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue: string }) {
  return (
    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all group">
      <div className="flex items-center gap-3 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div className="space-y-1">
        <div className="text-lg font-black text-white truncate font-mono">{value}</div>
        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{subValue}</div>
      </div>
    </div>
  )
}
