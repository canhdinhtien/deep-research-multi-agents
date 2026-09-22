import React from 'react';
import type { ModelInfo } from '../types';
import { AVAILABLE_MODELS } from '../data/presets';

interface ModelPickerProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export const ModelPicker: React.FC<ModelPickerProps> = ({ value, onChange, disabled }) => {
  // Group models by provider
  const providers: ('Google' | 'Anthropic' | 'OpenAI' | 'DeepSeek' | 'Local')[] = [
    'Google',
    'Anthropic',
    'OpenAI',
    'DeepSeek'
  ];

  const currentModel = AVAILABLE_MODELS.find(m => m.id === value);

  return (
    <div className="model-picker-wrap">
      <select
        className="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {providers.map((provider) => {
          const group = AVAILABLE_MODELS.filter(m => m.provider === provider);
          if (group.length === 0) return null;

          return (
            <optgroup key={provider} label={provider}>
              {group.map((model: ModelInfo) => (
                <option key={model.id} value={model.id}>
                  {model.name} — {model.tag}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>

      {currentModel && (
        <div className="model-helper-meta">
          <span className="model-tag-text">{currentModel.description}</span>
        </div>
      )}

      <style>{`
        .model-picker-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .model-select {
          width: 100%;
          font-size: 14.5px;
          color: var(--text-primary);
          background-color: var(--bg-input);
          border: 1px solid var(--border-medium);
          padding: 10px 14px;
          border-radius: var(--radius-md);
        }

        .model-select optgroup {
          color: var(--text-muted);
          background-color: var(--bg-surface);
          font-weight: 700;
        }

        .model-select option {
          color: var(--text-primary);
          background-color: var(--bg-input);
          padding: 8px;
        }

        .model-helper-meta {
          font-size: 13px;
          color: var(--text-muted);
          padding-left: 2px;
          line-height: 1.4;
        }

        .model-tag-text {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};
