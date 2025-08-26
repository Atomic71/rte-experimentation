import { useEffect } from 'react';
import { webViewBridge } from '../../common/webview-bridge';
import { SlateEditorWrapper } from '../SlateEditorWrapper';

/**
 * Custom hook to handle WebView bridge setup and message handlers for Slate editor
 * @param wrapper - The SlateEditorWrapper instance
 * @param setValue - State setter function for the editor value
 */
export const useWebViewBridge = (
  wrapper: SlateEditorWrapper,
  setValue: (value: any) => void
) => {
  useEffect(() => {
    wrapper.setChangeCallback(setValue);
    wrapper.initialize();

    // Set up message handlers
    webViewBridge.on('SET_CONTENT', (payload) => {
      if (payload) {
        wrapper.setContent(payload);
      }
    });

    webViewBridge.on('COMMAND', (payload) => {
      if (payload) {
        wrapper.executeCommand(payload);
      }
    });

    webViewBridge.on('GET_CONTENT', () => {
      webViewBridge.sendContent(wrapper.getContent());
    });

    webViewBridge.on('EXPORT_HTML', () => {
      webViewBridge.sendHTML(wrapper.exportHTML());
    });

    webViewBridge.on('IMPORT_HTML', (payload) => {
      if (payload?.html) {
        wrapper.importHTML(payload.html);
      }
    });

    // Cleanup function to remove event listeners if needed
    return () => {
      // Note: webViewBridge doesn't expose an off method in the current implementation
      // If cleanup is needed in the future, it can be added here
    };
  }, [wrapper, setValue]);
};
