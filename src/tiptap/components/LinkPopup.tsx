import React, { useState, useEffect, useRef } from 'react';

interface LinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  initialUrl?: string;
  position?: { top: number; left: number };
}

export const LinkPopup: React.FC<LinkPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialUrl = '',
  position = { top: 0, left: 0 },
}) => {
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onSubmit(url);
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
      className="link-popup"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter URL..."
          style={{
            padding: '4px 8px',
            border: '1px solid #ddd',
            borderRadius: '2px',
            minWidth: '250px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '4px 12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '4px 12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};