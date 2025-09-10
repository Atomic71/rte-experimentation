import { webViewBridge } from '@/utils/WebviewBridge';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useEffect } from 'react';

export function MentionNode(props: NodeViewProps) {
  const { id, userId, label, username } = props.node.attrs;
  const mentionId = userId || id;

  useEffect(() => {
    // On mount - mention was added

    webViewBridge.sendMentionAdded(mentionId);

    // On unmount - mention was removed
    return () => {
      console.log('Mention removed:', mentionId);
      webViewBridge.sendMentionRemoved(mentionId);
    };
  }, [mentionId]); // Only re-run if mentionId changes

  return (
    <NodeViewWrapper
      className='mention'
      as='span'
    >
      <span
        className='mention'
        data-mention-id={mentionId}
      >
        {label || `@${username}`}
      </span>
    </NodeViewWrapper>
  );
}
