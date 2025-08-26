import { useMemo } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withFormatting } from '../plugins/formatting';
import { withBlocks } from '../plugins/blocks';
import { withDirection } from '../plugins/direction';

/**
 * Custom hook to create and configure a Slate editor with all plugins
 * @returns Configured Slate editor instance
 */
export const useSlateEditor = () => {
  const editor = useMemo(
    () =>
      withDirection(
        withBlocks(withFormatting(withHistory(withReact(createEditor()))))
      ),
    []
  );

  return editor;
};
