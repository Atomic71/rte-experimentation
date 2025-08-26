# HTML Export Feature Implementation

## Summary
Both Slate and Lexical editors now emit HTML alongside their native content format through the WebView bridge back to React Native.

## Changes Made

### Slate Editor
1. **Modified `SlateEditor.tsx`:**
   - Updated `handleChange` to serialize content to HTML and include it in the change notification
   - Modified `getContent()` to return both Slate format and HTML
   - Enhanced `setContent()` to handle both legacy and new data structures

2. **Enhanced `serialization.ts`:**
   - Added support for `dir` attribute in HTML serialization to preserve RTL/LTR direction
   - Improved HTML generation with proper direction attributes

### Lexical Editor
- Already had HTML export functionality in place
- Confirmed `getContent()` returns both JSON and HTML formats
- Change notifications include HTML automatically

### Data Structure
The bridge now sends data in the following format:

```javascript
// Slate Editor
{
  format: 'slate',
  data: {
    slate: [...],  // Native Slate format
    html: '<p>...'  // HTML representation
  }
}

// Lexical Editor
{
  format: 'lexical',
  data: {
    json: '...',    // Lexical JSON state
    html: '<p>...'  // HTML representation
  }
}
```

## WebView Bridge Messages

### On Content Change
```javascript
{
  type: 'CHANGE',
  payload: {
    format: 'slate' | 'lexical',
    data: {
      // Native format data
      html: '<p>Content...</p>'
    }
  },
  editor: 'slate' | 'lexical',
  timestamp: 1234567890
}
```

### On Export HTML Request
```javascript
// Request
{ type: 'EXPORT_HTML' }

// Response
{
  type: 'EXPORT_HTML',
  payload: {
    html: '<p>Full HTML content...</p>'
  }
}
```

## Testing
Created `test-webview-bridge.html` to visualize:
- Real-time message logging from the WebView bridge
- Live HTML preview as content changes
- Raw HTML output for debugging

## Usage in React Native
The React Native app can now:
1. Receive HTML on every content change via the `CHANGE` event
2. Request HTML export at any time using `EXPORT_HTML` message
3. Import HTML content using `IMPORT_HTML` message
4. Access both native format and HTML simultaneously

## Benefits
- **Cross-platform compatibility:** HTML can be used across different editors and platforms
- **Preview generation:** Easy to generate previews without parsing native formats
- **Data portability:** Content can be easily moved between different editor types
- **Search indexing:** HTML content can be indexed for search functionality
- **Email/export:** Ready-to-use HTML for email or document export features