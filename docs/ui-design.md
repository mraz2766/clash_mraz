# Desktop UI design

The frontend uses React, MUI, Emotion and SCSS. Theme values live in
src/pages/_theme.tsx; useCustomTheme maps the active palette to MUI and
--md-* CSS custom properties. Shared component overrides live in
src/pages/material-components.ts. Geometry tokens live in index.scss.

Use opaque neutral surfaces, outlined cards and a blue container for selection.
Keep semantic status colours for success, warning and failure. Node latency
colour presentation lives in proxy-status-color.ts and does not change the
core's timeout classification, measurements or sorting. The default node layout
is one column; existing explicit multi-column preferences remain available.

The font stack uses Segoe UI Variable, Segoe UI and Apple system fallbacks.
No external font downloads, native blur APIs or platform-specific window controls
were introduced. Existing titlebar, drag, resize and window-decoration code is
retained. Reduced-motion preferences and visible keyboard focus are supported.

Settings use section headers and divided rows. Connections retain the existing
virtual table and sticky header. Rules remain a virtual dense list. Profiles use
outlined cards, with a primary container for the active subscription. Custom
colour, background and layout preferences remain available.

Validation: frontend TypeScript/Vite build, ESLint on changed sources, existing
Vitest suite, and isolated browser previews of the actual shared components in
light/dark at 1280x720 and 800x600. Preview mocks never contact the proxy core.
Native Windows 10/11 and macOS window interaction still requires a packaged-app
smoke check on those systems; the browser preview is not native integration QA.
