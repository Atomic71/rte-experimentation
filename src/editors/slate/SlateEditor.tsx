import React, { useState, useCallback, useEffect } from 'react';
import { Descendant } from 'slate';
import { Slate, Editable } from 'slate-react';
import { Toolbar } from './components/Toolbar';
import { renderElement } from './components/ElementRenderer';
import { renderLeaf } from './components/LeafRenderer';
import { handleKeyDown } from './utils/keyboard-shortcuts';
import { serialize } from './utils/serialization';
import { simplifiedBridge } from '../common/simplified-bridge';
import { useSlateEditor } from './hooks/useSlateEditor';
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

  // Set up simplified WebView bridge
  useEffect(() => {
    const handleGetContent = () => {
      const html = serialize(value);
      simplifiedBridge.sendContent(html);
    };

    const handleSetContent = (event: CustomEvent) => {
      const html = event.detail;
      const newValue = deserialize(html);
      setValue(newValue);
    };

    window.addEventListener('webview-get-content', handleGetContent as any);
    window.addEventListener('webview-set-content', handleSetContent as any);
    
    // Notify that editor is ready
    simplifiedBridge.notifyReady();

    return () => {
      window.removeEventListener('webview-get-content', handleGetContent as any);
      window.removeEventListener('webview-set-content', handleSetContent as any);
    };
  }, [value]);

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue);
  }, []);

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
          onKeyDown={(event) => handleKeyDown(event, editor)}
          spellCheck
          autoFocus
        />
      </Slate>
    </div>
  );
};
