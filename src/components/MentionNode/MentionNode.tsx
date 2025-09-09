import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useEffect } from 'react';
import { webViewBridge } from '@/utils/WebviewBridge';

export function MentionNode(props: NodeViewProps) {
  const { id, userId, label, username } = props.node.attrs;
  const mentionId = userId || id;

  useEffect(() => {
    // On mount - mention was added
    const mentionData = {
      id: mentionId,
      mentionText: label || `@${username}`,
      start: props.getPos?.() || 0,
      end: (props.getPos?.() || 0) + props.node.nodeSize,
    };
    
    console.log('Mention added:', mentionData);
    webViewBridge.sendMentionAdded(mentionData);

    // On unmount - mention was removed
    return () => {
      console.log('Mention removed:', mentionId);
      webViewBridge.sendMentionRemoved(mentionId);
    };
  }, [mentionId]); // Only re-run if mentionId changes

  return (
    <NodeViewWrapper className="mention" as="span">
      <span className="mention" data-mention-id={mentionId}>
        {label || `@${username}`}
      </span>
    </NodeViewWrapper>
  );
}