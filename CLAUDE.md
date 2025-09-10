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
├── components/          # UI components
│   ├── EditorToolbar/   # Formatting toolbar
│   ├── LinkPopup/       # Link editing popup
│   ├── MentionList/     # Mentions dropdown
│   └── TipTapEditor.tsx # Main editor component
├── hooks/               # Custom React hooks
│   ├── useMentions.ts   # Mentions logic
│   └── useWebViewBridge.ts # WebView communication
├── utils/               # Utility functions
│   ├── webview-bridge.ts # Message protocol
│   └── mentions.ts      # Mention helpers
├── errors/              # Error handling
└── App.tsx              # Root app component
```

### WebView Integration

The primary use case is React Native WebView integration. The built `dist/index.html` file can be loaded in a WebView.

#### Message Protocol

**Web → React Native**:
- `READY` - Editor initialized and ready
- `CHANGE` - Content changed (includes HTML and text)
- `GET_CONTENT` - Response to content request
- `EXPORT_HTML` - HTML export response
- `ERROR` - Error occurred with details
- `MENTION_QUERY` - User search for mentions
- `MENTION_SELECT` - User selected a mention

**React Native → Web**:
- `SET_CONTENT` - Set editor HTML content
- `EXECUTE_COMMAND` - Execute formatting command
- `GET_CONTENT` - Request current content
- `EXPORT_HTML` - Request HTML export
- `IMPORT_HTML` - Import HTML content
- `MENTION_RESULTS` - Return mention search results
- `SET_MENTIONS_CONFIG` - Configure mentions behavior

### Build Outputs

- [`dist/index.html`](dist/index.html) - Single-file build for WebView integration
- `dist/index.js|mjs` - Library exports for npm consumption
- Library can be consumed via npm or linked locally with [yalc](https://github.com/wclr/yalc)

### Key Features

- **Text Formatting**: Bold, italic, underline, strikethrough
- **Block Elements**: Headings (H1-H6), ordered/unordered lists
- **Mentions**: @ trigger with user search and selection
- **Links**: URL insertion with validation and popup editing
- **Direction Support**: Automatic RTL/LTR text direction
- **HTML Operations**: Import/export with sanitization
- **WebView Bridge**: Full bidirectional communication
- **TypeScript**: Strict mode with full type safety