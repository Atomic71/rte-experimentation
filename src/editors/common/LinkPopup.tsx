import React, { useState, useEffect, useRef } from 'react';
import { popup, popupContent, input, button } from '../../design-system';

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

  const dynamicPopupStyle = position
    ? {
        ...popup.base,
        ...popup.positioned,
        top: position.top,
        left: position.left,
      }
    : { ...popup.base, ...popup.centered };

  return (
    <div ref={popupRef} style={dynamicPopupStyle}>
      <div style={popupContent.title}>
        {initialUrl ? 'Edit Link' : 'Insert Link'}
      </div>
      
      <input
        type="text"
        placeholder="Link text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={input.default}
        autoFocus
      />
      
      <input
        type="url"
        placeholder="URL (e.g., https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={input.default}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave();
          }
        }}
      />
      
      <div style={popupContent.buttonGroup}>
        <div>
          <button
            onClick={handleSave}
            style={button.primary}
            disabled={!url.trim()}
          >
            Save
          </button>
          <button onClick={onClose} style={button.default}>
            Cancel
          </button>
        </div>
        
        {onRemove && initialUrl && (
          <button onClick={handleRemove} style={button.danger}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
};