import { supabase } from './supabase';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  VIDEO_GENERATION = 'video_generation',
  EMAIL_DELIVERY = 'email_delivery',
  CAMPAIGN_PROCESSING = 'campaign_processing',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  userId?: string;
  campaignId?: string;
  recipientId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLogEntry {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  error: Error;
  context?: ErrorContext;
  timestamp: Date;
}

class ErrorHandler {
  private errorQueue: ErrorLogEntry[] = [];
  private flushInterval: number = 10000;
  private maxQueueSize: number = 50;

  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => this.flushErrors(), this.flushInterval);

      window.addEventListener('beforeunload', () => {
        this.flushErrors();
      });
    }
  }

  async logError(
    error: Error,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ): Promise<void> {
    const entry: ErrorLogEntry = {
      message: error.message,
      category,
      severity,
      error,
      context,
      timestamp: new Date()
    };

    this.errorQueue.push(entry);

    console.error(`[${severity.toUpperCase()}] ${category}:`, error.message, context);

    if (severity === ErrorSeverity.CRITICAL || this.errorQueue.length >= this.maxQueueSize) {
      await this.flushErrors();
    }
  }

  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const errorRecords = errors.map(entry => ({
        error_message: entry.message,
        error_category: entry.category,
        error_severity: entry.severity,
        error_stack: entry.error.stack || '',
        user_id: entry.context?.userId,
        campaign_id: entry.context?.campaignId,
        recipient_id: entry.context?.recipientId,
        action: entry.context?.action,
        metadata: entry.context?.metadata || {},
        occurred_at: entry.timestamp.toISOString()
      }));

      const { error } = await supabase
        .from('error_logs')
        .insert(errorRecords);

      if (error) {
        console.error('Failed to flush error logs:', error);
        this.errorQueue.push(...errors);
      }
    } catch (error) {
      console.error('Error flushing logs:', error);
      this.errorQueue.push(...errors);
    }
  }

  getUserFriendlyMessage(error: Error, category: ErrorCategory): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.VIDEO_GENERATION]: 'Unable to generate video. Please try again or contact support if the problem persists.',
      [ErrorCategory.EMAIL_DELIVERY]: 'Email could not be sent. Please check your email configuration and try again.',
      [ErrorCategory.CAMPAIGN_PROCESSING]: 'Campaign processing encountered an issue. Your progress has been saved.',
      [ErrorCategory.DATABASE]: 'Unable to save changes. Please check your connection and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Authentication failed. Please sign in again.',
      [ErrorCategory.NETWORK]: 'Network connection issue. Please check your internet connection.',
      [ErrorCategory.VALIDATION]: 'Invalid input. Please check your data and try again.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };

    return messages[category] || messages[ErrorCategory.UNKNOWN];
  }

  async getErrorStats(userId: string, hours: number = 24): Promise<{
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('error_logs')
        .select('error_category, error_severity')
        .eq('user_id', userId)
        .gte('occurred_at', since);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        byCategory: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>
      };

      data?.forEach(log => {
        stats.byCategory[log.error_category] = (stats.byCategory[log.error_category] || 0) + 1;
        stats.bySeverity[log.error_severity] = (stats.bySeverity[log.error_severity] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get error stats:', error);
      return { total: 0, byCategory: {}, bySeverity: {} };
    }
  }

  handleApiError(error: any, defaultMessage: string = 'Operation failed'): string {
    if (error.message) {
      if (error.message.includes('JWT')) {
        return 'Session expired. Please sign in again.';
      }
      if (error.message.includes('network')) {
        return 'Network error. Please check your connection.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
      }
      return error.message;
    }
    return defaultMessage;
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    context?: ErrorContext
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        if (attempt < maxRetries) {
          await this.logError(
            error,
            ErrorCategory.UNKNOWN,
            ErrorSeverity.LOW,
            { ...context, metadata: { attempt, maxRetries } }
          );

          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }

    await this.logError(
      lastError || new Error('Retry operation failed'),
      ErrorCategory.UNKNOWN,
      ErrorSeverity.HIGH,
      { ...context, metadata: { maxRetries, finalAttempt: true } }
    );

    throw lastError;
  }
}

export const errorHandler = new ErrorHandler();
