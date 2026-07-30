# Prepaid Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fifth Packages tab that tracks prepaid services, multi-service visits, and automatically calculated remaining sessions without affecting financial totals.

**Architecture:** FinanceCore owns pure balance and selection validation. SwiftData adds `ServicePackage`, `PackageVisit`, and `PackageUsage` records so visits can reference several services and balances can be derived from usage. Focused SwiftUI package views provide list, detail, add/edit/delete, and visit history flows.

**Tech Stack:** Swift 6, SwiftUI, SwiftData, FinanceCore, Swift Testing, iOS 17+

---

### Task 1: Package balance rules

**Files:**
- Create: `FinanceCore/Sources/FinanceCore/PackageRules.swift`
- Create: `FinanceCore/Tests/FinanceCoreTests/PackageRulesTests.swift`

- [ ] Write failing tests proving `remaining(total: 15, usageCount: 1) == 14`, balances floor at zero, duplicate service IDs are rejected, and zero-balance selections are rejected.
- [ ] Run `swift test --disable-sandbox --package-path FinanceCore`; expect missing `PackageRules` failures.
- [ ] Implement `PackageRules.remaining`, `validateSelection`, and `PackageRuleError` as pure public APIs.
- [ ] Run all FinanceCore tests; expect all tests to pass.
- [ ] Commit with `git commit -m "feat: add prepaid package balance rules"`.

### Task 2: SwiftData records and starting packages

**Files:**
- Modify: `MoneyMap.swiftpm/Sources/Models.swift`
- Modify: `MoneyMap.swiftpm/Sources/MoneyMapApp.swift`

- [ ] Add `ServicePackage` with provider, category, service name, total sessions, notes, timestamps, and usages.
- [ ] Add `PackageVisit` with visit date, staff, notes, and usages.
- [ ] Add `PackageUsage` joining one visit to one service package with cascade deletion.
- [ ] Include all three models in the app model container.
- [ ] Seed the ten approved services when the package table is empty and seed one historical Manicure usage so it starts at four remaining.
- [ ] Compile the complete iOS executable; expect an arm64 Mach-O with no diagnostics.
- [ ] Commit with `git commit -m "feat: add prepaid package data"`.

### Task 3: Packages tab and visit workflows

**Files:**
- Create: `MoneyMap.swiftpm/Sources/PackagesView.swift`
- Modify: `MoneyMap.swiftpm/Sources/MoneyMapApp.swift`

- [ ] Add Packages as the fifth `TabView` item using `ticket.fill`.
- [ ] Build a package list showing provider, category, progress, and `remaining of total remaining`.
- [ ] Build package add and edit forms with provider, category, service, total, and notes.
- [ ] Build package detail with visit history and delete controls.
- [ ] Build visit add/edit forms with date/time, multi-service selection, staff, and notes.
- [ ] Validate at least one unique service and prevent selecting zero-balance services.
- [ ] Ensure deleting or editing visits updates balances because remaining values are derived from usages.
- [ ] Compile the complete iOS executable and run all FinanceCore tests.
- [ ] Commit with `git commit -m "feat: add prepaid packages tab"`.

### Task 4: Final verification and delivery

**Files:**
- Modify: `INSTALL.md`
- Update: `outputs/MoneyMap-iPhone-App.zip`

- [ ] Verify the seeded Manicure balance is four and the other seeded balances equal their totals.
- [ ] Verify DashboardCalculator inputs still include only assets, cards, and future plans.
- [ ] Run all FinanceCore tests, iPhone source type-check, full iOS compile/link, plist validation, and `git diff --check`.
- [ ] Update installation notes to mention the Packages tab and local SwiftData persistence.
- [ ] Refresh and integrity-test the final ZIP archive.
