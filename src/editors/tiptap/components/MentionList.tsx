import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { MentionUser } from '../extensions/MentionExtension'

export interface MentionListProps {
  items: MentionUser[]
  command: (item: any) => void
}

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item.id, label: item.name })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  if (props.items.length === 0) {
    return <div className="mention-list-empty">No users found</div>
  }

  return (
    <div className="mention-list">
      {props.items.map((item, index) => (
        <button
          className={`mention-list-item ${index === selectedIndex ? 'selected' : ''}`}
          key={item.id}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          {item.avatar && (
            <img src={item.avatar} alt={item.name} className="mention-avatar" />
          )}
          <span className="mention-name">{item.name}</span>
        </button>
      ))}
    </div>
  )
})