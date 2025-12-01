import { supabase } from '../supabase';

export interface RealtimeSession {
  sessionId: string;
  userId: string;
  conversationType: 'video_creation' | 'script_editing' | 'analytics_query' | 'campaign_setup';
  status: 'active' | 'paused' | 'ended';
}

export interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

class OpenAIRealtimeService {
  private activeSession: RealtimeSession | null = null;
  private websocket: WebSocket | null = null;
  private messageBuffer: VoiceMessage[] = [];

  async startSession(
    userId: string,
    conversationType: RealtimeSession['conversationType']
  ): Promise<string> {
    const sessionId = `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await supabase.from('ai_conversations').insert({
      user_id: userId,
      session_id: sessionId,
      conversation_type: conversationType,
      messages: [],
      status: 'active',
      started_at: new Date().toISOString()
    });

    if (error) throw error;

    this.activeSession = {
      sessionId,
      userId,
      conversationType,
      status: 'active'
    };

    this.messageBuffer = [];

    return sessionId;
  }

  async connectWebSocket(sessionId: string): Promise<void> {
    const { data } = await supabase.functions.invoke('realtime-voice', {
      body: { action: 'connect', sessionId }
    });

    if (!data.wsUrl) throw new Error('Failed to get WebSocket URL');

    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(data.wsUrl);

      this.websocket.onopen = () => {
        console.log('Realtime WebSocket connected');
        resolve();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(JSON.parse(event.data));
      };

      this.websocket.onclose = () => {
        console.log('Realtime WebSocket closed');
        this.endSession();
      };
    });
  }

  private handleWebSocketMessage(message: any) {
    if (message.type === 'transcript') {
      const voiceMessage: VoiceMessage = {
        role: 'user',
        content: message.text,
        timestamp: Date.now()
      };
      this.messageBuffer.push(voiceMessage);
      this.syncMessagesToDatabase();
    } else if (message.type === 'response') {
      const voiceMessage: VoiceMessage = {
        role: 'assistant',
        content: message.text,
        timestamp: Date.now(),
        audioUrl: message.audioUrl
      };
      this.messageBuffer.push(voiceMessage);
      this.syncMessagesToDatabase();
    }
  }

  private async syncMessagesToDatabase() {
    if (!this.activeSession) return;

    await supabase
      .from('ai_conversations')
      .update({
        messages: this.messageBuffer,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', this.activeSession.sessionId);
  }

  sendAudio(audioBlob: Blob) {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    audioBlob.arrayBuffer().then(buffer => {
      this.websocket!.send(JSON.stringify({
        type: 'audio',
        data: Array.from(new Uint8Array(buffer))
      }));
    });
  }

  sendText(text: string) {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.websocket.send(JSON.stringify({
      type: 'text',
      text
    }));
  }

  async saveVoiceRecording(
    audioBlob: Blob,
    transcript: string,
    duration: number,
    userId: string
  ): Promise<string> {
    const fileName = `voice_${Date.now()}.webm`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('voice-recordings')
      .upload(filePath, audioBlob);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('voice-recordings')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('voice_recordings')
      .insert({
        user_id: userId,
        conversation_id: this.activeSession?.sessionId,
        audio_url: publicUrl,
        transcript,
        duration_seconds: Math.floor(duration),
        language: 'en',
        confidence_score: 0.95
      })
      .select()
      .single();

    if (error) throw error;

    return data.id;
  }

  async endSession(): Promise<void> {
    if (!this.activeSession) return;

    await supabase
      .from('ai_conversations')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        messages: this.messageBuffer
      })
      .eq('session_id', this.activeSession.sessionId);

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.activeSession = null;
    this.messageBuffer = [];
  }

  getMessages(): VoiceMessage[] {
    return [...this.messageBuffer];
  }

  isActive(): boolean {
    return this.activeSession?.status === 'active';
  }

  async getSessionHistory(userId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async resumeSession(sessionId: string): Promise<void> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) throw error;

    this.activeSession = {
      sessionId: data.session_id,
      userId: data.user_id,
      conversationType: data.conversation_type,
      status: 'active'
    };

    this.messageBuffer = data.messages || [];

    await supabase
      .from('ai_conversations')
      .update({ status: 'active' })
      .eq('session_id', sessionId);
  }
}

export const openaiRealtimeService = new OpenAIRealtimeService();
