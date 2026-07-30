# Personal Finance Tracker Design

## Purpose

Build a private native iPhone app that replaces the user's current spreadsheet for tracking assets, credit-card debt, installment plans, and planned future expenses. The app provides a realistic view of current net worth and money available after debts and planned spending.

## Product boundaries

- Native SwiftUI iPhone app.
- All monetary values use Malaysian Ringgit (MYR).
- Data is entered manually and remains on the iPhone.
- No account, backend, cloud sync, analytics, advertising, or network access.
- One combined financial view; personal and company-owned records are not separated in dashboard totals.
- Face ID or the device passcode protects access.
- Local notifications provide credit-card payment reminders.

## Navigation

The app has four bottom tabs:

1. Dashboard
2. Assets
3. Cards
4. Plans

Each list tab has an add action. Selecting a record opens its details and editing controls.

## Dashboard

The dashboard presents three primary values:

1. **Total Assets**: sum of all current asset values.
2. **After Credit Cards**: total assets minus all credit-card outstanding balances.
3. **After Future Plans**: total assets minus credit-card outstanding balances and remaining budgets for active future plans.

Calculations:

```
totalAssets = sum(asset.currentValue)
totalCardDebt = sum(card.outstandingBalance)
remainingPlanBudget = sum(max(plan.plannedBudget - plan.amountSpent, 0))
afterCards = totalAssets - totalCardDebt
afterPlans = afterCards - remainingPlanBudget
```

Only plans with `planning` or `active` status contribute to `remainingPlanBudget`. Completed and cancelled plans do not.

The dashboard also shows upcoming card due dates, active installments, active plans, and records whose values have not been updated recently.

## Assets

### Common fields

- Name
- Category
- Current MYR value
- Ownership label: Personal or Company
- Last-updated date
- Optional notes

Ownership is descriptive only. Both ownership types contribute to the same dashboard totals.

### Categories

- Bank account
- Fixed deposit
- Cash
- E-wallet
- ASNB or unit trust
- Stocks or ETF
- EPF or retirement
- Gold
- Property
- Vehicle
- Cryptocurrency
- Business value
- Money owed to the user
- Other

The Other category accepts a custom category name. Values may be entered as full MYR amounts or with a convenience control that multiplies an entered value by RM1,000.

### Bank account details

- Bank preset: Maybank, CIMB, Hong Leong, or Other
- Account name
- Account type: Savings, Current, or Fixed Deposit
- Common asset fields

### Gold details

- Description
- Form: Jewellery, Bar, Coin, or Other
- Weight in grams
- Purity: 999, 916, 750, or Custom
- Optional purchase price and purchase date
- Current MYR value
- Common asset fields

Gold valuation remains manual so the app can remain offline.

### Starting data

The app seeds these records on first launch:

| Asset | Value |
|---|---:|
| Hong Leong Bank | RM500 |
| BJ Visual Studio | RM15,000 |
| Maybank Tabung | RM21,000 |
| CIMB | RM2,000 |
| Gold | RM2,300 |
| ASNB | RM5,200 |
| Stocks | RM4,200 |
| **Total** | **RM50,200** |

The initial records can be edited or deleted. Empty categories from the source spreadsheet are available as categories but are not seeded as zero-value records.

## Credit cards

The initial card presets are Maybank and UOB. A user can add another issuer later.

### Card fields

- Issuer
- Card nickname
- Optional last four digits
- Current outstanding balance
- Credit limit
- Statement day
- Payment due date
- Minimum payment
- Reminder timing
- Optional notes

Only `outstandingBalance` contributes to dashboard debt. The app never stores a full card number, security code, PIN, username, or password.

### Reminders

The app requests notification permission only when the user enables reminders. It schedules local notifications before the due date using the selected lead time. Editing or deleting a card reschedules or removes its notifications.

## Installment plans

Each installment belongs to one credit card.

### Fields

- Purpose
- Current installment number
- Total number of installments
- Monthly installment amount
- Remaining balance
- Original total
- Optional start date
- Optional notes
- Status: Active or Completed

Example display:

`iPhone · 11/12 · RM300 remaining · RM3,600 total`

When the current installment reaches the total installment count, the plan is automatically marked completed. Installment balances are informational and are not added to credit-card debt because the card's current outstanding balance is the authoritative debt figure. This prevents double-counting.

## Future plans

Future plans represent anticipated expenses such as a house renovation or travel.

### Fields

- Name
- Category: Home, Travel, Education, Vehicle, Family, or Other
- Planned budget
- Amount already spent
- Calculated remaining budget
- Optional expected date
- Status: Planning, Active, Completed, or Cancelled
- Optional notes

`remainingBudget = max(plannedBudget - amountSpent, 0)`

The app displays progress and includes only the unspent remainder of planning and active plans in the dashboard's After Future Plans calculation. This avoids subtracting money already reflected in lower asset balances twice.

## Privacy and authentication

- Persist records locally using SwiftData.
- Use LocalAuthentication with device-owner authentication, allowing Face ID with passcode fallback.
- Lock when the app launches and whenever it returns from the background.
- The lock screen reveals no financial totals.
- Do not request network entitlements or transmit financial information.

Local-only storage means uninstalling the app deletes its data. That behavior is explained during onboarding and in Settings.

## Validation and error handling

- Required text fields cannot be blank.
- Money values must be finite and non-negative.
- An installment count must be at least one; the current number must be between one and the total.
- Amount spent may exceed the original budget, but the remaining budget floors at zero and the UI identifies the overrun.
- A credit limit is optional; if present, an outstanding balance above it is allowed but highlighted.
- Invalid forms show inline messages and do not save.
- Deleting records requires confirmation.
- Notification denial does not block saving a card; the app explains that reminders are disabled.
- Authentication failure keeps the app locked and offers another attempt.

## Architecture

- SwiftUI views provide the four-tab interface and editing forms.
- SwiftData models represent `Asset`, `CreditCard`, `InstallmentPlan`, and `FuturePlan`.
- A calculation service provides dashboard totals as pure, independently testable functions.
- An authentication service wraps LocalAuthentication.
- A notification service owns local notification permission and scheduling.
- Seed-data logic creates the starting assets and initial Maybank/UOB card presets only when the local store is empty.

Views do not duplicate financial calculations or notification scheduling logic.

## Testing

Automated tests cover:

- The RM50,200 starting total.
- Asset total aggregation.
- Credit-card debt subtraction.
- Remaining future-plan budget and status filtering.
- Prevention of installment double-counting.
- Installment completion at the final payment.
- Validation of money and installment fields.
- Seed data being created only once.

Manual verification covers Face ID/passcode behavior, notification permission outcomes, local reminders, tab navigation, data persistence across relaunch, dark mode, Dynamic Type, and installation on a physical iPhone.

## Installation and delivery

The deliverable is an Xcode project plus a concise installation guide. On a Mac, the user will open the project in Xcode, choose their Apple ID under Signing & Capabilities, connect and trust the iPhone, select it as the run destination, and run the app. Device Developer Mode and trust prompts are handled in the guide when required by the installed iOS/Xcode versions.

A free Apple ID can be used for personal device installation subject to Apple's current provisioning limits. TestFlight or App Store distribution is outside the first version.

## Acceptance criteria

- The app opens behind device-owner authentication.
- The four bottom tabs are Dashboard, Assets, Cards, and Plans.
- The seeded assets total RM50,200.
- Asset, card, installment, and plan records can be added, edited, and deleted.
- Dashboard totals update immediately and follow the documented formulas.
- Maybank and UOB are available as initial cards.
- Installment progress supports displays such as 11/12 and completes at 12/12.
- Card reminders use local notifications.
- Data persists locally without any network dependency.
