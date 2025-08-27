import type { CSSProperties } from 'react';

// LinkPopup styles
export const popupBaseStyle: CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  zIndex: 10000,
  minWidth: '300px',
};

export const popupCenteredStyle: CSSProperties = {
  ...popupBaseStyle,
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

export const popupPositionedStyle: CSSProperties = {
  ...popupBaseStyle,
  position: 'absolute',
  transform: 'translateY(-100%)',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  marginBottom: '8px',
  fontSize: '14px',
};

export const buttonStyle: CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '14px',
};

export const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#007acc',
  color: '#fff',
  borderColor: '#007acc',
};

export const dangerButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#dc3545',
  color: '#fff',
  borderColor: '#dc3545',
};

// MentionsDropdown styles
export const dropdownBaseStyle: CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  maxHeight: '200px',
  overflowY: 'auto',
  zIndex: 10001,
  minWidth: '200px',
};

export const itemStyle: CSSProperties = {
  padding: '8px 12px',
  cursor: 'pointer',
  borderBottom: '1px solid #eee',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
};

export const selectedItemStyle: CSSProperties = {
  ...itemStyle,
  backgroundColor: '#f0f0f0',
};

export const nameStyle: CSSProperties = {
  fontWeight: 'bold',
  fontSize: '14px',
};

export const usernameStyle: CSSProperties = {
  color: '#666',
  fontSize: '12px',
};

// Layout styles
export const flexContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
};

export const marginBottomStyle: CSSProperties = {
  marginBottom: '16px',
  fontWeight: 'bold',
};

export const centerTextStyle: CSSProperties = {
  padding: '20px',
  textAlign: 'center',
};