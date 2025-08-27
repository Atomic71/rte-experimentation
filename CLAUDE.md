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
npm run build:web    # Web only: vite + HTML export
npm run build:lib    # Library only: tsc with lib config

# Package management for local development
npm run yalc:publish    # Build library and publish with yalc
npm run link:local      # Build library and push to linked projects
```

## Architecture Overview

Rich text editor playground with multiple implementations (Slate.js and Lexical) and WebView communication API for React Native integration.

### Key Architecture Concepts

- **Dual Editor Support**: Both [Slate.js](src/editors/slate/) and [Lexical](src/editors/lexical/) implementations
- **WebView API**: All editors implement the same message protocol for React Native WebView communication
- **Editor Selection**: Via URL parameters (`?editor=slate` or `?editor=lexical`) or path-based routing
- **Shared Bridge**: Common WebView communication layer in [`/src/editors/common/webview-bridge.ts`](src/editors/common/webview-bridge.ts)

### Directory Structure

```
src/
├── editors/
│   ├── common/          # Shared WebView bridge and types
│   ├── slate/           # Slate.js implementation with plugins
│   └── lexical/         # Lexical implementation with plugins
├── data/                # Static data (users for mentions)
└── routes/              # App routing
```

### WebView Integration

The primary use case is React Native WebView integration. The built [`dist/index.html`](dist/index.html) file can be loaded in a WebView with editor selection via URL parameters. All editors implement the same message protocol:

- **Web → React Native**: `READY`, `CHANGE`, `GET_CONTENT`, `EXPORT_HTML`, `ERROR`
- **React Native → Web**: `SET_CONTENT`, `COMMAND`, `GET_CONTENT`, `EXPORT_HTML`, `IMPORT_HTML`

### Build Outputs

- [`dist/index.html`](dist/index.html) - Single-file build for WebView integration
- `dist/index.js|mjs` - Library exports for npm consumption
- Library can be consumed via npm or linked locally with [yalc](https://github.com/wclr/yalc)

### Key Features

- RTL/LTR text direction support
- Rich text formatting (bold, italic, underline, etc.)
- Mentions support with dropdown
- Link insertion and editing
- HTML import/export
- Consistent API across editor types