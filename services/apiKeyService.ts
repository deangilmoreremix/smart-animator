export class ApiKeyService {
  private static readonly STORAGE_KEY = 'VITE_API_KEY';
  private static readonly ENCRYPTION_KEY = 'smart-animator-key'; // In production, use a more secure key

  static async storeApiKey(apiKey: string): Promise<void> {
    try {
      // Basic encryption for client-side storage
      const encrypted = await this.encryptData(apiKey);
      localStorage.setItem(this.STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('Failed to securely store API key');
    }
  }

  static async getApiKey(): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY);
      if (!encrypted) return null;

      return await this.decryptData(encrypted);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      // Clear corrupted data
      this.clearApiKey();
      return null;
    }
  }

  static clearApiKey(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static hasApiKey(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  static async validateStoredApiKey(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    if (!apiKey) return false;

    // Basic validation
    return apiKey.startsWith('AIza') && apiKey.length > 20;
  }

  private static async encryptData(data: string): Promise<string> {
    // Simple XOR encryption for demo purposes
    // In production, use proper encryption like AES-GCM
    const key = this.ENCRYPTION_KEY;
    let result = '';

    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }

    // Convert to base64 for safe storage
    return btoa(result);
  }

  private static async decryptData(encryptedData: string): Promise<string> {
    try {
      // Decode from base64
      const decoded = atob(encryptedData);
      const key = this.ENCRYPTION_KEY;
      let result = '';

      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }

      return result;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  static async rotateApiKey(newApiKey: string): Promise<void> {
    // Clear old key
    this.clearApiKey();

    // Store new key
    await this.storeApiKey(newApiKey);

    // Log the rotation (in production, this would be sent to a server)
    console.log('API key rotated successfully');
  }

  static getApiKeyMasked(): string {
    const encrypted = localStorage.getItem(this.STORAGE_KEY);
    if (!encrypted) return '';

    // Return masked version for display
    return 'AIza' + '*'.repeat(Math.max(0, encrypted.length - 8)) + encrypted.slice(-4);
  }
}

export const apiKeyService = new ApiKeyService();