// Simplified WebView bridge for TipTap editor only

export interface EditorContent {
  format: 'html' | 'text';
  data: any;
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

interface ReactNativeWebView {
  postMessage: (message: string) => void;
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

class TipTapWebViewBridge {
  public callbacks: EditorCallbacks = {};
  private isReactNative: boolean = false;
  private messageListener?: () => void;
  private isDebugMode: boolean = false;
  private mentionsConfig: MentionsConfig = {
    enabled: true,
    allowedTriggers: ['@'],
    maxResults: 10,
    debounceMs: 300,
  };

  constructor() {
    this.isReactNative = !!window.ReactNativeWebView;
    this.isDebugMode =
      new URLSearchParams(window.location.search).get('debug') === 'true';
    this.setupMessageListener();
  }

  initialize(callbacks: EditorCallbacks) {
    // Merge new callbacks with existing ones instead of replacing
    this.postDebugMessage({
      step: 'webview_bridge_initialize',
      existingCallbacks: Object.keys(this.callbacks),
      newCallbacks: Object.keys(callbacks),
    });
    this.callbacks = {
      ...this.callbacks,
      ...callbacks
    };
    this.postDebugMessage({
      step: 'webview_bridge_initialize_complete',
      finalCallbacks: Object.keys(this.callbacks),
    });
    this.postMessage('READY', {
      features: {
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        headings: true,
        lists: true,
        links: true,
        mentions: true,
        rtl: true,
      },
    });
  }

  destroy() {
    if (this.messageListener) {
      this.messageListener();
      this.messageListener = undefined;
    }
  }

  private setupMessageListener() {
    const handleMessage = (event: MessageEvent) => {
      this.postDebugMessage({ step: 'received_message', data: event.data });
      try {
        const message = this.parseMessage(event);
        this.postDebugMessage({ step: 'parsed_message', message });
        this.handleIncomingMessage(message);
      } catch (error) {
        this.postDebugMessage({
          step: 'parse_error',
          error: error instanceof Error ? error.message : String(error),
        });
        this.callbacks.onError?.('Failed to parse message');
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage as EventListener);

    this.messageListener = () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as EventListener);
    };
  }

  private parseMessage(event: MessageEvent): WebViewMessage {
    const data =
      typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

    return {
      type: data.type,
      payload: data.payload,
      timestamp: data.timestamp || Date.now(),
    };
  }

  private handleIncomingMessage(message: WebViewMessage) {
    this.postDebugMessage({
      step: 'handling_message',
      type: message.type,
      payload: message.payload,
    });

    switch (message.type) {
      case 'SET_CONTENT':
        this.callbacks.onSetContent?.(message.payload);
        break;

      case 'CLEAR_CONTENT':
        this.callbacks.onClearContent?.();
        break;

      case 'GET_CONTENT':
        const content = this.callbacks.onGetContent?.();
        if (content) {
          this.postMessage('CONTENT_RESPONSE', content);
        }
        break;

      case 'EXPORT_HTML':
        const htmlContent = this.callbacks.onGetContent?.();
        if (htmlContent) {
          this.postMessage('EXPORT_HTML', { html: htmlContent.data });
        }
        break;

      case 'MENTION_RESULTS':
        this.postDebugMessage({
          step: 'processing_mention_results',
          query: message.payload?.query,
          users: message.payload?.users,
          callbackExists: !!this.callbacks.onMentionResults,
        });
        this.callbacks.onMentionResults?.(
          message.payload.users,
          message.payload.query
        );
        break;

      case 'SET_MENTIONS_CONFIG':
        this.setMentionsConfig(message.payload);
        break;

      default:
        this.postDebugMessage({
          step: 'unknown_message_type',
          type: message.type,
        });
    }
  }

  postMessage(type: WebViewMessage['type'], payload?: any) {
    const message: WebViewMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    if (this.isReactNative) {
      try {
        window.ReactNativeWebView!.postMessage(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to post message to React Native:', error);
        this.callbacks.onError?.('Failed to communicate with React Native');
      }
    } else {
      console.log('[TipTap] WebView Message:', message);
    }
  }

  private postDebugMessage(payload: any) {
    if (this.isDebugMode) {
      this.postMessage('DEBUG', payload);
    }
  }

  queryMentions(query: string) {
    this.postMessage('MENTION_QUERY', { query });
  }

  sendMentionSelected(user: MentionUser) {
    this.postMessage('MENTION_SELECT', { user });
  }

  getMentionsConfig() {
    return this.mentionsConfig;
  }

  setMentionsConfig(config: Partial<MentionsConfig>) {
    this.mentionsConfig = { ...this.mentionsConfig, ...config };
    this.callbacks.onMentionsConfigUpdate?.(this.mentionsConfig);
  }

  notifyContentChange(content: EditorContent) {
    this.postMessage('CHANGE', content);
  }

  notifyError(error: string) {
    this.postMessage('ERROR', { message: error });
    this.callbacks.onError?.(error);
  }

  notifyReady() {
    this.postMessage('READY', {
      features: {
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        headings: true,
        lists: true,
        links: true,
        mentions: true,
        rtl: true,
      },
    });
  }

  sendContent(content: EditorContent) {
    this.postMessage('CONTENT_RESPONSE', content);
  }

  sendHTML(html: string) {
    this.postMessage('EXPORT_HTML', { html });
  }

  send(html: string) {
    this.postMessage('SEND', { html });
  }
}

declare global {
  interface Window {
    ReactNativeWebView?: ReactNativeWebView;
    webViewBridge?: TipTapWebViewBridge;
  }
}

export const webViewBridge = new TipTapWebViewBridge();

// Expose for debugging
if (typeof window !== 'undefined') {
  window.webViewBridge = webViewBridge;
}
