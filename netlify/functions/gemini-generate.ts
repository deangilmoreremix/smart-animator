import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' }),
    };
  }

  try {
    const { endpoint, method = 'GET', body: requestBody } = JSON.parse(event.body || '{}');

    if (!endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Endpoint is required' }),
      };
    }

    const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${GEMINI_API_KEY}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (requestBody && method !== 'GET') {
      options.body = JSON.stringify(requestBody);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
