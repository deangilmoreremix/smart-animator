import React from 'react';
import { Check, Zap, Brain, Code, Cpu } from './Icons';

export type GPTModel =
  | 'gpt-5.2'
  | 'gpt-5.2-pro'
  | 'gpt-5.2-chat-latest'
  | 'gpt-5-mini'
  | 'gpt-5-nano'
  | 'gpt-4o'
  | 'gpt-4o-mini';

interface ModelInfo {
  name: string;
  description: string;
  bestFor: string;
  icon: React.ReactNode;
  pricing: {
    input: number;
    output: number;
  };
  capabilities: string[];
}

const MODEL_INFO: Record<GPTModel, ModelInfo> = {
  'gpt-5.2': {
    name: 'GPT-5.2',
    description: 'Best for complex reasoning, broad world knowledge, and code-heavy tasks',
    bestFor: 'Complex reasoning, broad world knowledge, code-heavy or multi-step agentic tasks',
    icon: <Brain className="w-5 h-5" />,
    pricing: { input: 0.003, output: 0.012 },
    capabilities: ['Advanced reasoning', 'Broad knowledge', 'Code generation', 'Multi-step tasks']
  },
  'gpt-5.2-pro': {
    name: 'GPT-5.2 Pro',
    description: 'Tough problems that may take longer but require harder thinking',
    bestFor: 'Tough problems requiring harder thinking and more compute',
    icon: <Zap className="w-5 h-5" />,
    pricing: { input: 0.006, output: 0.024 },
    capabilities: ['Deep reasoning', 'Complex problem solving', 'Higher accuracy', 'Advanced analysis']
  },
  'gpt-5.2-chat-latest': {
    name: 'GPT-5.2 Chat Latest',
    description: 'The model powering ChatGPT with optimized chat capabilities',
    bestFor: 'Conversational AI, chat applications, interactive experiences',
    icon: <Check className="w-5 h-5" />,
    pricing: { input: 0.002, output: 0.008 },
    capabilities: ['Conversational', 'Interactive', 'Context awareness', 'Natural responses']
  },
  'gpt-5-mini': {
    name: 'GPT-5 Mini',
    description: 'Cost-optimized reasoning and chat, balancing speed, cost, and capability',
    bestFor: 'Cost-effective reasoning and general chat applications',
    icon: <Cpu className="w-5 h-5" />,
    pricing: { input: 0.0002, output: 0.0008 },
    capabilities: ['Cost-effective', 'Fast responses', 'General purpose', 'Balanced performance']
  },
  'gpt-5-nano': {
    name: 'GPT-5 Nano',
    description: 'High-throughput tasks, especially simple instruction-following or classification',
    bestFor: 'High-volume simple tasks, classification, basic instruction following',
    icon: <Code className="w-5 h-5" />,
    pricing: { input: 0.0001, output: 0.0004 },
    capabilities: ['High throughput', 'Simple tasks', 'Classification', 'Basic reasoning']
  },
  'gpt-4o': {
    name: 'GPT-4o (Legacy)',
    description: 'Previous generation model with multimodal capabilities',
    bestFor: 'General purpose tasks, multimodal input/output',
    icon: <Brain className="w-5 h-5" />,
    pricing: { input: 0.0025, output: 0.01 },
    capabilities: ['Multimodal', 'General purpose', 'Legacy support']
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini (Legacy)',
    description: 'Lightweight version of GPT-4o for cost-effective tasks',
    bestFor: 'Cost-effective general purpose tasks',
    icon: <Cpu className="w-5 h-5" />,
    pricing: { input: 0.00015, output: 0.0006 },
    capabilities: ['Cost-effective', 'Lightweight', 'General purpose']
  }
};

interface ModelSelectorProps {
  selectedModel: GPTModel;
  onModelChange: (model: GPTModel) => void;
  showPricing?: boolean;
  compact?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  showPricing = false,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-400">Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value as GPTModel)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {Object.entries(MODEL_INFO).map(([key, info]) => (
            <option key={key} value={key}>
              {info.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Choose Your Model</h3>
      </div>

      <div className="grid gap-3">
        {Object.entries(MODEL_INFO).map(([key, info]) => (
          <div
            key={key}
            onClick={() => onModelChange(key as GPTModel)}
            className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
              selectedModel === key
                ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/20'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  selectedModel === key ? 'bg-blue-600' : 'bg-slate-700'
                }`}>
                  {info.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{info.name}</h4>
                    {selectedModel === key && (
                      <Check className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{info.description}</p>
                  <p className="text-xs text-slate-500 mb-2">
                    <strong>Best for:</strong> {info.bestFor}
                  </p>
                  {showPricing && (
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Input: ${(info.pricing.input * 1000).toFixed(3)}/1K</span>
                      <span>Output: ${(info.pricing.output * 1000).toFixed(3)}/1K</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {info.capabilities.slice(0, 3).map((capability, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
        <h4 className="text-sm font-medium text-white mb-2">Quick Recommendations:</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• <strong>GPT-5.2:</strong> Complex tasks requiring broad knowledge</li>
          <li>• <strong>GPT-5.2 Pro:</strong> When accuracy is more important than speed</li>
          <li>• <strong>GPT-5 Mini:</strong> Cost-effective general purpose tasks</li>
          <li>• <strong>GPT-5 Nano:</strong> High-volume simple operations</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelSelector;