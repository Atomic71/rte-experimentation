// Utility exports for React Native - no React components or CSS
// This file contains only pure JavaScript utilities and types

export const slateUtils = {
  /**
   * Convert Slate nodes to plain text
   */
  toPlainText: (nodes: any[]): string => {
    let result = ''
    
    const extractText = (node: any): string => {
      if (node.text !== undefined) {
        return node.text
      }
      
      if (node.type === 'mention') {
        return node.label || node.value || ''
      }
      
      if (node.children) {
        return node.children.map(extractText).join('')
      }
      
      return ''
    }
    
    nodes.forEach((node, index) => {
      result += extractText(node)
      if (node.type && node.type !== 'mention' && index < nodes.length - 1) {
        result += '\n'
      }
    })
    
    return result.trim()
  },

  /**
   * Extract mentions from Slate document
   * Returns format compatible with gorgias-mobile Mention type
   */
  extractMentions: (nodes: any[]): Array<{
    id: number
    start: number
    end: number
    mentionText: string
  }> => {
    const mentions: Array<{
      id: number
      start: number
      end: number
      mentionText: string
    }> = []
    
    const findMentions = (node: any, offset: number = 0): number => {
      let currentOffset = offset
      
      if (node.type === 'mention') {
        mentions.push({
          id: parseInt(node.id, 10) || 0, // Convert string to number
          start: currentOffset,
          end: currentOffset + (node.label || node.value || '').length,
          mentionText: node.label || node.value || ''
        })
        return currentOffset + (node.label || node.value || '').length
      }
      
      if (node.children) {
        node.children.forEach((child: any) => {
          currentOffset = findMentions(child, currentOffset)
        })
      } else if (node.text) {
        currentOffset += node.text.length
      }
      
      return currentOffset
    }
    
    nodes.forEach((node) => {
      findMentions(node, 0)
    })
    
    return mentions
  },

  /**
   * Create a mention element for Slate
   */
  createMention: (id: string, label: string, value?: string): any => {
    return {
      type: 'mention',
      id,
      label,
      value: value || label,
      children: [{ text: '' }]
    }
  },

  /**
   * Create a paragraph element
   */
  createParagraph: (text: string = ''): any => {
    return {
      type: 'paragraph',
      children: [{ text }]
    }
  }
}

// Constants for message types
export const MESSAGE_TYPES = {
  // From React Native to WebView
  SET_CONTENT: 'SET_CONTENT',
  GET_CONTENT: 'GET_CONTENT',
  IMPORT_HTML: 'IMPORT_HTML',
  EXPORT_HTML: 'EXPORT_HTML',
  COMMAND: 'COMMAND',
  UPDATE_MENTIONS: 'UPDATE_MENTIONS',
  
  // From WebView to React Native
  READY: 'READY',
  CHANGE: 'CHANGE',
  ERROR: 'ERROR',
  MENTION_ADD: 'MENTION_ADD',
  MENTION_REMOVE: 'MENTION_REMOVE'
} as const

// Type for valid message types
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES]

// Type exports - using explicit export type syntax
export type EditorMessage = {
  type: MessageType
  payload?: any
  editor?: string
  timestamp?: number
}

export type EditorContent = {
  format: 'slate' | 'lexical' | 'draft' | 'html' | 'markdown' | 'text'
  data: any
}

export type EditorType = 'slate' | 'lexical' | 'draft'