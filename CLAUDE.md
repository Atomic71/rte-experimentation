# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server - opens at http://localhost:5173
npm run dev

# Type checking without emitting files
npm run typecheck

# Linting
npm run lint

# Production builds
npm run build        # Full build: tsc + vite + HTML export
npm run build:lib    # Library only: tsc with lib config

# Package management for local development
npm run yalc:publish    # Build library and publish with yalc
npm run link:local      # Build library and push to linked projects
```

## Architecture Overview

Rich text editor built with TipTap and WebView communication API for React Native integration.

### Key Architecture Concepts

- **TipTap Editor**: Modern, extensible rich text editor framework
- **WebView API**: Message protocol for React Native WebView communication
- **Direct Routing**: TipTap editor served directly at root path (`/`)
- **WebView Bridge**: Communication layer in [`/src/tiptap/webview-bridge.ts`](src/tiptap/webview-bridge.ts)

### Directory Structure

```
src/
├── tiptap/              # TipTap editor implementation
│   ├── components/      # UI components (Toolbar, MentionList, LinkPopup)
│   ├── extensions/      # TipTap extensions (mentions)
│   ├── styles/          # CSS styles
│   ├── webview-bridge.ts       # WebView communication
│   └── TipTapEditor.tsx        # Main editor component
├── data/                # Static data (users for mentions)
└── App.tsx              # Root app component (handles WebView bridge integration)
```

### WebView Integration

The primary use case is React Native WebView integration. The built [`dist/index.html`](dist/index.html) file can be loaded in a WebView. The editor implements this message protocol:

- **Web → React Native**: `READY`, `CHANGE`, `GET_CONTENT`, `EXPORT_HTML`, `ERROR`, `MENTION_QUERY`, `MENTION_SELECT`
- **React Native → Web**: `SET_CONTENT`, `EXECUTE_COMMAND`, `GET_CONTENT`, `EXPORT_HTML`, `IMPORT_HTML`, `MENTION_RESULTS`, `SET_MENTIONS_CONFIG`

### Build Outputs

- [`dist/index.html`](dist/index.html) - Single-file build for WebView integration
- `dist/index.js|mjs` - Library exports for npm consumption
- Library can be consumed via npm or linked locally with [yalc](https://github.com/wclr/yalc)

### Key Features

- RTL/LTR text direction support
- Rich text formatting (bold, italic, underline, strikethrough)
- Headings and lists
- Mentions support with dropdown
- Link insertion and editing
- HTML import/export
- Extensible plugin system