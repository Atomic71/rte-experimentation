import React, { useState, useEffect, useRef } from 'react';

interface LinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, text: string) => void;
  initialUrl?: string;
  initialText?: string;
}

export const LinkPopup: React.FC<LinkPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialUrl = '',
  initialText = '',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && urlInputRef.current) {
      setTimeout(() => {
        urlInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setUrl(initialUrl);
    setText(initialText);
  }, [initialUrl, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && text) {
      onSubmit(url, text);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='link-popup-fullscreen'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
        }}
      >
        <h3
          style={{
            margin: '0 0 20px 0',
            fontSize: '16px',
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          Insert Link
        </h3>

        <form
          onSubmit={handleSubmit}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor='link-text'
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                color: '#666',
                fontWeight: '500',
              }}
            >
              Text
            </label>
            <input
              id='link-text'
              type='text'
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Enter link text'
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor='link-url'
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                color: '#666',
                fontWeight: '500',
              }}
            >
              URL
            </label>
            <input
              id='link-url'
              ref={urlInputRef}
              type='url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='https://example.com'
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              width: '100%',
            }}
          >
            <button
              type='button'
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                background: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              style={{
                flex: 1,
                padding: '10px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
