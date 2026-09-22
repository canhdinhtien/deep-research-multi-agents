import React, { useState } from 'react';
import { Plus, X, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';

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
        <div className="section-title-wrap">
          <h2 className="section-heading">Tiêu chí & Câu hỏi nghiên cứu</h2>
          <span className="section-subheading">
            Các câu hỏi trọng tâm, giả thuyết cần kiểm chứng hoặc tiêu chí đánh giá mà đội ngũ Agents sẽ đào sâu.
          </span>
        </div>
        <button
          type="button"
          className="btn-action-inline"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
        >
          <Plus size={16} />
          <span>Thêm tiêu chí</span>
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
              placeholder="Nhập câu hỏi hoặc tiêu chí chi tiết cần điều tra..."
            />
            <div className="question-row-actions">
              <button
                type="button"
                className="q-order-btn"
                onClick={() => handleMove(idx, 'up')}
                disabled={disabled || idx === 0}
                title="Di chuyển lên"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                className="q-order-btn"
                onClick={() => handleMove(idx, 'down')}
                disabled={disabled || idx === questions.length - 1}
                title="Di chuyển xuống"
              >
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                className="q-delete-btn"
                onClick={() => handleDeleteQuestion(idx)}
                disabled={disabled}
                title="Xóa tiêu chí"
              >
                <X size={16} />
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
              placeholder="Ví dụ: Đánh đổi về chi phí và độ trễ khi triển khai multi-agents là gì?"
              autoFocus
              disabled={disabled}
            />
            <div className="new-q-actions">
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '13.5px' }}
                onClick={handleAddQuestion}
                disabled={disabled || !newQuestion.trim()}
              >
                Thêm
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: '6px 12px', fontSize: '13.5px' }}
                onClick={() => setIsAdding(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {questions.length === 0 && !isAdding && (
          <div className="empty-questions-box" onClick={() => setIsAdding(true)}>
            <HelpCircle size={20} className="empty-q-icon" />
            <div className="empty-q-text">
              <span>Chưa có câu hỏi cụ thể nào. Nhấn <strong>"+ Thêm tiêu chí"</strong> để định hướng các góc nhìn nghiên cứu.</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .questions-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .section-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .section-heading {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .section-subheading {
          font-size: 14px;
          color: var(--text-muted);
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .question-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .question-row:hover {
          border-color: var(--border-medium);
          background-color: var(--bg-surface-hover);
        }

        .question-number {
          font-size: 14.5px;
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--accent);
          min-width: 24px;
        }

        .question-input {
          flex: 1;
          font-size: 15px;
          background: transparent;
          border: 1px solid transparent;
          padding: 6px 10px;
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
        }

        .q-order-btn, .q-delete-btn {
          color: var(--text-muted);
          padding: 5px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
        }

        .q-order-btn:hover:not(:disabled) {
          color: var(--text-primary);
          background-color: var(--bg-surface-active);
        }

        .q-delete-btn:hover:not(:disabled) {
          color: var(--status-danger);
          background-color: rgba(239, 68, 68, 0.15);
        }

        .new-question-row {
          border-color: var(--border-focus);
          background-color: var(--bg-surface);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .new-q-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .empty-questions-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background-color: var(--bg-surface);
          border: 1px dashed var(--border-medium);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-size: 14px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .empty-questions-box:hover {
          border-color: var(--accent);
          color: var(--text-secondary);
          background-color: var(--accent-subtle);
        }

        .empty-q-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .empty-q-text strong {
          color: var(--accent);
        }
      `}</style>
    </section>
  );
};
