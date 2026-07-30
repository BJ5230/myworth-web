# MyWorth Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline because the user asked to avoid extra AI workflow/subagent token cost. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a separate React + Firebase web app for MyWorth with mobile-first pages and cloud storage.

**Architecture:** A Vite React app lives in `MyWorth-Web`. UI pages use Ant Design components and shared calculation helpers. Firebase Auth gates the app, and Firestore hooks sync each page's records under the current user ID.

**Tech Stack:** React 19, TypeScript, Vite, Ant Design, Firebase Web SDK, Vitest.

## Global Constraints

- Do not modify the existing Swift iPhone app folders.
- Keep the project separate in `MyWorth-Web`.
- Use email and password login.
- Store user data in Firestore under `users/{uid}`.
- MYR is the only currency.
- No mock data.
- Mobile-first layout.

---

### Task 1: Project scaffold

**Files:**
- Create: `MyWorth-Web/package.json`
- Create: `MyWorth-Web/index.html`
- Create: `MyWorth-Web/tsconfig.json`
- Create: `MyWorth-Web/tsconfig.node.json`
- Create: `MyWorth-Web/vite.config.ts`
- Create: `MyWorth-Web/.gitignore`
- Create: `MyWorth-Web/.env.example`

**Interfaces:**
- Produces a Vite React TypeScript app shell.

- [x] Create the scaffold files manually without touching the Swift app.
- [x] Add scripts for `dev`, `build`, `preview`, and `test`.

### Task 2: Firebase and domain logic

**Files:**
- Create: `MyWorth-Web/src/firebase.ts`
- Create: `MyWorth-Web/src/types.ts`
- Create: `MyWorth-Web/src/utils/format.ts`
- Create: `MyWorth-Web/src/utils/calculations.ts`
- Create: `MyWorth-Web/src/utils/text.ts`
- Create: `MyWorth-Web/src/utils/calculations.test.ts`

**Interfaces:**
- Produces reusable money formatting, title casing, card outstanding, package remaining, and dashboard calculations.

- [x] Add Firebase env config reader.
- [x] Add typed records for assets, cards, plans, packages, and visits.
- [x] Add Vitest coverage for dashboard, card recurring, and package remaining logic.

### Task 3: Firestore sync and authentication

**Files:**
- Create: `MyWorth-Web/src/hooks/useAuth.ts`
- Create: `MyWorth-Web/src/hooks/useUserCollection.ts`
- Create: `MyWorth-Web/src/pages/AuthPage.tsx`

**Interfaces:**
- Produces authenticated user state and CRUD helpers for user-scoped Firestore collections.

- [x] Add email/password login and account creation.
- [x] Add real-time Firestore collection sync.
- [x] Keep Firebase setup errors visible and understandable.

### Task 4: Mobile-first app UI

**Files:**
- Create: `MyWorth-Web/src/main.tsx`
- Create: `MyWorth-Web/src/App.tsx`
- Create: `MyWorth-Web/src/styles.css`
- Create: `MyWorth-Web/src/components/AppShell.tsx`
- Create: `MyWorth-Web/src/components/EmptyState.tsx`
- Create: `MyWorth-Web/src/components/MoneyText.tsx`

**Interfaces:**
- Produces the shared app layout, bottom navigation, theme, empty states, and hide/show money behavior.

- [x] Add Dashboard, Assets, Cards, Plans, Packages, and Settings tabs.
- [x] Use mobile-first widths and spacing.

### Task 5: Record pages

**Files:**
- Create: `MyWorth-Web/src/pages/DashboardPage.tsx`
- Create: `MyWorth-Web/src/pages/AssetsPage.tsx`
- Create: `MyWorth-Web/src/pages/CardsPage.tsx`
- Create: `MyWorth-Web/src/pages/PlansPage.tsx`
- Create: `MyWorth-Web/src/pages/PackagesPage.tsx`
- Create: `MyWorth-Web/src/pages/SettingsPage.tsx`

**Interfaces:**
- Produces all editable app pages.

- [x] Add, edit, delete assets.
- [x] Add, edit, delete cards and recurring card items.
- [x] Add, edit, delete plans.
- [x] Add, edit, delete packages and visit history.
- [x] Add JSON export/import for all latest fields.

### Task 6: Firebase setup docs and verification

**Files:**
- Create: `MyWorth-Web/README.md`
- Create: `MyWorth-Web/FIREBASE_SETUP.md`
- Create: `MyWorth-Web/firebase.json`

**Interfaces:**
- Produces clear setup instructions for the user.

- [x] Document Firebase project setup.
- [x] Document local run and hosting deploy.
- [x] Run local verification possible without network-installed packages.
