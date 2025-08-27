# Rich Text Editor Playground

Rich text editor implementations (Slate.js and Lexical) with React Native WebView integration.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173?editor=slate
```

## Development Commands

```bash
npm run dev          # Development server
npm run typecheck    # Type checking
npm run lint         # Linting
npm run build        # Full build for WebView
```

## Documentation

- **[Editor Implementations](src/editors/editors.md)** - Architecture overview
- **[Slate.js Implementation](src/editors/slate.md)** - Plugin-based editor
- **[Lexical Implementation](src/editors/lexical.md)** - Command-based editor
- **[WebView Integration](webview-integration.md)** - React Native protocol
- **[Design System](src/design-system/)** - Styling system

## Editor Selection

```
http://localhost:5173?editor=slate
http://localhost:5173?editor=lexical
```

## WebView Usage

Load built `dist/index.html` in React Native WebView:

```javascript
<WebView
  source={{ uri: 'file:///path/to/dist/index.html?editor=slate' }}
  onMessage={(event) => {
    const message = JSON.parse(event.nativeEvent.data)
    console.log('Editor message:', message.type, message.payload)
  }}
/>
```

## Build Outputs

- `dist/index.html` - Single-file WebView build
- `dist/index.js` - Library export for npm

## Features

- Rich text formatting (bold, italic, underline, lists, headings)
- @mention system with user search  
- Link insertion and editing
- RTL/LTR text direction support
- HTML import/export
- TypeScript support
