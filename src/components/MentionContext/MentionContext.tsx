import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { webViewBridge } from '@/utils/WebviewBridge';
import { QueryTimeoutError } from '@/errors';
import { MentionsConfig, MentionUser } from '@/utils/WebviewBridge/types';

interface MentionQuery {
  query: string;
  resolve: (users: MentionUser[]) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface MentionContextValue {
  mentionsEnabled: boolean;
  mentionsConfig: MentionsConfig;
  setMentionsConfig: (config: Partial<MentionsConfig>) => void;
  queryMentions: (query: string) => Promise<MentionUser[]>;
}

const MentionContext = createContext<MentionContextValue | null>(null);

export const useMentionContext = () => {
  const context = useContext(MentionContext);
  if (!context) {
    throw new Error('useMentionContext must be used within MentionProvider');
  }
  return context;
};

interface MentionProviderProps {
  children: React.ReactNode;
}

export const MentionProvider: React.FC<MentionProviderProps> = ({
  children,
}) => {
  const [mentionsEnabled, setMentionsEnabled] = useState(true);
  const [mentionsConfig, setMentionsConfigState] = useState<MentionsConfig>({
    enabled: true,
    allowedTriggers: ['@'],
    maxResults: 10,
    debounceMs: 300,
    allowSpaces: false,
    minQueryLength: 1,
  });

  const currentQueryRef = useRef<MentionQuery | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize callbacks in useEffect
  useEffect(() => {
    // Listen for results from React Native
    webViewBridge.callbacks.onMentionResults = (users, query) => {
      webViewBridge.postMessage('DEBUG', {
        step: 'context_received_mention_results',
        users,
        query,
        currentQueryExists: !!currentQueryRef.current,
      });

      // Only resolve if this matches the current query
      if (currentQueryRef.current?.query === query) {
        webViewBridge.postMessage('DEBUG', {
          step: 'resolving_current_query',
          query,
        });
        clearTimeout(currentQueryRef.current.timeoutId);
        currentQueryRef.current.resolve(users);
        currentQueryRef.current = null;
      } else {
        webViewBridge.postMessage('DEBUG', {
          step: 'query_mismatch_or_stale',
          query,
          currentQuery: currentQueryRef.current?.query,
        });
      }
    };

    // Listen for config updates (including channel changes)
    webViewBridge.callbacks.onMentionsConfigUpdate = (config) => {
      setMentionsEnabled(config.enabled);
      setMentionsConfigState((prev) => ({ ...prev, ...config }));
    };

    webViewBridge.postMessage('DEBUG', {
      step: 'context_mention_callback_setup_complete',
    });

    // Cleanup on unmount
    return () => {
      if (currentQueryRef.current) {
        clearTimeout(currentQueryRef.current.timeoutId);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const setMentionsConfig = useCallback(
    (config: Partial<MentionsConfig>) => {
      const newConfig = { ...mentionsConfig, ...config };
      setMentionsConfigState(newConfig);
      webViewBridge.setMentionsConfig(config);
    },
    [mentionsConfig]
  );

  const queryMentions = useCallback(
    (query: string): Promise<MentionUser[]> => {
      if (!mentionsEnabled) {
        return Promise.resolve([]);
      }

      const { minQueryLength, allowSpaces } = mentionsConfig;

      const isValidQueryLength = query.length >= (minQueryLength || 0);

      if (!isValidQueryLength) {
        return Promise.resolve([]);
      }

      const isValidQuerySpaces = allowSpaces && !query.includes(' ');

      if (!isValidQuerySpaces) {
        return Promise.resolve([]);
      }

      return new Promise<MentionUser[]>((resolve, reject) => {
        webViewBridge.postMessage('DEBUG', {
          step: 'setting_up_promise',
          query,
        });

        // Cancel previous query if exists
        if (currentQueryRef.current) {
          clearTimeout(currentQueryRef.current.timeoutId);
        }

        // Cancel previous debounce
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Set up new query with proper timeout handling
        const timeoutId = setTimeout(() => {
          if (currentQueryRef.current?.query === query) {
            webViewBridge.postMessage('DEBUG', {
              step: 'mention_query_timeout',
              query,
            });
            reject(new QueryTimeoutError(query));
            currentQueryRef.current = null;
          }
        }, 5000); // 5 seconds timeout

        currentQueryRef.current = {
          query,
          resolve,
          reject,
          timeoutId,
        };

        // Debounce the actual RN query
        const debounceMs = mentionsConfig.debounceMs || 300;
        debounceTimeoutRef.current = setTimeout(() => {
          if (currentQueryRef.current?.query === query) {
            webViewBridge.postMessage('DEBUG', {
              step: 'sending_mention_query',
              query,
            });
            webViewBridge.queryMentions(query);
          }
        }, debounceMs);
      });
    },
    [mentionsEnabled, mentionsConfig]
  );

  return (
    <MentionContext.Provider
      value={{
        mentionsEnabled,
        mentionsConfig,
        setMentionsConfig,
        queryMentions,
      }}
    >
      {children}
    </MentionContext.Provider>
  );
};
