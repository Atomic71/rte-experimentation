import React, { useState, useCallback, useEffect } from 'react';
import { Descendant } from 'slate';
import { Slate, Editable } from 'slate-react';
import { Toolbar } from './components/Toolbar';
import { renderElement } from './components/ElementRenderer';
import { renderLeaf } from './components/LeafRenderer';
import { handleKeyDown as handleEditorKeyDown } from './utils/keyboard-shortcuts';
import { serialize } from './utils/serialization';
import { webViewBridge, EditorCallbacks } from '../common/webview-bridge';
import { MentionsDropdown } from '../common/MentionsDropdown';
import { useSlateEditor } from './hooks/useSlateEditor';
import { useMentions } from './hooks/useMentions';
import { deserialize } from './utils/serialization';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Welcome to the Slate.js editor! Try using the toolbar or keyboard shortcuts to format your text.',
      },
    ],
  },
];

export const SlateEditor: React.FC = () => {
  const editor = useSlateEditor();
  const [value, setValue] = useState<Descendant[]>(initialValue);
  
  const {
    mentionState,
    detectMention,
    insertMention,
    handleMentionKeyDown,
  } = useMentions(editor);

  // Set up unified WebView bridge
  useEffect(() => {
    const callbacks: EditorCallbacks = {
      onSetContent: (content) => {
        if (content.format === 'slate') {
          setValue(content.data.slate || content.data);
        } else if (content.format === 'html') {
          const htmlContent = typeof content.data === 'string' ? content.data : content.data.html;
          setValue(deserialize(htmlContent));
        }
      },
      onGetContent: () => ({
        format: 'slate',
        data: {
          slate: value,
          html: serialize(value)
        }
      }),
      onExportHTML: () => serialize(value),
      onImportHTML: (html) => {
        setValue(deserialize(html));
      },
      onError: (error) => {
        console.error('Slate Editor Error:', error);
      }
    };

    webViewBridge.initialize('slate', callbacks);

    return () => {
      webViewBridge.destroy();
    };
  }, [value]);

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue);
    detectMention();
    
    // Notify WebView of content changes
    webViewBridge.notifyContentChange({
      format: 'slate',
      data: {
        slate: newValue,
        html: serialize(newValue)
      }
    });
  }, [detectMention]);



  return (
    <div className='editor-container'>
      <Slate
        editor={editor}
        initialValue={value}
        onChange={handleChange}
      >
        <Toolbar />
        <Editable
          className='editor'
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            const mentionHandled = handleMentionKeyDown(event);
            if (!mentionHandled && !event.defaultPrevented) {
              handleEditorKeyDown(event, editor);
            }
          }}
          spellCheck
          autoFocus
        />
      </Slate>
      <MentionsDropdown
        users={mentionState.users || []}
        selectedIndex={mentionState.index}
        onSelect={insertMention}
        isVisible={mentionState.isActive}
        position={mentionState.isActive ? { top: 100, left: 100 } : undefined}
      />
    </div>
  );
};
