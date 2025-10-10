import Mention from '@tiptap/extension-mention';
import { ReactRenderer, ReactNodeViewRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { MentionList } from '@/components';
import { MentionNode } from '@/components/MentionNode';
import { QueryTimeoutError } from '../errors';

/**
 * Configure mentions extension using React Context for state management
 * Requires MentionProvider to be set up in the app tree
 */
export function configureMention(
  queryMentions: (query: string) => Promise<any[]>,
  getMentionsEnabled?: () => boolean
) {
  return Mention.extend({
    addNodeView() {
      return ReactNodeViewRenderer(MentionNode);
    },
  }).configure({
    HTMLAttributes: { class: 'gorgias-mention' },
    suggestion: {
      items: async ({ query }) => {
        // Check if mentions are disabled

        try {
          // Use the passed-in queryMentions function from context
          const results = await queryMentions(query);

          // Handle no results found case
          if (results.length === 0) {
            return [
              {
                id: 'no-results',
                name: query
                  ? `No users found for "${query}"`
                  : 'Type user name',
                username: '',
                isError: true,
                errorType: 'no-results',
              },
            ];
          }

          return results;
        } catch (error) {
          // Return error as special item to display in list
          if (error instanceof QueryTimeoutError) {
            return [
              {
                id: 'timeout-error',
                name: error.message,
                username: '',
                isError: true,
                errorType: 'timeout',
              },
            ];
          }
          return [
            {
              id: 'general-error',
              name: 'Failed to load users',
              username: '',
              isError: true,
              errorType: 'general',
            },
          ];
        }
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
            if (getMentionsEnabled && !getMentionsEnabled()) {
              return;
            }
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
    renderHTML(options) {
      return options.node.attrs.label || `@${options.node.attrs.username}`;
    },
  });
}
