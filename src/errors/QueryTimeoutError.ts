export class QueryTimeoutError extends Error {
  public readonly query?: string;

  constructor(query?: string) {
    super(`Request timed out${query ? ` for: "${query}"` : ''}, please try again`);
    this.name = 'QueryTimeoutError';
    this.query = query;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QueryTimeoutError);
    }
  }
}