# WebView to React Native Mentions Implementation Plan

## Architecture Overview

```typescript
// Message flow for mentions:
// 1. WebView detects "@" trigger → sends MENTION_QUERY to RN
// 2. RN queries users → sends MENTION_RESULTS back to WebView  
// 3. WebView displays results in dropdown
// 4. User selects → WebView inserts mention
```

## 1. WebView Bridge Extension

### Update `src/editors/common/webview-bridge.ts`:

```typescript
// Add to WebViewMessage type union
type: '...' | 'MENTION_QUERY' | 'MENTION_RESULTS' | 'MENTION_SELECT' | 'SET_MENTIONS_CONFIG'

// Add to EditorCallbacks interface
export interface EditorCallbacks {
  // ... existing callbacks
  onMentionQuery?: (query: string) => void
  onMentionResults?: (results: MentionUser[]) => void
  onMentionsConfigUpdate?: (config: MentionsConfig) => void
}

// Add to handleIncomingMessage switch
case 'MENTION_RESULTS':
  this.callbacks.onMentionResults?.(message.payload.users)
  break

case 'SET_MENTIONS_CONFIG':
  this.callbacks.onMentionsConfigUpdate?.(message.payload)
  break

// Add public methods
queryMentions(query: string) {
  this.postMessage('MENTION_QUERY', { query })
}

sendMentionSelected(user: MentionUser) {
  this.postMessage('MENTION_SELECT', { user })
}

// Store mentions configuration
private mentionsConfig: MentionsConfig = {
  enabled: true,
  allowedTriggers: ['@'],
  maxResults: 10,
  debounceMs: 300
}

getMentionsConfig() {
  return this.mentionsConfig
}

setMentionsConfig(config: Partial<MentionsConfig>) {
  this.mentionsConfig = { ...this.mentionsConfig, ...config }
  this.callbacks.onMentionsConfigUpdate?.(this.mentionsConfig)
}
```

### Common Types (`src/editors/common/types.ts`):

```typescript
export interface MentionUser {
  id: string
  name: string
  username: string
  avatar?: string
}

export interface MentionsConfig {
  enabled: boolean
  allowedTriggers?: string[]  // ['@', '#'] for mentions and hashtags
  maxResults?: number
  debounceMs?: number
  allowSpaces?: boolean  // Whether to allow spaces in queries
  minQueryLength?: number  // Minimum chars before querying
}

export interface MentionQueryPayload {
  query: string
  editorType: string
  trigger?: string  // '@' or '#' etc
}

export interface MentionResultsPayload {
  users: MentionUser[]
  query: string
}

export interface MentionsConfigPayload {
  config: MentionsConfig
}
```

## 2. React Native Side Implementation

### Message Handler (in gorgias-mobile):

```typescript
// WebViewMessageHandler.ts
interface WebViewMessage {
  type: string
  payload: any
  editor: string
  timestamp: number
}

// Mentions configuration state
const [mentionsConfig, setMentionsConfig] = useState<MentionsConfig>({
  enabled: true,
  allowedTriggers: ['@'],
  maxResults: 10,
  debounceMs: 300,
  allowSpaces: false,
  minQueryLength: 1
})

const handleWebViewMessage = async (event: WebViewMessageEvent) => {
  const message: WebViewMessage = JSON.parse(event.nativeEvent.data)
  
  switch (message.type) {
    case 'MENTION_QUERY':
      if (mentionsConfig.enabled) {
        await handleMentionQuery(message.payload.query)
      }
      break
    case 'MENTION_SELECT':
      trackMentionSelection(message.payload.user)
      break
    // ... existing cases
  }
}

// Function to update mentions configuration
const updateMentionsConfig = (config: Partial<MentionsConfig>) => {
  const newConfig = { ...mentionsConfig, ...config }
  setMentionsConfig(newConfig)
  
  // Send config to WebView
  webViewRef.current?.postMessage(JSON.stringify({
    type: 'SET_MENTIONS_CONFIG',
    payload: newConfig
  }))
}

// Expose config controls to UI
export const MentionsConfigControls = () => (
  <View>
    <Switch
      value={mentionsConfig.enabled}
      onValueChange={(enabled) => updateMentionsConfig({ enabled })}
      label="Enable Mentions"
    />
    <Slider
      value={mentionsConfig.maxResults}
      onValueChange={(maxResults) => updateMentionsConfig({ maxResults })}
      minimumValue={1}
      maximumValue={20}
      label="Max Results"
    />
  </View>
)

const handleMentionQuery = async (query: string) => {
  try {
    // Query your user API/database
    const users = await userService.searchUsers(query)
    
    // Transform to WebView format if needed
    const webViewUsers: MentionUser[] = users.map(u => ({
      id: u.id,
      name: u.displayName,
      username: u.handle,
      avatar: u.avatarUrl
    }))
    
    // Send results back to WebView
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'MENTION_RESULTS',
      payload: { 
        users: webViewUsers,
        query 
      }
    }))
  } catch (error) {
    // Send empty results on error
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'MENTION_RESULTS',
      payload: { users: [], query }
    }))
  }
}
```

### WebView Component:

```typescript
// RichTextEditor.tsx
<WebView
  ref={webViewRef}
  source={{ html: editorHTML }}
  onMessage={handleWebViewMessage}
  onLoad={() => {
    // Send initial configuration
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'SET_MENTIONS_CONFIG',
      payload: mentionsConfig
    }))
  }}
  injectedJavaScript={`
    // Ensure bridge is ready
    window.isReactNative = true;
  `}
/>
```

## 3. Editor-Specific Implementations

### TipTap Implementation

```typescript
// src/editors/tiptap/extensions/configureMentionWithHttp.tsx
import Mention from '@tiptap/extension-mention'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { MentionListWithHttp } from '../components/MentionListWithHttp'
import { webViewBridge } from '../../common/webview-bridge'

export function configureMentionWithHttp() {
  let currentQuery = ''
  let searchResults: MentionUser[] = []
  let resolveSearch: ((users: MentionUser[]) => void) | null = null
  let mentionsEnabled = true

  // Listen for results from RN
  webViewBridge.callbacks.onMentionResults = (users) => {
    searchResults = users
    if (resolveSearch) {
      resolveSearch(users)
      resolveSearch = null
    }
  }

  // Listen for config updates
  webViewBridge.callbacks.onMentionsConfigUpdate = (config) => {
    mentionsEnabled = config.enabled
    // Could also update other settings like debounce, triggers, etc
  }

  return Mention.configure({
    HTMLAttributes: { class: 'mention' },
    suggestion: {
      items: async ({ query }) => {
        // Check if mentions are enabled
        if (!mentionsEnabled || !webViewBridge.getMentionsConfig().enabled) {
          return []
        }

        const config = webViewBridge.getMentionsConfig()
        
        // Check minimum query length
        if (config.minQueryLength && query.length < config.minQueryLength) {
          return []
        }
        
        // Check for spaces if not allowed
        if (!config.allowSpaces && query.includes(' ')) {
          return []
        }

        currentQuery = query
        
        // Send query to RN
        webViewBridge.queryMentions(query)
        
        // Wait for results with configured timeout
        return new Promise<MentionUser[]>((resolve) => {
          resolveSearch = resolve
          
          // Timeout fallback
          setTimeout(() => {
            if (resolveSearch === resolve) {
              resolve([])
              resolveSearch = null
            }
          }, 1000)
        })
      },

      render() {
        let component: ReactRenderer | null = null
        let popup: TippyInstance | null = null

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionListWithHttp, {
              props,
              editor: props.editor,
            })

            // ... popup setup
          },
          
          onUpdate: (props) => {
            component?.updateProps(props)
          },
          
          onKeyDown: (props) => {
            return component?.ref?.onKeyDown?.(props) || false
          },
          
          onExit: () => {
            popup?.destroy()
            component?.destroy()
          }
        }
      }
    }
  })
}
```

### Slate Implementation

```typescript
// src/editors/slate/hooks/useMentionsWithHttp.ts
import { useEffect, useState, useCallback } from 'react'
import { webViewBridge } from '../../common/webview-bridge'

export const useMentionsWithHttp = () => {
  const [mentionState, setMentionState] = useState<MentionState>({
    isActive: false,
    search: '',
    index: 0,
    targetRange: null,
    users: []
  })
  
  const [mentionsEnabled, setMentionsEnabled] = useState(true)

  // Listen for results from RN
  useEffect(() => {
    const handleResults = (users: MentionUser[]) => {
      setMentionState(prev => ({
        ...prev,
        users
      }))
    }
    
    const handleConfigUpdate = (config: MentionsConfig) => {
      setMentionsEnabled(config.enabled)
    }

    webViewBridge.callbacks.onMentionResults = handleResults
    webViewBridge.callbacks.onMentionsConfigUpdate = handleConfigUpdate
    return () => {
      webViewBridge.callbacks.onMentionResults = undefined
      webViewBridge.callbacks.onMentionsConfigUpdate = undefined
    }
  }, [])

  const queryMentions = useCallback((search: string) => {
    webViewBridge.queryMentions(search)
  }, [])

  const detectMention = useCallback((editor: Editor) => {
    // Early return if mentions are disabled
    if (!mentionsEnabled || !webViewBridge.getMentionsConfig().enabled) {
      setMentionState({
        isActive: false,
        search: '',
        index: 0,
        targetRange: null,
        users: []
      })
      return
    }

    const state = detectMentionTrigger(editor)
    
    if (state && state.search !== mentionState.search) {
      const config = webViewBridge.getMentionsConfig()
      
      // Validate query against config
      if (config.minQueryLength && state.search.length < config.minQueryLength) {
        return
      }
      if (!config.allowSpaces && state.search.includes(' ')) {
        setMentionState({ ...state, users: [] })
        return
      }
      
      queryMentions(state.search)
      setMentionState({
        ...state,
        users: [] // Clear while loading
      })
    } else if (!state) {
      setMentionState({
        isActive: false,
        search: '',
        index: 0,
        targetRange: null,
        users: []
      })
    }
  }, [mentionState.search, queryMentions, mentionsEnabled])

  const insertMention = useCallback((editor: Editor, user: MentionUser) => {
    if (mentionState.targetRange) {
      // Insert mention node
      Transforms.select(editor, mentionState.targetRange)
      Transforms.insertNodes(editor, {
        type: 'mention',
        userId: user.id,
        userName: user.name,
        username: user.username,
        children: [{ text: '' }]
      })
      
      // Notify RN of selection
      webViewBridge.sendMentionSelected(user)
      
      // Reset state
      setMentionState({
        isActive: false,
        search: '',
        index: 0,
        targetRange: null,
        users: []
      })
    }
  }, [mentionState.targetRange])

  return {
    mentionState,
    detectMention,
    insertMention
  }
}
```

### Lexical Implementation

```typescript
// src/editors/lexical/plugins/MentionsPluginWithHttp.tsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createBeautifulMentionNode } from 'lexical-beautiful-mentions'
import { webViewBridge } from '../../common/webview-bridge'

export function MentionsPluginWithHttp() {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState('')
  const [results, setResults] = useState<MentionUser[]>([])
  const [mentionsEnabled, setMentionsEnabled] = useState(true)

  // Listen for results and config
  useEffect(() => {
    const handleResults = (users: MentionUser[]) => {
      setResults(users)
    }
    
    const handleConfigUpdate = (config: MentionsConfig) => {
      setMentionsEnabled(config.enabled)
      if (!config.enabled) {
        setResults([])
        setQueryString('')
      }
    }

    webViewBridge.callbacks.onMentionResults = handleResults
    webViewBridge.callbacks.onMentionsConfigUpdate = handleConfigUpdate
    return () => {
      webViewBridge.callbacks.onMentionResults = undefined
      webViewBridge.callbacks.onMentionsConfigUpdate = undefined
    }
  }, [])

  // Detect @ trigger
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      // Skip if mentions disabled
      if (!mentionsEnabled || !webViewBridge.getMentionsConfig().enabled) {
        return
      }

      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const text = selection.getTextContent()
          const config = webViewBridge.getMentionsConfig()
          const triggers = config.allowedTriggers || ['@']
          
          // Check for any configured trigger
          let matchFound = false
          for (const trigger of triggers) {
            const regex = new RegExp(`${trigger}(\\w*)$`)
            const match = text.match(regex)
            
            if (match) {
              const query = match[1]
              
              // Validate query
              if (config.minQueryLength && query.length < config.minQueryLength) {
                setQueryString('')
                setResults([])
                return
              }
              if (!config.allowSpaces && query.includes(' ')) {
                setQueryString('')
                setResults([])
                return
              }
              
              setQueryString(query)
              webViewBridge.queryMentions(query)
              matchFound = true
              break
            }
          }
          
          if (!matchFound) {
            setQueryString('')
            setResults([])
          }
        }
      })
    })
  }, [editor, mentionsEnabled])

  const insertMention = useCallback((user: MentionUser) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        // Remove the @ and query text
        const anchor = selection.anchor
        const focus = selection.focus
        const textNode = anchor.getNode()
        
        // Calculate position to remove @query
        const offset = anchor.offset - queryString.length - 1
        selection.anchor.offset = offset
        
        // Insert mention node
        const mentionNode = $createBeautifulMentionNode({
          trigger: '@',
          value: user.username,
          data: {
            id: user.id,
            name: user.name
          }
        })
        
        selection.insertNodes([mentionNode])
        
        // Notify RN
        webViewBridge.sendMentionSelected(user)
      }
    })
  }, [editor, queryString])

  if (!queryString || results.length === 0) return null

  return (
    <MentionDropdown
      users={results}
      onSelect={insertMention}
    />
  )
}
```

## 4. Testing Strategy

### WebView Side Tests:
```typescript
// Mock RN environment
window.ReactNativeWebView = {
  postMessage: jest.fn()
}

// Test query sending
describe('Mention Query', () => {
  it('sends MENTION_QUERY when @ detected', () => {
    typeText('@john')
    expect(window.ReactNativeWebView.postMessage).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'MENTION_QUERY',
        payload: { query: 'john' },
        editor: 'tiptap',
        timestamp: expect.any(Number)
      })
    )
  })
})
```

### RN Side Tests:
```typescript
// Test message handling
it('queries users and sends results back', async () => {
  const mockUsers = [
    { id: '1', name: 'John Doe', username: '@john' }
  ]
  
  userService.searchUsers.mockResolvedValue(mockUsers)
  
  await handleWebViewMessage({
    nativeEvent: {
      data: JSON.stringify({
        type: 'MENTION_QUERY',
        payload: { query: 'john' }
      })
    }
  })
  
  expect(webViewRef.current.postMessage).toHaveBeenCalledWith(
    JSON.stringify({
      type: 'MENTION_RESULTS',
      payload: {
        users: mockUsers,
        query: 'john'
      }
    })
  )
})
```

## 5. Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Extend WebView bridge with mention messages and config
- [ ] Add mention types and MentionsConfig to common/types.ts
- [ ] Create RN message handler skeleton with config state
- [ ] Add mock user service for testing
- [ ] Implement SET_MENTIONS_CONFIG message handling

### Phase 2: TipTap Implementation
- [ ] Create configureMentionWithHttp.tsx with config support
- [ ] Create MentionListWithHttp component
- [ ] Update TipTapRoute to use HTTP mentions
- [ ] Add loading states
- [ ] Handle enable/disable state changes

### Phase 3: Slate Implementation  
- [ ] Create useMentionsWithHttp hook with config support
- [ ] Update SlateEditor to use new hook
- [ ] Create MentionDropdownWithHttp component
- [ ] Handle keyboard navigation
- [ ] Implement config-based validation

### Phase 4: Lexical Implementation
- [ ] Create MentionsPluginWithHttp with config support
- [ ] Update editor config
- [ ] Create dropdown component
- [ ] Handle selection logic
- [ ] Support multiple triggers based on config

### Phase 5: RN Integration
- [ ] Implement user search service
- [ ] Add message handlers with config support
- [ ] Create MentionsConfigControls component
- [ ] Add error handling
- [ ] Add analytics tracking
- [ ] Persist config in AsyncStorage/MMKV

### Phase 6: Testing & Polish
- [ ] Unit tests for each editor with enable/disable
- [ ] Integration tests for config changes
- [ ] Performance optimization
- [ ] Error boundary implementation
- [ ] Test config persistence across sessions

## 6. Error Handling

```typescript
// Timeout handling in WebView
const queryWithTimeout = (query: string, timeout = 1000) => {
  return Promise.race([
    queryMentions(query),
    new Promise<MentionUser[]>((resolve) => 
      setTimeout(() => resolve([]), timeout)
    )
  ])
}

// Error recovery in RN
try {
  const users = await userService.searchUsers(query)
  sendResults(users)
} catch (error) {
  console.error('Mention query failed:', error)
  sendResults([]) // Send empty array on error
}
```

## 7. Performance Considerations

### Debouncing:
```typescript
const debouncedQuery = useMemo(
  () => debounce((query: string) => {
    webViewBridge.queryMentions(query)
  }, 300),
  []
)
```

### Caching:
```typescript
// RN side cache
const mentionCache = new Map<string, MentionUser[]>()

const getCachedOrQuery = async (query: string) => {
  const cached = mentionCache.get(query)
  if (cached) return cached
  
  const results = await userService.searchUsers(query)
  mentionCache.set(query, results)
  
  // Clear old entries
  if (mentionCache.size > 50) {
    const firstKey = mentionCache.keys().next().value
    mentionCache.delete(firstKey)
  }
  
  return results
}
```

### Virtual Scrolling:
```typescript
// For large user lists
<VirtualList
  items={users}
  renderItem={(user) => <MentionItem user={user} />}
  itemHeight={40}
  maxHeight={200}
/>
```

## 8. Migration Strategy

1. **Keep existing local mentions working** during development
2. **Feature flag** to toggle between local and HTTP mentions
3. **Gradual rollout** per editor type
4. **Fallback** to local data if RN communication fails

```typescript
const useMentions = () => {
  const isHttpEnabled = useFeatureFlag('HTTP_MENTIONS')
  
  if (isHttpEnabled && window.ReactNativeWebView) {
    return useMentionsWithHttp()
  }
  
  return useMentionsLocal() // Existing implementation
}
```

## 9. Enable/Disable Mentions Features

### Dynamic Configuration Options

```typescript
interface MentionsConfig {
  enabled: boolean              // Master switch for mentions
  allowedTriggers: string[]      // ['@'] for users, ['#'] for hashtags, etc
  maxResults: number             // Limit dropdown results
  debounceMs: number            // Delay before querying
  allowSpaces: boolean          // Allow spaces in search query
  minQueryLength: number        // Min chars before showing results
}
```

### RN-Side Controls

```typescript
// Settings Screen Component
export const EditorSettingsScreen = () => {
  const [mentionsConfig, setMentionsConfig] = useMMKV('mentions_config', {
    enabled: true,
    allowedTriggers: ['@'],
    maxResults: 10,
    debounceMs: 300
  })

  return (
    <ScrollView>
      <SettingsSection title="Mentions">
        <SwitchRow
          label="Enable Mentions"
          value={mentionsConfig.enabled}
          onValueChange={(enabled) => {
            updateMentionsConfig({ enabled })
          }}
        />
        
        {mentionsConfig.enabled && (
          <>
            <SliderRow
              label="Max Results"
              value={mentionsConfig.maxResults}
              min={1}
              max={20}
              onValueChange={(maxResults) => {
                updateMentionsConfig({ maxResults })
              }}
            />
            
            <SliderRow
              label="Debounce (ms)"
              value={mentionsConfig.debounceMs}
              min={0}
              max={1000}
              step={100}
              onValueChange={(debounceMs) => {
                updateMentionsConfig({ debounceMs })
              }}
            />
            
            <SwitchRow
              label="Allow Spaces in Search"
              value={mentionsConfig.allowSpaces}
              onValueChange={(allowSpaces) => {
                updateMentionsConfig({ allowSpaces })
              }}
            />
          </>
        )}
      </SettingsSection>
    </ScrollView>
  )
}
```

### WebView-Side Handling

```typescript
// Each editor checks config before showing mentions
const shouldShowMentions = () => {
  const config = webViewBridge.getMentionsConfig()
  return config.enabled && window.ReactNativeWebView
}

// Dropdown component conditionally renders
{shouldShowMentions() && mentionState.isActive && (
  <MentionDropdown users={mentionState.users} />
)}
```

### Real-time Toggle

```typescript
// Immediate effect when toggled
webViewBridge.callbacks.onMentionsConfigUpdate = (config) => {
  if (!config.enabled) {
    // Hide any open dropdowns immediately
    closeMentionDropdown()
    clearMentionState()
  } else {
    // Re-enable mention detection
    enableMentionDetection()
  }
}
```

### Per-Editor Toggle

```typescript
// Advanced: Different configs per editor type
interface EditorMentionsConfig extends MentionsConfig {
  enabledEditors?: {
    slate?: boolean
    lexical?: boolean
    tiptap?: boolean
  }
}

// Check editor-specific setting
const isEnabledForEditor = (editorType: string) => {
  const config = webViewBridge.getMentionsConfig()
  return config.enabled && 
    (config.enabledEditors?.[editorType] ?? true)
}
```

### Testing Enable/Disable

```typescript
describe('Mentions Enable/Disable', () => {
  it('should not show dropdown when disabled', async () => {
    // Disable mentions
    await updateConfig({ enabled: false })
    
    // Type mention trigger
    await typeText('@john')
    
    // Verify no dropdown appears
    expect(screen.queryByTestId('mention-dropdown')).toBeNull()
  })
  
  it('should hide dropdown immediately when disabled', async () => {
    // Type with mentions enabled
    await typeText('@john')
    expect(screen.getByTestId('mention-dropdown')).toBeVisible()
    
    // Disable mentions
    await updateConfig({ enabled: false })
    
    // Dropdown should disappear
    expect(screen.queryByTestId('mention-dropdown')).toBeNull()
  })
  
  it('should resume mentions when re-enabled', async () => {
    // Disable then re-enable
    await updateConfig({ enabled: false })
    await updateConfig({ enabled: true })
    
    // Should work normally
    await typeText('@jane')
    expect(screen.getByTestId('mention-dropdown')).toBeVisible()
  })
})
```