import type { CSSProperties } from 'react';

export const editorContainerStyle: CSSProperties = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

export const editorStyle: CSSProperties = {
  minHeight: '300px',
  padding: '16px',
  fontSize: '16px',
  lineHeight: '1.5',
  outline: 'none',
};

export const placeholderStyle: CSSProperties = {
  position: 'absolute',
  top: '16px',
  left: '16px',
  color: '#999',
  fontSize: '16px',
  pointerEvents: 'none',
};

export const editorWrapperStyle: CSSProperties = {
  position: 'relative',
  border: '1px solid #e5e5e5',
  borderTop: 'none',
};

export const toolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px',
  borderBottom: '1px solid #e5e5e5',
  backgroundColor: '#f9f9f9',
  flexWrap: 'wrap',
};

export const buttonStyle: CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333',
};

export const activeButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#007acc',
  color: '#fff',
  borderColor: '#007acc',
};

export const directionContainerStyle: CSSProperties = {
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
};

export const directionButtonStyle: CSSProperties = {
  padding: '4px 8px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#666',
};

export const activeDirectionButtonStyle: CSSProperties = {
  ...directionButtonStyle,
  backgroundColor: '#007acc',
  color: '#fff',
  borderColor: '#007acc',
};
