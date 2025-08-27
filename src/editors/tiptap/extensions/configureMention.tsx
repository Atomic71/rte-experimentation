import Mention from '@tiptap/extension-mention'
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { MentionList } from '../components/MentionList'

export interface MentionUser {
  id: string
  name: string
  avatar?: string
}

export function configureMention(users: MentionUser[] = []) {
  return Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
    suggestion: {
      items: ({ query }: { query: string }) => {
        return users
          .filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
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
          },
        }
      },
    },
  })
}