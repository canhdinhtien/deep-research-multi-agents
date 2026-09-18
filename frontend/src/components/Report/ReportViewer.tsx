import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Printer, ArrowLeft, Check, BookOpen, FileText } from 'lucide-react';
import type { SourceItem, ResearchConfig } from '../../types';

interface ReportViewerProps {
  topic: string;
  markdown: string;
  sources: SourceItem[];
  config: ResearchConfig;
  onBackToConfig: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  topic,
  markdown,
  sources,
  config,
  onBackToConfig
}) => {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'report' | 'sources'>('report');

  const tocHeadings = useMemo(() => {
    if (!markdown) return [];
    const lines = markdown.split('\n');
    const headings: { id: string; text: string; level: number }[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        headings.push({ id, text, level });
      }
    });

    return headings;
  }, [markdown]);

  const wordCount = useMemo(() => {
    return markdown ? markdown.split(/\s+/).filter(Boolean).length : 0;
  }, [markdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const filename = `${topic.toLowerCase().replace(/[^\w]+/g, '-').substring(0, 40)}.md`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-layout">
      {/* Top action bar */}
      <div className="report-nav-bar">
        <button type="button" className="btn-ghost back-btn" onClick={onBackToConfig}>
          <ArrowLeft size={14} />
          <span>New research</span>
        </button>

        <div className="report-quick-stats">
          <span className="stats-tag">{config.format}</span>
          <span className="stats-dot">·</span>
          <span>~{wordCount.toLocaleString()} words</span>
          <span className="stats-dot">·</span>
          <span>{sources.length} sources</span>
        </div>

        <div className="report-action-group">
          <button type="button" className="btn-secondary btn-sm" onClick={handleCopy}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={handleDownloadMd}>
            <Download size={13} />
            <span>Markdown</span>
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="report-content-grid">
        {/* TOC Sidebar */}
        <aside className="report-toc-sidebar">
          <div className="toc-title">Contents</div>
          <nav className="toc-links">
            {tocHeadings.map((h, idx) => (
              <a
                key={idx}
                href={`#${h.id}`}
                className={`toc-link toc-depth-${h.level}`}
              >
                {h.text}
              </a>
            ))}
          </nav>

          <div className="toc-tab-switch">
            <button
              type="button"
              className={`toc-switch-btn ${viewTab === 'report' ? 'toc-switch-active' : ''}`}
              onClick={() => setViewTab('report')}
            >
              <FileText size={13} />
              <span>Dossier</span>
            </button>
            <button
              type="button"
              className={`toc-switch-btn ${viewTab === 'sources' ? 'toc-switch-active' : ''}`}
              onClick={() => setViewTab('sources')}
            >
              <BookOpen size={13} />
              <span>Sources ({sources.length})</span>
            </button>
          </div>
        </aside>

        {/* Main Document */}
        <main className="report-paper">
          {viewTab === 'report' ? (
            <div className="markdown-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                    return <h1 id={id}>{children}</h1>;
                  },
                  h2: ({ children }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                    return <h2 id={id}>{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                    return <h3 id={id}>{children}</h3>;
                  },
                  table: ({ children }) => (
                    <div className="table-responsive">
                      <table>{children}</table>
                    </div>
                  )
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="sources-dossier">
              <h1 className="sources-main-title">Examined evidence & sources</h1>
              <p className="sources-sub-title">
                The following primary documentation, empirical reports, and links were cited during this research:
              </p>
              <div className="sources-stack">
                {sources.map((src, i) => (
                  <div key={src.id} className="source-dossier-card">
                    <span className="source-index">[{i + 1}]</span>
                    <div className="source-card-body">
                      <div className="source-card-title">{src.name}</div>
                      <div className="source-card-meta">
                        <span>{src.type.toUpperCase()}</span>
                        {src.url && (
                          <a href={src.url} target="_blank" rel="noreferrer">
                            {src.url}
                          </a>
                        )}
                      </div>
                      <div className="source-snippet">
                        {src.content ? src.content.substring(0, 240) + '...' : 'Parsed during runtime analysis.'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .report-layout {
          max-width: 1040px;
          margin: 0 auto;
          padding: 24px 24px 64px 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .report-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .back-btn {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .report-quick-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .stats-tag {
          font-weight: 500;
          color: var(--text-secondary);
        }

        .stats-dot {
          color: var(--border-medium);
        }

        .report-action-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .report-content-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
          align-items: flex-start;
        }

        .report-toc-sidebar {
          position: sticky;
          top: 64px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          padding-right: 12px;
        }

        .toc-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .toc-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .toc-link {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: none;
          line-height: 1.4;
          padding: 3px 0;
          transition: color var(--transition-fast);
        }

        .toc-link:hover {
          color: var(--text-primary);
        }

        .toc-depth-1 { font-weight: 500; color: var(--text-secondary); }
        .toc-depth-2 { padding-left: 12px; font-size: 12px; }
        .toc-depth-3 { padding-left: 20px; font-size: 11px; }

        .toc-tab-switch {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .toc-switch-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          font-size: 12px;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
        }

        .toc-switch-btn:hover {
          background-color: var(--bg-surface-hover);
        }

        .toc-switch-active {
          background-color: var(--bg-surface-active);
          color: var(--text-primary);
          font-weight: 500;
        }

        .report-paper {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 40px 48px;
          min-height: 70vh;
        }

        /* Calm Typography for Markdown */
        .markdown-prose {
          color: #d1d5db;
          font-size: 14px;
          line-height: 1.7;
        }

        .markdown-prose h1 {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 20px;
          letter-spacing: -0.015em;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 14px;
        }

        .markdown-prose h2 {
          font-size: 18px;
          font-weight: 600;
          color: #f3f4f6;
          margin-top: 36px;
          margin-bottom: 14px;
          letter-spacing: -0.01em;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 8px;
        }

        .markdown-prose h3 {
          font-size: 15px;
          font-weight: 600;
          color: #e5e7eb;
          margin-top: 24px;
          margin-bottom: 10px;
        }

        .markdown-prose p {
          margin-bottom: 16px;
        }

        .markdown-prose ul, .markdown-prose ol {
          margin-bottom: 16px;
          padding-left: 22px;
        }

        .markdown-prose li {
          margin-bottom: 5px;
        }

        .markdown-prose blockquote {
          border-left: 2px solid var(--accent);
          padding-left: 14px;
          color: var(--text-secondary);
          margin: 18px 0;
          font-style: normal;
        }

        .table-responsive {
          overflow-x: auto;
          margin: 20px 0;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .markdown-prose table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .markdown-prose th, .markdown-prose td {
          padding: 8px 12px;
          border: 1px solid var(--border-subtle);
          text-align: left;
        }

        .markdown-prose th {
          background-color: var(--bg-surface-subtle);
          color: var(--text-primary);
          font-weight: 600;
        }

        .markdown-prose code {
          font-family: var(--font-mono);
          font-size: 12px;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-subtle);
          padding: 2px 5px;
          border-radius: var(--radius-sm);
          color: #e2e8f0;
        }

        .sources-dossier {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sources-main-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .sources-sub-title {
          font-size: 13px;
          color: var(--text-muted);
        }

        .sources-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .source-dossier-card {
          display: flex;
          gap: 12px;
          padding: 14px;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .source-index {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
        }

        .source-card-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .source-card-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .source-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .source-card-meta a {
          color: var(--text-secondary);
          text-decoration: underline;
        }

        .source-snippet {
          font-size: 12px;
          color: var(--text-secondary);
          background-color: var(--bg-input);
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          margin-top: 6px;
        }

        @media (max-width: 860px) {
          .report-content-grid {
            grid-template-columns: 1fr;
          }
          .report-toc-sidebar {
            display: none;
          }
          .report-paper {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};
