import { safeJsonParse, safeFetch } from './apiUtils';

export class NetlifyClient {
  private static readonly GEMINI_FUNCTION_URL = '/.netlify/functions/gemini-generate';

  static async callGeminiAPI(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    try {
      const response = await safeFetch(this.GEMINI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          method,
          body,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
          const error = await safeJsonParse(response);
          errorMessage = error.message || error.error || errorMessage;
        } catch (parseError) {
          const text = await response.text();
          errorMessage = `HTTP ${response.status}: ${text.substring(0, 200)}`;
        }
        throw new Error(errorMessage);
      }

      return await safeJsonParse(response);
    } catch (error) {
      console.error('Netlify Function Error:', error);
      throw error;
    }
  }
}
