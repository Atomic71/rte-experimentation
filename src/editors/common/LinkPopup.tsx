import React, { useState, useEffect, useRef } from 'react';

interface LinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, url: string) => void;
  onRemove?: () => void;
  initialText?: string;
  initialUrl?: string;
  position?: { top: number; left: number };
}

export const LinkPopup: React.FC<LinkPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  onRemove,
  initialText = '',
  initialUrl = '',
  position,
}) => {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(initialText);
    setUrl(initialUrl);
  }, [initialText, initialUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (url.trim()) {
      onSave(text.trim() || url, url.trim());
      onClose();
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      onClose();
    }
  };

  const popupStyle: React.CSSProperties = {
    position: 'absolute',
    top: position?.top || '50%',
    left: position?.left || '50%',
    transform: position ? 'translateY(-100%)' : 'translate(-50%, -50%)',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 10000,
    minWidth: '300px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    marginRight: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff',
  };

  const dangerButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: 'white',
    borderColor: '#dc3545',
  };

  return (
    <div ref={popupRef} style={popupStyle}>
      <div style={{ marginBottom: '16px', fontWeight: 'bold' }}>
        {initialUrl ? 'Edit Link' : 'Insert Link'}
      </div>
      
      <input
        type="text"
        placeholder="Link text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={inputStyle}
        autoFocus
      />
      
      <input
        type="url"
        placeholder="URL (e.g., https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={inputStyle}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave();
          }
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <button
            onClick={handleSave}
            style={primaryButtonStyle}
            disabled={!url.trim()}
          >
            Save
          </button>
          <button onClick={onClose} style={buttonStyle}>
            Cancel
          </button>
        </div>
        
        {onRemove && initialUrl && (
          <button onClick={handleRemove} style={dangerButtonStyle}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
};