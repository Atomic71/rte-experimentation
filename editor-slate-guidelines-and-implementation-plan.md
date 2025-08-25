# Slate.js Rich Text Editor Implementation Guidelines

## Architecture Overview

### Core Setup
```jsx
const editor = useMemo(() => withReact(withHistory(createEditor())), []);
const [value, setValue] = useState(initialValue);
```

### Plugin System
- Implement each feature as a modular plugin
- Compose plugins using Slate's plugin architecture
- Organize plugins by feature (mentions, lists, formatting, links, etc.)

## Feature Implementation

### Text Formatting (Bold, Italic, Underline, Strikethrough)
- Use `Editor.addMark` and `Editor.removeMark` for toggling
- Implement `renderLeaf` for styling marked text
- Add keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)

### Block Elements
- **Headings**: Custom elements (`heading-one`, `heading-two`, `heading-three`)
- **Lists**: Support `bulleted-list`, `numbered-list`, `list-item` types
- **Code Blocks**: Use dedicated plugin for proper indentation handling

### Advanced Features
- **Mentions**: Implement with dropdown suggestions and filtering
- **Links**: Support manual insertion and auto-linking
- **HTML Serialization**: Bidirectional conversion between HTML and Slate format

## WebView Communication Protocol

### Web to React Native
```js
// Send message from web app
window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'EDITOR_CHANGE',
  value: editorValue
}));
```

### React Native to Web
```js
// Inject JavaScript from React Native
webviewRef.current.injectJavaScript(`
  window.postMessage(JSON.stringify({
    type: "SET_CONTENT", 
    value: newContent
  }), "*");
`);
```

### Message Types
- `READY`: Editor initialized and ready
- `CHANGE`: Content updated
- `SET_CONTENT`: Update editor content from native
- `COMMAND`: Execute editor command

## Project Structure

```
/src/editor/
  /plugins/
    /mentions/          # Mention functionality
    /formatting/        # Bold, italic, etc.
    /blocks/           # Headings, lists, code blocks
    /links/            # Link handling
  /components/
    EditorRoot.jsx     # Main editor component
    Toolbar.jsx        # Formatting toolbar
  /utils/
    serialization.js   # HTML conversion utilities
    webview-bridge.js  # WebView communication
```

## Implementation Checklist

### Core Editor
- [ ] Basic Slate editor with React and History
- [ ] Initial value and state management
- [ ] Custom renderElement and renderLeaf functions

### Formatting Features
- [ ] Bold, italic, underline, strikethrough marks
- [ ] Keyboard shortcuts for formatting
- [ ] Toolbar with formatting buttons

### Block Elements
- [ ] Heading elements (H1, H2, H3)
- [ ] Bulleted and numbered lists
- [ ] Code blocks with proper indentation

### Advanced Features
- [ ] Mention system with suggestions dropdown
- [ ] Link insertion and auto-linking
- [ ] HTML serialization/deserialization

### WebView Integration
- [ ] Message posting from web to native
- [ ] JavaScript injection from native to web
- [ ] Error handling for communication
- [ ] Message protocol documentation

### Testing & Quality
- [ ] Keyboard shortcut functionality
- [ ] WebView message round-trip testing
- [ ] HTML serialization round-trip testing
- [ ] Cross-platform WebView compatibility

## Key Considerations

### Performance
- Debounce frequent updates to prevent excessive messaging
- Optimize for large document handling
- Consider virtualization for long documents

### Error Handling
- Wrap WebView communication in try-catch blocks
- Implement fallback behaviors for failed operations
- Log errors appropriately for debugging

### Accessibility
- Ensure proper ARIA labels and roles
- Support screen readers and keyboard navigation
- Test with accessibility tools

### Browser Compatibility
- Target ES2018 for broader WebView support
- Test across different WebView implementations
- Handle feature detection gracefully

## Development Workflow

1. **Setup**: Initialize Slate editor with basic configuration
2. **Features**: Implement one feature plugin at a time
3. **Integration**: Add WebView communication for each feature
4. **Testing**: Verify functionality in WebView environment
5. **Optimization**: Performance tuning and error handling
6. **Documentation**: Update implementation docs and examples

## Resources

- [Slate.js Documentation](https://docs.slatejs.org)
- [Plate.js Plugin System](https://platejs.org)
- [React Native WebView Documentation](https://github.com/react-native-webview/react-native-webview)