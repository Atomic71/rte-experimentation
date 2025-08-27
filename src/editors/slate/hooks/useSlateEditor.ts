import { useMemo } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withFormatting } from '../plugins/formatting';
import { withBlocks } from '../plugins/blocks';
import { withDirection } from '../plugins/direction';
import { withMentions } from '../plugins/mentions';

export const useSlateEditor = () => {
  const editor = useMemo(
    () =>
      withMentions(
        withDirection(
          withBlocks(withFormatting(withHistory(withReact(createEditor()))))
        )
      ),
    []
  );

  return editor;
};
