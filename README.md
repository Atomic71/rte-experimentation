# Rich Text Editor Playground

A unified rich text editor playground that provides multiple editor implementations (Slate.js and Lexical) with a consistent WebView communication API for React Native integration.

## Features

- **Dual Editor Support**: Both Slate.js and Lexical implementations
- **Unified WebView API**: Consistent message protocol for React Native WebView communication
- **Rich Text Formatting**: Bold, italic, underline, strikethrough, headings, lists
- **RTL/LTR Support**: Automatic text direction detection and support
- **Mentions System**: @mention functionality with user search
- **Link Management**: Insert and edit links with validation
- **HTML Import/Export**: Convert between editor formats and HTML
- **TypeScript**: Full type safety throughout the codebase

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

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

## Architecture

### Unified WebView Bridge

The project features a consolidated WebView bridge system that replaced 4 separate implementations:

- **Single Bridge Class**: `UnifiedWebViewBridge` handles all editor communication
- **Consistent API**: Callback-based interface for all editors
- **Type Safety**: Clean type definitions with minimal `any` usage
- **Clean Message Protocol**: `{ type, payload, editor, timestamp }` format

### Editor Selection

Choose your editor via URL parameters:

- **[Slate.js](src/editors/slate/)**: `http://localhost:5173?editor=slate`
- **[Lexical](src/editors/lexical/)**: `http://localhost:5173?editor=lexical`

Or use path-based routing in your implementation.

## WebView Integration

The built [`dist/index.html`](dist/index.html) file can be loaded in a React Native WebView:

```javascript
<WebView
  source={{ uri: 'file:///path/to/dist/index.html?editor=slate' }}
  onMessage={(event) => {
    const message = JSON.parse(event.nativeEvent.data)
    switch (message.type) {
      case 'READY':
        console.log(`${message.editor} editor ready`)
        break
      case 'CHANGE':
        console.log('Content changed:', message.payload)
        break
    }
  }}
/>
```

### Message Protocol

**Web → React Native:**
- `READY` - Editor initialized
- `CHANGE` - Content changed
- `CONTENT_RESPONSE` - Current content (response to GET_CONTENT)
- `EXPORT_HTML` - HTML export (response to request)
- `ERROR` - Error occurred

**React Native → Web:**
- `SET_CONTENT` - Set editor content
- `GET_CONTENT` - Request current content
- `EXECUTE_COMMAND` - Execute editor command
- `EXPORT_HTML` - Request HTML export
- `IMPORT_HTML` - Import HTML content

## Directory Structure

```
src/
├── [editors/](src/editors/)
│   ├── [common/](src/editors/common/)          # Shared WebView bridge and types
│   ├── [slate/](src/editors/slate/)           # Slate.js implementation with plugins
│   └── [lexical/](src/editors/lexical/)         # Lexical implementation with plugins
├── [data/](src/data/)                # Static data (users for mentions)
└── [routes/](src/routes/)              # App routing
```

## Build Outputs

- [`dist/index.html`](dist/index.html) - Single-file build for WebView integration
- `dist/index.js|mjs` - Library exports for npm consumption
- Library can be consumed via npm or linked locally with [yalc](https://github.com/wclr/yalc)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `npm run typecheck` and `npm run lint` to ensure code quality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.