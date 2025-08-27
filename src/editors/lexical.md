# Lexical Editor Implementation

Text editor implementation using [Lexical](https://lexical.dev/) command-based architecture.

## Architecture

```
lexical/
├── index.ts                    # Editor wrapper class
├── LexicalEditor.tsx           # Main editor component
├── plugins/
│   ├── ToolbarPlugin.tsx       # Formatting toolbar
│   ├── MentionsPlugin.tsx      # @mention functionality
│   ├── LinksPlugin.tsx         # Link insertion/editing
│   ├── DirectionPlugin.tsx     # RTL/LTR text direction
│   ├── ListPlugin.tsx          # Bulleted/numbered lists
│   └── RichTextPlugin.tsx      # Core rich text features
├── components/
│   ├── EditorContainer.tsx     # Styled wrapper
│   └── EditorToolbar.tsx       # Formatting controls
├── nodes/
│   ├── MentionNode.ts          # Custom mention node
│   └── LinkNode.ts             # Custom link node
└── theme/
    └── EditorTheme.ts          # Lexical theme configuration
```

## Plugin System

Lexical uses React components as plugins:

```typescript
<LexicalComposer initialConfig={editorConfig}>
  <div className="editor-container">
    <ToolbarPlugin />
    <div className="editor-inner">
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div className="editor-placeholder">Enter text...</div>}
      />
      <MentionsPlugin />
      <LinksPlugin />
      <DirectionPlugin />
      <ListPlugin />
    </div>
  </div>
</LexicalComposer>
```

## Commands

Lexical uses command-based operations:

```typescript
import { 
  FORMAT_TEXT_COMMAND, 
  INSERT_PARAGRAPH_COMMAND,
  $getSelection 
} from 'lexical'

// Text formatting
editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')

// Custom commands
editor.dispatchCommand(INSERT_LINK_COMMAND, { url: 'https://example.com' })
editor.dispatchCommand(INSERT_MENTION_COMMAND, { userId: '123', username: '@john' })
```

## Data Structure

Lexical uses immutable editor state:

```typescript
// Reading state
editor.getEditorState().read(() => {
  const root = $getRoot()
  const children = root.getChildren()
  
  children.forEach(node => {
    if ($isTextNode(node)) {
      console.log(node.getTextContent())
    }
  })
})

// Updating state
editor.update(() => {
  const paragraph = $createParagraphNode()
  const text = $createTextNode('Hello world')
  paragraph.append(text)
  $getRoot().append(paragraph)
})
```

## RTL/LTR Support

Automatic direction detection plugin:

```typescript
export function DirectionPlugin(): null {
  const [editor] = useLexicalComposerContext()
  
  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (textNode) => {
      const text = textNode.getTextContent()
      const direction = detectTextDirection(text)
      
      if (direction !== textNode.getDirection()) {
        textNode.setDirection(direction)
      }
    })
  }, [editor])
  
  return null
}
```

## Mentions Implementation

Command-based mention insertion:

```typescript
editor.registerCommand(
  INSERT_MENTION_COMMAND,
  (payload: { userId: string; username: string; userName: string }) => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const mentionNode = $createMentionNode(payload.userId, payload.username, payload.userName)
      selection.insertNodes([mentionNode])
    }
    return true
  },
  COMMAND_PRIORITY_EDITOR
)
```

## Custom Nodes

Define custom node types:

```typescript
export class MentionNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'mention'
  }
  
  createDOM(): HTMLElement {
    const element = document.createElement('span')
    element.style.cssText = mention.inlineStyle
    element.setAttribute('contenteditable', 'false')
    return element
  }
  
  decorate(): JSX.Element {
    return <MentionComponent userId={this.userId} username={this.username} />
  }
}
```

## HTML Serialization

Built-in HTML transformation:

```typescript
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'

// To HTML
editor.update(() => {
  const htmlString = $generateHtmlFromNodes(editor, null)
  console.log(htmlString)
})

// From HTML
editor.update(() => {
  const parser = new DOMParser()
  const dom = parser.parseFromString(html, 'text/html')
  const nodes = $generateNodesFromDOM(editor, dom)
  $getRoot().select()
  $getSelection()?.insertNodes(nodes)
})
```

## WebView Integration

Uses shared bridge from `../common/webview-bridge.ts`:

```typescript
export class LexicalEditorWrapper implements BaseEditor {
  initialize(): void {
    const callbacks: EditorCallbacks = {
      onSetContent: (content) => this.setContent(content),
      onGetContent: () => this.getContent(),
      onExecuteCommand: (command) => this.executeCommand(command),
      onExportHTML: () => this.exportHTML(),
      onImportHTML: (html) => this.importHTML(html)
    }

    webViewBridge.initialize('lexical', callbacks)
  }
}
```

## Performance Features

- Immutable state prevents accidental mutations
- Commands batched automatically
- Virtual rendering for large documents
- Built-in undo/redo with diffing
- Lazy plugin loading