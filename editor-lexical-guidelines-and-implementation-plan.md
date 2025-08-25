# Lexical.js Rich Text Editor Implementation Guidelines

## Architecture Overview

### Core Setup
```jsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

const editorConfig = {
  namespace: 'MyRichTextEditor',
  theme: customTheme,
  onError: (error) => console.error(error),
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
    CodeNode,
    CodeHighlightNode,
    // Custom nodes
  ],
};

function LexicalEditor() {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Enter some rich text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={handleChange} />
      {/* Feature plugins */}
    </LexicalComposer>
  );
}
```

### Plugin System
- Implement each feature as a React component plugin
- Use command-based system for all editor operations
- Register commands and transforms within plugins
- Leverage Lexical's reconciliation system for performance

## Feature Implementation

### Text Formatting (Bold, Italic, Underline, Strikethrough)
- Use `FORMAT_TEXT_COMMAND` with format types
- Track active states using selection changes
- Text formatting uses binary flags (bitmasks)

```jsx
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  return (
    <div className="toolbar">
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={isBold ? 'active' : ''}
      >
        Bold
      </button>
    </div>
  );
};
```

### Headings (H1-H6)
- Import `HeadingNode` from `@lexical/rich-text`
- Use `$setBlocksType` with `$createHeadingNode`
- Support all heading levels (h1-h6)

```jsx
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType, $getSelection } from 'lexical';

const createHeading = (headingSize) => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createHeadingNode(headingSize));
    }
  });
};
```

### Lists (Bulleted, Numbered, Checklist)
- Import `ListNode`, `ListItemNode` from `@lexical/list`
- Use predefined commands for list operations
- Configure list styles in theme

```jsx
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { 
  INSERT_UNORDERED_LIST_COMMAND, 
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  ListNode,
  ListItemNode 
} from '@lexical/list';

// Theme configuration
const theme = {
  list: {
    nested: {
      listitem: 'ml-4',
    },
    ol: 'list-decimal pl-8',
    ul: 'list-disc pl-8',
    listitem: 'mb-2',
    listitemChecked: 'line-through text-gray-500',
  },
};

// Toolbar buttons
<button onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)}>
  Bullet List
</button>
<button onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)}>
  Numbered List
</button>
<button onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND)}>
  Checklist
</button>
```

### Code Blocks
- Import `CodeNode` and `CodeHighlightNode` from `@lexical/code`
- Use `registerCodeHighlighting` for syntax highlighting
- Support multiple programming languages

```jsx
import { 
  CodeNode, 
  CodeHighlightNode, 
  registerCodeHighlighting,
  INSERT_CODE_COMMAND 
} from '@lexical/code';

// Register code highlighting
useEffect(() => {
  return registerCodeHighlighting(editor);
}, [editor]);

// Insert code block
const insertCodeBlock = (language = 'javascript') => {
  editor.dispatchCommand(INSERT_CODE_COMMAND, language);
};
```

### Links
- Import `LinkNode`, `AutoLinkNode` from `@lexical/link`
- Use `LinkPlugin`, `AutoLinkPlugin`, and `LexicalClickableLinkPlugin`
- Support manual and automatic link creation

```jsx
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { LinkNode, AutoLinkNode, $toggleLink } from '@lexical/link';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';

const URL_MATCHERS = [
  createLinkMatcherWithRegExp(
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
    (text) => text.startsWith('http') ? text : `https://${text}`
  ),
];

// Manual link creation
const insertLink = useCallback((url) => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $toggleLink(url);
    }
  });
}, [editor]);
```

### Mentions
- Use `lexical-beautiful-mentions` plugin
- Support multiple triggers (@, #, etc.)
- Implement async search functionality

```jsx
import { BeautifulMentionsPlugin, BeautifulMentionNode } from 'lexical-beautiful-mentions';

const mentionItems = {
  '@': ['Alice', 'Bob', 'Charlie'],
  '#': ['react', 'javascript', 'lexical'],
};

<BeautifulMentionsPlugin
  triggers={['@', '#']}
  mentions={mentionItems}
  onSearch={handleMentionSearch}
/>
```

## WebView Communication Protocol

### Web to React Native
```jsx
// Send editor changes
const handleEditorChange = (editorState) => {
  const serializedState = JSON.stringify(editorState);
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'EDITOR_CHANGE',
    data: serializedState
  }));
};

// Send custom events
const sendCustomEvent = (eventType, payload) => {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: eventType,
    data: payload
  }));
};
```

### React Native to Web
```jsx
// React Native WebView
const setEditorContent = (content) => {
  const jsCode = `
    window.setLexicalContent(${JSON.stringify(content)});
    true; // Required for injectJavaScript
  `;
  webviewRef.current.injectJavaScript(jsCode);
};

<WebView
  ref={webviewRef}
  source={{ uri: 'path/to/lexical/editor' }}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    handleMessageFromWeb(data);
  }}
/>
```

## HTML Serialization

### Built-in Support
```jsx
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

// Serialize to HTML
const serializeToHtml = () => {
  editor.update(() => {
    const htmlString = $generateHtmlFromNodes(editor, null);
    return htmlString;
  });
};

// Deserialize from HTML
const deserializeFromHtml = (htmlString) => {
  editor.update(() => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(htmlString, 'text/html');
    const nodes = $generateNodesFromDOM(editor, dom);
    $getRoot().select();
    $insertNodes(nodes);
  });
};
```

## Project Structure

```
/src/editors/lexical/
  /plugins/
    ToolbarPlugin.jsx        # Main toolbar with all formatting
    MentionsPlugin.jsx       # Mention functionality
    CodeBlockPlugin.jsx      # Code block features
    LinkPlugin.jsx          # Link handling
    ListPlugin.jsx          # List functionality
  /nodes/
    CustomMentionNode.js    # Custom mention node
    CustomImageNode.js      # Custom image node
  /components/
    LexicalEditor.jsx       # Main editor component
    FloatingToolbar.jsx     # Floating toolbar
  /theme/
    EditorTheme.js          # Complete styling theme
  /utils/
    serialization.js        # HTML conversion utilities
    webview-bridge.js       # WebView communication
```

## Implementation Checklist

### Core Editor Setup
- [ ] LexicalComposer with all required nodes
- [ ] RichTextPlugin with ContentEditable
- [ ] HistoryPlugin for undo/redo
- [ ] OnChangePlugin for state management

### Node Configuration
- [ ] HeadingNode for headings (H1-H6)
- [ ] ListNode and ListItemNode for lists
- [ ] LinkNode and AutoLinkNode for links
- [ ] CodeNode and CodeHighlightNode for code blocks
- [ ] BeautifulMentionNode for mentions

### Plugin Implementation
- [ ] ToolbarPlugin with all formatting options
- [ ] ListPlugin for list functionality
- [ ] LinkPlugin and AutoLinkPlugin for links
- [ ] LexicalClickableLinkPlugin for clickable links
- [ ] BeautifulMentionsPlugin for mentions
- [ ] Code highlighting registration

### WebView Integration
- [ ] Message posting from web to native
- [ ] JavaScript injection from native to web
- [ ] Error handling for communication failures
- [ ] Message protocol documentation

### Serialization
- [ ] HTML export functionality
- [ ] HTML import functionality
- [ ] JSON serialization for state persistence
- [ ] Round-trip testing for data integrity

### Theme Configuration
- [ ] Complete CSS theme for all nodes
- [ ] List styling with proper indentation
- [ ] Code block syntax highlighting styles
- [ ] Link and mention styling
- [ ] Toolbar and UI component styles

## Key Advantages of Lexical

### Performance Benefits
- Better reconciliation system than Slate.js
- Efficient virtual DOM handling
- Optimized for large documents

### Architecture Benefits
- Command-based system for cleaner operations
- Modular plugin system with better composition
- First-class React support with hooks
- Clear separation of concerns

### Development Benefits
- Backed by Meta with active development
- Comprehensive documentation and examples
- Large and growing community
- TypeScript support out of the box

## Testing Strategy

### Unit Tests
- [ ] Plugin functionality testing
- [ ] Command execution testing
- [ ] Node creation and manipulation
- [ ] Serialization round-trip tests

### Integration Tests
- [ ] WebView communication reliability
- [ ] Cross-platform compatibility testing
- [ ] Performance testing with large documents
- [ ] Format combination testing

### User Testing
- [ ] Keyboard shortcut functionality
- [ ] Touch interaction on mobile
- [ ] Accessibility compliance
- [ ] Browser compatibility

## Development Workflow

1. **Setup**: Initialize LexicalComposer with base configuration
2. **Nodes**: Add and configure all required node types
3. **Plugins**: Implement feature plugins one by one
4. **Toolbar**: Create comprehensive formatting toolbar
5. **WebView**: Implement bidirectional communication
6. **Serialization**: Add HTML export/import functionality
7. **Theme**: Apply complete styling theme
8. **Testing**: Comprehensive testing across all features

## Resources

- [Lexical Documentation](https://lexical.dev/docs/intro)
- [Lexical React Plugins](https://lexical.dev/docs/react/plugins)
- [Beautiful Mentions Plugin](https://github.com/sodenn/lexical-beautiful-mentions)
- [Lexical Examples](https://github.com/facebook/lexical/tree/main/packages/lexical-playground)

## Migration from Slate.js

If migrating from Slate.js:
- Replace Slate's `withReact` with LexicalComposer
- Convert custom elements to Lexical nodes
- Replace Slate transforms with Lexical commands
- Update serialization logic to use Lexical's HTML utilities
- Adapt plugins to Lexical's component-based system