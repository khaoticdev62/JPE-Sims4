# Test Design: TS4Rebels Vault Feature

**Date**: 2026-04-06
**Designer**: Quinn (Test Architect)
**Scope**: TS4Rebels API integration, CredentialManager, TS4RebelsService, API bridge route

---

## Test Strategy Overview

- **Total test scenarios**: 24
- **Unit tests**: 14 (58%)
- **Integration tests**: 6 (25%)
- **E2E tests**: 4 (17%)
- **Priority distribution**: P0: 6, P1: 10, P2: 6, P3: 2

---

## Test Scenarios by Acceptance Criteria

### AC1: User can authenticate with TS4Rebels.cc

#### Scenarios

| ID            | Level       | Priority | Test                                              | Justification                     |
|---------------|-------------|----------|---------------------------------------------------|-----------------------------------|
| TS4R-UNIT-001 | Unit        | P0       | CredentialManager.saveCredential stores encrypted | Security critical                 |
| TS4R-UNIT-002 | Unit        | P0       | CredentialManager.getCredential decrypts correctly | Data integrity                    |
| TS4R-UNIT-003 | Unit        | P1       | CredentialManager.deleteCredential removes data   | Data lifecycle                    |
| TS4R-INT-001  | Integration | P0       | Login flow stores cookies in CredentialManager    | Multi-component auth flow         |
| TS4R-INT-002  | Integration | P0       | POST /api/ts4rebels calls Python login CLI        | API bridge to external service    |
| TS4R-E2E-001  | E2E         | P1       | User enters creds → authenticated → portal loads  | Critical user journey             |

### AC2: User can browse forum topics (default Forum 59 - File Donations)

#### Scenarios

| ID            | Level       | Priority | Test                                                | Justification               |
|---------------|-------------|----------|-----------------------------------------------------|-----------------------------|
| TS4R-UNIT-004 | Unit        | P0       | TS4RebelsService.listForum constructs correct URL    | Pure validation logic       |
| TS4R-UNIT-005 | Unit        | P1       | TS4RebelsService.listForum handles missing cookies   | Error condition             |
| TS4R-UNIT-006 | Unit        | P1       | TS4RebelsService.listForum default params (forum=59) | Default behavior            |
| TS4R-INT-003  | Integration | P0       | GET /api/ts4rebels?forum=59 invokes Python scraper   | API bridge correctness      |
| TS4R-E2E-002  | E2E         | P1       | User opens portal → topics list renders             | Critical user journey       |

### AC3: User can view topic details with download links

#### Scenarios

| ID            | Level       | Priority | Test                                                | Justification                   |
|---------------|-------------|----------|-----------------------------------------------------|---------------------------------|
| TS4R-UNIT-007 | Unit        | P0       | TS4RebelsService.getTopic constructs correct URL    | Pure validation logic           |
| TS4R-UNIT-008 | Unit        | P0       | extractDownloadLinks filters external download hosts | Core extraction algorithm       |
| TS4R-UNIT-009 | Unit        | P1       | extractDownloadLinks deduplicates URLs              | Data correctness                |
| TS4R-UNIT-010 | Unit        | P2       | extractDownloadLinks handles empty posts array      | Edge case                       |
| TS4R-INT-004  | Integration | P1       | GET /api/ts4rebels?topic=X returns parsed posts     | Data transformation pipeline    |
| TS4R-E2E-003  | E2E         | P1       | User clicks topic → posts + download links render   | Core feature validation         |

### AC4: User can download mods from external hosts (simfileshare, mega.nz, google drive)

#### Scenarios

| ID            | Level       | Priority | Test                                                | Justification               |
|---------------|-------------|----------|-----------------------------------------------------|-----------------------------|
| TS4R-UNIT-011 | Unit        | P1       | extractDownloadLinks identifies simfileshare URLs    | Heuristic correctness       |
| TS4R-UNIT-012 | Unit        | P1       | extractDownloadLinks identifies mega.nz URLs         | Heuristic correctness       |
| TS4R-UNIT-013 | Unit        | P2       | extractDownloadLinks excludes ts4rebels.cc internal  | Filter correctness          |
| TS4R-UNIT-014 | Unit        | P2       | extractDownloadLinks handles null labels             | Null safety                 |
| TS4R-INT-005  | Integration | P1       | Full topic→posts→links extraction pipeline           | End-to-end data flow        |
| TS4R-E2E-004  | E2E         | P2       | Download link opens in new tab                      | User action verification    |

### AC5: API bridge handles errors gracefully

#### Scenarios

| ID            | Level       | Priority | Test                                                | Justification               |
|---------------|-------------|----------|-----------------------------------------------------|-----------------------------|
| TS4R-INT-006  | Integration | P0       | Invalid forum ID returns 400                        | Input validation            |
| TS4R-INT-007  | Integration | P1       | Python process failure returns 500                  | Error handling              |
| TS4R-INT-008  | Integration | P1       | Missing auth params returns 400                     | Security validation         |
| TS4R-E2E-005  | E2E         | P2       | Network error → user sees error message             | User experience             |

---

## Risk Coverage

| Risk ID | Description                     | Mitigating Tests                                  |
|---------|---------------------------------|---------------------------------------------------|
| RISK-001 | Credential leakage            | TS4R-UNIT-001, TS4R-UNIT-002, TS4R-UNIT-003      |
| RISK-002 | External API failure          | TS4R-INT-007, TS4R-E2E-005                       |
| RISK-003 | Invalid user input            | TS4R-INT-006, TS4R-INT-008                       |
| RISK-004 | Download link extraction bugs | TS4R-UNIT-008, TS4R-UNIT-009, TS4R-UNIT-011-014 |
| RISK-005 | Python CLI not available      | TS4R-INT-007, TS4R-INT-002                       |

---

## Recommended Execution Order

1. **P0 Unit tests** (fail fast):
   - TS4R-UNIT-001, TS4R-UNIT-002, TS4R-UNIT-004, TS4R-UNIT-007, TS4R-UNIT-008
2. **P0 Integration tests**:
   - TS4R-INT-001, TS4R-INT-002, TS4R-INT-003, TS4R-INT-006
3. **P0 E2E tests**:
   - TS4R-E2E-001
4. **P1 tests in order**:
   - TS4R-UNIT-003, TS4R-UNIT-005, TS4R-UNIT-006, TS4R-UNIT-009
   - TS4R-INT-004, TS4R-INT-005, TS4R-INT-007, TS4R-INT-008
   - TS4R-E2E-002, TS4R-E2E-003
5. **P2+ as time permits**:
   - TS4R-UNIT-010, TS4R-UNIT-011, TS4R-UNIT-012, TS4R-UNIT-013, TS4R-UNIT-014
   - TS4R-E2E-004, TS4R-E2E-005

---

## Gate YAML Block

```yaml
test_design:
  scenarios_total: 24
  by_level:
    unit: 14
    integration: 6
    e2e: 4
  by_priority:
    p0: 6
    p1: 10
    p2: 6
    p3: 2
  coverage_gaps: []
```

---

## Trace References

Test design matrix: `qa/assessments/ts4rebels-test-design-20260406.md`
P0 tests identified: 6
