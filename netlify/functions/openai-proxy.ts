import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OpenAI API key not configured' }),
    };
  }

  try {
    const { action, endpoint, method = 'POST', data } = JSON.parse(event.body || '{}');

    if (action === 'check') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ available: true }),
      };
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    let result: any;

    switch (endpoint) {
      case 'chat':
        result = await openai.chat.completions.create(data);
        break;

      case 'embeddings':
        result = await openai.embeddings.create(data);
        break;

      case 'audio/speech':
        const speechResult = await openai.audio.speech.create(data);
        const buffer = Buffer.from(await speechResult.arrayBuffer());
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Access-Control-Allow-Origin': '*',
          },
          body: buffer.toString('base64'),
          isBase64Encoded: true,
        };

      case 'audio/transcriptions':
        result = await openai.audio.transcriptions.create(data);
        break;

      case 'images/generations':
        result = await openai.images.generate(data);
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid endpoint' }),
        };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to process request',
        message: error.message || 'Unknown error',
        details: error.response?.data || null
      }),
    };
  }
};
