import { useRef } from 'react';
import { TipTapEditorHandle } from '@/components/TipTapEditor/types';

const useTipTapRef = () => {
  const editorRef = useRef<TipTapEditorHandle>(null);

  return editorRef;
};

export default useTipTapRef;
