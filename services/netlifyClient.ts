export class NetlifyClient {
  private static readonly GEMINI_FUNCTION_URL = '/.netlify/functions/gemini-generate';

  static async callGeminiAPI(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    try {
      const response = await fetch(this.GEMINI_FUNCTION_URL, {
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
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Netlify Function Error:', error);
      throw error;
    }
  }
}
