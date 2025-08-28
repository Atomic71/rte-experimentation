import { useEffect, useState, useCallback } from 'react'
import { Editor, Transforms } from 'slate'
import { webViewBridge } from '../../common/webview-bridge'
import { MentionUser, MentionsConfig } from '../../common/types'
import { detectMentionTrigger, MentionState } from '../plugins/mentions'

export const useMentions = (editor: Editor) => {
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

  const detectMention = useCallback(() => {
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
  }, [mentionState.search, queryMentions, mentionsEnabled, editor])

  const insertMention = useCallback((user: MentionUser) => {
    if (mentionState.targetRange) {
      // Insert mention node
      Transforms.select(editor, mentionState.targetRange)
      Transforms.insertNodes(editor, {
        type: 'mention',
        userId: user.id,
        userName: user.name,
        username: user.username,
        children: [{ text: '' }]
      } as any)
      
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
  }, [mentionState.targetRange, editor])

  const handleMentionKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!mentionState.isActive || !mentionState.users || mentionState.users.length === 0) return false

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setMentionState(prev => ({
          ...prev,
          index: Math.min(prev.index + 1, (prev.users?.length || 0) - 1)
        }))
        return true
      case 'ArrowUp':
        event.preventDefault()
        setMentionState(prev => ({
          ...prev,
          index: Math.max(prev.index - 1, 0)
        }))
        return true
      case 'Enter':
        if (mentionState.users && mentionState.users.length > 0) {
          event.preventDefault()
          insertMention(mentionState.users[mentionState.index])
        }
        return true
      case 'Escape':
        event.preventDefault()
        setMentionState({
          isActive: false,
          search: '',
          index: 0,
          targetRange: null,
          users: []
        })
        return true
      default:
        return false
    }
  }, [mentionState, insertMention])

  return {
    mentionState,
    detectMention,
    insertMention,
    handleMentionKeyDown
  }
}