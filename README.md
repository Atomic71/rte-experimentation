# Rich Text Editor Playground

TipTap-based rich text editor with React Native WebView integration and mentions support.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Build Process

### Build Commands

```bash
# Development
npm run dev          # Live development server at localhost:5173

# Production Builds
npm run build        # Creates WebView HTML + JS module export
npm run build:lib    # Creates npm package (CommonJS + ESM)

# Code Quality
npm run typecheck    # TypeScript type checking (no emit)
npm run lint         # ESLint checks

# Local Package Testing
npm run yalc:publish # Publish to local yalc store
npm run link:local   # Publish + auto-update linked projects
```

### Build Outputs

```
dist/
├── index.html     # Single-file web app for WebView (all JS/CSS inlined)
├── html.js        # HTML exported as JS string for React Native
├── index.js       # Library CommonJS entry
├── index.mjs      # Library ES module entry
└── index.d.ts     # TypeScript definitions
```

### Build Architecture

The project supports **dual usage modes**:

1. **WebView Mode** (`npm run build`)
   - Uses Vite with `vite-plugin-singlefile`
   - Bundles everything into one HTML file
   - No external dependencies or network requests
   - Perfect for React Native WebView (`file://` protocol)

2. **Library Mode** (`npm run build:lib`) 
   - Compiles TypeScript to JS modules
   - Provides CommonJS and ESM exports
   - Used for npm package distribution

### Configuration Files

- **`vite.config.ts`**: Bundles for WebView with single-file output
- **`tsconfig.json`**: Development TypeScript config (no emit)
- **`tsconfig.lib.json`**: Library build TypeScript config (emits to `dist/`)
- **`tsconfig.node.json`**: Vite config TypeScript support

## Development Workflow

### For Staging (URL-based, Fast Iteration)

```bash
# 1. Start dev server
npm run dev

# 2. Deploy to Vercel (automatic on push)
# 3. Use Vercel URL in React Native WebView
```

### For Production (File-based)

```bash
# 1. Build production files
npm run build

# 2. Use dist/index.html in React Native
# Bundle with app or load from local filesystem
```

### For Local Package Development

Using [yalc](https://github.com/wclr/yalc) for local package testing:

```bash
# First time setup in this project
npm run yalc:publish

# In your React Native project
yalc add editor-playground
npm install

# After making changes here
npm run link:local  # Auto-updates all linked projects
```

#### Yalc Commands Explained

- **`npm run yalc:publish`**: Publishes to local store only
  - Linked projects must run `yalc update` to get changes
  - Use when you want controlled updates

- **`npm run link:local`**: Publishes with `--push` flag
  - Automatically updates all linked projects
  - Use for active development with instant updates
  - Like hot-reload for npm packages

## Editor Features

- **TipTap Editor**: Modern, extensible rich text editor framework
- **WebView Bridge**: Bidirectional communication protocol for React Native
- **Mentions System**: @ mentions with configurable user search and dropdown
- **Formatting Toolbar**: Bold, italic, underline, strikethrough, links
- **Link Management**: Insert and edit links with popup interface
- **RTL/LTR Support**: Automatic text direction handling

## WebView Integration

### Basic Setup

```javascript
<WebView
  source={{ uri: 'file:///path/to/dist/index.html' }}
  onMessage={(event) => {
    const message = JSON.parse(event.nativeEvent.data)
    console.log('Editor message:', message.type, message.payload)
  }}
/>
```

### Message Protocol

**Web → React Native**:
- `READY` - Editor initialized
- `CHANGE` - Content changed
- `GET_CONTENT` - Content response
- `EXPORT_HTML` - HTML export response
- `ERROR` - Error occurred
- `MENTION_QUERY` - User search request for mentions
- `MENTION_SELECT` - Mention selected event

**React Native → Web**:
- `SET_CONTENT` - Set editor content
- `EXECUTE_COMMAND` - Execute formatting command
- `GET_CONTENT` - Request current content
- `EXPORT_HTML` - Request HTML export
- `IMPORT_HTML` - Import HTML content
- `MENTION_RESULTS` - Return user search results
- `SET_MENTIONS_CONFIG` - Configure mentions behavior

## Features

- Rich text formatting (bold, italic, underline, strikethrough)
- Lists (ordered, unordered) and headings (H1-H6)
- @mention system with configurable user search
- Link insertion and editing with popup interface
- RTL/LTR automatic text direction support
- HTML import/export with sanitization
- Full TypeScript support with strict mode
- WebView message protocol for React Native integration

## Architecture

### Core Components
- **App.tsx**: Root component with WebView bridge initialization
- **TipTapEditor.tsx**: Main editor component with TipTap extensions
- **webview-bridge.ts**: Message protocol handler for React Native communication

### TipTap Extensions
- **Mentions**: User mentions with @ trigger and dropdown
- **Links**: URL insertion with validation and popup editing
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Lists & Headings**: Ordered/unordered lists, H1-H6 support

### UI Components
- **Toolbar**: Formatting controls and command buttons
- **MentionList**: Searchable user dropdown for mentions
- **LinkPopup**: Link URL input and editing interface

## Deployment Notes

### Vercel Deployment

The project is optimized for Vercel hosting:
- Automatic deployments on push
- Single HTML file output works perfectly with Vercel
- Use deployment URLs for staging/development iteration

### Performance Optimizations

- **Single-file HTML**: All JS/CSS inlined for zero network requests
- **WebView Optimized**: Compatible with `file://` protocol restrictions
- **Tree-shaking**: Vite eliminates dead code automatically
- **Minification**: Production builds fully minified and compressed
- **Fast Refresh**: HMR support for instant development feedback
- **Bundle Analysis**: Built-in size analysis for optimization

## Troubleshooting

### Type Errors
Run `npm run typecheck` separately to check types without building.

### WebView Loading Issues
Ensure using `file://` protocol for local files or proper HTTPS URLs for remote files.

### Package Linking Issues
1. Clear yalc store: `yalc installations clean`
2. Re-publish: `npm run yalc:publish`
3. Re-add in target project: `yalc add editor-playground`