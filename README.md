# SwapSkill — Community Skill Exchange Platform

One project covering:
- **Experiment 1** — Responsive & interactive UI, built with Tailwind CSS (installed via npm/PostCSS, not the CDN script).
- **Experiment 2** — React Hooks: `useEffect`, `useContext`, and custom hooks.

Plus a login page, a swap-hour credit balance, incoming-request
notifications, and an interactive swap-proposal modal — matching the
"Peer-to-Peer Engagement," "Credit Management," and "Seamless
Interaction" objectives from the Exp 1 write-up.

## Setup

```bash
npm install
npm run dev
```

Open the URL Vite prints. Sign in with any name + email (mock login,
nothing is sent anywhere) and you're in.

## How Tailwind CSS is integrated (Exp 1)

- `tailwind.config.js` — custom theme tokens (SwapSkill's colors/fonts)
- `postcss.config.js` — wires `tailwindcss` + `autoprefixer` together
- `src/index.css` — `@tailwind base/components/utilities` plus a handful
  of `@layer components` classes for effects utilities can't express
  directly (the flip-ticket transform, notch cutouts, etc.)
- Vite compiles this automatically on `npm run dev` / `npm run build` —
  no manual build step needed like the old CDN-based version.

## Where each React Hook lives (Exp 2)

| Hook | File | What it does |
|---|---|---|
| `useContext` (skills) | `src/context/SkillsContext.jsx`, consumed in `Browse.jsx` | Shares skill list, loading flag, search term, category. |
| `useContext` (app) | `src/context/AppContext.jsx`, consumed in `Navbar`, `SkillCard`, `NotificationBell`, `CreditBadge`, `ProposalModal`, `LoginPage`, `App` | Shares auth state, credit balance, notifications, and the proposal-modal target. |
| `useEffect` | `SkillsContext.jsx` | Simulated API fetch on mount + syncing `document.title`. |
| `useEffect` | `NotificationBell.jsx` | Closes the dropdown on outside click. |
| Custom hook — `useDebouncedValue` | `src/hooks/useDebouncedValue.js` | Debounces the search input. |
| Custom hook — `useModal` | `src/hooks/useModal.js` | Open/close + Escape-key handling, reused by the "List a skill" modal. |
| Custom hook — `useLocalStorage` | `src/hooks/useLocalStorage.js` | Persists login state and credit balance across page reloads. |

## Feature → write-up objective mapping

- **Login page** (`LoginPage.jsx`) — gates the app; `App.jsx` renders it
  whenever `AppContext`'s `user` is null.
- **Credit Management** — `CreditBadge.jsx` shows the live balance;
  accepting a notification in `NotificationBell.jsx` increases it by the
  swap's listed hours.
- **Seamless Interaction** — `NotificationBell.jsx` (incoming requests,
  accept/decline) and `ProposalModal.jsx` (pick a skill to offer, send a
  proposal) — opened from each `SkillCard`'s "Propose a swap" button.
- **Responsive Web Design** — mobile menu toggle, responsive grid,
  flexible layouts throughout.
- **Dynamic UI & Filtering** — category tabs + debounced search in
  `Browse.jsx`.

## Project structure

```
swapskill-react/
├── index.html
├── package.json / vite.config.js / tailwind.config.js / postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── data/skills.js
    ├── context/
    │   ├── SkillsContext.jsx
    │   └── AppContext.jsx
    ├── hooks/
    │   ├── useDebouncedValue.js
    │   ├── useModal.js
    │   └── useLocalStorage.js
    └── components/
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── HowItWorks.jsx
        ├── Browse.jsx
        ├── SkillCard.jsx
        ├── Stories.jsx
        ├── Footer.jsx
        ├── ListSkillModal.jsx
        ├── ProposalModal.jsx
        ├── NotificationBell.jsx
        ├── CreditBadge.jsx
        └── LoginPage.jsx
```
