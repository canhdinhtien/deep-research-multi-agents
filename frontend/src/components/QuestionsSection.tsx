import React, { useState } from 'react';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';

interface QuestionsSectionProps {
  questions: string[];
  onChange: (questions: string[]) => void;
  disabled?: boolean;
}

export const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  questions,
  onChange,
  disabled
}) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    onChange([...questions, newQuestion.trim()]);
    setNewQuestion('');
    setIsAdding(false);
  };

  const handleUpdateQuestion = (index: number, text: string) => {
    const updated = [...questions];
    updated[index] = text;
    onChange(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <section className="questions-section">
      <div className="section-header">
        <h2 className="section-heading">Research questions</h2>
        <button
          type="button"
          className="btn-action-inline"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
        >
          <Plus size={14} />
          <span>Add question</span>
        </button>
      </div>

      <div className="questions-list">
        {questions.map((question, idx) => (
          <div key={idx} className="question-row">
            <span className="question-number">{idx + 1}.</span>
            <input
              type="text"
              className="question-input"
              value={question}
              onChange={(e) => handleUpdateQuestion(idx, e.target.value)}
              disabled={disabled}
              placeholder="Specify question or hypothesis to investigate..."
            />
            <div className="question-row-actions">
              <button
                type="button"
                className="q-order-btn"
                onClick={() => handleMove(idx, 'up')}
                disabled={disabled || idx === 0}
                title="Move up"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                className="q-order-btn"
                onClick={() => handleMove(idx, 'down')}
                disabled={disabled || idx === questions.length - 1}
                title="Move down"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                className="q-delete-btn"
                onClick={() => handleDeleteQuestion(idx)}
                disabled={disabled}
                title="Delete question"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Inline new question input */}
        {isAdding && (
          <div className="question-row new-question-row">
            <span className="question-number">{questions.length + 1}.</span>
            <input
              type="text"
              className="question-input"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddQuestion();
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                }
              }}
              placeholder="e.g. When does model tiering actually reduce production cost?"
              autoFocus
              disabled={disabled}
            />
            <div className="new-q-actions">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={handleAddQuestion}
                disabled={disabled || !newQuestion.trim()}
              >
                Add
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .questions-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-heading {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .question-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 8px;
          border-radius: var(--radius-md);
          transition: background-color var(--transition-fast);
        }

        .question-row:hover {
          background-color: var(--bg-surface);
        }

        .question-number {
          font-size: 13px;
          font-family: var(--font-mono);
          color: var(--text-muted);
          min-width: 20px;
        }

        .question-input {
          flex: 1;
          font-size: 13px;
          background: transparent;
          border: 1px solid transparent;
          padding: 6px 8px;
          color: var(--text-primary);
          border-radius: var(--radius-sm);
        }

        .question-input:focus {
          background-color: var(--bg-input);
          border-color: var(--border-focus);
        }

        .question-row-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .question-row:hover .question-row-actions {
          opacity: 1;
        }

        .q-order-btn, .q-delete-btn {
          color: var(--text-muted);
          padding: 3px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
        }

        .q-order-btn:hover:not(:disabled) {
          color: var(--text-primary);
          background-color: var(--bg-surface-hover);
        }

        .q-delete-btn:hover:not(:disabled) {
          color: var(--status-danger);
          background-color: var(--bg-surface-hover);
        }

        .new-question-row {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
        }

        .new-q-actions {
          display: flex;
          gap: 6px;
        }

        .btn-sm {
          padding: 4px 10px;
          font-size: 12px;
        }
      `}</style>
    </section>
  );
};
