import {
  EditorCallbacks,
  EditorContent,
  MentionsConfig,
  MentionUser,
  WebViewMessage,
} from './types';

export default class WebviewBridge {
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
      ...callbacks,
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

  sendMentionAdded(mention: MentionUser) {
    this.postMessage('MENTION_ADD', {
      mention,
    });
  }

  sendMentionRemoved(mentionId: string) {
    this.postMessage('MENTION_REMOVE', { mentionId });
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

  send(html: string) {
    this.postMessage('SEND', { html });
  }
}
