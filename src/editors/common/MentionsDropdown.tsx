import React, { useRef, useEffect } from 'react';
import { MentionUser } from './types';
import { dropdown } from '../../design-system';

interface MentionsDropdownProps {
  users: MentionUser[];
  selectedIndex: number;
  onSelect: (user: MentionUser) => void;
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
    ...dropdown.container,
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
          style={{
            ...dropdown.item,
            ...(index === selectedIndex ? dropdown.itemSelected : {}),
          }}
          onClick={() => onSelect(user)}
        >
          <span style={dropdown.itemName}>{user.name}</span>
          <span style={dropdown.itemSubtext}>@{user.username}</span>
        </div>
      ))}
    </div>
  );
};