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
      // GPT-5.2 series pricing (estimated based on patterns)
      'gpt-5.2': { input: 0.003 / 1000, output: 0.012 / 1000 },
      'gpt-5.2-pro': { input: 0.006 / 1000, output: 0.024 / 1000 },
      'gpt-5.2-chat-latest': { input: 0.002 / 1000, output: 0.008 / 1000 },
      'gpt-5-mini': { input: 0.0002 / 1000, output: 0.0008 / 1000 },
      'gpt-5-nano': { input: 0.0001 / 1000, output: 0.0004 / 1000 },
      // Legacy models
      'gpt-4o': { input: 0.0025 / 1000, output: 0.01 / 1000 },
      'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 },
      'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
      'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
      'o1-preview': { input: 0.015 / 1000, output: 0.06 / 1000 },
      'o1-mini': { input: 0.003 / 1000, output: 0.012 / 1000 }
    };

    const rates = pricing[model] || pricing['gpt-5-mini'];
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
      reasoning?: {
        effort?: 'none' | 'low' | 'medium' | 'high' | 'xhigh';
        summary?: 'concise' | 'detailed';
      };
      text?: {
        verbosity?: 'low' | 'medium' | 'high';
      };
      tools?: any[];
      toolChoice?: any;
      previousResponseId?: string;
    } = {}
  ): Promise<string> {
    const startTime = Date.now();
    const model = options.model || 'gpt-5.2';

    try {
      const requestData: any = {
        model,
        input: messages,
      };

      // Add reasoning parameters
      if (options.reasoning) {
        requestData.reasoning = options.reasoning;
      }

      // Add text parameters
      if (options.text) {
        requestData.text = options.text;
      }

      // Add tools
      if (options.tools && options.tools.length > 0) {
        requestData.tools = options.tools;
      }

      // Add tool choice
      if (options.toolChoice) {
        requestData.tool_choice = options.toolChoice;
      }

      // Add max output tokens
      if (options.maxTokens) {
        requestData.max_output_tokens = options.maxTokens;
      }

      // Add previous response ID for CoT chaining
      if (options.previousResponseId) {
        requestData.previous_response_id = options.previousResponseId;
      }

      const result = await this.callProxy('responses', 'POST', requestData);

      const content = result.output?.[0]?.content || '';
      const usage = result.usage;

      if (options.userId) {
        await this.trackUsage(options.userId, {
          provider: 'openai',
          model,
          operationType: options.operationType || 'chat',
          inputTokens: usage?.input_tokens || 0,
          outputTokens: usage?.output_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
          costUsd: this.calculateCost(model, usage?.input_tokens || 0, usage?.output_tokens || 0),
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

  async createResponse(
    input: string,
    options: {
      model?: string;
      reasoning?: {
        effort?: 'none' | 'low' | 'medium' | 'high' | 'xhigh';
        summary?: 'concise' | 'detailed';
      };
      text?: {
        verbosity?: 'low' | 'medium' | 'high';
      };
      tools?: any[];
      toolChoice?: any;
      maxOutputTokens?: number;
      userId?: string;
      operationType?: string;
      previousResponseId?: string; // For CoT chaining
    } = {}
  ): Promise<{
    content: string;
    reasoning?: string;
    usage: any;
    responseId: string;
  }> {
    const startTime = Date.now();
    const model = options.model || 'gpt-5.2';

    try {
      const requestData: any = {
        model,
        input,
      };

      // Add reasoning parameters
      if (options.reasoning) {
        requestData.reasoning = options.reasoning;
      }

      // Add text parameters
      if (options.text) {
        requestData.text = options.text;
      }

      // Add tools
      if (options.tools && options.tools.length > 0) {
        requestData.tools = options.tools;
      }

      // Add tool choice
      if (options.toolChoice) {
        requestData.tool_choice = options.toolChoice;
      }

      // Add max output tokens
      if (options.maxOutputTokens) {
        requestData.max_output_tokens = options.maxOutputTokens;
      }

      // Add previous response ID for CoT chaining
      if (options.previousResponseId) {
        requestData.previous_response_id = options.previousResponseId;
      }

      const result = await this.callProxy('responses', 'POST', requestData);

      const content = result.output?.[0]?.content || '';
      const reasoning = result.reasoning;
      const usage = result.usage;
      const responseId = result.id;

      if (options.userId) {
        await this.trackUsage(options.userId, {
          provider: 'openai',
          model,
          operationType: options.operationType || 'response',
          inputTokens: usage?.input_tokens || 0,
          outputTokens: usage?.output_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
          costUsd: this.calculateCost(model, usage?.input_tokens || 0, usage?.output_tokens || 0),
          latencyMs: Date.now() - startTime,
          success: true
        });
      }

      return {
        content,
        reasoning,
        usage,
        responseId
      };
    } catch (error: any) {
      if (options.userId) {
        await this.trackUsage(options.userId, {
          provider: 'openai',
          model,
          operationType: options.operationType || 'response',
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
