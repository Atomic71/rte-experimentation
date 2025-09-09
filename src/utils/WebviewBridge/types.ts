export interface EditorContent {
  format: 'html' | 'text';
  data: any;
}

export interface ReactNativeWebView {
  postMessage: (message: string) => void;
}

export interface MentionUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface MentionsConfig {
  enabled: boolean;
  allowedTriggers?: string[];
  maxResults?: number;
  debounceMs?: number;
  allowSpaces?: boolean;
  minQueryLength?: number;
}

export interface WebViewMessage {
  type:
    | 'READY'
    | 'CHANGE'
    | 'SET_CONTENT'
    | 'CLEAR_CONTENT'
    | 'GET_CONTENT'
    | 'CONTENT_RESPONSE'
    | 'EXPORT_HTML'
    | 'ERROR'
    | 'MENTION_QUERY'
    | 'MENTION_RESULTS'
    | 'MENTION_SELECT'
    | 'SET_MENTIONS_CONFIG'
    | 'SEND'
    | 'DEBUG';
  payload?: any;
  timestamp?: number;
}

export interface EditorCallbacks {
  onSetContent?: (content: EditorContent) => void;
  onClearContent?: () => void;
  onGetContent?: () => EditorContent;
  onError?: (error: string) => void;
  onMentionQuery?: (query: string) => void;
  onMentionResults?: (results: MentionUser[], query: string) => void;
  onMentionsConfigUpdate?: (config: MentionsConfig) => void;
}
