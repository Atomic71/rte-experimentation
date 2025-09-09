import React from 'react';
import { createPreventDefaultHandlers } from '../../utils/eventHelpers';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  onClick, 
  isActive, 
  disabled, 
  title, 
  children 
}) => {
  return (
    <button
      onClick={onClick}
      {...createPreventDefaultHandlers()}
      className={`toolbar-button ${isActive ? 'active' : ''}`}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};