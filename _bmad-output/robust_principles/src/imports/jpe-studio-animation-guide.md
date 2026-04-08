JPE STUDIO – AAAA PROFESSIONAL ANIMATION SYSTEM
FIGMA MAKE AI MASTER PROMPT

Project Overview

Create a world-class animation system for a professional desktop application called **JPE Studio**, a Sims 4 mod engineering and diagnostics platform.

The UI already follows a high-end modern developer tool aesthetic similar to:

Figma
Linear
Raycast
Apple developer tools
modern IDE dashboards

Animations must communicate system behavior clearly while maintaining extremely high responsiveness and minimal distraction.

The system should feel premium, cinematic, and intelligent while remaining lightweight and fast.

The animation system must work across:

• Desktop application UI
• Dockable panels
• Tool windows
• Diagnostics overlays
• Graph visualizations
• Terminal views
• Mod conflict graphs

All animations must follow consistent physics, timing curves, and motion patterns.

---

GLOBAL MOTION PHILOSOPHY

Motion in JPE Studio must follow three rules:

1. Motion explains cause and effect
2. Motion reduces cognitive load
3. Motion never slows down workflow

Animations should feel:

• intentional
• confident
• fast
• frictionless

Avoid flashy or exaggerated movement.

The interface should feel like **precision instrumentation**.

---

GLOBAL ANIMATION VARIABLES

Define the following motion tokens for the entire design system.

Motion Duration Scale

instant = 80ms
fast = 120ms
normal = 180ms
complex = 260ms
large_transition = 340ms

Easing Curves

ease_out_standard
cubic-bezier(0.16, 1, 0.3, 1)

ease_in_out_smooth
cubic-bezier(0.4, 0, 0.2, 1)

ease_snappy
cubic-bezier(0.2, 0.8, 0.2, 1)

spring_soft
spring stiffness 380 damping 28

spring_precise
spring stiffness 520 damping 35

---

PRIMARY UI ANIMATIONS

Panel Expansion

Used for opening diagnostic panels, explorer trees, and tools.

Behavior

panel slides in from side
opacity fades from 0 to 100
slight scale from 0.98 to 1.0

Timing

duration 220ms
easing ease_out_standard

---

Docking Panel Animation

When panels attach to workspace areas.

Behavior

panel magnetically snaps into position
slight elastic spring effect

Timing

spring_precise
220ms

Visual effect

subtle shadow compression when docking

---

Modal Window Entry

For mod diagnostics and conflict reports.

Behavior

background blur increases
modal fades and scales in

scale

0.94 → 1.0

opacity

0 → 100

duration

240ms

easing

ease_out_standard

---

MOD DIAGNOSTICS ANIMATIONS

Exception Detected Alert

When a crash log appears.

Behavior

diagnostic card slides down from top
icon pulses once
border glow animates

timing

200ms slide
120ms glow pulse

effect

soft red pulse highlight

---

Stack Trace Reveal

Stack traces should progressively reveal.

Behavior

lines cascade downward
each line fades and slides in

delay per line

12ms

duration per line

140ms

This gives the feeling of **information unfolding**.

---

Dependency Graph Animation

One of the most important animated systems.

Graph nodes represent mods and dependencies.

When graph loads:

nodes fade in
connections draw between nodes
layout expands outward

Edges animate with a line draw effect.

timing

node fade

140ms

edge draw

180ms

layout settle

spring_soft

---

CONFLICT DETECTION VISUALIZATION

When a mod conflict is discovered:

conflicting nodes glow
connection pulses
graph slightly zooms

Animation sequence

1 node highlight
2 edge pulse
3 conflict panel appears

timing

180ms highlight
200ms pulse
220ms panel slide

---

TERMINAL INTERFACE ANIMATIONS

The terminal is part of the core developer workflow.

Commands should feel tactile.

Command Entry

cursor blink
text types in

character delay

12ms

Command Execution

terminal output scrolls smoothly

scroll velocity

consistent linear motion

Error Output

lines flash subtle amber highlight before settling.

---

LOADING STATES

The interface should avoid traditional spinners.

Use skeleton loaders and progressive reveal.

Skeleton Loader

light shimmer animation

direction

left to right

duration

1200ms

loop

continuous

---

SUCCESS ANIMATIONS

When builds succeed or diagnostics resolve.

Behavior

success icon draws itself
checkmark stroke animates

timing

220ms

accent color

soft green

Secondary effect

subtle confetti particles (extremely minimal)

---

ERROR ANIMATIONS

Errors must feel serious but not alarming.

Behavior

shake micro-motion

translation

2px horizontal oscillation

duration

120ms

frequency

3 oscillations

---

BUTTON INTERACTIONS

Hover

background brightens
scale increases slightly

scale

1.0 → 1.02

duration

120ms

---

Click

button compresses

scale

1.02 → 0.96 → 1

spring_soft

---

FOCUS TRANSITIONS

When switching between major tools:

Explorer
Diagnostics
Graph
Terminal

Use a cinematic transition.

Behavior

content slides slightly
fade cross dissolve

distance

24px

duration

260ms

easing

ease_in_out_smooth

---

GRAPH VISUALIZATION PHYSICS

Graph nodes should use **soft physics simulation**.

Nodes repel each other slightly.

Edges behave like springs.

This creates a living dependency map.

Parameters

repulsion strength

medium

spring stiffness

0.12

damping

0.88

---

PERFORMANCE RULES

Animations must maintain 60fps.

Do not animate:

width
height
top
left

Animate only:

opacity
transform
scale
translate

---

ACCESSIBILITY

Provide reduced motion mode.

When enabled:

disable physics motion
replace with fade transitions

durations

100ms max

---

FINAL OUTPUT

Figma Make AI should generate:

Complete animation component library

Interactive prototypes for:

diagnostics panel
dependency graph
terminal console
mod conflict viewer
modal windows
navigation transitions

Include:

motion tokens
animation variants
prototype flows
interaction triggers

Ensure the system matches the visual language of a professional developer platform.

Animations should feel **precise, intelligent, and premium**.

The final prototype must demonstrate real workflows such as:

opening diagnostics
analyzing crash reports
isolating mod conflicts
running CLI commands
