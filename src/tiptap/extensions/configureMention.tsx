import Mention from '@tiptap/extension-mention'
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { MentionList } from '../components/MentionList'
import { webViewBridge, MentionUser } from '../webview-bridge'

export function configureMention() {
  let resolveSearch: ((users: MentionUser[]) => void) | null = null
  let mentionsEnabled = true
  let pendingQueries = new Map<string, (users: MentionUser[]) => void>()

  // Listen for results from RN
  webViewBridge.callbacks.onMentionResults = (users) => {
    webViewBridge.postMessage('DEBUG', { 
      step: 'tiptap_received_mention_results',
      users,
      resolveSearchExists: !!resolveSearch,
      pendingQueriesCount: pendingQueries.size 
    })
    
    // Try current resolveSearch first
    if (resolveSearch) {
      webViewBridge.postMessage('DEBUG', { step: 'resolving_via_current_callback' })
      resolveSearch(users)
      resolveSearch = null
    } 
    // Fallback: resolve any pending queries
    else if (pendingQueries.size > 0) {
      const [firstQuery, resolve] = Array.from(pendingQueries.entries())[0]
      webViewBridge.postMessage('DEBUG', { step: 'resolving_via_pending_queries', query: firstQuery })
      resolve(users)
      pendingQueries.delete(firstQuery)
    } else {
      webViewBridge.postMessage('DEBUG', { step: 'no_callback_available', issue: 'This is likely the problem!' })
    }
  }
  
  webViewBridge.postMessage('DEBUG', { step: 'tiptap_mention_callback_setup_complete' })

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

        // Send query to RN
        webViewBridge.postMessage('DEBUG', { step: 'sending_mention_query', query })
        webViewBridge.queryMentions(query)
        
        // Wait for results with configured timeout
        return new Promise<MentionUser[]>((resolve) => {
          webViewBridge.postMessage('DEBUG', { step: 'setting_up_promise', query })
          resolveSearch = resolve
          pendingQueries.set(query, resolve)
          
          // Timeout fallback
          setTimeout(() => {
            if (resolveSearch === resolve) {
              webViewBridge.postMessage('DEBUG', { step: 'mention_query_timeout', query })
              resolve([])
              resolveSearch = null
            }
            // Clean up pending query
            pendingQueries.delete(query)
          }, 1000)
        })
      },

      render() {
        let component: ReactRenderer | null = null
        let popup: TippyInstance | null = null

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionList, {
              props,
              editor: props.editor,
            })

            if (!props.clientRect) {
              return
            }

            const getClientRect = () => {
              const rect = props.clientRect?.()
              return rect || ({
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: 0,
                height: 0
              } as DOMRect)
            }

            popup = tippy(document.body, {
              getReferenceClientRect: getClientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            })
          },
          
          onUpdate: (props) => {
            component?.updateProps(props)

            if (!props.clientRect) {
              return
            }

            const getClientRect = () => {
              const rect = props.clientRect?.()
              return rect || ({
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: 0,
                height: 0
              } as DOMRect)
            }

            popup?.setProps({
              getReferenceClientRect: getClientRect,
            })
          },
          
          onKeyDown: (props) => {
            if (props.event.key === 'Escape') {
              popup?.hide()
              return true
            }

            return (component?.ref as any)?.onKeyDown?.(props) || false
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