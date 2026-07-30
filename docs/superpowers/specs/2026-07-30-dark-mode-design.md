# MyWorth Web Dark Mode Design

## Goal

Add a manual light/dark theme toggle to the MyWorth web app.

## Design

- Store the theme mode in browser local storage.
- Default to light mode when no preference exists.
- Use Ant Design light/dark algorithms for native components.
- Use CSS variables for app-level surfaces, text, shadows, banners, and bottom navigation.
- Keep existing blue gradient financial cards in both modes.
- Put the toggle in Settings so the bottom tab count stays the same as the iOS app.

## Verification

- Run `npm run test`.
- Run `npm run build`.
