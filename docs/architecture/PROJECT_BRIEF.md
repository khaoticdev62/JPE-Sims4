# JPE Mod Translator 2.0 — Project Brief

**Version**: 1.0
**Created**: December 26, 2025
**Project Lead**: Senior Full Stack Developer
**Team Size**: 1 (solo vibe engineering with AI assistance)
**Timeline**: ASAP (MVP target)

---

## Executive Summary

**JPE Mod Translator 2.0** is an open-source toolchain that transforms the Sims 4 modding experience by enabling mod creators to **read, edit, and compile mods in Just Plain English (JPE)** — making mod development accessible to both technical veterans and newcomers.

### The Problem

Sims 4 mods are written in complex XML tuning files, binary packages, and scripts that are:
- **Hard to understand** - Requires deep knowledge of Sims 4's modding architecture
- **Hard to edit** - No user-friendly tools; requires manual XML editing
- **Hard to share** - Knowledge transfer is difficult; documentation is scarce
- **Hard to debug** - Error tracking and diagnostics are manual and error-prone

### The Vision

A toolchain that:
1. **Reads** all Sims 4 mod file types (XML, STBL, .package, .ts4script, Python, JSON, cfg)
2. **Translates** them into human-readable JPE format
3. **Allows editing** in JPE and an English-friendly XML fork (JPE-XML)
4. **Compiles** JPE back into valid Sims 4-compatible formats
5. **Provides diagnostics** for easy issue tracking and fixing
6. **Runs on Desktop** (Windows/Mac) with future iPhone app

---

## Market & Users

### Target Users (Dual Persona)

#### **Persona A: Technical Mod Creators** (40% of MVP focus)
- **Profile**: Experienced developers with XML/scripting knowledge
- **Currently**: Hand-edit XML, use custom scripts, manage versioning manually
- **Needs**:
  - Better tooling for complex mod projects
  - Clear diagnostics when things break
  - Version control integration
  - Ability to refactor mods safely
- **Pain**: Tedious manual editing, hard to track changes, fragile dependencies

#### **Persona B: New/Casual Modders** (60% of MVP focus)
- **Profile**: Community members who want to create mods but find XML intimidating
- **Currently**: Avoid creating mods, use existing mod templates, struggle with modifications
- **Needs**:
  - Simple, understandable interface
  - Clear error messages that explain what went wrong
  - Tutorial/guided workflow
  - Lower barrier to entry
- **Pain**: XML is incomprehensible, no guidance, steep learning curve

### Market Size
- **Sims 4 Modding Community**: ~50,000-100,000+ active modders
- **Potential Users**: 30-50% of community (those frustrated with current tools)
- **Opportunity**: No existing tool solves this problem at scale

### Competitive Landscape
- **Current alternatives**: Manual XML editing, generic text editors, forum discussions
- **Competitive advantage**: JPE makes modding accessible; full file format support; diagnostics
- **Network effect**: Better tools → more modders → more mods → more community growth

---

## Goals & Success Criteria

### Primary Goals
1. **Accessibility**: New modders can create valid mods without understanding XML
2. **Efficiency**: Experienced modders work 3-5x faster than manual XML editing
3. **Community Impact**: Become the de-facto standard modding tool for Sims 4
4. **Quality**: Diagnostics catch 95%+ of mod errors before runtime

### Success Metrics (MVP)
- **Adoption**: 500+ downloads in first month
- **User Satisfaction**: 4.5+ star rating on mod sites
- **Retention**: 30%+ of users making mods within first week
- **Engagement**: 10+ community contributions (forks, issues, PRs) by month 2
- **Functionality**: 100% success rate on example mod translations
- **Performance**: Compile time < 5 seconds for typical mods

---

## MVP Scope

### What's In v1.0

#### **File Format Support** (Priority Order)
1. **XML Tuning** (.xml) — Core mod files
2. **Python Scripts** (.ts4script/.py) — Behavior definitions
3. **String Tables** (.stbl) — Localized strings
4. **Package Files** (.package) — Binary resource containers
5. **Configuration** (.cfg, .json) — Settings files

#### **Core Features**
- ✅ **Read** all supported formats
- ✅ **Translate to JPE** (English representation)
- ✅ **Edit in JPE** (user-friendly editing)
- ✅ **Compile back** to valid Sims 4 format
- ✅ **Diagnostics** (error detection and reporting)
- ✅ **Desktop App** (Windows/Mac)
- ✅ **Project Management** (open/save projects, file tracking)

#### **What's NOT in v1.0** (Future)
- ❌ iPhone app (v2.0)
- ❌ Cloud sync (v2.0)
- ❌ Mod marketplace (v3.0)
- ❌ Advanced refactoring tools (v2.0)
- ❌ Visual mod builder (v3.0)

### Architecture Approach

**Tech Stack (Recommended)**:
- **Language**: TypeScript (type safety, scalability)
- **Desktop Framework**: Electron (cross-platform, full file system access)
- **Engine**: Shared translation engine (usable in desktop + future iPhone)
- **UI**: React (component reusability, responsive design)
- **File Processing**: Custom parsers for Sims 4 formats
- **Testing**: Jest + integration tests for format compatibility

**Key Architectural Decisions**:
- **Modular Parsers**: One parser per file type (maintainability, testability)
- **JPE Intermediate Format**: Translate all formats to JPE, then compile from JPE
- **Diagnostic Engine**: Real-time validation as user edits
- **Desktop-First**: Ship desktop app first, iPhone uses shared engine later

---

## Constraints & Assumptions

### Constraints
- **Solo Development**: One person building the entire stack
- **Timeline**: ASAP (MVP target)
- **Platforms**: Desktop first (Windows/Mac with Electron)
- **Learning Curve**: Sims 4 modding format specs must be learned/documented

### Assumptions
- **Community Interest**: Sims 4 modders will adopt new tools
- **Open Source Model**: Community contributions will help after launch
- **File Format Stability**: Sims 4 format specs are stable enough to parse reliably
- **Desktop Market**: Desktop app is the right distribution channel for MVP

### Key Risks
1. **File Format Complexity**: Sims 4 formats are undocumented; reverse engineering needed
2. **Solo Development**: One person can't do everything; need to prioritize ruthlessly
3. **User Education**: New modders need guided experience; generic tool won't work
4. **Testing Coverage**: Must test extensively against real mods to build trust

---

## Timeline & Milestones

### Suggested Phasing (ASAP with quality)

**Phase 1: Foundation (Weeks 1-3)**
- [ ] Design system architecture
- [ ] Set up Electron + React base
- [ ] Create JPE format specification
- [ ] Build first parser (XML tuning)
- [ ] Create basic UI
- **Deliverable**: Read + translate XML mods to JPE

**Phase 2: Core Workflow (Weeks 4-6)**
- [ ] Build remaining parsers (Python, STBL, package, cfg)
- [ ] Implement JPE editor
- [ ] Build compiler (JPE → valid formats)
- [ ] Create diagnostic engine
- **Deliverable**: Full read-edit-compile cycle

**Phase 3: Polish & Diagnostics (Weeks 7-9)**
- [ ] Comprehensive error handling and diagnostics
- [ ] Project management UI (open/save/manage)
- [ ] Tutorial and onboarding
- [ ] Testing with real mods
- **Deliverable**: Production-ready MVP

**Phase 4: Community Launch (Week 10+)**
- [ ] Beta testing with community
- [ ] GitHub open source release
- [ ] Documentation and tutorials
- [ ] Community feedback collection
- **Deliverable**: Public v1.0 launch

**Target**: **10 weeks to MVP** (adjustable based on complexity discovery)

---

## Technology & Architecture Highlights

### Why This Architecture Works for Solo Development

1. **Shared Engine**: Write translation logic once, use in desktop + future iPhone
2. **Modular Parsers**: Each file type is independent; can develop and test in parallel
3. **Electron**: Fastest path to cross-platform desktop; large ecosystem
4. **React**: Component reuse, strong community, fast development
5. **Open Source**: Community can contribute parsers, fix bugs, add features

### Key Technical Insights

- **JPE as Intermediate Format**: All formats translate to JPE, all compile from JPE
  - Makes architecture clean and extensible
  - Same validation logic works for all formats

- **Diagnostic-First Approach**: Real-time error checking
  - Catch issues as user types
  - Educational feedback ("Here's why this is wrong")

- **Reverse Engineering**: Sims 4 formats documented through community
  - Start with known format examples
  - Build parser incrementally
  - Validate against existing mods

---

## Next Steps

### Phase 1 of Workflow: Discovery ✅ COMPLETE

**Deliverables**:
- ✅ Project Brief (this document)
- ✅ User personas defined
- ✅ MVP scope locked
- ✅ Timeline and milestones
- ✅ Architectural approach outlined

### Phase 2: Product Strategy (Ready to Begin)

**Sarah (Product Manager)** will create:
1. **Product Requirements Document (PRD)**
   - Detailed feature list with acceptance criteria
   - User stories for each feature set
   - Prioritized roadmap
   - Success metrics and KPIs

2. **Feature Breakdown**
   - File format support (detailed specs)
   - JPE translation rules
   - Editing capabilities
   - Compilation & diagnostics
   - UI workflows

3. **Market Research** (Optional deepdive)
   - Sims 4 community analysis
   - Modding platform landscape
   - Opportunity assessment

---

## Stakeholders & Approvals

- **Product Visionary**: You (Senior Full Stack Developer)
- **Development Team**: You (solo with AI assistance)
- **Target Users**: Sims 4 modding community (feedback later)
- **Success Owner**: You (tracking metrics post-launch)

---

## Appendix: Key Questions Answered

**Q: Why both technical and non-technical users in MVP?**
A: Non-technical users are the larger opportunity (60%+). Technical users validate the tool works correctly. Both need to be delighted for success.

**Q: Why open source from day 1?**
A: Sims 4 community expects open tools. Building trust early enables community contributions to accelerate development.

**Q: Why desktop-first, not web?**
A: Sims 4 mods are local files; desktop has better file system access and UX. Web app comes later if demand exists.

**Q: How do you solve the "one person can't do everything" problem?**
A: Ruthless MVP scope (no visual builder, no marketplace, no cloud). AI assistance on architecture and code. Community picks up secondary features post-launch.

**Q: What if Sims 4 formats change?**
A: Modular parser design means one format can be updated independently. Community feedback early catches format changes quickly.

---

**Status**: Ready for Product Manager Phase
**Next Agent**: Sarah (Product Manager) → Create PRD
**Estimated Time to PRD**: 1-2 hours
