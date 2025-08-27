import React, { useRef, useEffect } from 'react';
import { User } from '../../data/users';
import { dropdownBaseStyle, itemStyle, selectedItemStyle, nameStyle, usernameStyle } from './styles/componentStyles';

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

  const dynamicDropdownStyle = {
    ...dropdownBaseStyle,
    position: 'absolute' as const,
    top: position?.top || 0,
    left: position?.left || 0,
  };


  return (
    <div ref={dropdownRef} style={dynamicDropdownStyle}>
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