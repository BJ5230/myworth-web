# Prepaid Packages Design

## Purpose

Add a fifth Packages tab to MoneyMap for tracking prepaid beauty, gym, medical, car-wash, and similar session packages. Package data is private local data and never contributes to assets, card debt, future plans, or dashboard financial totals.

## Navigation

The bottom tabs become Dashboard, Assets, Cards, Plans, and Packages. Packages uses the system ticket icon and opens a list of active prepaid services.

## Package records

Each package records:

- Shop or provider name
- Category: Beauty, Gym, Medical, Car Wash, or Other
- Service name
- Total purchased sessions
- Optional notes
- Created and last-updated dates

Remaining sessions are calculated from visit usage rather than stored independently:

`remaining = max(total sessions - usage count, 0)`

The list shows the service, provider, progress, and a label such as `14 of 15 remaining`. Packages with zero remaining sessions are shown as completed.

## Visits

A visit records:

- Date and time
- One or more selected package services
- One session used for each selected service
- Optional staff member
- Optional notes

One visit can use several treatments at the same date and time. The app prevents selecting a service with no sessions remaining.

Editing a visit changes its date, time, treatments, staff, or notes and recalculates all affected balances. Deleting a visit restores one session to each service used by that visit. Deleting a package requires confirmation and removes its related usage entries from visits.

## Starting data

The app seeds these packages only when no package records exist:

| Service | Total sessions |
|---|---:|
| Aqua Facial | 15 |
| Eye Treatment | 15 |
| Oxygen Spray | 10 |
| Hydrating Facial | 5 |
| Hot Stone Massage | 5 |
| Lymphatic Massage | 5 |
| Aroma Massage | 5 |
| Jacuzzi Spa | 5 |
| MK AI Care | 5 |
| Manicure | 5 |

The screenshot shows Manicure with four remaining sessions. The seed therefore includes one historical Manicure usage entry so the calculated balance begins at four.

## Data and privacy

`ServicePackage` and `PackageVisit` are local SwiftData models included in the existing model container. They use the same Face ID/passcode protection as all other MoneyMap data. Uninstalling the app deletes package data. No package information is synced or transmitted.

## Validation

- Provider and service names cannot be blank.
- Total sessions must be at least one.
- A visit must select at least one service.
- A service cannot be selected more than once in one visit.
- A visit cannot consume a service whose calculated balance is zero.
- All package and visit fields can be edited; both record types can be deleted with confirmation.

## Testing and acceptance

- Starting packages match the approved spreadsheet and Manicure begins at four remaining.
- Adding a single-service visit reduces that service by one.
- Adding a multi-service visit reduces every selected service by one.
- Editing or deleting a visit recalculates affected balances.
- Zero-balance services cannot be consumed.
- Package records do not change any dashboard financial total.
- Packages persist locally across app relaunches.
