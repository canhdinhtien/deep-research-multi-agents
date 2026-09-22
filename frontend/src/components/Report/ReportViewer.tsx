import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Copy, 
  Download, 
  Printer, 
  ArrowLeft, 
  Check, 
  BookOpen, 
  FileText, 
  FolderTree,
  ExternalLink
} from 'lucide-react';
import type { SourceItem, ResearchConfig, KnowledgeTreeData } from '../../types';
import { KnowledgeTreeViewer } from './KnowledgeTreeViewer';

interface ReportViewerProps {
  topic: string;
  markdown: string;
  sources: SourceItem[];
  config: ResearchConfig;
  knowledgeTree?: KnowledgeTreeData;
  onBackToConfig: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  topic,
  markdown,
  sources,
  config,
  knowledgeTree,
  onBackToConfig
}) => {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'report' | 'tree' | 'sources'>('tree');

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
    const filename = `${topic.toLowerCase().replace(/[^\w]+/g, '-').substring(0, 40) || 'deep-research'}.md`;
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
      {/* Top Navigation & Action Bar */}
      <div className="report-nav-bar">
        <button type="button" className="btn-ghost back-btn" onClick={onBackToConfig}>
          <ArrowLeft size={16} />
          <span>New Research</span>
        </button>

        {/* View Switcher Tabs */}
        <div className="report-tab-pill-group">
          <button
            type="button"
            className={`report-tab-pill ${viewTab === 'tree' ? 'pill-active' : ''}`}
            onClick={() => setViewTab('tree')}
          >
            <FolderTree size={15} />
            <span>Obsidian Knowledge Tree</span>
          </button>
          <button
            type="button"
            className={`report-tab-pill ${viewTab === 'report' ? 'pill-active' : ''}`}
            onClick={() => setViewTab('report')}
          >
            <FileText size={15} />
            <span>Synthesis Dossier</span>
          </button>
          <button
            type="button"
            className={`report-tab-pill ${viewTab === 'sources' ? 'pill-active' : ''}`}
            onClick={() => setViewTab('sources')}
          >
            <BookOpen size={15} />
            <span>Sources & Evidence ({sources.length})</span>
          </button>
        </div>

        <div className="report-action-group">
          <button type="button" className="btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>
          <button type="button" className="btn-secondary" onClick={handleDownloadMd}>
            <Download size={15} />
            <span>Download .md</span>
          </button>
          <button type="button" className="btn-secondary" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {viewTab === 'tree' && knowledgeTree && (
        <KnowledgeTreeViewer knowledgeTree={knowledgeTree} topic={topic} />
      )}

      {viewTab === 'report' && (
        <div className="report-content-grid">
          {/* TOC Sidebar */}
          <aside className="report-toc-sidebar">
            <div className="toc-title">Table of Contents</div>
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

            <div className="toc-meta-card">
              <div className="toc-meta-row">
                <span className="toc-meta-lbl">Word Count:</span>
                <span className="toc-meta-val">~{wordCount.toLocaleString()} words</span>
              </div>
              <div className="toc-meta-row">
                <span className="toc-meta-lbl">Format:</span>
                <span className="toc-meta-val">{config.format.toUpperCase()}</span>
              </div>
              <div className="toc-meta-row">
                <span className="toc-meta-lbl">Sources:</span>
                <span className="toc-meta-val">{sources.length} ingested</span>
              </div>
            </div>
          </aside>

          {/* Main Document */}
          <main className="report-paper">
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
          </main>
        </div>
      )}

      {viewTab === 'sources' && (
        <main className="report-paper">
          <div className="sources-dossier">
            <div className="sources-head-row">
              <h1 className="sources-main-title">Examined Evidence & Primary Sources</h1>
              <span className="sources-count-badge">{sources.length} sources ingested</span>
            </div>
            <p className="sources-sub-title">
              The following primary documentation, empirical reports, and links were cited during multi-agent cross-verification:
            </p>
            <div className="sources-stack">
              {sources.length === 0 ? (
                <div className="sources-empty-box">
                  No direct files were uploaded. Autonomous agents synthesized peer-reviewed literature and open benchmark corpuses.
                </div>
              ) : (
                sources.map((src, i) => (
                  <div key={src.id} className="source-dossier-card">
                    <span className="source-index">[{i + 1}]</span>
                    <div className="source-card-body">
                      <div className="source-card-title">{src.name}</div>
                      <div className="source-card-meta">
                        <span className="source-badge">{src.type.toUpperCase()}</span>
                        {src.url && (
                          <a href={src.url} target="_blank" rel="noreferrer" className="source-link-out">
                            <span>{src.url}</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <div className="source-snippet">
                        {src.content ? src.content.substring(0, 320) + (src.content.length > 320 ? '...' : '') : 'Parsed during runtime analysis.'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      )}

      <style>{`
        .report-layout {
          max-width: 1160px;
          margin: 0 auto;
          padding: 28px 24px 80px 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .report-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-medium);
          gap: 16px;
          flex-wrap: wrap;
        }

        .back-btn {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .report-tab-pill-group {
          display: flex;
          align-items: center;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 4px;
          gap: 4px;
        }

        .report-tab-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .report-tab-pill:hover {
          color: var(--text-primary);
        }

        .pill-active {
          background-color: var(--accent);
          color: #ffffff !important;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
        }

        .report-action-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .report-content-grid {
          display: grid;
          grid-template-columns: 270px 1fr;
          gap: 32px;
          align-items: flex-start;
        }

        .report-toc-sidebar {
          position: sticky;
          top: 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          padding-right: 12px;
        }

        .toc-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .toc-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .toc-link {
          font-size: 14px;
          color: var(--text-secondary);
          text-decoration: none;
          line-height: 1.45;
          padding: 4px 0;
          transition: color var(--transition-fast);
        }

        .toc-link:hover {
          color: var(--accent);
        }

        .toc-depth-1 { font-weight: 600; color: var(--text-primary); }
        .toc-depth-2 { padding-left: 14px; font-size: 13.5px; color: var(--text-secondary); }
        .toc-depth-3 { padding-left: 24px; font-size: 13px; color: var(--text-muted); }

        .toc-meta-card {
          margin-top: 16px;
          padding: 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .toc-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .toc-meta-lbl {
          color: var(--text-muted);
        }

        .toc-meta-val {
          color: var(--text-primary);
          font-weight: 600;
        }

        .report-paper {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 48px 56px;
          min-height: 75vh;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        /* High-Legibility Typography for Markdown */
        .markdown-prose {
          color: #e2e8f0;
          font-size: 16px;
          line-height: 1.8;
        }

        .markdown-prose h1 {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
          border-bottom: 1px solid var(--border-medium);
          padding-bottom: 16px;
        }

        .markdown-prose h2 {
          font-size: 21px;
          font-weight: 700;
          color: #f1f5f9;
          margin-top: 40px;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 10px;
        }

        .markdown-prose h3 {
          font-size: 17.5px;
          font-weight: 600;
          color: #e2e8f0;
          margin-top: 28px;
          margin-bottom: 12px;
        }

        .markdown-prose p {
          margin-bottom: 18px;
        }

        .markdown-prose ul, .markdown-prose ol {
          margin-bottom: 20px;
          padding-left: 26px;
        }

        .markdown-prose li {
          margin-bottom: 8px;
        }

        .markdown-prose blockquote {
          border-left: 3px solid var(--accent);
          padding: 12px 18px;
          background-color: var(--bg-surface-subtle);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          color: var(--text-secondary);
          margin: 22px 0;
          font-size: 15px;
        }

        .table-responsive {
          overflow-x: auto;
          margin: 24px 0;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
        }

        .markdown-prose table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14.5px;
        }

        .markdown-prose th, .markdown-prose td {
          padding: 12px 16px;
          border: 1px solid var(--border-subtle);
          text-align: left;
        }

        .markdown-prose th {
          background-color: var(--bg-surface-subtle);
          color: #ffffff;
          font-weight: 600;
        }

        .markdown-prose code {
          font-family: var(--font-mono);
          font-size: 13.5px;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-subtle);
          padding: 3px 7px;
          border-radius: var(--radius-sm);
          color: #93c5fd;
        }

        /* Sources Dossier */
        .sources-dossier {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .sources-head-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sources-main-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .sources-count-badge {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
          background-color: var(--accent-subtle);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .sources-sub-title {
          font-size: 15px;
          color: var(--text-muted);
        }

        .sources-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 12px;
        }

        .source-dossier-card {
          display: flex;
          gap: 16px;
          padding: 18px;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .source-index {
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .source-card-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .source-card-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .source-card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }

        .source-badge {
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent);
          background-color: var(--accent-subtle);
          padding: 2px 7px;
          border-radius: var(--radius-sm);
        }

        .source-link-out {
          color: var(--text-secondary);
          text-decoration: underline;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .source-snippet {
          font-size: 13.5px;
          color: var(--text-secondary);
          background-color: var(--bg-input);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          margin-top: 8px;
          line-height: 1.5;
        }

        .sources-empty-box {
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
          font-size: 15px;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-md);
        }

        @media (max-width: 900px) {
          .report-content-grid {
            grid-template-columns: 1fr;
          }
          .report-toc-sidebar {
            display: none;
          }
          .report-paper {
            padding: 28px 20px;
          }
        }
      `}</style>
    </div>
  );
};
