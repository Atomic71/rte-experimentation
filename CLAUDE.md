# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on port 5173 with LAN access
- `npm run build` - Build for production (TypeScript compilation + Vite build + HTML export)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler without emitting files

### Build Process
The build process has three steps:
1. `tsc` - TypeScript compilation
2. `vite build` - Vite bundling with single-file output
3. `node scripts/make-html-export.mjs` - Exports HTML as JavaScript module

## Architecture

This is a React + Slate.js rich text editor designed to run in WebView environments (React Native, mobile apps). Key architectural patterns:

### WebView Integration
- Main entry point: `src/main.tsx` (not App.tsx)
- Uses `window.ReactNativeWebView.postMessage()` for communication with native app
- Listens for messages on both `window` and `document` for cross-platform compatibility
- Posts `READY` event on mount and `CHANGE` events on content updates

### Rich Text Editor
- Built with Slate.js framework (`slate`, `slate-react`, `slate-dom`)
- Single editor instance with React state management
- Supports external content updates via `SET_CONTENT` messages

### Build Configuration
- Vite with `vite-plugin-singlefile` for single HTML file output
- All assets inlined (100MB limit) for WebView compatibility
- Base path set to `./` for `file://` protocol loading
- ES2018 target for broader compatibility
- No source maps in production

### Styling
- Global dark theme with light mode fallback
- System fonts with fallbacks
- Responsive design starting at 320px minimum width