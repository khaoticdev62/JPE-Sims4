"use client";
/**
 * BrowserCompatibility.tsx
 * Detect unsupported browsers and show upgrade message
 */

import { AlertTriangle, ExternalLink } from "lucide-react";
import { T } from "./robust/jpe-theme";
import { JpeButton } from "./jpe-design-system";

function isSupported(): { supported: boolean; reason?: string; recommendation?: string } {
  // Check for IE
  const ua = navigator.userAgent;
  if (ua.indexOf("MSIE") !== -1 || ua.indexOf("Trident/") !== -1) {
    return {
      supported: false,
      reason: "Internet Explorer is not supported",
      recommendation: "Please use a modern browser like Chrome, Firefox, or Edge.",
    };
  }

  // Check for very old Chrome
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch && parseInt(chromeMatch[1]) < 90) {
    return {
      supported: false,
      reason: "Your Chrome version is outdated",
      recommendation: "Please update to Chrome 90 or later.",
    };
  }

  // Check for very old Firefox
  const firefoxMatch = ua.match(/Firefox\/(\d+)/);
  if (firefoxMatch && parseInt(firefoxMatch[1]) < 88) {
    return {
      supported: false,
      reason: "Your Firefox version is outdated",
      recommendation: "Please update to Firefox 88 or later.",
    };
  }

  // Check for required APIs
  if (!window.localStorage) {
    return {
      supported: false,
      reason: "LocalStorage is not available",
      recommendation: "Your browser is too old or has storage disabled.",
    };
  }

  if (!window.ResizeObserver) {
    return {
      supported: false,
      reason: "ResizeObserver is not available",
      recommendation: "Please update your browser to a recent version.",
    };
  }

  return { supported: true };
}

export function BrowserCompatibilityCheck({ children }: { children: React.ReactNode }) {
  const { supported, reason, recommendation } = isSupported();

  if (supported) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: T.bgApp,
        fontFamily: T.sans,
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 500,
          background: T.bgPanel,
          border: `1px solid ${T.rose}`,
          borderRadius: 12,
          padding: 48,
          textAlign: "center",
        }}
      >
        <div
          className="p-4 rounded-full mx-auto mb-6"
          style={{
            background: `${T.rose}20`,
            width: "fit-content",
          }}
        >
          <AlertTriangle size={48} color={T.rose} />
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: T.textPrimary,
            marginBottom: 12,
          }}
        >
          Unsupported Browser
        </h1>

        <p
          style={{
            fontSize: 14,
            color: T.textSecondary,
            lineHeight: 1.6,
            marginBottom: 8,
          }}
        >
          {reason}
        </p>

        <p
          style={{
            fontSize: 13,
            color: T.textMuted,
            lineHeight: 1.5,
            marginBottom: 32,
          }}
        >
          {recommendation}
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <JpeButton
            variant="primary"
            size="lg"
            icon={ExternalLink}
            onClick={() => window.open("https://www.google.com/chrome/", "_blank")}
          >
            Get Chrome
          </JpeButton>
          <JpeButton
            variant="secondary"
            size="lg"
            icon={ExternalLink}
            onClick={() => window.open("https://www.mozilla.org/firefox/", "_blank")}
          >
            Get Firefox
          </JpeButton>
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 11,
            color: T.textMuted,
            fontFamily: T.mono,
          }}
        >
          Minimum: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
        </div>
      </div>
    </div>
  );
}
