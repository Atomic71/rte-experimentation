import {
  EditorCallbacks,
  EditorContent,
  MentionsConfig,
  WebViewMessage,
} from './types';
import { __DEV__, isDebugEnabled } from '../debug';

export default class WebviewBridge {
  public callbacks: EditorCallbacks = {};
  private isReactNative: boolean = false;
  private messageListener?: () => void;
  private mentionsConfig: MentionsConfig = {
    enabled: true,
    allowedTriggers: ['@'],
    maxResults: 10,
    debounceMs: 300,
  };

  constructor() {
    this.isReactNative = !!window.ReactNativeWebView;
    this.setupMessageListener();
  }

  initialize(callbacks: EditorCallbacks) {
    // Merge new callbacks with existing ones instead of replacing
    if (__DEV__) {
      this.postDebugMessage({
        step: 'webview_bridge_initialize',
        existingCallbacks: Object.keys(this.callbacks),
        newCallbacks: Object.keys(callbacks),
      });
    }
    this.callbacks = {
      ...this.callbacks,
      ...callbacks,
    };
    if (__DEV__) {
      this.postDebugMessage({
        step: 'webview_bridge_initialize_complete',
        finalCallbacks: Object.keys(this.callbacks),
      });
    }
    this.postMessage('READY');
  }

  destroy() {
    if (this.messageListener) {
      this.messageListener();
      this.messageListener = undefined;
    }
  }

  private setupMessageListener() {
    const handleMessage = (event: MessageEvent) => {
      if (__DEV__) {
        this.postDebugMessage({ step: 'received_message', data: event.data });
      }
      try {
        const message = this.parseMessage(event);
        if (__DEV__) {
          this.postDebugMessage({ step: 'parsed_message', message });
        }
        this.handleIncomingMessage(message);
      } catch (error) {
        if (__DEV__) {
          this.postDebugMessage({
            step: 'parse_error',
            error: error instanceof Error ? error.message : String(error),
          });
        }
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

    const message: WebViewMessage = {
      type: data.type,
      payload: data.payload,
    };

    if (__DEV__) {
      message.timestamp = data.timestamp || Date.now();
    }

    return message;
  }

  private handleIncomingMessage(message: WebViewMessage) {
    if (__DEV__) {
      this.postDebugMessage({
        step: 'handling_message',
        type: message.type,
        payload: message.payload,
      });
    }

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
          this.postMessage('CONTENT_RESPONSE', { html: content.data });
        }
        break;

      case 'MENTION_RESULTS':
        if (__DEV__) {
          this.postDebugMessage({
            step: 'processing_mention_results',
            query: message.payload?.query,
            users: message.payload?.users,
            callbackExists: !!this.callbacks.onMentionResults,
          });
        }
        this.callbacks.onMentionResults?.(
          message.payload.users,
          message.payload.query
        );
        break;

      case 'SET_MENTIONS_CONFIG':
        this.setMentionsConfig(message.payload);
        break;

      case 'FOCUS_EDITOR':
        this.callbacks.onFocusEditor?.();
        break;

      default:
        if (__DEV__) {
          this.postDebugMessage({
            step: 'unknown_message_type',
            type: message.type,
          });
        }
    }
  }

  postMessage(type: WebViewMessage['type'], payload?: any) {
    const message: WebViewMessage = {
      type,
      payload,
    };

    if (__DEV__) {
      message.timestamp = Date.now();
    }

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
    // This method should only be called from __DEV__ blocks
    // Additional runtime check for URL parameter
    if (isDebugEnabled()) {
      this.postMessage('DEBUG', payload);
    }
  }

  queryMentions(query: string) {
    this.postMessage('MENTION_QUERY', { query });
  }

  sendMentionAdded(id: number) {
    this.postMessage('MENTION_ADD', {
      id,
    });
  }

  sendMentionRemoved(id: number) {
    this.postMessage('MENTION_REMOVE', { id });
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

  send(html: string) {
    this.postMessage('SEND', { html });
  }
}
