import React, { useRef, useEffect } from 'react';
import { User } from '../../data/users';

interface MentionsDropdownProps {
  users: User[];
  selectedIndex: number;
  onSelect: (user: User) => void;
  position?: { top: number; left: number };
  isVisible: boolean;
}

export const MentionsDropdown: React.FC<MentionsDropdownProps> = ({
  users,
  selectedIndex,
  onSelect,
  position,
  isVisible,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll selected item into view
    if (selectedItemRef.current && dropdownRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  if (!isVisible || users.length === 0) return null;

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: position?.top || 0,
    left: position?.left || 0,
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 10001,
    minWidth: '200px',
  };

  const itemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    borderBottom: '1px solid #f0f0f0',
  };

  const selectedItemStyle: React.CSSProperties = {
    ...itemStyle,
    backgroundColor: '#e8f4fd',
  };

  const nameStyle: React.CSSProperties = {
    fontWeight: '500',
    color: '#333',
  };

  const usernameStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px',
  };

  return (
    <div ref={dropdownRef} style={dropdownStyle}>
      {users.map((user, index) => (
        <div
          key={user.id}
          ref={index === selectedIndex ? selectedItemRef : null}
          style={index === selectedIndex ? selectedItemStyle : itemStyle}
          onClick={() => onSelect(user)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            if (index !== selectedIndex) {
              e.currentTarget.style.backgroundColor = 'white';
            }
          }}
        >
          <span style={nameStyle}>{user.name}</span>
          <span style={usernameStyle}>{user.username}</span>
        </div>
      ))}
    </div>
  );
};