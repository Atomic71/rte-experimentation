# Editor Playground Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Philosophy](#architecture-philosophy)
3. [Slate.js Editor Implementation](#slatejs-editor-implementation)
4. [Lexical Editor Implementation](#lexical-editor-implementation)
5. [WebView Bridge Architecture](#webview-bridge-architecture)
6. [Styling Organization](#styling-organization)
7. [Hook Architecture](#hook-architecture)
8. [Common Components](#common-components)
9. [Plugin System](#plugin-system)
10. [Data Flow](#data-flow)

## Overview

This editor playground provides a unified architecture for two powerful rich text editors:
- **Slate.js**: A completely customizable framework for building rich text editors
- **Lexical**: Facebook's modern rich text editor framework with excellent performance

Both editors are implemented with consistent patterns, shared components, and unified WebView bridge communication to ensure maintainability and feature parity.

## Architecture Philosophy

### Core Principles

1. **Unified Interface**: Both editors implement the same `BaseEditor` interface for consistent external API
2. **Component Composition**: Large components are broken into focused, single-responsibility pieces
3. **Hook-Based Logic**: Complex state management and logic are encapsulated in custom hooks
4. **Style Separation**: All styling is extracted to dedicated files, keeping business logic clean
5. **Plugin Architecture**: Features are implemented as composable plugins rather than monolithic code
6. **WebView Compatibility**: Both editors use the same bridge pattern for React Native WebView integration

### File Organization Strategy

```
src/editors/
├── common/           # Shared components and utilities
├── slate/           # Slate.js implementation
└── lexical/         # Lexical implementation
```

Each editor follows the same internal structure:
- **Main Component**: Thin composition layer (20-30 lines)
- **Wrapper Class**: Business logic and external interface
- **Components/**: UI components broken into focused pieces
- **Hooks/**: Custom hooks for state management
- **Plugins/**: Feature implementations
- **Styles/**: Dedicated styling files
- **Utils/**: Helper functions and utilities

## Slate.js Editor Implementation

### Component Architecture

#### SlateEditor.tsx (101 lines)
The main component is a thin composition layer that orchestrates:

```typescript
export const SlateEditor: React.FC = () => {
  const editor = useSlateEditor(); // Pre-configured with all plugins
  const [value, setValue] = useState<Descendant[]>(initialValue);
  
  const {
    mentionState,
    mentionUsers,
    handleMentionTrigger,
    handleMentionSelect,
    handleMentionKeyDown,
  } = useMentions(editor);

  // WebView bridge setup
  useEffect(() => {
    const handleGetContent = () => {
      const html = serialize(value);
      simplifiedBridge.sendContent(html);
    };
    // ... event listeners
  }, [value]);

  return (
    <div className='editor-container'>
      <Slate editor={editor} initialValue={value} onChange={handleChange}>
        <Toolbar />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
        />
      </Slate>
      <MentionsDropdown {...mentionProps} />
    </div>
  );
};
```

**Key Responsibilities:**
- Orchestrate editor setup and configuration
- Manage document state (value/setValue)
- Handle WebView bridge communication
- Coordinate mention functionality
- Render editor UI with toolbar and mentions

### Hook Architecture

#### useSlateEditor Hook
Creates a fully configured Slate editor with all plugins applied:

```typescript
export const useSlateEditor = () => {
  const editor = useMemo(
    () =>
      withMentions(
        withDirection(
          withBlocks(withFormatting(withHistory(withReact(createEditor()))))
        )
      ),
    []
  );
  return editor;
};
```

**Plugin Stack (inside-out):**
1. `createEditor()` - Base Slate editor
2. `withReact()` - React integration
3. `withHistory()` - Undo/redo functionality
4. `withFormatting()` - Bold, italic, underline, etc.
5. `withBlocks()` - Headings, lists, paragraphs
6. `withDirection()` - Text direction support
7. `withMentions()` - @mention functionality

#### useMentions Hook (67 lines)
Encapsulates all mention-related state and logic:

```typescript
export function useMentions(editor: Editor) {
  const [mentionState, setMentionState] = useState<MentionState | null>(null);
  const [mentionUsers, setMentionUsers] = useState(searchUsers(''));

  const handleMentionTrigger = useCallback(() => {
    const mention = detectMentionTrigger(editor);
    if (mention) {
      setMentionState(mention);
      setMentionUsers(searchUsers(mention.search).slice(0, 10));
    } else {
      setMentionState(null);
    }
  }, [editor]);

  const handleMentionKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!mentionState) return false;
    
    switch (event.key) {
      case 'ArrowDown': // Navigate down
      case 'ArrowUp':   // Navigate up  
      case 'Enter':     // Select user
      case 'Escape':    // Cancel mentions
    }
  }, [mentionState, mentionUsers, handleMentionSelect]);

  return {
    mentionState,
    mentionUsers,
    handleMentionTrigger,
    handleMentionSelect,
    handleMentionKeyDown,
  };
}
```

**Responsibilities:**
- Detect `@` trigger and search term extraction
- Manage mention dropdown state (open/closed, selected index)
- Handle keyboard navigation (arrow keys, enter, escape)
- User search and filtering
- Mention insertion into editor

### Plugin System

Slate plugins follow the Higher-Order Component pattern, wrapping the editor with additional functionality:

#### withMentions Plugin
```typescript
export const withMentions = (editor: Editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === 'mention' ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === 'mention' ? true : isVoid(element);
  };

  return editor;
};
```

#### withFormatting Plugin
Handles text formatting (bold, italic, underline, strikethrough):

```typescript
export const withFormatting = (editor: Editor) => {
  // Adds formatting commands and keyboard shortcuts
  return editor;
};
```

### Serialization

Slate uses custom serialization for HTML import/export:

```typescript
export const serialize = (nodes: Descendant[]): string => {
  return nodes.map(n => Node.string(n)).join('\n');
};

export const deserialize = (html: string): Descendant[] => {
  // Convert HTML back to Slate nodes
};
```

## Lexical Editor Implementation

### Component Architecture

#### LexicalEditor.tsx (26 lines)
Ultra-thin composition layer:

```typescript
export const LexicalEditor: React.FC = () => {
  const wrapper = React.useMemo(() => new LexicalEditorWrapper(), []);

  return (
    <div className='editor-container' style={editorContainerStyle}>
      <LexicalComposer initialConfig={editorConfig}>
        <EditorInitializer wrapper={wrapper} />
        <EditorContainer wrapper={wrapper} />
      </LexicalComposer>
    </div>
  );
};
```

**Key Design Decision**: The main component only handles composition. All business logic lives in the wrapper class and sub-components.

#### LexicalEditorWrapper Class (144 lines)
Implements the `BaseEditor` interface and handles all business logic:

```typescript
export class LexicalEditorWrapper implements BaseEditor {
  private editor: LexicalEditorType | null = null;

  setEditor(editor: LexicalEditorType) {
    this.editor = editor;
    this.setupWebViewHandlers();
  }

  private setupWebViewHandlers() {
    const handleGetContent = () => {
      const content = this.getContent();
      const html = typeof content.data === 'object' ? content.data.html : '';
      simplifiedBridge.sendContent(html || '');
    };

    window.addEventListener('webview-get-content', handleGetContent as any);
    window.addEventListener('webview-set-content', handleSetContent as any);
  }

  executeCommand(command: EditorCommand): void {
    if (['bold', 'italic', 'underline', 'strikethrough'].includes(command.action)) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, command.action as any);
    }
    // ... other command handling
  }
}
```

**Key Responsibilities:**
- Implement BaseEditor interface for external API
- Handle WebView bridge communication
- Execute formatting and structural commands
- Manage content serialization/deserialization
- Coordinate with Lexical's command system

#### EditorContainer Component
Renders the actual Lexical editor with plugins:

```typescript
export const EditorContainer: React.FC<{ wrapper: LexicalEditorWrapper }> = ({ wrapper }) => {
  return (
    <div style={editorWrapperStyle}>
      <ToolbarPlugin />
      <div style={editorInnerStyle}>
        <RichTextPlugin
          contentEditable={<ContentEditable style={contentEditableStyle} />}
          placeholder={<div style={placeholderStyle}>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <DirectionPlugin />
      </div>
    </div>
  );
};
```

#### EditorInitializer Component
Handles editor setup and initialization:

```typescript
export const EditorInitializer: React.FC<{ wrapper: LexicalEditorWrapper }> = ({ wrapper }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    wrapper.setEditor(editor);
    wrapper.initialize();
  }, [editor, wrapper]);

  return null; // This component only handles setup
};
```

### Plugin Integration

Lexical uses a plugin-based architecture where each feature is a separate component:

```typescript
// In EditorContainer
<RichTextPlugin />     // Basic rich text functionality
<HistoryPlugin />      // Undo/redo
<ListPlugin />         // Bullet and numbered lists
<LinkPlugin />         // Link insertion and editing
<DirectionPlugin />    // Text direction (LTR/RTL)
```

Each plugin registers itself with the editor and handles its own commands and state.

### Command System

Lexical uses a centralized command system:

```typescript
// Formatting commands
editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');

// List commands  
editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);

// Custom commands can be created and registered
const CUSTOM_COMMAND = createCommand('custom-action');
editor.dispatchCommand(CUSTOM_COMMAND, payload);
```

## WebView Bridge Architecture

Both editors use the **SimplifiedWebViewBridge** for consistent communication with React Native WebViews.

### SimplifiedWebViewBridge Class

```typescript
export class SimplifiedWebViewBridge {
  private isReactNative: boolean = false;

  constructor() {
    this.isReactNative = !!(window as any).ReactNativeWebView;
    this.setupMessageListener();
  }

  private setupMessageListener() {
    const handleMessage = (event: MessageEvent) => {
      const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      if (message.type === 'GET_CONTENT') {
        window.dispatchEvent(new CustomEvent('webview-get-content'));
      } else if (message.type === 'SET_CONTENT' && message.html) {
        window.dispatchEvent(
          new CustomEvent('webview-set-content', { detail: message.html })
        );
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage as any); // Android WebView
  }
}
```

### Communication Flow

1. **Inbound Messages** (React Native → WebView):
   ```
   React Native → MessageEvent → SimplifiedBridge → CustomEvent → Editor
   ```

2. **Outbound Messages** (WebView → React Native):
   ```
   Editor → SimplifiedBridge → ReactNativeWebView.postMessage → React Native
   ```

### Event Types

- `GET_CONTENT`: Request current editor content
- `SET_CONTENT`: Update editor with new content  
- `READY`: Notify that editor is initialized
- `CONTENT`: Send editor content to React Native

### Editor Integration

Both editors listen for the same custom events:

```typescript
// Setup in both Slate and Lexical
const handleGetContent = () => {
  const html = /* get current content */;
  simplifiedBridge.sendContent(html);
};

const handleSetContent = (event: CustomEvent) => {
  const html = event.detail;
  /* update editor content */;
};

window.addEventListener('webview-get-content', handleGetContent);
window.addEventListener('webview-set-content', handleSetContent);
```

This provides a unified API regardless of which editor is being used.

## Styling Organization

All styling has been extracted from business logic files into dedicated style modules.

### Style File Structure

```
src/editors/
├── common/styles/componentStyles.ts    # Shared component styles
├── lexical/styles/componentStyles.ts   # Lexical-specific styles  
└── slate/styles/componentStyles.ts     # Slate-specific styles
```

### Style Implementation Pattern

**Before** (inline styles polluting components):
```typescript
const popupStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  // ... more properties
};

return <div style={popupStyle}>Content</div>;
```

**After** (clean separation):
```typescript
// In styles/componentStyles.ts
export const popupBaseStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  // ... all properties defined once
};

// In component file
import { popupBaseStyle } from './styles/componentStyles';

return <div style={popupBaseStyle}>Content</div>;
```

### Dynamic Styling Support

For components requiring dynamic positioning (dropdowns, popups), we maintain the ability to combine base styles with dynamic properties:

```typescript
// Base style in componentStyles.ts
export const dropdownBaseStyle: React.CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid #e0e0e0',
  position: 'absolute', // Note: position is in base style
  // ... other static properties
};

// In component - only dynamic properties
const dynamicDropdownStyle = {
  ...dropdownBaseStyle,
  top: position?.top || 0,    // Dynamic
  left: position?.left || 0,  // Dynamic
};
```

### Style Categories

1. **Layout Styles**: Container, flexbox, positioning
2. **Interactive Styles**: Buttons, inputs, hover states  
3. **Visual Styles**: Colors, borders, shadows
4. **Typography Styles**: Font sizes, weights, colors
5. **Component-Specific**: Dropdown items, toolbar buttons, etc.

## Hook Architecture

Custom hooks encapsulate complex state management and logic, making components cleaner and logic more reusable.

### useMentions Hook Deep Dive

The mentions hook demonstrates the full pattern:

#### State Management
```typescript
const [mentionState, setMentionState] = useState<MentionState | null>(null);
const [mentionUsers, setMentionUsers] = useState(searchUsers(''));
```

- `mentionState`: Tracks if mentions dropdown is open, current search term, selected index
- `mentionUsers`: Filtered list of users matching current search

#### Event Handlers
```typescript
const handleMentionTrigger = useCallback(() => {
  const mention = detectMentionTrigger(editor);
  if (mention) {
    setMentionState(mention);
    setMentionUsers(searchUsers(mention.search).slice(0, 10));
  } else {
    setMentionState(null);
  }
}, [editor]);
```

This handler:
1. Checks current cursor position for `@` trigger
2. Extracts search term after `@`
3. Updates mention state and filtered user list
4. Called on every editor content change

#### Keyboard Navigation
```typescript
const handleMentionKeyDown = useCallback((event: React.KeyboardEvent) => {
  if (!mentionState) return false;
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      setMentionState(prev => prev ? {
        ...prev,
        index: Math.min(prev.index + 1, mentionUsers.length - 1)
      } : null);
      return true;
    // ... other cases
  }
}, [mentionState, mentionUsers, handleMentionSelect]);
```

Returns boolean indicating if the event was handled, allowing parent components to decide whether to process the event further.

### Hook Benefits

1. **Separation of Concerns**: State logic separated from rendering
2. **Reusability**: Hooks can be used across different components
3. **Testability**: Hook logic can be tested independently  
4. **Composition**: Multiple hooks can be combined in components
5. **Performance**: Proper memoization prevents unnecessary re-renders

## Common Components

Shared components provide consistent UI across both editors.

### MentionsDropdown Component

A reusable dropdown for user mentions:

```typescript
interface MentionsDropdownProps {
  users: User[];
  selectedIndex: number;
  onSelect: (user: User) => void;
  position?: { top: number; left: number };
  isVisible: boolean;
}

export const MentionsDropdown: React.FC<MentionsDropdownProps> = ({
  users,
  selectedIndex,
  onSelect,
  position,
  isVisible,
}) => {
  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current && dropdownRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  return (
    <div style={dynamicDropdownStyle}>
      {users.map((user, index) => (
        <div
          key={user.id}
          ref={index === selectedIndex ? selectedItemRef : null}
          style={index === selectedIndex ? selectedItemStyle : itemStyle}
          onClick={() => onSelect(user)}
        >
          <span style={nameStyle}>{user.name}</span>
          <span style={usernameStyle}>{user.username}</span>
        </div>
      ))}
    </div>
  );
};
```

**Key Features:**
- Automatic positioning based on cursor location
- Keyboard navigation support (managed by parent)
- Smooth scrolling to keep selected item visible
- Hover effects for better UX
- Consistent styling across both editors

### LinkPopup Component

Shared component for link insertion/editing:

```typescript
interface LinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, url: string) => void;
  onRemove?: () => void;
  initialText?: string;
  initialUrl?: string;
  position?: { top: number; left: number };
}
```

**Features:**
- Modal or positioned popup modes
- Form validation (URL required)
- Escape key and click-outside to close
- Support for editing existing links
- Remove link functionality

## Plugin System

Both editors use plugin architectures, but with different patterns.

### Slate Plugin Pattern

Slate plugins are Higher-Order Functions that wrap and enhance the editor:

```typescript
export const withFormatting = (editor: Editor) => {
  const { isMarkActive, toggleMark } = editor;
  
  // Add new methods
  editor.toggleBold = () => toggleMark(editor, 'bold');
  editor.toggleItalic = () => toggleMark(editor, 'italic');
  
  // Override existing methods  
  editor.isMarkActive = (format) => {
    // Custom logic
    return isMarkActive(format);
  };
  
  return editor;
};
```

**Plugin Composition:**
```typescript
const editor = withMentions(
  withDirection(
    withBlocks(
      withFormatting(
        withHistory(
          withReact(createEditor())
        )
      )
    )
  )
);
```

### Lexical Plugin Pattern

Lexical plugins are React components that register themselves:

```typescript
export const CustomPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // Register commands
    const unregister = editor.registerCommand(
      CUSTOM_COMMAND,
      (payload) => {
        // Handle command
        return true;
      },
      COMMAND_PRIORITY_NORMAL
    );
    
    return unregister;
  }, [editor]);
  
  return null; // Most plugins don't render anything
};
```

**Plugin Registration:**
```typescript
<LexicalComposer>
  <RichTextPlugin />
  <HistoryPlugin />
  <CustomPlugin />
</LexicalComposer>
```

## Data Flow

### Slate.js Data Flow

1. **User Input** → `onChange` → `setValue` → Re-render
2. **WebView Message** → Custom Event → `handleSetContent` → `deserialize` → `setValue`
3. **Content Request** → Custom Event → `handleGetContent` → `serialize` → Bridge

```
User Types → Slate Editor → onChange Handler → setValue → React State Update
                    ↓
              Toolbar Action → Plugin Method → Editor Transform → onChange
                    ↓  
           WebView Request → Custom Event → Serialize → Send to React Native
```

### Lexical Data Flow

1. **User Input** → Lexical Internal State → Plugins → Commands
2. **WebView Message** → Wrapper Method → Lexical Update → Re-render
3. **Content Request** → Wrapper Method → Serialize → Bridge

```
User Types → Lexical Editor → Internal State → Plugin Listeners → Command System
                    ↓
           Toolbar Action → dispatchCommand → Plugin Handlers → Editor Update
                    ↓
           WebView Request → Wrapper Method → Serialize → Send to React Native
```

### Key Differences

- **Slate**: Explicit state management with React useState
- **Lexical**: Internal state management with command-driven updates
- **Slate**: Direct editor transforms and operations
- **Lexical**: Command-based architecture with priority system

Both approaches provide excellent developer experience but with different mental models and API surfaces.

---

This documentation provides a comprehensive overview of how each part of the editor system works, from high-level architecture down to implementation details. Each editor maintains its own strengths while sharing common patterns for consistency and maintainability.