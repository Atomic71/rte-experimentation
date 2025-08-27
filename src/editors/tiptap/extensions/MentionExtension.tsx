import { ReactRenderer } from '@tiptap/react'
import Mention from '@tiptap/extension-mention'
import { SuggestionOptions } from '@tiptap/suggestion'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { MentionList } from '../components/MentionList'

export interface MentionUser {
  id: string
  name: string
  avatar?: string
}

interface MentionExtensionOptions {
  users: MentionUser[]
  suggestion?: Partial<SuggestionOptions>
}

export const MentionExtension = Mention.configure({
  suggestion: {
    items: ({ query: _ }: { query: string }) => {
      // This will be overridden by the actual configuration
      return []
    },
    render: () => {
      let component: ReactRenderer | null = null
      let popup: TippyInstance | null = null

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          })[0]
        },

        onUpdate(props: any) {
          component?.updateProps(props)

          if (!props.clientRect) {
            return
          }

          popup?.setProps({
            getReferenceClientRect: props.clientRect,
          })
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            popup?.hide()
            return true
          }

          // @ts-ignore - ref might have onKeyDown method
          return component?.ref?.onKeyDown?.(props)
        },

        onExit() {
          popup?.destroy()
          component?.destroy()
        },
      }
    },
  },
}).extend<MentionExtensionOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      users: [],
      suggestion: {
        ...this.parent?.().suggestion,
        items: ({ query }: { query: string }) => {
          // @ts-ignore - this.options is available in the extension context
          const users = this.options.users || []
          return users
            .filter((user: MentionUser) =>
              user.name.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5)
        },
      },
    }
  },
})