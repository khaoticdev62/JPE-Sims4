# JPE Studio - Git Branching Strategy & Feature Branches

**Date:** December 20, 2024
**Status:** Phase 1 - Feature branch planning and creation

---

## Overview

JPE Studio uses a **feature branch strategy** to manage development:
- `master` branch = stable, production-ready code
- Feature branches = isolated development of specific features
- Branches merge back to `master` via pull requests (when ready)

---

## Identified Features for Feature Branches

Based on codebase analysis, these features deserve their own branches:

### 🎯 Priority 1 (Active/Incomplete)

#### 1. **feature/ccmanager-plugin**
**Status:** In Progress (Phase 1 scaffolding complete)
**What:** CC/MOD organizer plugin with file browser and viewfinder
**Why:** Major plugin feature, affects plugin system
**Scope:** 7-phase implementation plan already created
**Files:** `plugins/ccmanager_plugin/*`

#### 2. **feature/cloud-sync-collaboration**
**Status:** Framework exists, needs enhancement
**What:** Cloud synchronization and team collaboration
**Why:** Enable multi-user workflows
**Scope:** Cloud API, conflict detection, merge strategies
**Files:** `cloud/*`, `collaboration/*`

#### 3. **feature/native-engine**
**Status:** In Progress (Rust implementation)
**What:** Native performance optimizations (Rust bridge)
**Why:** Speed up file processing for large mods
**Scope:** Build native library, integrate with Python
**Files:** `engine_native/*`

### 🎯 Priority 2 (Planned)

#### 4. **feature/mobile-apps**
**Status:** Framework exists, needs full implementation
**What:** iOS and Android companion apps
**Why:** On-the-go mod management
**Scope:** Mobile UI, sync with desktop, offline support
**Files:** `ios_app/*`, `mobile_app/*`

#### 5. **feature/ts4rebels-integration-advanced**
**Status:** Basic integration exists, needs enhancement
**What:** Advanced TS4Rebels vault integration
**Why:** Leverage existing mod databases
**Scope:** Vault indexing, auto-download, recommendations
**Files:** `plugins/ts4rebels_plugin/*`

#### 6. **feature/plugin-system-v2**
**Status:** V1 complete, needs enhancement
**What:** Plugin system improvements and APIs
**Why:** Enable rich ecosystem of community plugins
**Scope:** Plugin store, hot-loading, better APIs
**Files:** `plugins/*`

### 🎯 Priority 3 (Nice to Have)

#### 7. **feature/performance-monitoring**
**Status:** Started
**What:** Real-time performance metrics and optimization
**Why:** Improve user experience for large projects
**Scope:** Monitor memory, CPU, suggest optimizations
**Files:** `performance/*`

#### 8. **feature/ui-enhancements-phase-2**
**Status:** Phase 1 complete
**What:** Additional UI/UX improvements
**Why:** Continue design system evolution
**Scope:** Themes, animations, accessibility
**Files:** `jpe_studio_qt/ui/*`, `jpe_studio_qt/theme*`

#### 9. **feature/testing-framework**
**Status:** Started
**What:** Enhanced testing infrastructure
**Why:** Improve code quality and reliability
**Scope:** Integration tests, performance tests, CI/CD
**Files:** `tests/*`

#### 10. **feature/ai-enhancements**
**Status:** Phase 12 complete, future improvements
**What:** Advanced AI features
**Why:** Better code completion and suggestions
**Scope:** Multi-model support, custom training, RAG enhancements
**Files:** `jpe_studio_qt/ai/*`

---

## Feature Branch Naming Convention

```
feature/<feature-name>        - New feature development
bugfix/<bug-description>      - Bug fixes
docs/<documentation-topic>    - Documentation updates
refactor/<component>          - Code refactoring
perf/<optimization>           - Performance improvements
test/<test-area>             - Test-related changes
```

### Examples:
- `feature/ccmanager-plugin` - CC Manager plugin
- `bugfix/translation-memory-race-condition` - Bug fix
- `docs/plugin-development-guide` - Documentation
- `refactor/gemini-client-async` - Refactoring
- `perf/cache-optimization` - Performance
- `test/ui-integration-tests` - Testing

---

## Feature Branch Workflow

### Creating a Feature Branch

```bash
# Start from master
git checkout master
git pull origin master

# Create and switch to feature branch
git checkout -b feature/<feature-name>
```

### During Development

```bash
# Regular commits
git add .
git commit -m "feat: description of work"

# Keep up with master
git fetch origin
git rebase origin/master

# Push regularly
git push -u origin feature/<feature-name>
```

### Preparing for Merge

```bash
# Ensure all tests pass
pytest tests/

# Create Pull Request on GitHub
gh pr create --title "Feature: Description" --body "Description"

# After review, squash commits if needed
git rebase -i master

# Merge to master
git checkout master
git merge feature/<feature-name>
git push origin master

# Delete branch
git branch -d feature/<feature-name>
git push origin --delete feature/<feature-name>
```

---

## Release & Hotfix Branches

### Release Branch
```
release/<version>  - e.g., release/2.5.0
```

### Hotfix Branch
```
hotfix/<bug-description>  - e.g., hotfix/critical-crash
```

---

## Branch Management Tips

### View All Branches
```bash
# Local branches
git branch -v

# Remote branches
git branch -r -v

# All branches with activity
git branch -v -a
```

### Track Changes
```bash
# See commits in feature branch but not master
git log master..feature/<name>

# See recent commits
git log feature/<name> --oneline -n 20
```

### Clean Up Branches
```bash
# Delete local branch
git branch -d feature/<name>

# Delete remote branch
git push origin --delete feature/<name>

# Clean deleted remote branches
git remote prune origin
```

---

## Pull Request Guidelines

### PR Checklist
- [ ] Clear, descriptive title
- [ ] Detailed description of changes
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Code follows style guidelines

### PR Template
```
## Description
Brief overview of the feature

## Related Issues
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change

## Testing
- [ ] Tests added
- [ ] Tests pass
- [ ] Manual testing done

## Checklist
- [ ] Follows code style
- [ ] Tests pass locally
- [ ] Docs updated
- [ ] No new warnings
```

---

## Merge Strategies

### Squash & Merge (Clean history)
```bash
git merge --squash feature/<name>
git commit -m "feat: Add CC Manager plugin scaffolding"
```

### Standard Merge (Keep history)
```bash
git merge feature/<name>
```

### Rebase & Merge (Linear history)
```bash
git rebase master
git checkout master
git merge --ff-only feature/<name>
```

---

## Feature Branch Status (Current)

### Branches to Create Now (Priority 1)
✅ `feature/ccmanager-plugin` - CC Manager plugin
✅ `feature/cloud-sync-collaboration` - Cloud & collaboration
✅ `feature/native-engine` - Native Rust bridge

### Ready for Future Development
- `feature/mobile-apps` - iOS/Android apps
- `feature/ts4rebels-integration-advanced` - Vault enhancements
- `feature/plugin-system-v2` - Plugin system v2
- `feature/performance-monitoring` - Performance metrics
- `feature/ui-enhancements-phase-2` - UI improvements
- `feature/testing-framework` - Test infrastructure
- `feature/ai-enhancements` - AI improvements

---

## Quick Reference

```bash
# Create feature branch
git checkout -b feature/<name> master

# Push branch
git push -u origin feature/<name>

# Create PR (GitHub CLI)
gh pr create --title "feat: description"

# Update from master
git fetch && git rebase origin/master

# Merge and cleanup
git checkout master
git pull
git merge feature/<name>
git push origin master
git branch -D feature/<name>
git push origin --delete feature/<name>
```

---

**Last Updated:** December 20, 2024
**Next Review:** January 31, 2025
