# GitHub Upload and Firebase Auto Deploy

This project is ready for GitHub auto deploy using GitHub Actions and Firebase Hosting.

## 1. Create GitHub repository

1. Go to [GitHub](https://github.com/new).
2. Repository name: `myworth-web`.
3. Choose Private or Public.
4. Do not add README, `.gitignore`, or license because this project already has files.

## 2. Push this project

From Terminal:

```bash
cd /Users/bao/Documents/Codex/2026-07-02/superpowers-plugin-superpowers-openai-curated-remote/MyWorth-Web
git init
git add .
git commit -m "feat: create myworth web app"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/myworth-web.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username.

## 3. Add GitHub Secrets

GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add these Firebase web config secrets from your local `.env`:

```txt
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## 4. Connect Firebase Hosting to GitHub

Run:

```bash
firebase login
firebase init hosting:github
```

Use these answers:

- GitHub repository: `YOUR_GITHUB_USERNAME/myworth-web`
- Set up workflow to run build before deploy: `Yes`
- Build command: `npm ci && npm run test && npm run build`
- Public directory: `dist`
- Deploy to live channel on merge to main: `Yes`
- Branch: `main`

This command should create this GitHub secret automatically:

```txt
FIREBASE_SERVICE_ACCOUNT_MYWORTH_F5331
```

If the secret name is different, update the two workflow files in `.github/workflows/`.

## 5. Auto deploy

After the GitHub secrets are ready, every push to `main` will:

1. install dependencies
2. run tests
3. build the app
4. deploy to Firebase Hosting

## 6. Manual deploy fallback

If GitHub deploy fails, you can still deploy manually:

```bash
npm run build
firebase deploy
```
