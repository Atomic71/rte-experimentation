import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $isElementNode,
  $createParagraphNode,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $isListNode } from '@lexical/list';

// Arabic and RTL character regex
const RTL_REGEX =
  /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/;

// Detect if text contains RTL characters
const detectTextDirection = (text: string): 'ltr' | 'rtl' => {
  const rtlChars =
    /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/g;
  const ltrChars = /[A-Za-z]/g;

  const rtlMatches = (text.match(rtlChars) || []).length;
  const ltrMatches = (text.match(ltrChars) || []).length;

  if (rtlMatches > ltrMatches) return 'rtl';
  if (ltrMatches > rtlMatches) return 'ltr';

  // Check first strong character
  const firstStrongChar = text.match(
    /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]|[A-Za-z]/
  );
  if (firstStrongChar) {
    return RTL_REGEX.test(firstStrongChar[0]) ? 'rtl' : 'ltr';
  }

  return 'ltr';
};

// Check if current selection has RTL direction
const $isParentElementRTL = (selection: any): boolean => {
  if (!$isRangeSelection(selection)) return false;

  const anchorNode = selection.anchor.getNode();
  const topElement = anchorNode.getTopLevelElement();

  if (topElement && $isElementNode(topElement)) {
    const direction = topElement.getDirection();
    return direction === 'rtl';
  }

  return false;
};

// Set direction on elements
const $setDirection = (direction: 'ltr' | 'rtl' | 'auto') => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  $setBlocksType(selection, () => {
    const anchorNode = selection.anchor.getNode();
    const element = anchorNode.getTopLevelElement();

    if (!element || $isListNode(element)) {
      // Create a new paragraph with direction
      const paragraph = $createParagraphNode();
      if (direction !== 'auto') {
        paragraph.setDirection(direction);
      }
      return paragraph;
    }

    // Create new paragraph and copy content
    const paragraph = $createParagraphNode();
    paragraph.append(...element.getChildren());
    if (direction !== 'auto') {
      paragraph.setDirection(direction);
    }
    return paragraph;
  });
};

// Auto-detect and set direction based on text content
const $autoDetectDirection = () => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  const anchorNode = selection.anchor.getNode();
  const element = anchorNode.getTopLevelElement();

  if (element && $isElementNode(element)) {
    const textContent = element.getTextContent();
    const detectedDirection = detectTextDirection(textContent);

    // Only update if direction changed
    const currentDirection = element.getDirection();
    if (currentDirection !== detectedDirection) {
      element.setDirection(detectedDirection);
    }
  }
};

export const DirectionPlugin: React.FC<{ hideDirectionOptions?: boolean }> = ({
  hideDirectionOptions = false,
}) => {
  const [editor] = useLexicalComposerContext();
  const [currentDirection, setCurrentDirection] = useState<
    'ltr' | 'rtl' | 'auto'
  >('ltr');
  const [isAutoMode, setIsAutoMode] = useState(false);

  // Update direction state based on current selection
  const updateDirectionState = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const isRTL = $isParentElementRTL(selection);
      setCurrentDirection(isRTL ? 'rtl' : 'ltr');
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateDirectionState();
      });
    });
  }, [editor, updateDirectionState]);

  // Auto-detect direction on text changes when in auto mode
  useEffect(() => {
    if (!isAutoMode) return;

    return editor.registerTextContentListener(() => {
      editor.update(() => {
        $autoDetectDirection();
      });
    });
  }, [editor, isAutoMode]);

  const setDirection = useCallback(
    (direction: 'ltr' | 'rtl' | 'auto') => {
      editor.update(() => {
        $setDirection(direction);
      });

      setIsAutoMode(direction === 'auto');
      if (direction !== 'auto') {
        setCurrentDirection(direction);
      }
    },
    [editor]
  );

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    margin: '0 2px',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff',
  };

  if (hideDirectionOptions) return null;
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <button
        style={
          currentDirection === 'ltr' && !isAutoMode
            ? activeButtonStyle
            : buttonStyle
        }
        onClick={() => setDirection('ltr')}
        title='Left to Right'
      >
        ←→
      </button>

      <button
        style={
          currentDirection === 'rtl' && !isAutoMode
            ? activeButtonStyle
            : buttonStyle
        }
        onClick={() => {
          console.log('rtl');
          setDirection('rtl');
        }}
        title='Right to Left (Arabic/Hebrew)'
      >
        →←
      </button>

      <button
        style={isAutoMode ? activeButtonStyle : buttonStyle}
        onClick={() => setDirection('auto')}
        title='Auto-detect direction'
      >
        ↔
      </button>
    </div>
  );
};

// Hook for using direction functionality programmatically
export const useDirection = () => {
  const [editor] = useLexicalComposerContext();

  const setDirectionManually = useCallback(
    (direction: 'ltr' | 'rtl' | 'auto') => {
      editor.update(() => {
        $setDirection(direction);
      });
    },
    [editor]
  );

  const autoDetectDirection = useCallback(() => {
    editor.update(() => {
      $autoDetectDirection();
    });
  }, [editor]);

  const getCurrentDirection = useCallback((): 'ltr' | 'rtl' | null => {
    let direction: 'ltr' | 'rtl' | null = null;

    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        direction = $isParentElementRTL(selection) ? 'rtl' : 'ltr';
      }
    });

    return direction;
  }, [editor]);

  return {
    setDirection: setDirectionManually,
    autoDetectDirection,
    getCurrentDirection,
  };
};
