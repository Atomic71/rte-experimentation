import { __DEV__ } from './debug';
import { webViewBridge } from './WebviewBridge';
import { MentionUser, MentionsConfig } from './WebviewBridge/types';

/**
 * Debug logger for mentions functionality.
 * All methods are tree-shaken in production builds.
 */
export class MentionsDebugger {
  private static log(step: string, data?: Record<string, any>): void {
    if (__DEV__) {
      webViewBridge.postMessage('DEBUG', {
        step,
        ...data,
      });
    }
  }

  // Context initialization
  static callbacksSetupComplete(): void {
    this.log('context_mention_callback_setup_complete');
  }

  // Mention results handling
  static receivedMentionResults(
    users: MentionUser[],
    query: string,
    hasCurrentQuery: boolean
  ): void {
    this.log('context_received_mention_results', {
      users,
      query,
      currentQueryExists: hasCurrentQuery,
    });
  }

  static resolvingQuery(query: string): void {
    this.log('resolving_current_query', { query });
  }

  static queryMismatchOrStale(query: string, currentQuery?: string): void {
    this.log('query_mismatch_or_stale', {
      query: `${query}+${currentQuery}`,
      currentQuery,
    });
  }

  // Config updates
  static configUpdate(config: MentionsConfig): void {
    this.log('mentions_config_update', { config });
  }

  // Query flow
  static settingUpPromise(query: string): void {
    this.log('setting_up_promise', {
      query,
      willSetLoading: true,
    });
  }

  static typingStateSet(query: string, isTyping: boolean): void {
    this.log('typing_state_set', {
      query,
      isTyping,
    });
  }

  static queryTimeout(query: string): void {
    this.log('mention_query_timeout', { query });
  }

  static debounceFinished(query: string): void {
    this.log('debounce_finished_sending_query', { query });
  }
}
