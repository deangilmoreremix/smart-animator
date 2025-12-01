import OpenAI from 'openai';
import { supabase } from '../supabase';

export interface UsageMetadata {
  provider: 'openai' | 'gemini';
  model: string;
  operationType: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
}

class OpenAIClient {
  private client: OpenAI | null = null;
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;

    try {
      const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' })
      });

      if (response.ok) {
        this.initialized = true;
      }
    } catch (error) {
      console.error('OpenAI initialization check failed:', error);
    }
  }

  private async callProxy(endpoint: string, method: string, data: any): Promise<any> {
    await this.initialize();

    const response = await fetch('/.netlify/functions/openai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, method, data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OpenAI API error');
    }

    return response.json();
  }

  async trackUsage(userId: string, metadata: UsageMetadata): Promise<void> {
    try {
      await supabase.from('model_usage_tracking').insert({
        user_id: userId,
        provider: metadata.provider,
        model: metadata.model,
        operation_type: metadata.operationType,
        input_tokens: metadata.inputTokens,
        output_tokens: metadata.outputTokens,
        total_tokens: metadata.totalTokens,
        cost_usd: metadata.costUsd,
        latency_ms: metadata.latencyMs,
        success: metadata.success,
        error_message: metadata.errorMessage,
        metadata: {}
      });
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }

  calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 0.0025 / 1000, output: 0.01 / 1000 },
      'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 },
      'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
      'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
      'o1-preview': { input: 0.015 / 1000, output: 0.06 / 1000 },
      'o1-mini': { input: 0.003 / 1000, output: 0.012 / 1000 }
    };

    const rates = pricing[model] || pricing['gpt-4o-mini'];
    return (inputTokens * rates.input) + (outputTokens * rates.output);
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      userId?: string;
      operationType?: string;
    } = {}
  ): Promise<string> {
    const startTime = Date.now();
    const model = options.model || 'gpt-4o-mini';

    try {
      const result = await this.callProxy('chat', 'POST', {
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000
      });

      const content = result.choices[0].message.content;
      const usage = result.usage;

      if (options.userId) {
        await this.trackUsage(options.userId, {
          provider: 'openai',
          model,
          operationType: options.operationType || 'chat',
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          costUsd: this.calculateCost(model, usage.prompt_tokens, usage.completion_tokens),
          latencyMs: Date.now() - startTime,
          success: true
        });
      }

      return content;
    } catch (error: any) {
      if (options.userId) {
        await this.trackUsage(options.userId, {
          provider: 'openai',
          model,
          operationType: options.operationType || 'chat',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costUsd: 0,
          latencyMs: Date.now() - startTime,
          success: false,
          errorMessage: error.message
        });
      }
      throw error;
    }
  }

  async completion(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      userId?: string;
      operationType?: string;
    } = {}
  ): Promise<string> {
    return this.chat(
      [{ role: 'user', content: prompt }],
      options
    );
  }

  async createEmbedding(
    text: string,
    options: {
      model?: string;
      userId?: string;
    } = {}
  ): Promise<number[]> {
    const startTime = Date.now();
    const model = options.model || 'text-embedding-3-small';

    try {
      const result = await this.callProxy('embeddings', 'POST', {
        model,
        input: text
      });

      const embedding = result.data[0].embedding;
      const usage = result.usage;

      if (options.userId) {
        await this.trackUsage(options.userId, {
          provider: 'openai',
          model,
          operationType: 'embedding',
          inputTokens: usage.total_tokens,
          outputTokens: 0,
          totalTokens: usage.total_tokens,
          costUsd: this.calculateCost(model, usage.total_tokens, 0),
          latencyMs: Date.now() - startTime,
          success: true
        });
      }

      return embedding;
    } catch (error: any) {
      if (options.userId) {
        await this.trackUsage(options.userId, {
          provider: 'openai',
          model,
          operationType: 'embedding',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costUsd: 0,
          latencyMs: Date.now() - startTime,
          success: false,
          errorMessage: error.message
        });
      }
      throw error;
    }
  }

  async generateSpeech(
    text: string,
    options: {
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      model?: string;
      speed?: number;
      userId?: string;
    } = {}
  ): Promise<Blob> {
    const result = await this.callProxy('audio/speech', 'POST', {
      model: options.model || 'tts-1',
      voice: options.voice || 'alloy',
      input: text,
      speed: options.speed || 1.0
    });

    return new Blob([result], { type: 'audio/mpeg' });
  }

  async transcribe(
    audioFile: File,
    options: {
      model?: string;
      language?: string;
      prompt?: string;
      userId?: string;
    } = {}
  ): Promise<{ text: string; language?: string; duration?: number }> {
    const startTime = Date.now();
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', options.model || 'whisper-1');
    if (options.language) formData.append('language', options.language);
    if (options.prompt) formData.append('prompt', options.prompt);

    try {
      const result = await this.callProxy('audio/transcriptions', 'POST', formData);

      if (options.userId) {
        await this.trackUsage(options.userId, {
          provider: 'openai',
          model: options.model || 'whisper-1',
          operationType: 'transcription',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costUsd: 0.006 * (audioFile.size / 1024 / 1024),
          latencyMs: Date.now() - startTime,
          success: true
        });
      }

      return {
        text: result.text,
        language: result.language,
        duration: result.duration
      };
    } catch (error: any) {
      throw error;
    }
  }
}

export const openaiClient = new OpenAIClient();
