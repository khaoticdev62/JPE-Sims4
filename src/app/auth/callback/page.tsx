"use client"

/**
 * OAuth Callback Page
 * Handles provider redirection, extracts codes/tokens, and communicates with the main window.
 */

import * as React from "react"
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react"

export default function AuthCallback() {
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Simulate real OAuth param extraction
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const provider = urlParams.get('state') || 'unknown'
        
        // In a real app, you'd exchange a code here for tokens with a backend
        // For simulation/mock flow, we just provide a result
        
        const result = {
          provider,
          token: "oauth_token_" + Math.random().toString(36).substring(7),
          user: {
            name: `${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "AI"} Developer`,
            email: `dev@${provider}.com`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
          }
        }

        // Send back to the main window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth-success',
            provider,
            result
          }, window.location.origin)
          
          setStatus("success")
          setTimeout(() => window.close(), 1500)
        } else {
          throw new Error("Opener window not found. Please try logging in again.")
        }
      } catch (err: any) {
        setStatus("error")
        setError(err.message || "Failed to complete authentication")
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth-error',
            error: err.message
          }, window.location.origin)
        }
      }
    }

    processCallback()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0E0E0E] text-white p-6 font-sans">
      <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 text-center shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
        
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Syncing Accounts...</h1>
            <p className="text-sm text-white/50 leading-relaxed">
              We're securely connecting your AI provider account to JPE Studio. One moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-400">Authentication Success</h1>
            <p className="text-sm text-white/50 leading-relaxed">
              Successfully linked your account. This window will close automatically.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-red-400">Link Failed</h1>
            <p className="text-sm text-white/50 leading-relaxed">
              {error || "An error occurred during authentication."}
            </p>
            <button 
              onClick={() => window.close()}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
            >
              Close Window
            </button>
          </>
        )}

        {/* Brand Footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 opacity-30 grayscale pointer-events-none">
          <div className="w-4 h-4 rounded bg-white" />
          <span className="text-[10px] font-black uppercase tracking-widest">JPE Studio</span>
        </div>
      </div>
    </div>
  )
}
