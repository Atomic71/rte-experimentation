import React, { useState, useEffect, useRef } from 'react';
import {
  popupCenteredStyle,
  popupPositionedStyle,
  inputStyle,
  buttonStyle,
  primaryButtonStyle,
  dangerButtonStyle,
  flexContainerStyle,
  marginBottomStyle
} from './styles/componentStyles';

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
        ...popupPositionedStyle,
        top: position.top,
        left: position.left,
      }
    : popupCenteredStyle;

  return (
    <div ref={popupRef} style={dynamicPopupStyle}>
      <div style={marginBottomStyle}>
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
      
      <div style={flexContainerStyle}>
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