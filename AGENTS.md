# g8homemarket Agent Guide

This repository is a Zalo Mini App template built with Vite, React, Jotai, Tailwind, and `zmp-ui`. Start with [README.md](README.md), [app-config.json](app-config.json), [package.json](package.json), [src/router.tsx](src/router.tsx), [src/components/layout.tsx](src/components/layout.tsx), [src/state.ts](src/state.ts), and [src/utils/request.ts](src/utils/request.ts).

## Working Rules

- Use `zmp start` for local development, `zmp deploy` for release, and `npm run build:css` after changing the Tailwind CSS entry files.
- Keep routing changes in [src/router.tsx](src/router.tsx). Route `handle` metadata drives the shared layout, header, footer, and floating cart behavior.
- Keep global app state in [src/state.ts](src/state.ts). Prefer extending existing atoms and hooks instead of introducing a new state system.
- Load server data through [src/utils/request.ts](src/utils/request.ts). It falls back to [src/mock/*.json](src/mock) when `template.apiUrl` is empty, so keep mock payloads aligned with API shapes.
- Treat [app-config.json](app-config.json) as the source of truth for app-level configuration. `src/app.ts` injects it into `window.APP_CONFIG`.
- Preserve the existing component/page split under [src/components](src/components) and [src/pages](src/pages). Add new screens by registering them in the router and following the established handle conventions.
- This codebase uses Zalo Mini App APIs and environment checks such as `window.ZJSBridge`; be careful when changing auth, phone, location, or navigation flows.

## What To Link Instead Of Copying

- Product and setup details belong in [README.md](README.md).
- Mini App configuration belongs in [app-config.json](app-config.json) and [zmp-cli.json](zmp-cli.json).
- Styling conventions belong in [src/css](src/css) and [tailwind.config.js](tailwind.config.js).

## Practical Defaults

- Read the nearest feature page, its shared component, and the related atom or utility before editing.
- Keep changes small and consistent with the existing class-based layout and async atom patterns.
- If a change touches navigation or layout metadata, verify the relevant route `handle` entries and the shared header/footer logic together.