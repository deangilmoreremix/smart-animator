import React, { useEffect, useState } from 'react';
import Button from './Button';
import { Key } from './Icons';

interface ApiKeyModalProps {
  onKeySelected: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const has = await window.aistudio.hasSelectedApiKey();
      setHasKey(has);
      if (has) {
        onKeySelected();
      }
    } else {
        // Fallback if not running in expected environment, assuming true for dev/testing if env var present
        // In real scenario, this block should ideally not be reached if strict prompt constraints are met
        if(process.env.API_KEY) {
             setHasKey(true);
             onKeySelected();
        }
    }
    setChecking(false);
  };

  useEffect(() => {
    checkKey();
    // Optional: Poll briefly in case of async init of window.aistudio
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Re-check immediately after selection flow closes (or wait for polling)
        setChecking(true);
        setTimeout(checkKey, 500);
      } else {
        alert("AI Studio environment not detected.");
      }
    } catch (error) {
      console.error("Error selecting key:", error);
      alert("Failed to open key selector.");
    }
  };

  if (checking && !hasKey) {
    return null; // Or a loading spinner
  }

  if (hasKey) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mx-auto bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Key className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">API Key Required</h2>
        <p className="text-slate-400 mb-8">
          To use Veo Animator, you need to select a Google Cloud API Key. This key is used to communicate with the Gemini API.
        </p>
        
        <Button 
          onClick={handleSelectKey} 
          className="w-full py-3 text-lg"
          icon={<Key className="w-5 h-5"/>}
        >
          Select API Key
        </Button>
        
        <div className="mt-6 text-xs text-slate-500">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noreferrer"
            className="underline hover:text-slate-300 transition-colors"
          >
            Read about Gemini API Billing
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;