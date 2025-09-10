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
  mentionsConfig: MentionsConfig;
  setMentionsConfig: (config: Partial<MentionsConfig>) => void;
  queryMentions: (query: string) => Promise<MentionUser[]>;
  isLoadingMentions: boolean;
  currentQuery: string;
  isTyping: boolean;
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
  const [mentionsConfig, setMentionsConfigState] = useState<MentionsConfig>({
    enabled: false,
    allowedTriggers: ['@'],
    maxResults: 10,
    debounceMs: 800,
    allowSpaces: false,
    minQueryLength: 1,
  });
  const [isLoadingMentions, setIsLoadingMentions] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
        setIsLoadingMentions(false);
        setIsTyping(false);
        currentQueryRef.current.resolve(users);
        currentQueryRef.current = null;
      } else {
        webViewBridge.postMessage('DEBUG', {
          step: 'query_mismatch_or_stale',
          query: `${query}+${currentQueryRef.current?.query}`,
          currentQuery: currentQueryRef.current?.query,
        });
      }
    };

    // Listen for config updates (including channel changes)
    webViewBridge.callbacks.onMentionsConfigUpdate = (config) => {
      webViewBridge.postMessage('DEBUG', {
        step: 'mentions_config_update',
        config,
      });
      setMentionsConfigState((prev) => ({ ...prev, enabled: config.enabled }));
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
      const { minQueryLength, allowSpaces } = mentionsConfig;

      const isValidQueryLength = query.length >= (minQueryLength || 0);

      if (!isValidQueryLength) {
        return Promise.resolve([]);
      }

      const isValidQuerySpaces = allowSpaces || !query.includes(' ');

      if (!isValidQuerySpaces) {
        return Promise.resolve([]);
      }

      return new Promise<MentionUser[]>((resolve, reject) => {
        webViewBridge.postMessage('DEBUG', {
          step: 'setting_up_promise',
          query,
          willSetLoading: true,
        });

        // Cancel previous query if exists
        if (currentQueryRef.current) {
          clearTimeout(currentQueryRef.current.timeoutId);
          setIsLoadingMentions(false);
          setIsTyping(false);
        }

        // Cancel previous debounce
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Set typing state and current query immediately
        setIsTyping(true);
        setCurrentQuery(query);
        setIsLoadingMentions(false);

        webViewBridge.postMessage('DEBUG', {
          step: 'typing_state_set',
          query,
          isTyping: true,
        });

        // Set up timeout for the entire flow
        const timeoutId = setTimeout(() => {
          if (currentQueryRef.current?.query === query) {
            webViewBridge.postMessage('DEBUG', {
              step: 'mention_query_timeout',
              query,
            });
            setIsLoadingMentions(false);
            setIsTyping(false);
            reject(new QueryTimeoutError(query));
            currentQueryRef.current = null;
          }
        }, 10000); // 10 seconds total timeout

        currentQueryRef.current = {
          query,
          resolve,
          reject,
          timeoutId,
        };

        // Debounce the actual RN query - when this fires, user stopped typing
        const debounceMs = mentionsConfig.debounceMs || 800;
        debounceTimeoutRef.current = setTimeout(() => {
          if (currentQueryRef.current?.query === query) {
            webViewBridge.postMessage('DEBUG', {
              step: 'debounce_finished_sending_query',
              query,
            });
            // User stopped typing - now we're searching
            setIsTyping(false);
            setIsLoadingMentions(true);
            webViewBridge.queryMentions(query);
          }
        }, debounceMs);
      });
    },
    [mentionsConfig]
  );

  return (
    <MentionContext.Provider
      value={{
        mentionsConfig,
        setMentionsConfig,
        queryMentions,
        isLoadingMentions,
        currentQuery,
        isTyping,
      }}
    >
      {children}
    </MentionContext.Provider>
  );
};
