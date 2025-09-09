import { ReactNativeWebView } from './types';
import WebviewBridge from './WebviewBridge';

declare global {
  interface Window {
    ReactNativeWebView?: ReactNativeWebView;
    webViewBridge?: WebviewBridge;
  }
}

export const webViewBridge = new WebviewBridge();

// Expose for debugging
if (typeof window !== 'undefined') {
  window.webViewBridge = webViewBridge;
}
