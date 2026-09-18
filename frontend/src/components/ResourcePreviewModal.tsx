import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import type { SourceItem } from '../types';
import { formatFileSize } from '../utils/storage';

interface ResourcePreviewModalProps {
  source: SourceItem | null;
  onClose: () => void;
}

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  source,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!source) return null;

  const handleCopy = () => {
    if (!source.content) return;
    navigator.clipboard.writeText(source.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog preview-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="preview-top">
          <div className="preview-header-meta">
            <span className="preview-file-name" title={source.name}>
              {source.name}
            </span>
            <span className="preview-file-sub">
              {source.type.toUpperCase()}
              {source.size ? ` · ${formatFileSize(source.size)}` : ''}
            </span>
          </div>

          <div className="preview-actions-row">
            {source.content && (
              <button type="button" className="btn-secondary btn-sm" onClick={handleCopy}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy text'}</span>
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="preview-body">
          {source.url && (
            <div className="preview-url-box">
              <span className="preview-url-label">Source link:</span>
              <a href={source.url} target="_blank" rel="noreferrer" className="preview-url-link">
                <span>{source.url}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          <div className="preview-text-box">
            <pre className="preview-raw-text">
              {source.content || 'No extracted text available for this item.'}
            </pre>
          </div>
        </div>
      </div>

      <style>{`
        .preview-dialog {
          max-width: 680px;
        }

        .preview-top {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .preview-header-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .preview-file-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-file-sub {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }

        .preview-actions-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .preview-body {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .preview-url-box {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          background-color: var(--bg-surface-subtle);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }

        .preview-url-label {
          color: var(--text-muted);
        }

        .preview-url-link {
          color: var(--text-primary);
          text-decoration: underline;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .preview-text-box {
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
          overflow-x: auto;
        }

        .preview-raw-text {
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.6;
          color: #d1d5db;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
};
