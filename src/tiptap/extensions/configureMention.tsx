import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { MentionList } from '../components';
import { webViewBridge, MentionUser } from '../webview-bridge';

// Simplified state management for mention queries
let currentQuery: {
  query: string;
  resolve: (users: MentionUser[]) => void;
  timeout: ReturnType<typeof setTimeout>;
} | null = null;
let mentionsEnabled = true;
let callbacksSetUp = false;
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

export function configureMention() {
  // Only set up callbacks once to prevent multiple initialization
  if (!callbacksSetUp) {
    // Listen for results from RN
    webViewBridge.callbacks.onMentionResults = (users, query) => {
      webViewBridge.postMessage('DEBUG', {
        step: 'tiptap_received_mention_results',
        users,
        query,
        currentQueryExists: !!currentQuery,
      });

      // Only resolve if this matches the current query
      if (currentQuery?.query === query) {
        webViewBridge.postMessage('DEBUG', {
          step: 'resolving_current_query',
          query,
        });
        clearTimeout(currentQuery.timeout);
        currentQuery.resolve(users);
        currentQuery = null;
      } else {
        webViewBridge.postMessage('DEBUG', {
          step: 'query_mismatch_or_stale',
          query,
          currentQuery: currentQuery?.query,
        });
      }
    };

    // Listen for config updates
    webViewBridge.callbacks.onMentionsConfigUpdate = (config) => {
      mentionsEnabled = config.enabled;
      // Could also update other settings like debounce, triggers, etc
    };

    webViewBridge.postMessage('DEBUG', {
      step: 'tiptap_mention_callback_setup_complete',
    });
    callbacksSetUp = true;
  }

  return Mention.configure({
    HTMLAttributes: { class: 'mention' },
    suggestion: {
      items: async ({ query }) => {
        // Check if mentions are enabled
        if (!mentionsEnabled || !webViewBridge.getMentionsConfig().enabled) {
          return [];
        }

        const config = webViewBridge.getMentionsConfig();

        // Check minimum query length
        if (config.minQueryLength && query.length < config.minQueryLength) {
          return [];
        }

        // Check for spaces if not allowed
        if (!config.allowSpaces && query.includes(' ')) {
          return [];
        }

        // Wait for results with debounced query
        return new Promise<MentionUser[]>((resolve) => {
          webViewBridge.postMessage('DEBUG', {
            step: 'setting_up_promise',
            query,
          });

          // Cancel previous query if exists
          if (currentQuery) {
            clearTimeout(currentQuery.timeout);
          }

          // Cancel previous debounce
          if (debounceTimeout) {
            clearTimeout(debounceTimeout);
          }

          // Set up new query
          currentQuery = {
            query,
            resolve,
            timeout: setTimeout(() => {
              if (currentQuery?.query === query) {
                webViewBridge.postMessage('DEBUG', {
                  step: 'mention_query_timeout',
                  query,
                });
                resolve([]);
                currentQuery = null;
              }
            }, 2000), // 2 seconds - realistic for React Native response
          };

          // Debounce the actual RN query
          debounceTimeout = setTimeout(() => {
            if (currentQuery?.query === query) {
              webViewBridge.postMessage('DEBUG', {
                step: 'sending_mention_query',
                query,
              });
              webViewBridge.queryMentions(query);
            }
          }, 300); // 300ms debounce
        });
      },

      render() {
        let component: ReactRenderer | null = null;
        let popup: TippyInstance | null = null;

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionList, {
              props,
              editor: props.editor,
            });

            if (!props.clientRect) {
              return;
            }

            const getClientRect = () => {
              const rect = props.clientRect?.();
              return (
                rect ||
                ({
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  width: 0,
                  height: 0,
                } as DOMRect)
              );
            };

            popup = tippy(document.body, {
              getReferenceClientRect: getClientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            });
          },

          onUpdate: (props) => {
            component?.updateProps(props);

            if (!props.clientRect) {
              return;
            }

            const getClientRect = () => {
              const rect = props.clientRect?.();
              return (
                rect ||
                ({
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  width: 0,
                  height: 0,
                } as DOMRect)
              );
            };

            popup?.setProps({
              getReferenceClientRect: getClientRect,
            });
          },

          onKeyDown: (props) => {
            if (props.event.key === 'Escape') {
              popup?.hide();
              return true;
            }

            return (component?.ref as any)?.onKeyDown?.(props) || false;
          },

          onExit: () => {
            popup?.destroy();
            component?.destroy();
          },
        };
      },
    },
  });
}
