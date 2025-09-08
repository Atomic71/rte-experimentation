export class QueryTimeoutError extends Error {
  constructor(query?: string) {
    super(`Query timed out${query ? ` for: "${query}"` : ''}`);
    this.name = 'QueryTimeoutError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QueryTimeoutError);
    }
  }
}