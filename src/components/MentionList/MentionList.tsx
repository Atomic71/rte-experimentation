import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import './MentionList.css';
import { webViewBridge } from '@/utils/WebviewBridge';
import { MentionUser } from '@/utils/WebviewBridge/types';
import { useMentionContext } from '@/components/MentionContext';

export interface MentionItem extends MentionUser {
  isError?: boolean;
  errorType?: 'timeout' | 'no-results' | 'general';
}

export interface MentionListProps {
  items: MentionItem[];
  command: (item: any) => void;
}

const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isLoadingMentions, currentQuery } = useMentionContext();

  // Debug logging
  webViewBridge.postMessage('DEBUG', {
    step: 'mention_list_render',
    isLoadingMentions,
    currentQuery,
    itemsLength: props.items.length,
    items: props.items.map(i => ({ id: i.id, name: i.name, isError: i.isError }))
  });

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item && !item.isError) {
      // Notify RN of selection
      webViewBridge.sendMentionSelected(item);

      // Execute command with TipTap expected format
      props.command({
        id: item.id,
        label: `@${item.username}`,
        userId: item.id,
        userName: item.name,
        username: item.username,
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

  // Show loading state - either when no items and loading, or when we have items but still loading
  if (isLoadingMentions) {
    return (
      <div className='mention-list'>
        <div className='mention-list-loading-item'>
          <div className='loading-spinner'></div>
          <span>Searching for "{currentQuery}"...</span>
        </div>
        {/* Show existing items while loading if any */}
        {props.items.length > 0 && props.items.map((item, index) => (
          <button
            className={`mention-list-item ${
              index === selectedIndex ? 'selected' : ''
            } ${item.isError ? 'error' : ''} ${
              item.errorType ? `error-${item.errorType}` : ''
            } loading-overlay`}
            key={item.id}
            onClick={() => !item.isError && selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            disabled={item.isError || isLoadingMentions}
          >
            {item.isError ? (
              <div className='mention-error'>
                {item.errorType === 'timeout' && (
                  <span className='error-icon'>⏱️</span>
                )}
                {item.errorType === 'no-results' && (
                  <span className='error-icon'>🔍</span>
                )}
                {item.errorType === 'general' && (
                  <span className='error-icon'>❌</span>
                )}
                <span className='error-message'>{item.name}</span>
              </div>
            ) : (
              <>
                {item.avatar && (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className='mention-avatar'
                  />
                )}
                <div className='mention-info'>
                  <span className='mention-name'>{item.name}</span>
                  <span className='mention-username'>@{item.username}</span>
                </div>
              </>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Show empty state only if not loading and no items
  if (props.items.length === 0) {
    return <div className='mention-list-empty'>No users found</div>;
  }

  return (
    <div className='mention-list'>
      {props.items.map((item, index) => (
        <button
          className={`mention-list-item ${
            index === selectedIndex ? 'selected' : ''
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
                <span className='error-icon'>⏱️</span>
              )}
              {item.errorType === 'no-results' && (
                <span className='error-icon'>🔍</span>
              )}
              {item.errorType === 'general' && (
                <span className='error-icon'>❌</span>
              )}
              <span className='error-message'>{item.name}</span>
            </div>
          ) : (
            <>
              {item.avatar && (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className='mention-avatar'
                />
              )}
              <div className='mention-info'>
                <span className='mention-name'>{item.name}</span>
                <span className='mention-username'>@{item.username}</span>
              </div>
            </>
          )}
        </button>
      ))}
    </div>
  );
});

export default MentionList;
