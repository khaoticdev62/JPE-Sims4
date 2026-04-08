# Story: 6-1 - Secure Multi-Model AI Service Integration

**Epic:** 6 - AI-Powered Modding Engine  
**Story Key:** 6-1-secure-multi-model-ai-service-integration  
**Status:** done  
**User Story:** As a Modder, I want to connect to different AI providers safely, so that I can use my preferred LLM for modding assistance with industrial-grade security.

## 📋 Story Foundation

### Description
This story formalizes the multi-model AI infrastructure. It ensures that Claude, OpenAI, Gemini, and Qwen providers are unified under a single orchestrator (`AIService.ts`) and that all API credentials are encrypted and managed securely via the OS-level `CredentialManager`.

### Acceptance Criteria (BDD)

**Given** the configuration settings in JPE Studio  
**When** I provide API keys for ANY supported provider (Claude, OpenAI, Gemini, Qwen)  
**Then** the following outcomes must be achieved:
1.  **Secure Storage**: Credentials must be encrypted and stored in the OS Keychain (via `keytar`) or a secure bridge.
2.  **Provider-Agnostic Interface**: The `AIService` orchestrator must handle requests independently of the chosen LLM backend.
3.  **Data Disposal**: Clearing credentials must result in 100% removal of all stored keys across all providers.
4.  **Backend Proxying**: All requests must be proxied through the Next.js server-side routes to protect API keys from client-side exposure.

## 🏗️ Developer Context

### Technical Milestones
- **Unified Orchestrator**: `AIService.ts` manages rate limiting and caching for all providers.
- **Credential Layer**: `CredentialManager.ts` handles OS keychain synchronization.
- **Server-Side Security**: Next.js App Router routes handle direct LLM SDK communication.

### Implementation Patterns
- **Singleton Orchestrator**: `AIService.getInstance()` ensures consistent state across the UI.
- **Rate Limiting**: `rate-limiter-flexible` prevents API abuse.
- **Failover Logic**: API routes provide standardized error handling for all LLM errors.

## 🧪 Verification Plan

- `[ ]` Verify `CredentialManager.saveKey` persists keys to the OS keychain.
- `[ ]` Verify `AIService.chat` routes correctly to `/api/{provider}/chat`.
- `[ ]` Verify `clearAllCredentials` correctly wipes metadata for ALL 4 providers.

---
**Project Context:** JPE-Sims4  
**Date:** 2026-04-03  
**Created By:** BMAD Master (Antigravity)

### 🧐 Review Findings (v6.0.4)

#### Patches (Fix Required)
- [x] [Review][Patch] Harden JSON Parsing in AI Services (use try-catch for extraction) [src/services/ai/*.Service.ts]
- [x] [Review][Patch] Synchronize Proxy Usage Reporting (map data.usage to totalTokensUsed) [src/services/ai/*.Service.ts]
- [x] [Review][Patch] Refactor Hardcoded API Paths to use BaseAIService context [src/services/ai/*.Service.ts]

#### Deferred
- [x] [Review][Defer] Transition to Persistent Rate Limiting (Redis) for distributed proxy safety — deferred, pre-existing infrastructure [src/app/api/*/route.ts]
