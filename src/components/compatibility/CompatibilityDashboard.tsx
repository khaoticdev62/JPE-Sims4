"use client";
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  FileSearch,
} from 'lucide-react';
import { ModCompatibilityService, type CompatibilityReport } from '@/services/ModCompatibilityService';

export const CompatibilityDashboard: React.FC = () => {
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameVersion, setGameVersion] = useState('Checking...');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      // 1. Detect local game version
      const version = await ModCompatibilityService.getGameVersion();
      setGameVersion(version);

      // 2. Fetch community mod status
      const compatibilityReport = await ModCompatibilityService.getCompatibilityReport();
      setReport(compatibilityReport);
    } catch (error) {
      console.error('[CompatibilityDashboard] Failed to fetch data.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const stats = report?.summary || { broken: 0, outdated: 0, fine: 0, total: 0, unknown: 0 };
  const items = report?.mods || [];
  const actions = report?.actions || [];

  return (
    <div className="flex flex-col h-full bg-jpe-surface text-jpe-text overflow-hidden border-l border-jpe-border">
      {/* Header */}
      <div className="p-4 border-b border-jpe-border bg-jpe-bg/50 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-jpe-primary" />
            <h1 className="text-sm font-bold tracking-tight uppercase">Compatibility Dashboard</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchStatus} 
            disabled={loading}
            className="h-8 text-[11px] gap-2 hover:bg-jpe-primary/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-jpe-bg/30 border-jpe-border p-3 flex flex-col gap-1 items-center">
            <span className="text-[10px] uppercase text-jpe-muted font-bold tracking-wider">Broken</span>
            <span className="text-xl font-bold text-destructive">{stats.broken}</span>
          </Card>
          <Card className="bg-jpe-bg/30 border-jpe-border p-3 flex flex-col gap-1 items-center">
            <span className="text-[10px] uppercase text-jpe-muted font-bold tracking-wider">Updates</span>
            <span className="text-xl font-bold text-yellow-500">{stats.outdated}</span>
          </Card>
          <Card className="bg-jpe-bg/30 border-jpe-border p-3 flex flex-col gap-1 items-center">
            <span className="text-[10px] uppercase text-jpe-muted font-bold tracking-wider">Compatible</span>
            <span className="text-xl font-bold text-emerald-500">{stats.fine}</span>
          </Card>
        </div>
      </div>

      {/* Local Info */}
      <div className="px-4 py-3 bg-jpe-bg/20 border-b border-jpe-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px]">
          <Activity className="w-3.5 h-3.5 text-jpe-muted" />
          <span className="text-jpe-muted">Game Version:</span>
          <span className="font-mono font-bold text-jpe-primary">{gameVersion}</span>
        </div>
        <Badge variant="outline" className="text-[9px] uppercase border-jpe-primary/20 text-jpe-primary">
          Live Data
        </Badge>
      </div>

      {/* Action Required List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-jpe-muted uppercase tracking-widest mb-2">
            <FileSearch className="w-3.5 h-3.5" />
            Action Required
          </div>

          {loading ? (
             <div className="py-12 flex flex-col items-center gap-2 opacity-50">
               <RefreshCw className="w-8 h-8 animate-spin text-jpe-primary" />
               <span className="text-xs italic">Scanning mod database...</span>
             </div>
          ) : actions.length > 0 ? (
            actions.map(action => (
              <Card key={action.modId} className={`bg-jpe-surface border-jpe-border p-4 hover:border-jpe-primary/40 transition-all border-l-4 shadow-lg ${
                action.severity === 'broken' 
                  ? 'border-l-destructive shadow-destructive/5' 
                  : action.severity === 'outdated'
                  ? 'border-l-yellow-500 shadow-yellow-500/5'
                  : 'border-l-jpe-primary shadow-jpe-primary/5'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">{action.modName}</h3>
                      <Badge variant={action.severity === 'broken' ? 'destructive' : 'secondary'} className="text-[9px] uppercase px-1.5 h-4">
                        {action.action}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-jpe-muted">{action.description}</p>
                  </div>
                  {action.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 shrink-0 rounded-full border-jpe-border hover:bg-jpe-primary hover:text-white"
                      onClick={() => window.open(action.link, '_blank')}
                      aria-label={`Open ${action.modName} link`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="py-8 text-center text-jpe-muted text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              No action required. All installed mods are compatible.
            </div>
          )}

          {/* Fully Compatible Section */}
          <div className="pt-8 opacity-50">
            <div className="flex items-center gap-2 text-[10px] font-bold text-jpe-muted uppercase tracking-widest mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Compatible
            </div>
            {items.filter(i => i.status === 'Fine').map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-jpe-border/30 last:border-0">
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{item.name}</span>
                  <span className="text-[10px] text-jpe-muted">{item.creator} ({item.version})</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
