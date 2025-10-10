import { useMentionContext } from '@/components/MentionContext';
import { MentionUser } from '@/utils/WebviewBridge/types';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { MdAccessTime, MdSearch, MdError } from 'react-icons/md';
import './MentionList.css';

export interface MentionItem extends MentionUser {
  isError?: boolean;
  errorType?: 'timeout' | 'no-results' | 'general' | 'loading';
  renderLeft?: () => React.ReactNode;
}

export interface MentionListProps {
  items: MentionItem[];
  command: (item: any) => void;
}

const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isLoadingMentions, currentQuery, isTyping } = useMentionContext();

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item && !item.isError) {
      props.command({
        id: item.id,
        label: item.name,
        userId: item.id,
      });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  // // Show typing state - user still typing (interactive)
  // if (isTyping) {
  //   return (
  //     <div className='mention-list-typing'>
  //       <span>Query for: "{currentQuery}"</span>
  //     </div>
  //   );
  // }

  // // Show loading state - user stopped typing, searching (disabled)
  // if () {
  //   return (
  //     <div className='mention-list-item error'>
  //       <MdSearch size={20} />
  //       <span>Searching...</span>
  //     </div>
  //   );
  // }

  // Show empty state only if not loading and no items
  if (props.items.length === 0) {
    return (
      <div className='mention-list-empty'>
        <span>No users found</span>
      </div>
    );
  }
  const isTypingOrLoading = isTyping || isLoadingMentions;

  return (
    <div className='mention-list'>
      {(isLoadingMentions || isTyping) && (
        <button className='mention-list-item error selected'>
          <span className='error-icon'>
            <MdSearch size={20} />
          </span>
          <span>Searching...</span>
        </button>
      )}
      {!isTypingOrLoading &&
        props.items.map((item, index) => (
          <button
            className={`mention-list-item ${
              index === selectedIndex && !item.isError ? 'selected' : ''
            } ${item.isError ? 'error' : ''} ${
              item.errorType ? `error-${item.errorType}` : ''
            }`}
            key={item.id}
            onClick={() => !item.isError && selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            disabled={item.isError}
          >
            {item.isError ? (
              <div className='mention-error'>
                {item.errorType === 'timeout' && (
                  <span className='error-icon'>
                    <MdAccessTime size={20} />
                  </span>
                )}
                {item.errorType === 'no-results' && (
                  <span className='error-icon'>
                    <MdSearch size={20} />
                  </span>
                )}
                {item.errorType === 'general' && (
                  <span className='error-icon'>
                    <MdError size={20} />
                  </span>
                )}
                {item.errorType === 'loading' && (
                  <div className='loading-spinner'></div>
                )}
                <span className='error-message'>{item.name}</span>
              </div>
            ) : (
              <>
                {item.renderLeft
                  ? item.renderLeft()
                  : item.avatar && (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className='mention-avatar'
                      />
                    )}
                <div className='mention-info'>
                  <span className='mention-name'>{item.name}</span>
                </div>
              </>
            )}
          </button>
        ))}
    </div>
  );
});

export default MentionList;
