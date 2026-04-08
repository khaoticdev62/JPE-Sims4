/**
 * NetworkStatusIndicator.tsx
 * Offline detection with automatic reconnection and status indicator
 */

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { T } from "../pages/jpe-theme";
import { motion, AnimatePresence } from "./jpe-motion";
import { toast } from "sonner";

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);

      if (wasOffline) {
        toast.success("Back online", {
          description: "Your internet connection has been restored.",
          icon: <Wifi size={16} color={T.emerald} />,
        });
        setWasOffline(false);
      }

      // Hide indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      setWasOffline(true);

      toast.error("No internet connection", {
        description: "Some features may be unavailable. Trying to reconnect...",
        icon: <WifiOff size={16} color={T.rose} />,
        duration: Infinity, // Keep until reconnected
        id: "offline-toast",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  // Don't show if online and indicator timeout expired
  if (!showIndicator && isOnline) return null;

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9998,
            background: isOnline ? T.bgPanel : T.bgPanel,
            border: `1px solid ${isOnline ? T.emerald : T.rose}`,
            borderRadius: 8,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px ${isOnline ? T.emerald : T.rose}40`,
            fontFamily: T.sans,
          }}
        >
          {isOnline ? (
            <Wifi size={18} color={T.emerald} />
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw size={18} color={T.rose} />
            </motion.div>
          )}
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: isOnline ? T.emerald : T.rose,
            }}
          >
            {isOnline ? "Connected" : "Offline"}
          </span>
          {!isOnline && (
            <span
              style={{
                fontSize: 12,
                color: T.textMuted,
              }}
            >
              Reconnecting...
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to check online status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
