# MyWorth Web Design

## Goal

Create a new mobile-first web version of MyWorth without touching the existing Swift iPhone app. The web app stores each signed-in user's finance and package data in Firebase.

## Approved approach

Use React, TypeScript, Ant Design, Firebase Authentication, Cloud Firestore, and Firebase Hosting. Start with email and password login only.

## Scope

- Create a separate project folder named `MyWorth-Web`.
- Keep MYR as the only currency.
- Provide mobile-first pages: Dashboard, Assets, Cards, Plans, Packages, Settings.
- Store all records under the authenticated Firebase user ID.
- Support add, edit, delete, sorting, hide/show values, JSON export, and JSON import.
- Do not seed mock data.
- Leave Firebase config as environment variables until the user creates the Firebase project.

## Data model

Firestore paths:

- `users/{uid}/assets/{assetId}`
- `users/{uid}/cards/{cardId}`
- `users/{uid}/plans/{planId}`
- `users/{uid}/packages/{packageId}`
- `users/{uid}/visits/{visitId}`

Card recurring items are stored inside the card document. Outstanding is calculated from active recurring items and is not manually entered.

## Dashboard rules

The Dashboard shows total assets by default. A toggle reveals after-card-outstanding and after-future-plan totals. Hidden values render as `****`.

## Firebase free-plan expectation

Firebase Spark plan is suitable for personal use if usage remains inside the official free quotas. The app avoids Cloud Functions and paid-only features.

## Firebase setup needed from user

The user must create a Firebase project, enable Email/Password sign-in, create Firestore, and provide the web app Firebase config values.
