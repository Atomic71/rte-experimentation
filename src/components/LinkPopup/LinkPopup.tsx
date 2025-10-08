import React, { useState, useEffect, useRef, useMemo } from 'react';
import validator from 'validator';
import './LinkPopup.css';

interface LinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, text: string) => void;
  initialUrl?: string;
  initialText?: string;
}

const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return false;

  // If it contains a colon, it must be http:// or https://
  if (url.includes(':')) {
    const hasValidProtocol =
      url.startsWith('http://') || url.startsWith('https://');
    if (!hasValidProtocol) return false;
  }

  // Use validator.js with strict options
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: false,
    require_valid_protocol: true,
    allow_underscores: false,
    allow_protocol_relative_urls: false,
  });
};

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

  const isUrlValid = useMemo(() => isValidUrl(url), [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && text && isUrlValid) {
      onSubmit(url, text);
      // Clear the form after successful submission
      setUrl('');
      setText('');
      onClose();
    }
  };

  const handleCancel = () => {
    setUrl('');
    setText('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='link-popup-fullscreen'>
      <div className='link-popup-container'>
        <form
          onSubmit={handleSubmit}
          className='link-popup-form'
        >
          <div className='link-popup-scroll-container'>
            <div className='link-popup-field-container'>
              <label
                htmlFor='link-text'
                className='link-popup-label'
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
                className='link-popup-input'
                autoCapitalize='none'
              />
            </div>

            <div className='link-popup-field-container-last'>
              <label
                htmlFor='link-url'
                className='link-popup-label-url'
              >
                URL
              </label>
              <input
                id='link-url'
                ref={urlInputRef}
                type='text'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='https://example.com'
                className='link-popup-input'
                autoCapitalize='none'
              />
            </div>
          </div>

          <div className='link-popup-button-container'>
            <button
              type='button'
              onClick={handleCancel}
              className='link-popup-cancel-button'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!text.trim() || !isUrlValid}
              className='link-popup-submit-button'
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
