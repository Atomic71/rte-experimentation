# Quill.js Rich Text Editor Implementation Guidelines

## Architecture Overview

### Core Setup
```jsx
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const editorConfig = {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'code-block'],
      ['clean']
    ],
    syntax: true,
    mention: mentionConfig,
  },
  formats: [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'code-block'
  ]
};

function QuillEditor() {
  const [value, setValue] = useState('');
  
  return (
    <ReactQuill
      value={value}
      onChange={setValue}
      modules={editorConfig.modules}
      formats={editorConfig.formats}
      theme={editorConfig.theme}
    />
  );
}
```

### Module System
- Implement each feature as a Quill module
- Use configuration-driven approach for toolbar and formats
- Leverage Quill's built-in format system for consistency
- Register custom modules and formats using `Quill.register()`

## Feature Implementation

### Text Formatting (Bold, Italic, Underline, Strikethrough)
- Use built-in format system with standard toolbar configuration
- Apply formats programmatically with `quill.format()`
- Check active states using `quill.getFormat()`
- Text formatting uses Quill's native format detection

```jsx
const ToolbarPlugin = () => {
  const [formats, setFormats] = useState({});
  
  const updateFormats = () => {
    const currentFormat = quill.getFormat();
    setFormats(currentFormat);
  };

  useEffect(() => {
    quill.on('selection-change', updateFormats);
    return () => quill.off('selection-change', updateFormats);
  }, []);

  const toggleFormat = (format) => {
    const isActive = formats[format];
    quill.format(format, !isActive);
  };

  return (
    <div className="toolbar">
      <button
        onClick={() => toggleFormat('bold')}
        className={formats.bold ? 'active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => toggleFormat('italic')}
        className={formats.italic ? 'active' : ''}
      >
        Italic
      </button>
    </div>
  );
};
```

### Headings (H1-H6)
- Use built-in `header` format with numeric values (1-6)
- Configure toolbar dropdown for all heading levels
- Support custom header labels via CSS or HTML toolbar
- Headers are block-level formats

```jsx
const headerConfig = [
  { 'header': [1, 2, 3, 4, 5, 6, false] }
];

// Programmatic heading creation
const createHeading = (level) => {
  quill.format('header', level);
};

// Custom header labels
const customToolbar = `
  <select class="ql-header">
    <option value="1">Title</option>
    <option value="2">Subtitle</option>
    <option value="3">Heading</option>
    <option selected>Normal</option>
  </select>
`;
```

### Lists (Bulleted, Numbered)
- Use built-in `list` format with 'ordered' and 'bullet' values
- Support nested lists with automatic indentation
- Configure indent controls for list management
- Toggle lists programmatically with format detection

```jsx
const listConfig = [
  { 'list': 'ordered'}, { 'list': 'bullet' },
  { 'indent': '-1'}, { 'indent': '+1' }
];

const toggleList = (type) => {
  const format = quill.getFormat();
  const currentList = format.list;
  
  if (currentList === type) {
    quill.format('list', false); // Remove list
  } else {
    quill.format('list', type); // Apply list type
  }
};
```

### Code Blocks
- Use built-in `code-block` format with syntax highlighting
- Import highlight.js for language support
- Configure Syntax module for automatic highlighting
- Support multiple programming languages

```jsx
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

hljs.configure({
  languages: ['javascript', 'python', 'java', 'css', 'html']
});

const modules = {
  syntax: {
    highlight: (text) => hljs.highlightAuto(text).value,
  },
  toolbar: [['code-block']]
};

// Programmatic code block insertion
const insertCodeBlock = () => {
  quill.format('code-block', true);
};
```

### Links
- Use built-in `link` format with toolbar button
- Create custom link handlers for enhanced UX
- Support automatic URL detection and conversion
- Handle link insertion programmatically

```jsx
const linkHandler = function(value) {
  if (value) {
    const href = prompt('Enter the URL:');
    this.quill.format('link', href);
  } else {
    this.quill.format('link', false);
  }
};

const modules = {
  toolbar: {
    container: [['link']],
    handlers: {
      link: linkHandler
    }
  }
};

// Programmatic link insertion
const insertLink = (url, text) => {
  const selection = quill.getSelection();
  if (selection) {
    quill.insertText(selection.index, text, 'link', url);
  }
};
```

### Mentions
- Use `quill-mention` plugin for @mentions and hashtags
- Support multiple trigger characters (@, #, etc.)
- Implement async data sources for mention suggestions
- Configure custom mention appearance and behavior

```jsx
import 'quill-mention/autoregister';

const mentionConfig = {
  allowedChars: /^[A-Za-z\s]*$/,
  mentionDenotationChars: ["@", "#"],
  source: function(searchTerm, renderList, mentionChar) {
    let values;
    
    if (mentionChar === "@") {
      values = usersList; // Your users data
    } else {
      values = tagsList; // Your tags data
    }
    
    if (searchTerm.length === 0) {
      renderList(values, searchTerm);
    } else {
      const matches = values.filter(item => 
        item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
      );
      renderList(matches, searchTerm);
    }
  }
};
```

## WebView Communication Protocol

### Web to React Native
```jsx
// Send editor changes
const handleEditorChange = (content, delta, source) => {
  const message = {
    type: 'EDITOR_CHANGE',
    data: {
      html: quill.root.innerHTML,
      delta: quill.getContents(),
      text: quill.getText()
    }
  };
  
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
};

// Send custom events
const sendCustomEvent = (eventType, payload) => {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: eventType,
    data: payload
  }));
};

// Listen for text changes
quill.on('text-change', handleEditorChange);
```

### React Native to Web
```jsx
// React Native WebView
const setEditorContent = (content) => {
  const jsCode = `
    quill.setContents(${JSON.stringify(content)});
    true; // Required for injectJavaScript
  `;
  webviewRef.current.injectJavaScript(jsCode);
};

// Listen for messages from React Native
document.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'SET_CONTENT':
      quill.setContents(message.data);
      break;
    case 'APPLY_FORMAT':
      quill.format(message.format, message.value);
      break;
    case 'INSERT_TEXT':
      quill.insertText(message.index, message.text);
      break;
  }
});

<WebView
  ref={webviewRef}
  source={{ uri: 'path/to/quill/editor' }}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    handleMessageFromWeb(data);
  }}
/>
```

## HTML Serialization

### Built-in Support
```jsx
// Export to HTML
const serializeToHtml = () => {
  return quill.root.innerHTML;
  // Or use semantic HTML (newer API)
  // return quill.getSemanticHTML();
};

// Export to Delta (recommended)
const serializeToDelta = () => {
  return quill.getContents();
};

// Import from HTML
const deserializeFromHtml = (htmlString) => {
  quill.clipboard.dangerouslyPasteHTML(htmlString);
};

// Convert Delta to HTML
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

const deltaToHtml = (delta) => {
  const converter = new QuillDeltaToHtmlConverter(delta.ops, {});
  return converter.convert();
};
```

## Project Structure

```
/src/editors/quill/
  /components/
    QuillEditor.jsx         # Main editor component
    CustomToolbar.jsx       # Custom toolbar implementation
    MentionsList.jsx        # Mention dropdown component
    LinkDialog.jsx          # Link insertion dialog
  /modules/
    mentions.js             # Mention module configuration
    imageUploader.js        # Image upload handling
    customFormats.js        # Custom format definitions
  /utils/
    serialization.js        # HTML/Delta conversion utilities
    webview-bridge.js       # WebView communication
  /styles/
    quill-theme.css         # Custom theme styling
    custom-formats.css      # Custom format styles
```

## Implementation Checklist

### Core Editor Setup
- [ ] ReactQuill component with theme configuration
- [ ] Module system with toolbar, syntax, and mention modules
- [ ] Format registration for all supported formats
- [ ] Event handling for content changes and selection

### Module Configuration
- [ ] Toolbar module with complete formatting options
- [ ] Syntax module with highlight.js integration
- [ ] Mention module with quill-mention plugin
- [ ] Custom modules for specialized functionality

### Feature Implementation
- [ ] Text formatting with active state management
- [ ] Heading system with custom labels
- [ ] List functionality with nesting support
- [ ] Code blocks with syntax highlighting
- [ ] Link handling with custom insertion dialog
- [ ] Mention system with async data sources

### WebView Integration
- [ ] Message posting from web to native
- [ ] JavaScript injection from native to web
- [ ] Error handling for communication failures
- [ ] Message protocol documentation

### Serialization
- [ ] HTML export using root.innerHTML or getSemanticHTML()
- [ ] Delta format for Quill-native serialization
- [ ] HTML import using dangerouslyPasteHTML()
- [ ] Round-trip testing for data integrity

### Theme Configuration
- [ ] Snow theme with custom CSS overrides
- [ ] Toolbar styling for mobile compatibility
- [ ] Format-specific styling (code blocks, mentions, etc.)
- [ ] Responsive design for WebView environments

## Key Advantages of Quill.js

### Maturity Benefits
- Battle-tested with extensive documentation
- Large community and ecosystem support
- Proven reliability in production environments
- Comprehensive API with consistent behavior

### Architecture Benefits
- Configuration-driven approach for easy customization
- Modular system with clear separation of concerns
- Built-in format system with comprehensive support
- Delta format for efficient change representation

### Development Benefits
- React integration with react-quill wrapper
- Extensive plugin ecosystem (mentions, image upload, etc.)
- Native WebView support through dedicated packages
- Clean API design with intuitive method names

## Testing Strategy

### Unit Tests
- [ ] Module functionality testing
- [ ] Format application and detection
- [ ] Delta operations and transformations
- [ ] Serialization round-trip tests

### Integration Tests
- [ ] WebView communication reliability
- [ ] Cross-platform compatibility testing
- [ ] Performance testing with large documents
- [ ] Mobile touch interaction testing

### User Testing
- [ ] Toolbar usability on mobile devices
- [ ] Keyboard shortcut functionality
- [ ] Copy/paste behavior across platforms
- [ ] Accessibility compliance

## Development Workflow

1. **Setup**: Initialize ReactQuill with base configuration and theme
2. **Modules**: Configure and register all required modules
3. **Toolbar**: Implement complete toolbar with custom handlers
4. **WebView**: Set up bidirectional communication protocol
5. **Serialization**: Implement HTML/Delta conversion utilities
6. **Theme**: Apply custom styling for brand consistency
7. **Testing**: Comprehensive testing across all features

## Resources

- [Quill.js Documentation](https://quilljs.com/docs/)
- [ReactQuill GitHub](https://github.com/zenoamaro/react-quill)
- [Quill Mention Plugin](https://github.com/quill-mention/quill-mention)
- [Quill Delta to HTML](https://www.npmjs.com/package/quill-delta-to-html)
- [React Native WebView Quill](https://www.npmjs.com/package/react-native-webview-quill)

## Migration from Other Editors

If migrating from Slate.js or Lexical:
- Replace editor components with ReactQuill wrapper
- Convert custom elements to Quill formats or modules
- Update serialization logic to use Delta/HTML conversion
- Adapt plugins to Quill's module system
- Update WebView communication to use Quill's event system