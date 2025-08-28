import React, { useEffect, useState, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $createBeautifulMentionNode } from 'lexical-beautiful-mentions'
import { webViewBridge } from '../../common/webview-bridge'
import { MentionUser, MentionsConfig } from '../../common/types'
import { MentionsDropdown } from '../../common/MentionsDropdown'

export function MentionsPlugin() {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState('')
  const [results, setResults] = useState<MentionUser[]>([])
  const [mentionsEnabled, setMentionsEnabled] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Listen for results and config
  useEffect(() => {
    const handleResults = (users: MentionUser[]) => {
      setResults(users)
      setIsVisible(users.length > 0)
      setSelectedIndex(0)
    }
    
    const handleConfigUpdate = (config: MentionsConfig) => {
      setMentionsEnabled(config.enabled)
      if (!config.enabled) {
        setResults([])
        setQueryString('')
        setIsVisible(false)
      }
    }

    webViewBridge.callbacks.onMentionResults = handleResults
    webViewBridge.callbacks.onMentionsConfigUpdate = handleConfigUpdate
    return () => {
      webViewBridge.callbacks.onMentionResults = undefined
      webViewBridge.callbacks.onMentionsConfigUpdate = undefined
    }
  }, [])

  // Detect @ trigger and query
  useEffect(() => {
    const removeListener = editor.registerUpdateListener(({ editorState }) => {
      // Skip if mentions disabled
      if (!mentionsEnabled || !webViewBridge.getMentionsConfig().enabled) {
        setIsVisible(false)
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
            const regex = new RegExp(`\\${trigger}(\\w*)$`)
            const match = text.match(regex)
            
            if (match) {
              const query = match[1]
              
              // Validate query
              if (config.minQueryLength && query.length < config.minQueryLength) {
                setQueryString('')
                setResults([])
                setIsVisible(false)
                return
              }
              if (!config.allowSpaces && query.includes(' ')) {
                setQueryString('')
                setResults([])
                setIsVisible(false)
                return
              }
              
              if (query !== queryString) {
                setQueryString(query)
                webViewBridge.queryMentions(query)
                matchFound = true
              }
              break
            }
          }
          
          if (!matchFound && (queryString || isVisible)) {
            setQueryString('')
            setResults([])
            setIsVisible(false)
          }
        }
      })
    })

    return removeListener
  }, [editor, mentionsEnabled, queryString, isVisible])

  const insertMention = useCallback((user: MentionUser) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        // Insert mention node directly
        const mentionNode = $createBeautifulMentionNode('@', user.username, {
          id: user.id,
          name: user.name
        })
        
        selection.insertNodes([mentionNode])
        
        // Notify RN
        webViewBridge.sendMentionSelected(user)
      }
    })

    // Hide dropdown
    setIsVisible(false)
    setResults([])
    setQueryString('')
  }, [editor])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isVisible || results.length === 0) return false

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        return true
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        return true
      case 'Enter':
        if (results.length > 0) {
          event.preventDefault()
          insertMention(results[selectedIndex])
        }
        return true
      case 'Escape':
        event.preventDefault()
        setIsVisible(false)
        setResults([])
        setQueryString('')
        return true
      default:
        return false
    }
  }, [isVisible, results, selectedIndex, insertMention])

  // Register keyboard event listener
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      handleKeyDown(event as any)
    }

    if (isVisible) {
      document.addEventListener('keydown', handleGlobalKeyDown)
      return () => document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [isVisible, handleKeyDown])

  if (!isVisible || results.length === 0) return null

  return (
    <MentionsDropdown
      users={results}
      selectedIndex={selectedIndex}
      onSelect={insertMention}
      isVisible={isVisible}
      position={{ top: 100, left: 100 }}
    />
  )
}