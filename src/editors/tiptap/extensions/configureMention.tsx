import Mention from '@tiptap/extension-mention'
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { MentionList } from '../components/MentionList'
import { MentionUser } from './MentionExtension'

export function configureMention(users: MentionUser[]) {
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

            // @ts-ignore
            return component?.ref?.onKeyDown?.(props)
          },

          onExit() {
            popup?.destroy()
            component?.destroy()
          },
        }
      },
    },
  })
}