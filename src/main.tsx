import React from 'react';
import { createRoot } from 'react-dom/client';
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor, Editor, Descendant } from 'slate';
import './toolbar.css';

type CustomElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
    Text: CustomText;
  }
}

const RN = (window as any).ReactNativeWebView;
const post = (type: string, payload?: any) =>
  RN?.postMessage?.(JSON.stringify({ type, payload }));

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] === true : false;
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const ToolbarButton = ({
  format,
  icon,
  editor,
}: {
  format: string;
  icon: string;
  editor: Editor;
}) => {
  const isActive = isMarkActive(editor, format);
  return (
    <button
      className={`toolbar-button ${isActive ? 'active' : ''}`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </button>
  );
};

const Toolbar = ({ editor }: { editor: Editor }) => {
  return (
    <div className='toolbar'>
      <ToolbarButton
        format='bold'
        icon='B'
        editor={editor}
      />
      <ToolbarButton
        format='italic'
        icon='I'
        editor={editor}
      />
      <ToolbarButton
        format='underline'
        icon='U'
        editor={editor}
      />
    </div>
  );
};

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

function App() {
  const [editor] = React.useState(() => withReact(createEditor()));
  const [value, setValue] = React.useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [
        {
          text: 'Hello! Try formatting this text with the toolbar above. Hello! Try formatting this text with the toolbar above Hello! Try formatting this text with the toolbar above Hello! Try formatting this text with the toolbar above Hello! Try formatting this text with the toolbar above',
        },
      ],
    },
  ]);

  const renderLeaf = React.useCallback((props: any) => {
    return <Leaf {...props} />;
  }, []);

  React.useEffect(() => {
    post('READY');
    const onMsg = (e: MessageEvent) => {
      try {
        const msg = JSON.parse((e as any).data);
        if (msg.type === 'SET_CONTENT') setValue(msg.payload);
      } catch {}
    };
    window.addEventListener('message', onMsg);
    document.addEventListener('message', onMsg as any); // Android
    return () => {
      window.removeEventListener('message', onMsg);
      document.removeEventListener('message', onMsg as any);
    };
  }, []);

  return (
    <div className='editor-container'>
      <Slate
        editor={editor}
        initialValue={value}
        onChange={(v) => {
          setValue(v);
          post('CHANGE', v);
        }}
      >
        <Toolbar editor={editor} />
        <Editable
          className='editor'
          placeholder='Type…'
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (!event.ctrlKey && !event.metaKey) {
              return;
            }
            switch (event.key) {
              case 'b': {
                event.preventDefault();
                toggleMark(editor, 'bold');
                break;
              }
              case 'i': {
                event.preventDefault();
                toggleMark(editor, 'italic');
                break;
              }
              case 'u': {
                event.preventDefault();
                toggleMark(editor, 'underline');
                break;
              }
            }
          }}
        />
      </Slate>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
