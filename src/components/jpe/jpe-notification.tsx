/**
 * JpeNotification — Toast notification with cyberpunk styling
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

const NOTIFICATION_CONFIG = {
  info: {
    icon: Info,
    color: "#63B3ED",
    bg: "rgba(99,179,237,0.08)",
    borderColor: "rgba(99,179,237,0.25)",
  },
  success: {
    icon: CheckCircle2,
    color: "#48BB78",
    bg: "rgba(72,187,120,0.08)",
    borderColor: "rgba(72,187,120,0.25)",
  },
  warning: {
    icon: AlertTriangle,
    color: "#F6AD55",
    bg: "rgba(246,173,85,0.08)",
    borderColor: "rgba(246,173,85,0.25)",
  },
  error: {
    icon: XCircle,
    color: "#FC8181",
    bg: "rgba(252,129,129,0.08)",
    borderColor: "rgba(252,129,129,0.25)",
  },
};

export type NotificationType = keyof typeof NOTIFICATION_CONFIG;

export interface JpeNotificationProps {
  type?: NotificationType;
  title: string;
  message?: string;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
  timestamp?: string;
  className?: string;
  "data-testid"?: string;
}

export function JpeNotification({
  type = "info",
  title,
  message,
  onDismiss,
  action,
  timestamp,
  className,
  "data-testid": testId,
}: JpeNotificationProps) {
  const config = NOTIFICATION_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative rounded-xl p-3 max-w-[360px] shadow-md",
        className
      )}
      style={{
        backgroundColor: "rgba(15,17,22,0.88)",
        backdropFilter: "blur(24px)",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 12px ${config.color}10`,
      }}
      role="alert"
      data-testid={testId}
    >
      {/* Accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 rounded-l-xl"
        style={{ width: 3, backgroundColor: config.color }}
      />

      <div className="flex gap-3 pl-3">
        <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: config.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-text-primary" data-notification-title>{title}</p>
          {message && (
            <p className="text-[11px] text-text-secondary mt-0.5" data-notification-message>{message}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {action && (
              <button
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors duration-fast hover:bg-white/5"
                style={{ color: config.color, borderColor: config.borderColor, border: "1px solid" }}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            )}
            {timestamp && (
              <span className="text-[9px] text-text-muted ml-auto" data-notification-timestamp>{timestamp}</span>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 p-0.5 rounded text-text-tertiary hover:text-text-primary transition-colors duration-fast"
            aria-label="Dismiss notification"
            data-notification-dismiss
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
