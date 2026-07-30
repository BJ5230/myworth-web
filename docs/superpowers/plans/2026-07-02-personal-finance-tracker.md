# Personal Finance Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private SwiftUI iPhone app for assets, credit-card balances and installments, future plans, and three dashboard totals.

**Architecture:** A small Swift package owns framework-independent financial calculations and validation. The iOS app uses SwiftData models, four focused SwiftUI feature folders, and narrow services for authentication, notifications, and seed data. XcodeGen provides a reviewable project definition and generates the `.xcodeproj` without hand-editing project metadata.

**Tech Stack:** Swift 6, SwiftUI, SwiftData, LocalAuthentication, UserNotifications, Swift Testing/XCTest, XcodeGen, iOS 17+

---

## File structure

- `project.yml`: XcodeGen targets, deployment version, signing-neutral settings, test target.
- `FinanceCore/Package.swift`: standalone calculation package testable before full Xcode is available.
- `FinanceCore/Sources/FinanceCore/`: decimal money, dashboard calculation, plan and installment rules, validation.
- `FinanceCore/Tests/FinanceCoreTests/`: pure unit tests.
- `MoneyMap/App/`: app entry point, root tabs, lock overlay.
- `MoneyMap/Models/`: SwiftData records and enums.
- `MoneyMap/Services/`: seed data, authentication, and notification scheduling.
- `MoneyMap/Features/Dashboard/`: three totals and upcoming items.
- `MoneyMap/Features/Assets/`: list and category-aware asset form.
- `MoneyMap/Features/Cards/`: card list/form, installment list/form.
- `MoneyMap/Features/Plans/`: future-plan list and form.
- `MoneyMap/Shared/`: MYR formatting and reusable value cards/form controls.
- `MoneyMapTests/`: persistence, seed, and app-service tests.
- `INSTALL.md`: physical-iPhone installation guide.

### Task 1: Create the project skeleton and calculation package

**Files:**
- Create: `FinanceCore/Package.swift`
- Create: `FinanceCore/Sources/FinanceCore/Money.swift`
- Create: `FinanceCore/Tests/FinanceCoreTests/MoneyTests.swift`
- Create: `project.yml`

- [ ] **Step 1: Write the failing money tests**

```swift
import Testing
@testable import FinanceCore

@Test func moneyRejectsNegativeAndNonFiniteValues() {
    #expect(Money(validating: -1) == nil)
    #expect(Money(validating: .nan) == nil)
    #expect(Money(validating: 12.50)?.decimal == Decimal(string: "12.5"))
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd FinanceCore && swift test`
Expected: FAIL because `Money` does not exist.

- [ ] **Step 3: Implement the package and Money type**

```swift
public struct Money: Sendable, Equatable, Comparable {
    public let decimal: Decimal
    public init?(validating value: Double) {
        guard value.isFinite, value >= 0 else { return nil }
        decimal = Decimal(value)
    }
    public init(decimal: Decimal) { self.decimal = decimal }
    public static func < (lhs: Self, rhs: Self) -> Bool { lhs.decimal < rhs.decimal }
}
```

Define `Package.swift` with a `FinanceCore` library and test target. Define `project.yml` with `MoneyMap` (iOS application, iOS 17) and `MoneyMapTests` targets, automatic Info.plist generation, Face ID usage text, and source dependencies on the local package.

- [ ] **Step 4: Verify and commit**

Run: `cd FinanceCore && swift test`
Expected: PASS.

Commit: `git add FinanceCore project.yml && git commit -m "build: scaffold finance app and core package"`

### Task 2: Implement financial rules with TDD

**Files:**
- Create: `FinanceCore/Sources/FinanceCore/DashboardCalculator.swift`
- Create: `FinanceCore/Sources/FinanceCore/InstallmentRules.swift`
- Create: `FinanceCore/Tests/FinanceCoreTests/DashboardCalculatorTests.swift`
- Create: `FinanceCore/Tests/FinanceCoreTests/InstallmentRulesTests.swift`

- [ ] **Step 1: Write failing calculation tests**

```swift
@Test func dashboardSubtractsCardsAndOnlyRemainingActivePlans() {
    let result = DashboardCalculator.calculate(
        assets: [500, 15_000, 21_000, 2_000, 2_300, 5_200, 4_200],
        cardBalances: [2_000, 1_000],
        plans: [.init(budget: 20_000, spent: 5_000, isIncluded: true),
                .init(budget: 9_000, spent: 0, isIncluded: false)]
    )
    #expect(result.totalAssets == 50_200)
    #expect(result.afterCards == 47_200)
    #expect(result.afterPlans == 32_200)
}

@Test func finalInstallmentCompletesAutomatically() {
    #expect(InstallmentRules.status(current: 11, total: 12) == .active)
    #expect(InstallmentRules.status(current: 12, total: 12) == .completed)
}
```

- [ ] **Step 2: Run tests and confirm missing-type failures**

Run: `cd FinanceCore && swift test`
Expected: FAIL for missing calculator and installment rules.

- [ ] **Step 3: Implement pure calculations**

`DashboardCalculator.calculate` sums decimals, subtracts authoritative card balances, and subtracts `max(budget - spent, 0)` only when `isIncluded`. `InstallmentRules.status` validates `total >= 1` and `1...total` progress, returning completed exactly at the final installment. Do not include installment balances in dashboard debt.

- [ ] **Step 4: Run all core tests and commit**

Run: `cd FinanceCore && swift test`
Expected: PASS with four tests and no warnings.

Commit: `git add FinanceCore && git commit -m "feat: add dashboard and installment calculations"`

### Task 3: Add SwiftData models and first-launch seed data

**Files:**
- Create: `MoneyMap/Models/Asset.swift`
- Create: `MoneyMap/Models/CreditCard.swift`
- Create: `MoneyMap/Models/InstallmentPlan.swift`
- Create: `MoneyMap/Models/FuturePlan.swift`
- Create: `MoneyMap/Models/FinanceEnums.swift`
- Create: `MoneyMap/Services/SeedDataService.swift`
- Create: `MoneyMapTests/SeedDataServiceTests.swift`

- [ ] **Step 1: Write failing seed tests**

```swift
func testSeedCreatesExpectedRecordsOnlyOnce() throws {
    let context = try TestStore.makeContext()
    try SeedDataService.seedIfNeeded(context: context)
    XCTAssertEqual(try context.fetch(FetchDescriptor<Asset>()).map(\.currentValue).reduce(0, +), 50_200)
    XCTAssertEqual(try context.fetch(FetchDescriptor<CreditCard>()).map(\.issuer).sorted(), ["Maybank", "UOB"])
    try SeedDataService.seedIfNeeded(context: context)
    XCTAssertEqual(try context.fetchCount(FetchDescriptor<Asset>()), 7)
}
```

- [ ] **Step 2: Generate the project and confirm the test fails**

Run: `xcodegen generate && xcodebuild test -scheme MoneyMap -destination 'platform=iOS Simulator,name=iPhone 16'`
Expected: FAIL because models and service are missing. If Xcode is not installed, record this check as pending and continue with core tests only.

- [ ] **Step 3: Implement focused SwiftData models**

Use `Decimal` for money, UUID identifiers, timestamps, raw-value enums, and an explicit `CreditCard` relationship for installments. Store plan status so completed/cancelled items can be filtered. `SeedDataService` inserts the seven approved assets and two zero-balance card presets only when all four model tables are empty.

- [ ] **Step 4: Run tests and commit**

Expected: seed total RM50,200, issuers Maybank/UOB, second seed has no effect.

Commit: `git add MoneyMap/Models MoneyMap/Services MoneyMapTests && git commit -m "feat: add finance records and starting data"`

### Task 4: Build app shell, formatting, and dashboard

**Files:**
- Create: `MoneyMap/App/MoneyMapApp.swift`
- Create: `MoneyMap/App/RootTabView.swift`
- Create: `MoneyMap/Shared/MYRFormatStyle.swift`
- Create: `MoneyMap/Shared/MetricCard.swift`
- Create: `MoneyMap/Features/Dashboard/DashboardView.swift`

- [ ] **Step 1: Add formatting tests**

```swift
func testMYRFormatting() {
    XCTAssertEqual(MYRFormatter.string(from: 50_200), "RM50,200.00")
}
```

- [ ] **Step 2: Confirm the formatter test fails**

Run the `MoneyMapTests` scheme; expect missing `MYRFormatter`.

- [ ] **Step 3: Implement the shell**

Create a `TabView` whose labels are exactly Dashboard, Assets, Cards, and Plans using SF Symbols. Inject the SwiftData container at app launch, seed once, and query models in `DashboardView`. Convert model values to `FinanceCore` inputs and render Total Assets, After Credit Cards, and After Future Plans with accessible `MetricCard` views. Add upcoming due-date and active-plan sections.

- [ ] **Step 4: Verify and commit**

Run core tests and, with Xcode available, app tests plus an iPhone simulator build.

Commit: `git add MoneyMap MoneyMapTests && git commit -m "feat: add four-tab shell and dashboard"`

### Task 5: Build asset management

**Files:**
- Create: `MoneyMap/Features/Assets/AssetListView.swift`
- Create: `MoneyMap/Features/Assets/AssetFormView.swift`
- Create: `MoneyMap/Features/Assets/GoldFieldsView.swift`
- Create: `MoneyMap/Features/Assets/BankFieldsView.swift`
- Create: `MoneyMap/Shared/MoneyField.swift`
- Create: `MoneyMapTests/AssetValidationTests.swift`

- [ ] **Step 1: Write failing validation tests**

Test blank names, negative/non-finite values, the RM1,000 multiplier, custom Other names, and valid bank/gold records.

- [ ] **Step 2: Confirm failures, then implement**

Build a grouped asset list with total, add/edit sheets, swipe delete confirmation, all approved categories, ownership label, dates, and notes. Reveal bank fields only for Bank Account/Fixed Deposit and gold fields only for Gold. Keep current value mandatory; specialty metadata remains optional.

- [ ] **Step 3: Verify and commit**

Expected: validation tests pass; add/edit/delete immediately changes dashboard totals.

Commit: `git add MoneyMap/Features/Assets MoneyMap/Shared MoneyMapTests && git commit -m "feat: add asset tracking"`

### Task 6: Build cards, installments, and reminders

**Files:**
- Create: `MoneyMap/Features/Cards/CardListView.swift`
- Create: `MoneyMap/Features/Cards/CardFormView.swift`
- Create: `MoneyMap/Features/Cards/CardDetailView.swift`
- Create: `MoneyMap/Features/Cards/InstallmentFormView.swift`
- Create: `MoneyMap/Services/NotificationService.swift`
- Create: `MoneyMapTests/CardValidationTests.swift`
- Create: `MoneyMapTests/NotificationServiceTests.swift`

- [ ] **Step 1: Write failing card and installment tests**

Test issuer/name requirements, non-negative balance, optional over-limit warning, progress bounds, 11/12 active, 12/12 completed, and stable notification identifiers.

- [ ] **Step 2: Implement cards and installments**

Show card outstanding totals and due dates. Forms capture the approved card fields without full card numbers. Card details show installments as `Purpose · 11/12 · remaining · total`. Saving the final progress marks a plan completed. The dashboard continues to use only card outstanding balances.

- [ ] **Step 3: Implement local reminders**

Wrap `UNUserNotificationCenter` behind a protocol. Ask permission only when enabling reminders; schedule calendar notifications from the due day and lead time; replace pending requests on edit and remove them on delete. Permission denial saves the card and displays a nonblocking explanation.

- [ ] **Step 4: Verify and commit**

Expected: tests pass; reminder requests contain the correct card identifier and date components.

Commit: `git add MoneyMap/Features/Cards MoneyMap/Services MoneyMapTests && git commit -m "feat: add cards installments and reminders"`

### Task 7: Build future plans

**Files:**
- Create: `MoneyMap/Features/Plans/PlanListView.swift`
- Create: `MoneyMap/Features/Plans/PlanFormView.swift`
- Create: `MoneyMapTests/PlanValidationTests.swift`

- [ ] **Step 1: Write failing plan tests**

Test required name, non-negative budget/spend, over-budget remaining value of zero, and inclusion only for Planning/Active statuses.

- [ ] **Step 2: Implement and verify plans**

Build list progress, category/status filters, and add/edit/delete forms. Display over-budget amount when spent exceeds budget. Confirm completed/cancelled records disappear from the dashboard deduction without being deleted.

- [ ] **Step 3: Commit**

Commit: `git add MoneyMap/Features/Plans MoneyMapTests && git commit -m "feat: add future expense plans"`

### Task 8: Add Face ID/passcode lock and privacy lifecycle

**Files:**
- Create: `MoneyMap/Services/AuthenticationService.swift`
- Create: `MoneyMap/App/AppLockView.swift`
- Create: `MoneyMapTests/AuthenticationServiceTests.swift`

- [ ] **Step 1: Write failing authentication-state tests**

Test launch locked, successful authentication unlocks, failure remains locked, and background transition relocks.

- [ ] **Step 2: Implement authentication**

Wrap `LAContext.evaluatePolicy(.deviceOwnerAuthentication, ...)` behind a protocol for tests. Keep all tab content behind an opaque lock screen, reveal no totals, retry on request, and relock on inactive/background scene phases.

- [ ] **Step 3: Verify and commit**

Expected: service tests pass; physical-device check confirms Face ID and passcode fallback.

Commit: `git add MoneyMap/App MoneyMap/Services MoneyMapTests && git commit -m "feat: protect finance data with device authentication"`

### Task 9: Accessibility, installation guide, and release verification

**Files:**
- Create: `INSTALL.md`
- Modify: all feature views where accessibility verification finds issues

- [ ] **Step 1: Write the installation guide**

Document: install/open full Xcode; generate/open `MoneyMap.xcodeproj`; sign in under Xcode Settings > Accounts; keep automatic signing; select Personal Team; connect/trust iPhone; enable Developer Mode if prompted; select the iPhone; press Run; respond to notification and Face ID prompts. Explain local-only data deletion on uninstall and current Apple provisioning limits without promising a fixed duration.

- [ ] **Step 2: Run automated verification**

Run: `cd FinanceCore && swift test`
Expected: all core tests pass.

Run: `xcodegen generate && xcodebuild test -scheme MoneyMap -destination 'platform=iOS Simulator,name=iPhone 16'`
Expected: all app tests pass when full Xcode is available.

- [ ] **Step 3: Run manual verification**

Verify four tabs, RM50,200 seed total, add/edit/delete flows, calculation updates, 11/12 and 12/12 behavior, reminders, relocking, dark mode, large text, fresh launch, relaunch persistence, and physical-iPhone installation.

- [ ] **Step 4: Commit**

Commit: `git add INSTALL.md MoneyMap && git commit -m "docs: add installation guide and finish accessibility"`

### Task 10: Final review

- [ ] **Step 1: Inspect the complete diff and repository status**

Run: `git diff main...HEAD --check && git status --short`
Expected: no whitespace errors and no unintended untracked files.

- [ ] **Step 2: Re-run every available test**

Run core tests unconditionally. Run Xcode tests/build and physical-device checks when full Xcode is installed. Report any unavailable verification explicitly rather than claiming it passed.

- [ ] **Step 3: Compare the finished app against every acceptance criterion in the design spec**

Expected: every criterion maps to passing automation or a completed manual check.
