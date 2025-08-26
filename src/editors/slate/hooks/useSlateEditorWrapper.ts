import { useMemo } from 'react';
import { SlateEditorWrapper } from '../SlateEditorWrapper';

/**
 * Custom hook to create and memoize a SlateEditorWrapper instance
 * @returns Memoized SlateEditorWrapper instance
 */
export const useSlateEditorWrapper = () => {
  const wrapper = useMemo(() => new SlateEditorWrapper(), []);

  return wrapper;
};
