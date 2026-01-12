import React, { useState } from 'react';
import Button from './Button';
import { Key, XCircle } from './Icons';
import { validationService } from '../services/validationService';
import { apiKeyService } from '../services/apiKeyService';

interface ApiKeyModalProps {
  onKeySelected: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySelected }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Note: This modal doesn't have a close button, but ESC could be handled if added
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validationService.validateApiKey(apiKey);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    // Store API key securely using the apiKeyService
    try {
      await apiKeyService.storeApiKey(apiKey.trim());
      onKeySelected();
    } catch (error) {
      setError('Failed to save API key. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
      aria-describedby="api-key-description"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="mx-auto bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Key className="w-8 h-8 text-blue-400" />
        </div>
        <h2 id="api-key-title" className="text-2xl font-bold text-white mb-2 text-center">API Key Required</h2>
        <p id="api-key-description" className="text-slate-400 mb-6 text-center">
          Enter your Google Gemini API key to start generating videos with Veo 3.1
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-400 mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="AIza..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 px-3 py-2 rounded-lg text-sm flex items-center">
              <XCircle className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            icon={<Key className="w-5 h-5"/>}
          >
            Save API Key
          </Button>
        </form>

        <div className="mt-6 text-xs text-slate-500 text-center space-y-2">
          <p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-slate-300 transition-colors"
            >
              Get your free API key
            </a>
          </p>
          <p>
            <a
              href="https://ai.google.dev/gemini-api/docs/billing"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-slate-300 transition-colors"
            >
              Read about pricing
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;