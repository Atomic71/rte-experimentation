import React from 'react';

// LinkPopup styles
export const popupBaseStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  zIndex: 10000,
  minWidth: '300px',
};

export const popupCenteredStyle: React.CSSProperties = {
  ...popupBaseStyle,
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

export const popupPositionedStyle: React.CSSProperties = {
  ...popupBaseStyle,
  position: 'absolute',
  transform: 'translateY(-100%)',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  marginBottom: '8px',
  fontSize: '14px',
};

export const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '14px',
};

export const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#007acc',
  color: '#fff',
  borderColor: '#007acc',
};

export const dangerButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#dc3545',
  color: '#fff',
  borderColor: '#dc3545',
};

// MentionsDropdown styles
export const dropdownBaseStyle: React.CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  maxHeight: '200px',
  overflowY: 'auto',
  zIndex: 10001,
  minWidth: '200px',
};

export const itemStyle: React.CSSProperties = {
  padding: '8px 12px',
  cursor: 'pointer',
  borderBottom: '1px solid #eee',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
};

export const selectedItemStyle: React.CSSProperties = {
  ...itemStyle,
  backgroundColor: '#f0f0f0',
};

export const nameStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '14px',
};

export const usernameStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '12px',
};

// Layout styles
export const flexContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
};

export const marginBottomStyle: React.CSSProperties = {
  marginBottom: '16px',
  fontWeight: 'bold',
};

export const centerTextStyle: React.CSSProperties = {
  padding: '20px',
  textAlign: 'center',
};