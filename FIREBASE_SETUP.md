# Firebase Setup for MyWorth Web

## 1. Create Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**.
3. Name it `MyWorth`.
4. Google Analytics is optional. You can disable it for this personal app.

## 2. Add web app

1. In the project overview, click the web icon `</>`.
2. App nickname: `MyWorth Web`.
3. Register the app.
4. Firebase will show config values like `apiKey`, `authDomain`, and `projectId`.

## 3. Add config to this project

1. In `MyWorth-Web`, copy `.env.example` to `.env`.
2. Paste the Firebase config values:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 4. Enable email/password login

1. Firebase Console → **Authentication**.
2. Click **Get started**.
3. Go to **Sign-in method**.
4. Enable **Email/Password**.

## 5. Create Firestore database

1. Firebase Console → **Firestore Database**.
2. Click **Create database**.
3. Start in production mode.
4. Choose a nearby region.

## 6. Add Firestore security rules

Use these rules so each user can only read and write their own data:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. Run and test

```bash
npm install
npm run dev
```

Create an account in the app. Add one asset, refresh the page, and confirm it is still there.

## 8. Install Firebase CLI

If Terminal says `zsh: command not found: firebase`, install the Firebase command first:

```bash
npm install -g firebase-tools
```

Then check it:

```bash
firebase --version
```

## 9. Deploy free hosting

```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

Important: run each command one by one. Do not paste them as one long line.

When `firebase init hosting` asks questions, use these answers:

- Use an existing project: choose your MyWorth Firebase project.
- Public directory: `dist`
- Configure as a single-page app: `Yes`
- Set up automatic builds/deploys with GitHub: `No`
- File `dist/index.html` already exists, overwrite: `No`

After that, deploy:

```bash
npm run build
firebase deploy
```
