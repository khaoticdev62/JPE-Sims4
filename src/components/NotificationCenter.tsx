"use client";

/* JPE STUDIO — Notification Center
   Slide-out panel showing recent activity, build events, and system alerts. */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell, X, CheckCircle2, AlertTriangle, XCircle, Info,
  Rocket, Shield, Languages, Sparkles, GitMerge, Package,
  Bug, Download, Clock, Trash2, BellOff,
  type LucideIcon,
} from "lucide-react";
import { T } from "./robust/jpe-theme";
import { Eyebrow, Badge, IconBtn } from "./robust/jpe-shared";
import { motion, AnimatePresence } from "./jpe-motion";

export type NotifLevel = "info" | "success" | "warning" | "error";
export type NotifCategory = "build" | "conflict" | "translation" | "plugin" | "system" | "ai";

export interface JpeNotification {
  id: string;
  level: NotifLevel;
  category: NotifCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: LucideIcon;
  iconColor: string;
}

const levelStyle: Record<NotifLevel, { color: string; bg: string; Icon: LucideIcon }> = {
  info:    { color: T.cyan,    bg: T.cyanDim,    Icon: Info },
  success: { color: T.emerald, bg: T.emeraldDim, Icon: CheckCircle2 },
  warning: { color: T.amber,   bg: T.amberDim,   Icon: AlertTriangle },
  error:   { color: T.rose,    bg: T.roseDim,     Icon: XCircle },
};

const initialNotifications: JpeNotification[] = [
  {
    id: "n1", level: "success", category: "build", title: "Build #4218 Completed",
    message: "All 5 stages passed. Package ready for export (Evil_Trait_Override.package).",
    time: "2m ago", read: false, icon: Rocket, iconColor: T.emerald,
  },
  {
    id: "n2", level: "warning", category: "conflict", title: "Conflict Detected",
    message: "trait_Evil.xml has 3 tuning ID collisions with WickedWhims v8.4.",
    time: "5m ago", read: false, icon: Shield, iconColor: T.amber,
  },
  {
    id: "n3", level: "info", category: "translation", title: "Translation Sync",
    message: "87% confidence achieved on trait_Evil JPE translation. 2 STBL references unverified.",
    time: "8m ago", read: false, icon: Languages, iconColor: T.violet,
  },
  {
    id: "n4", level: "success", category: "plugin", title: "Plugin Updated",
    message: "JPE Auto-Translator updated to v3.2.1. Changelog: Improved STBL hash resolution.",
    time: "12m ago", read: true, icon: Package, iconColor: T.cyan,
  },
  {
    id: "n5", level: "error", category: "system", title: "Schema Validation Failed",
    message: "Line 21: Unresolved STBL reference 0x2A3B4C5D. Quick fix available.",
    time: "15m ago", read: true, icon: Bug, iconColor: T.rose,
  },
  {
    id: "n6", level: "info", category: "ai", title: "AI Suggestion Ready",
    message: "GPT-4o generated a translation suggestion for trait_description with 95% confidence.",
    time: "18m ago", read: true, icon: Sparkles, iconColor: T.violet,
  },
  {
    id: "n7", level: "success", category: "conflict", title: "Conflict Resolved",
    message: "Smart merge applied to conflicting_traits TunableList. No data loss detected.",
    time: "22m ago", read: true, icon: GitMerge, iconColor: T.emerald,
  },
  {
    id: "n8", level: "info", category: "system", title: "SDK Version Check",
    message: "Sims 4 SDK v1.108 is up to date. All API endpoints verified.",
    time: "30m ago", read: true, icon: Download, iconColor: T.textTertiary,
  },
];

interface NotificationCenterProps {
  onNavigate?: (mode: string) => void; // accepts any string, parent casts
}

export function NotificationBell({ onNavigate: _onNavigate }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<JpeNotification[]>(initialNotifications);
  const [filter, setFilter] = useState<NotifCategory | "all">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismissNotif = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", escHandler);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", escHandler);
    };
  }, [open]);

  const filtered = filter === "all" ? notifications : notifications.filter(n => n.category === filter);

  const categoryFilters: { id: NotifCategory | "all"; label: string; color: string }[] = [
    { id: "all", label: "All", color: T.textSecondary },
    { id: "build", label: "Build", color: T.amber },
    { id: "conflict", label: "Conflicts", color: T.rose },
    { id: "translation", label: "Translate", color: T.violet },
    { id: "plugin", label: "Plugins", color: T.cyan },
    { id: "ai", label: "AI", color: T.violetBright },
    { id: "system", label: "System", color: T.textTertiary },
  ];

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        className="p-1 rounded-md transition-colors hover:bg-white/5 relative"
        onClick={() => { setOpen(p => !p); }}
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={13} color={unreadCount > 0 ? T.amber : T.textTertiary} />
        {unreadCount > 0 && (
          <div className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5"
            style={{
              background: `linear-gradient(135deg, ${T.rose}, ${T.amber})`,
              boxShadow: `0 0 8px ${T.rose}60`,
              fontSize: 8, fontWeight: 800, fontFamily: T.mono, color: "#fff",
            }}>
            {unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 z-[100] rounded-xl flex flex-col overflow-hidden"
            style={{
              width: 380,
              maxHeight: 520,
              background: T.bgSurface,
              border: `1px solid ${T.border}`,
              boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05), ${T.glowCyan}`,
              backdropFilter: T.glassBlur,
              transformOrigin: "top right",
            }}
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}40, ${T.violet}40, transparent)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
              <div className="flex items-center gap-2">
                <Bell size={13} color={T.cyan} />
                <Eyebrow color={T.textPrimary}>NOTIFICATIONS</Eyebrow>
                {unreadCount > 0 && (
                  <Badge color={T.amber} bg={T.amberDim}>{unreadCount} new</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="px-2 py-0.5 rounded-md transition-colors hover:bg-white/5"
                    style={{ fontSize: 9, fontFamily: T.mono, color: T.cyan }}>
                    Mark all read
                  </button>
                )}
                <IconBtn icon={X} size={12} onClick={() => setOpen(false)} title="Close" />
              </div>
            </div>

            {/* Category filters */}
            <div className="flex items-center gap-1 px-3 py-1.5 flex-shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${T.border}` }}>
              {categoryFilters.map(f => {
                const isActive = filter === f.id;
                const count = f.id === "all" ? notifications.length : notifications.filter(n => n.category === f.id).length;
                if (f.id !== "all" && count === 0) return null;
                return (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-all flex-shrink-0"
                    style={{
                      fontSize: 9, fontFamily: T.mono, fontWeight: 600,
                      color: isActive ? f.color : T.textMuted,
                      background: isActive ? `${f.color}12` : "transparent",
                      border: `1px solid ${isActive ? `${f.color}25` : "transparent"}`,
                    }}>
                    {f.label}
                    <span style={{ fontSize: 8, color: isActive ? f.color : T.textDim }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <BellOff size={28} color={T.textDim} className="mb-3" />
                  <p style={{ fontSize: 12, color: T.textMuted }}>No notifications</p>
                  <p style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>
                    {filter !== "all" ? "Try a different filter" : "You're all caught up!"}
                  </p>
                </div>
              ) : (
                filtered.map(notif => {
                  const ls = levelStyle[notif.level];
                  const NIcon = notif.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative group"
                      style={{ borderBottom: `1px solid ${T.borderSubtle}` }}
                    >
                      <div
                        className="flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                        style={{
                          background: notif.read ? "transparent" : `${ls.color}04`,
                          borderLeft: notif.read ? "3px solid transparent" : `3px solid ${ls.color}`,
                        }}
                        onClick={() => markRead(notif.id)}
                        onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                        onMouseLeave={e => { e.currentTarget.style.background = notif.read ? "transparent" : `${ls.color}04`; }}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                          style={{ background: ls.bg, border: `1px solid ${ls.color}20` }}>
                          <NIcon size={13} color={notif.iconColor} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span style={{
                              fontSize: 11, fontWeight: notif.read ? 500 : 700,
                              color: notif.read ? T.textSecondary : T.textPrimary,
                            }}>
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ls.color, boxShadow: `0 0 4px ${ls.color}60` }} />
                            )}
                          </div>
                          <p style={{
                            fontSize: 10, color: T.textTertiary, lineHeight: 1.5, marginTop: 2,
                          }}>
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock size={8} color={T.textDim} />
                            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{notif.time}</span>
                            <span className="px-1.5 py-0 rounded" style={{
                              fontSize: 8, fontWeight: 700, color: ls.color, background: ls.bg,
                            }}>
                              {notif.level.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Dismiss button */}
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 flex-shrink-0"
                          onClick={e => { e.stopPropagation(); dismissNotif(notif.id); }}
                          title="Dismiss"
                        >
                          <X size={10} color={T.textMuted} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>
                  {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </span>
                <button onClick={clearAll} className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors hover:bg-white/5"
                  style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>
                  <Trash2 size={8} />
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
