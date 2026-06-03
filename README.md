# TypeScript + Vite Data Explorer

This project is a Data Explorer web app built with TypeScript and Vite. It lets you inspect a dataset through interactive controls for search, category filtering, minimum revenue filtering, tag filtering, sorting, and record detail viewing.

## App Overview

The app provides:

- Interactive filters for query, category, minimum revenue, and tags
- Sort controls for revenue, active users, updated date, and name
- Summary cards (record count, total revenue, total users, average revenue, category breakdown)
- A data table with selectable rows
- A details panel for the selected record
- Basic error handling for initialization and user-input-driven state updates

## How to Run

From the workspace root:

1. Change into the app directory:

	```bash
	cd @latest
	```

2. Install dependencies:

	```bash
	npm install
	```

3. Start the development server:

	```bash
	npm run dev
	```

4. Open the local URL shown in the terminal (typically `http://localhost:5173`).

### Production Build

Create a production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Reflection

### 1) How TypeScript’s type system helped catch errors or improve code quality

TypeScript improved reliability by modeling the domain with explicit interfaces and unions (`DataRecord`, `ExplorerFilters`, `SortField`, `SortDirection`, `Category`). The compiler caught incompatible assignments early (for example, invalid sort fields and constructor syntax constraints), and `noImplicitAny` prevents untyped values from silently spreading through the codebase. Type guards around data loading also ensure runtime values match expected shapes before they enter UI logic.

### 2) Project structure decisions and module organization with import/export

The app is organized into focused modules under `@latest/src`:

- `main.ts`: app bootstrap, DOM rendering, event wiring, state transitions
- `data.ts`: dataset and async loading helper
- `explorer.ts`: pure data utilities (filtering, sorting, parsing, formatting)
- `types.ts`: shared type models and `SummaryBuilder` class
- `style.css`: UI styling

Using ES modules (`export` / `import`) keeps responsibilities separated and makes each piece easier to test, reason about, and reuse.

### 3) How Vite’s dev server and build pipeline supported development workflow

Vite’s dev server gave fast feedback while editing TypeScript and CSS, especially during UI iteration and event-handler updates. Hot module replacement kept iteration tight without full page reload overhead. The build pipeline (`tsc && vite build`) validated both static typing and production bundling, which made it straightforward to catch compiler and CSS issues before finalizing changes.

### 4) JavaScript patterns that were most useful and why

- **Destructuring:** made row rendering and filter logic clearer by unpacking only needed fields.
- **Spread operator:** simplified immutable updates (e.g., cloning filter state and arrays before sorting).
- **Closures:** enabled reusable behavior like tag matchers and safe action wrappers that retain context.
- **Array methods:** `map`, `filter`, `reduce`, `some`, and `every` made transformation logic concise and declarative for summaries, filtering, and validation.

## Scripts

In `@latest/package.json`:

- `npm run dev` — start Vite dev server
- `npm run build` — compile TypeScript and build for production
- `npm run preview` — preview the production build locally