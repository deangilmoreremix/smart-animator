export async function safeJsonParse<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');

  if (contentLength === '0') {
    throw new Error('Empty response received from server');
  }

  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 200)}`);
  }

  const text = await response.text();

  if (!text || text.trim().length === 0) {
    throw new Error('Response body is empty');
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON. Response text: ${text.substring(0, 200)}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    throw new Error(`Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
