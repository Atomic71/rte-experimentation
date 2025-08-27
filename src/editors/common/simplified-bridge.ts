export class SimplifiedWebViewBridge {
  private isReactNative: boolean = false;

  constructor() {
    this.isReactNative = !!(window as any).ReactNativeWebView;
    this.setupMessageListener();
  }

  private setupMessageListener() {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (message.type === 'GET_CONTENT') {
          // This will be handled by the editor component
          window.dispatchEvent(new CustomEvent('webview-get-content'));
        } else if (message.type === 'SET_CONTENT' && message.html) {
          // This will be handled by the editor component
          window.dispatchEvent(
            new CustomEvent('webview-set-content', { detail: message.html })
          );
        }
      } catch (error) {
        console.warn('Failed to parse message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    // Android WebView support
    document.addEventListener('message', handleMessage as any);
  }

  // Send HTML content to React Native
  sendContent(html: string) {
    if (!this.isReactNative) {
      console.log('WebView Content:', html);
      return;
    }

    const message = {
      type: 'CONTENT',
      html: html,
      timestamp: Date.now(),
    };

    try {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send content to React Native:', error);
    }
  }

  // Notify that editor is ready
  notifyReady() {
    if (!this.isReactNative) {
      console.log('Editor ready');
      return;
    }

    const message = {
      type: 'READY',
      timestamp: Date.now(),
    };

    try {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to notify ready:', error);
    }
  }
}

// Export singleton instance
export const simplifiedBridge = new SimplifiedWebViewBridge();
