# Mentions Implementation Guide

## Overview

This guide covers the implementation of mentions (@username) functionality in both Slate.js and Lexical editors, designed for WebView integration with React Native applications.

## Architecture

### Data Structure
Mentions are stored as special inline elements/nodes within the editor's document structure:

```typescript
interface User {
  id: string;      // Unique identifier
  name: string;    // Display name
  username: string; // @handle
}
```

### HTML Serialization Format
Mentions are serialized to HTML as spans with data attributes:

```html
<span 
  data-mention-id="user_001" 
  data-mention-name="Alice Johnson"
  data-mention-username="@alice"
  contenteditable="false"
  style="background: #e8f4fd; color: #1976d2; padding: 2px 4px; border-radius: 3px;">
  @alice
</span>
```

## Slate.js Implementation

### 1. Mention Element Type
```typescript
// In types.ts
type MentionElement = {
  type: 'mention';
  userId: string;
  userName: string;
  username: string;
  children: [{ text: '' }];
}
```

### 2. Rendering Mentions
The mention element is rendered as a non-editable inline span in `ElementRenderer.tsx`:
- `contentEditable={false}` prevents editing
- Styled with blue background for visibility
- Stores user data in data attributes

### 3. Mention Detection Flow
1. User types "@" character
2. Capture subsequent characters as search query
3. Filter users based on query
4. Display dropdown with matches
5. On selection, insert mention element

### 4. Keyboard Navigation
- Arrow keys: Navigate dropdown
- Enter: Select highlighted user
- Escape: Close dropdown
- Continue typing: Filter results

### 5. Serialization
- **To HTML**: Convert mention elements to spans with data attributes
- **From HTML**: Parse spans with data-mention attributes back to mention elements

## Lexical Implementation

### 1. BeautifulMentionNode
Using the `lexical-beautiful-mentions` package:
```typescript
import { BeautifulMentionNode, BeautifulMentionsPlugin } from 'lexical-beautiful-mentions';
```

### 2. Plugin Configuration
```typescript
<BeautifulMentionsPlugin
  triggers={['@']}
  onSearch={async (trigger, query) => {
    return searchUsers(query || '').map(user => ({
      value: user.username,
      id: user.id,
      data: user
    }));
  }}
/>
```

### 3. Node Registration
Add `BeautifulMentionNode` to the editor config nodes array.

### 4. Serialization
- Lexical automatically handles HTML serialization
- Mentions are preserved in editor state JSON

## React Native Integration

### 1. Extracting Mentions from HTML
```javascript
function extractMentions(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const mentions = [];
  
  doc.querySelectorAll('[data-mention-id]').forEach(element => {
    mentions.push({
      id: element.dataset.mentionId,
      name: element.dataset.mentionName,
      username: element.dataset.mentionUsername,
      text: element.textContent
    });
  });
  
  return mentions;
}
```

### 2. Handling Mention Clicks
```javascript
webView.onMessage = (event) => {
  const { type, data } = JSON.parse(event.nativeEvent.data);
  
  if (type === 'MENTION_CLICK') {
    const { userId, userName } = data;
    // Handle mention click (e.g., navigate to user profile)
  }
};
```

### 3. Updating Mention Data
To update a user's display name:
1. Get current HTML content
2. Parse and find mentions with matching user ID
3. Update data attributes and text content
4. Set updated HTML back to editor

## WebView Communication

### Getting Content with Mentions
```javascript
// React Native side
webView.postMessage(JSON.stringify({ type: 'GET_CONTENT' }));

// WebView responds with HTML containing mention spans
```

### Setting Content with Mentions
```javascript
// React Native side
const htmlWithMentions = '<p>Hello <span data-mention-id="user_001">@alice</span></p>';
webView.postMessage(JSON.stringify({ 
  type: 'SET_CONTENT', 
  html: htmlWithMentions 
}));
```

## Common Issues and Solutions

### 1. Cursor Navigation
**Issue**: Cursor gets stuck around mentions
**Solution**: Make mentions atomic units - cursor jumps over them

### 2. Deletion Handling
**Issue**: Partial deletion of mentions
**Solution**: Delete entire mention element on backspace/delete

### 3. Copy/Paste
**Issue**: Mentions lose formatting when pasted
**Solution**: Preserve data attributes in clipboard HTML

### 4. Search Performance
**Issue**: Dropdown lags with large user lists
**Solution**: Debounce search, limit results to 10-20 users

### 5. Mobile Keyboard
**Issue**: Dropdown position incorrect on mobile
**Solution**: Calculate position relative to viewport, account for keyboard height

## Testing Checklist

- [ ] Type @ to trigger mention dropdown
- [ ] Search filters users correctly
- [ ] Arrow keys navigate dropdown
- [ ] Enter selects user
- [ ] Escape closes dropdown
- [ ] Mention appears as styled, non-editable element
- [ ] Backspace deletes entire mention
- [ ] Copy/paste preserves mentions
- [ ] HTML export includes data attributes
- [ ] HTML import recreates mentions
- [ ] Multiple mentions in same paragraph
- [ ] Mentions at start/middle/end of text
- [ ] WebView GET_CONTENT includes mentions
- [ ] WebView SET_CONTENT preserves mentions

## Performance Considerations

1. **Lazy Load Users**: Don't load all 100 users immediately
2. **Debounce Search**: Wait 150ms after typing before filtering
3. **Virtualize Dropdown**: For large lists, only render visible items
4. **Cache Results**: Store recent searches to avoid recomputation
5. **Optimize Regex**: Use efficient patterns for @ detection

## Accessibility

1. Add `role="button"` to mention elements
2. Include `aria-label` with full user name
3. Make mentions keyboard navigable
4. Announce selection to screen readers
5. Ensure sufficient color contrast

## Future Enhancements

1. **Multiple Mention Types**: Support @users, #hashtags, :emojis
2. **Rich Previews**: Show user avatar in dropdown
3. **Recent Mentions**: Quick access to recently used mentions
4. **Mention Groups**: @team, @everyone functionality
5. **Offline Support**: Cache user data for offline editing