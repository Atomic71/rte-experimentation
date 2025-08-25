import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import hljs from 'highlight.js';
// import 'quill-mention';
import { QuillConfig, QuillInstance } from '../types';
import { QuillSerialization } from '../utils/serialization';
// import { mentionConfig } from '../modules/mention';
import { toolbarConfig, toolbarHandlers } from '../modules/toolbar';
import '../styles/quill-theme.css';
import 'highlight.js/styles/github-dark.css';

// Configure highlight.js for code blocks
hljs.configure({
  languages: ['javascript', 'typescript', 'python', 'java', 'css', 'html', 'json', 'bash']
});

interface QuillEditorProps {
  initialContent?: any;
  onChange?: (content: any, delta: any, source: string) => void;
  onReady?: (quill: QuillInstance) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({
  initialContent,
  onChange,
  onReady,
  placeholder = "Start writing...",
  readOnly = false
}) => {
  const [value, setValue] = useState('');
  const [isReady, setIsReady] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const serializationRef = useRef<QuillSerialization | null>(null);
  const initializedRef = useRef(false);

  const modules: QuillConfig['modules'] = {
    syntax: {
      highlight: (text: string) => hljs.highlightAuto(text).value,
    },
    toolbar: {
      container: toolbarConfig,
      handlers: toolbarHandlers
    },
    // mention: mentionConfig,
    keyboard: {
      bindings: {
        // Custom keyboard shortcuts
        bold: {
          key: 'B',
          ctrlKey: true,
          handler: function(this: any) {
            this.quill.format('bold', !this.quill.getFormat().bold);
          }
        },
        italic: {
          key: 'I',
          ctrlKey: true,
          handler: function(this: any) {
            this.quill.format('italic', !this.quill.getFormat().italic);
          }
        },
        underline: {
          key: 'U',
          ctrlKey: true,
          handler: function(this: any) {
            this.quill.format('underline', !this.quill.getFormat().underline);
          }
        },
        // Header shortcuts
        header1: {
          key: '1',
          ctrlKey: true,
          handler: function(this: any) {
            this.quill.format('header', 1);
          }
        },
        header2: {
          key: '2',
          ctrlKey: true,
          handler: function(this: any) {
            this.quill.format('header', 2);
          }
        },
        header3: {
          key: '3',
          ctrlKey: true,
          handler: function(this: any) {
            this.quill.format('header', 3);
          }
        },
        // List shortcuts
        bulletList: {
          key: '8',
          ctrlKey: true,
          shiftKey: true,
          handler: function(this: any) {
            const format = this.quill.getFormat();
            this.quill.format('list', format.list === 'bullet' ? false : 'bullet');
          }
        },
        orderedList: {
          key: '7',
          ctrlKey: true,
          shiftKey: true,
          handler: function(this: any) {
            const format = this.quill.getFormat();
            this.quill.format('list', format.list === 'ordered' ? false : 'ordered');
          }
        }
      }
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script', 'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
    // 'mention'
  ];

  // Initialize editor once it's mounted
  const initializeEditor = useCallback(() => {
    if (quillRef.current && !initializedRef.current) {
      try {
        const quill = quillRef.current.getEditor();
        if (quill) {
          initializedRef.current = true;
          serializationRef.current = new QuillSerialization(quill);
          
          // Set initial content if provided
          if (initialContent) {
            if (typeof initialContent === 'string') {
              quill.clipboard.dangerouslyPasteHTML(initialContent);
            } else {
              quill.setContents(initialContent);
            }
          }

          setIsReady(true);
          
          if (onReady) {
            onReady(quill);
          }
        }
      } catch (error) {
        console.warn('Quill not ready yet, will retry...');
        // Retry after a short delay
        setTimeout(initializeEditor, 100);
      }
    }
  }, [initialContent, onReady]);

  // Try to initialize when component mounts and when quillRef changes
  useEffect(() => {
    const timer = setTimeout(initializeEditor, 0);
    return () => clearTimeout(timer);
  }, [initializeEditor]);

  const handleChange = useCallback((content: string, delta: any, source: string) => {
    setValue(content);
    if (onChange && isReady) {
      onChange(content, delta, source);
    }
  }, [onChange, isReady]);

  return (
    <div className="quill-editor-container">
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        theme="snow"
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          height: 'calc(100vh - 100px)',
          backgroundColor: '#1a1a1a'
        }}
      />
    </div>
  );
};

export default QuillEditor;