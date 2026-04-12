"use client";

import React from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
} from "recharts";
import { T } from "../robust/jpe-theme";
import { SafeChartContainer } from "../SafeChartContainer";

export function CoreLoadChart({ data }: { data: any[] }) {
  return (
    <div className="h-[140px] w-full pt-2">
      <SafeChartContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={T.cyan} stopOpacity={0.2} />
              <stop offset="95%" stopColor={T.cyan} stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <XAxis dataKey="t" hide />
          <YAxis hide domain={[0, 100]} />
          <Area 
            type="monotone" 
            dataKey="cpu" 
            stroke={T.cyan} 
            fill="url(#cpuGrad)" 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false} 
            filter="url(#glow)"
          />
        </AreaChart>
      </SafeChartContainer>
    </div>
  );
}

export function RegionalDistChart({ data }: { data: any[] }) {
  return (
    <div className="h-[140px] w-full pt-2">
      <SafeChartContainer>
        <BarChart data={data}>
          <XAxis 
            dataKey="locale" 
            tick={{ fontSize: 8, fill: T.textMuted }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis hide domain={[0, 100]} />
          <Bar 
            dataKey="coverage" 
            radius={[3, 3, 0, 0]} 
            fill={T.violet} 
            isAnimationActive={false} 
            minPointSize={0} 
          />
        </BarChart>
      </SafeChartContainer>
    </div>
  );
}

export function TelemetryMiniChart({ data }: { data: any[] }) {
  return (
    <div className="h-24 w-full bg-black/20 rounded-xl border border-white/5 p-2">
      <SafeChartContainer>
        <AreaChart data={data}>
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke={T.cyan} 
            fill={`${T.cyan}20`} 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false} 
          />
          <XAxis hide />
          <YAxis hide domain={[0, 60]} />
        </AreaChart>
      </SafeChartContainer>
    </div>
  );
}
