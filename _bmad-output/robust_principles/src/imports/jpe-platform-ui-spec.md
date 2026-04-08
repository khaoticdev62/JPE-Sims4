You are a senior product designer, frontend architect, and AI platform engineer.

Your task is to design the complete UI system for the **JPE Platform** — an AI orchestration and knowledge processing platform.

The design must be **fully compatible with live backend services** and must **NOT include any mocked, placeholder, or simulated data**.

All UI components must assume **real-time API connections** and **live data streams**.

---

CRITICAL RULE

The UI must never rely on:

• mock datasets
• lorem ipsum
• fake analytics values
• placeholder API structures
• simulated metrics

Every interface must reference **live data bindings and API endpoints**.

Where data would normally appear, instead define:

• API endpoint
• expected response schema
• data refresh behavior
• loading states
• error handling

---

JPE PLATFORM OVERVIEW

JPE is an AI-powered enterprise platform enabling:

• knowledge ingestion
• AI agent creation
• automation pipelines
• workflow orchestration
• analytics and monitoring
• integrations with external systems
• modular application extensions

The UI must support **real-time AI workflows and operational data**.

---

FIGMA PAGE STRUCTURE

Create these pages:

1 Foundations
2 JPE Design System
3 Core Components
4 Layout Framework
5 JPE Modules
6 Wireframes
7 High Fidelity Screens
8 Interaction Flows
9 Data Architecture
10 Developer Handoff

---

FOUNDATIONS

Create tokenized design foundations:

Color
Typography
Spacing
Radius
Shadow
Motion

Define colors for platform domains:

Knowledge
Agents
Automation
Analytics
Infrastructure

---

DATA CONNECTION PRINCIPLES

Every component must support:

• API-driven data rendering
• real-time updates
• asynchronous loading
• error states
• empty states

All dashboards must assume:

REST
GraphQL
or streaming WebSocket connections.

---

GLOBAL PLATFORM NAVIGATION

Design a workspace UI with:

Left sidebar modules:

Overview
Knowledge Hub
Agent Builder
Automation Pipelines
Workflow Engine
Analytics
Integrations
Apps Marketplace
Settings

Top command bar includes:

Global search
AI command interface
Notifications
User profile
Workspace selector

---

JPE CORE MODULES

Each module must define **live data sources and API bindings**.

---

KNOWLEDGE HUB

Features:

document ingestion
file uploads
knowledge indexing
semantic search
source management

Data connections:

GET /api/knowledge/sources
POST /api/knowledge/upload
GET /api/knowledge/search
GET /api/knowledge/{source_id}

UI states must support:

upload progress
indexing status
vectorization status
search latency
connection errors

---

AGENT BUILDER

Features:

create AI agents
assign knowledge
define prompts
configure tools
test responses

Live endpoints:

GET /api/agents
POST /api/agents
PUT /api/agents/{agent_id}
POST /api/agents/test

Include:

live execution logs
model latency
response tokens
agent performance metrics

---

AUTOMATION PIPELINES

Create a node-based workflow builder.

Pipeline nodes connect to live systems.

Example nodes:

Trigger
AI Processing
Data Transform
External API
Decision
Storage

Each node must define:

input schema
output schema
connected endpoint

Execution data:

GET /api/pipelines
POST /api/pipelines/run
GET /api/pipelines/{id}/logs

---

WORKFLOW ENGINE

Supports multi-step processes combining humans and AI.

Live data endpoints:

GET /api/workflows
POST /api/workflows
GET /api/workflows/tasks

UI must display:

task status
approval flows
automation triggers
live process metrics

---

ANALYTICS DASHBOARD

Analytics must assume **real telemetry data**.

Possible sources:

system events
agent usage
pipeline activity
API performance
AI model metrics

Endpoints:

GET /api/analytics/overview
GET /api/analytics/agents
GET /api/analytics/pipelines
GET /api/analytics/system

Charts must support:

live refresh
time range filtering
data aggregation

---

INTEGRATIONS

Integration system must support:

OAuth connections
API keys
webhooks
third-party services

Endpoints:

GET /api/integrations
POST /api/integrations
DELETE /api/integrations/{id}

---

APPS MARKETPLACE

Marketplace allows installation of platform extensions.

Endpoints:

GET /api/apps
GET /api/apps/{id}
POST /api/apps/install

---

COMPONENT LIBRARY

Create reusable components:

Buttons
Forms
Dropdowns
Tabs
Tables
Cards
Charts
Sidebars
Alerts
Modals
Notifications
AI chat panels
Pipeline nodes
Workflow blocks

Each component must support:

Loading state
Empty state
Error state
Live update state

---

REAL-TIME BEHAVIOR

Interfaces must support:

WebSocket updates
Server-sent events
Polling refresh
Streaming AI responses

Examples:

agent responses stream
pipeline logs update live
analytics refresh every interval

---

RESPONSIVE DESIGN

Create layouts for:

Mobile
Tablet
Desktop
Wide desktop

Dashboards must scale dynamically.

---

INTERACTION FLOWS

Create flows for:

Uploading knowledge
Creating AI agents
Building pipelines
Running automation
Viewing analytics
Installing apps

Include real data interactions.

---

DATA ARCHITECTURE PAGE

Document:

API structure
data schemas
event streams
authentication flow
rate limits
error responses

---

DEVELOPER HANDOFF

Provide documentation including:

design tokens
component specs
API mapping
state management
real-time event structure

---

CODE MAPPING

Map UI components to code architecture.

Example:

Agent Card

React <AgentCard agentId={id} />

API
GET /api/agents/{id}

Tailwind
bg-surface shadow-md rounded-xl p-6

---

AI CODING MODEL COMPATIBILITY

Ensure the design structure is optimized for AI coding tools including:

Copilot
Cursor
Replit

Use predictable naming conventions and tokenized styling.

---

DELIVERABLES

Generate:

complete JPE design system
modular component library
platform UI layouts
workflow builders
analytics dashboards
live data integration documentation

The system must be production-ready and designed to connect directly to real backend services.
