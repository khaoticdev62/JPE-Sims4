# JPE Studio Editor - Sims 4 Modding IDE

A professional, high-fidelity web IDE for Sims 4 mod developers to write **Just Plain English (JPE)** logic with real-time XML transformations and enterprise-grade AI intelligence.

## 🌟 Features

- **🚀 Real-Time JPE-to-XML Transformation**: Instant, debounced preview of your Sims 4 XML code as you type.
- **🧠 Multi-Model AI Intelligence**: 
    - **Claude 3.5 Sonnet** (The Gold Standard)
    - **OpenAI GPT-4o** (Creative Logic)
    - **Google Gemini 1.5 Pro** (Deep Context)
    - **Alibaba Qwen-Plus** (Efficient Diagnostic)
- **🔐 Enterprise-Grade Security**: 
    - **Server-Side API Routes**: No API keys are exposed to the client by default.
    - **Hybrid Key Model**: Users can safely override system keys with their own private tokens via LocalStorage for personal rate limits.
- **🛠️ Professional Modding Toolkit**: 
    - **Monaco Editor Support**: Full syntax highlighting and custom JPE language registration.
    - **Smart AI Fixes**: Right-click any error to have the AI suggest and apply the correct Sims 4 logic.
    - **Mod Analysis**: One-click deep dives into mod purpose and field parameters.
- **📥 Export Suite**: Export your work as original `.jpe` source or production-ready `.xml`.

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: custom premium components + shadcn/ui
- **State Management**: Zustand
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **AI Backend**: Anthropic SDK, OpenAI SDK, Google Generative AI (HTTP), Alibaba DashScope (HTTP)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.17+
- NPM / PNPM

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# AI Providers (Server-Managed)
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_gemini_key
DASHSCOPE_API_KEY=your_qwen_key
```

### 3. Installation & Launch
```bash
npm install
npm run dev
```

## 🔐 Security & Privacy
JPE Studio prioritizes developer privacy. 
- **Zero-Storage Policy**: API keys provided via "Advanced Override" are stored strictly in your browser's LocalStorage and are never sent to our database.
- **Encrypted Handshake**: Communication between the IDE and the AI endpoints is handled via secure server-managed routes.

---
*Created for the Sims 4 Modding Community.*