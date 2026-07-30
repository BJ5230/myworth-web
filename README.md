# MyWorth Web

Mobile-first React web app for recording assets, credit card installments, future plans, and prepaid package visits.

## What is included

- Firebase email/password login
- Firestore cloud storage per user
- MYR only
- Dashboard with hide/show values
- Assets, cards, plans, packages, and visit history
- Editable and deletable records
- Credit card outstanding calculated from active monthly recurring items
- JSON export/import backup
- No mock data

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example`.

3. Add your Firebase web config values.

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open the local URL shown in Terminal.

## Build

```bash
npm run build
```

## Deploy to Firebase Hosting

After Firebase is configured:

```bash
npm run build
firebase deploy
```

Read `FIREBASE_SETUP.md` for the Firebase console steps.
