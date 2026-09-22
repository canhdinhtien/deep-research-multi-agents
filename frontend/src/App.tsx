import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import JSZip from 'jszip';
import { 
  ArrowUp, 
  Plus, 
  X, 
  Copy, 
  Check, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  PanelLeft, 
  PanelLeftClose, 
  SquarePen, 
  Trash2, 
  MessageSquare
} from 'lucide-react';

import type { 
  ResearchConfig, 
  SourceItem, 
  AppSettings, 
  ResearchStatus, 
  AgentLog, 
  KnowledgeTreeData,
  ResearchSession
} from './types';
import { DEFAULT_RESEARCHERS } from './data/presets';
import { 
  loadSettings, 
  saveSettings, 
  loadSessions, 
  saveSession, 
  deleteSession, 
  generateId,
  formatFileSize 
} from './utils/storage';
import { ResearchEngine } from './services/researchEngine';
import { SettingsPage } from './components/Settings/SettingsPage';
import { InciteLogo } from './components/Brand/InciteLogo';

export const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [status, setStatus] = useState<ResearchStatus>('idle');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [knowledgeTree, setKnowledgeTree] = useState<KnowledgeTreeData | undefined>(undefined);
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  
  // Navigation & Sidebar
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ResearchSession[]>(loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Tools & State
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [settings, setSettings] = useState<AppSettings>(loadSettings());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<ResearchEngine>(new ResearchEngine());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  useEffect(() => {
    if (status !== 'idle') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, reportMarkdown, status]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newSources: SourceItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let type: SourceItem['type'] = 'text';
      if (ext === 'pdf') type = 'pdf';
      else if (ext === 'docx' || ext === 'doc') type = 'docx';
      else if (['md', 'markdown'].includes(ext)) type = 'markdown';

      let content = '';
      if (['txt', 'md', 'markdown', 'json', 'csv'].includes(ext)) {
        try {
          content = await file.text();
        } catch {
          content = '';
        }
      } else {
        content = `[Attached document: ${file.name} — Size: ${formatFileSize(file.size)}]`;
      }

      newSources.push({
        id: generateId('src-file'),
        name: file.name,
        type,
        size: file.size,
        content,
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setSources(prev => [...prev, ...newSources]);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;

    let formatted = linkInput.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }

    try {
      const parsed = new URL(formatted);
      setSources(prev => [
        ...prev,
        {
          id: generateId('src-web'),
          name: parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : ''),
          type: 'web',
          url: formatted,
          content: `[Source link: ${formatted}]`,
          addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLinkInput('');
      setIsLinkInputOpen(false);
    } catch {
      alert('Please enter a valid URL.');
    }
  };

  const handleStartResearch = () => {
    if (!prompt.trim()) return;

    const currentTopic = prompt.trim();
    const sessionId = generateId('res');
    setActiveSessionId(sessionId);

    // Apply model choices and default settings configured in SettingsPage
    const configuredResearchers = DEFAULT_RESEARCHERS.map(agent => ({
      ...agent,
      model: settings.agentModels?.[agent.id] || agent.model
    }));

    const config: ResearchConfig = {
      topic: currentTopic,
      requirements: settings.defaultRequirements || '',
      sources,
      questions: [],
      researchers: configuredResearchers,
      effort: settings.defaultEffort || 'standard',
      format: settings.defaultFormat || 'report',
      reportLength: settings.defaultReportLength || 'standard',
      citationStyle: settings.defaultCitationStyle || 'inline'
    };

    setLogs([]);
    setReportMarkdown('');
    setKnowledgeTree(undefined);
    setStatus('planning');
    setIsThinkingOpen(true);
    setCurrentView('chat');

    engineRef.current.startResearch(
      config,
      settings,
      {
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
        },
        onLog: (newLog) => {
          setLogs(prev => [...prev, newLog]);
        },
        onComplete: (markdown, generatedTree) => {
          setReportMarkdown(markdown);
          setKnowledgeTree(generatedTree);
          setStatus('completed');

          // Save to real session history
          const newSession: ResearchSession = {
            id: sessionId,
            topic: currentTopic,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
            config,
            logs,
            reportMarkdown: markdown,
            knowledgeTree: generatedTree
          };

          saveSession(newSession);
          setSessions(loadSessions());
        },
        onError: (err) => {
          setStatus('error');
          alert('Research error: ' + err);
        }
      }
    );
  };

  const handleNewResearch = () => {
    engineRef.current.cancel();
    setPrompt('');
    setSources([]);
    setLogs([]);
    setReportMarkdown('');
    setKnowledgeTree(undefined);
    setStatus('idle');
    setActiveSessionId(null);
    setCurrentView('chat');
  };

  const handleSelectSession = (session: ResearchSession) => {
    engineRef.current.cancel();
    setPrompt(session.topic);
    setSources(session.config.sources || []);
    setLogs(session.logs || []);
    setReportMarkdown(session.reportMarkdown || '');
    setKnowledgeTree(session.knowledgeTree);
    setStatus(session.status);
    setActiveSessionId(session.id);
    setCurrentView('chat');
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const updated = deleteSession(sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      handleNewResearch();
    }
  };

  const handleCopyMarkdown = () => {
    if (!reportMarkdown) return;
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVaultZip = async () => {
    if (!knowledgeTree) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folderName = `${prompt.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'research'}-obsidian-vault`;
      const rootFolder = zip.folder(folderName) || zip;

      knowledgeTree.vaultFiles.forEach((file) => {
        rootFolder.file(file.path, file.content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate zip: ' + err);
    } finally {
      setIsExporting(false);
    }
  };

  const isRunning = status !== 'idle' && status !== 'completed' && status !== 'error';

  return (
    <div className="chatgpt-app-container">
      {/* LEFT SIDEBAR (ChatGPT Style) */}
      <aside className={`chatgpt-sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-top">
          <button 
            type="button" 
            className="new-chat-btn" 
            onClick={handleNewResearch}
            title="New Research"
          >
            <SquarePen size={18} />
            <span>New research</span>
          </button>
          <button 
            type="button" 
            className="sidebar-toggle-btn" 
            onClick={() => setIsSidebarOpen(false)}
            title="Close sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* History List Section */}
        <div className="sidebar-history-container">
          <div className="sidebar-section-title">History</div>
          {sessions.length === 0 ? (
            <div className="sidebar-empty-state">No research history yet</div>
          ) : (
            <div className="sidebar-sessions-list">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`sidebar-session-item ${activeSessionId === s.id ? 'session-active' : ''}`}
                  onClick={() => handleSelectSession(s)}
                >
                  <MessageSquare size={15} className="session-icon" />
                  <span className="session-title" title={s.topic}>{s.topic}</span>
                  <button
                    type="button"
                    className="session-delete-btn"
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    title="Delete session"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pinned Bottom Settings Item */}
        <div className="sidebar-bottom">
          <button 
            type="button" 
            className={`sidebar-settings-btn ${currentView === 'settings' ? 'sidebar-btn-active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <div className="chatgpt-main-wrapper">
        {currentView === 'settings' ? (
          <SettingsPage
            settings={settings}
            onSave={(newSettings) => {
              setSettings(newSettings);
              saveSettings(newSettings);
            }}
            onBack={() => setCurrentView('chat')}
          />
        ) : (
          <>
            {/* Top Header Bar */}
            <header className="chatgpt-top-nav">
              <div className="nav-left">
                {!isSidebarOpen && (
                  <button 
                    type="button" 
                    className="sidebar-open-btn" 
                    onClick={() => setIsSidebarOpen(true)}
                    title="Open sidebar"
                  >
                    <PanelLeft size={18} />
                  </button>
                )}
                <InciteLogo size={22} badgeText="Swarm" />
              </div>

              <div className="nav-right">
                <button 
                  type="button" 
                  className="nav-icon-btn" 
                  onClick={() => setCurrentView('settings')}
                  title="Settings & API Keys"
                >
                  <Settings size={18} />
                </button>
                {status !== 'idle' && (
                  <button type="button" className="nav-icon-btn" onClick={handleNewResearch} title="New Research">
                    <SquarePen size={18} />
                  </button>
                )}
              </div>
            </header>

            {/* Content Area */}
            <main className="chatgpt-content-area">
          {status === 'idle' ? (
            /* Empty / Landing State (Centered Prompt Box) */
            <div className="landing-view">
              <div className="landing-logo-badge">
                <InciteLogo size={44} showText={false} />
              </div>
              <h1 className="landing-title">What do you want to research?</h1>

              <div className="chat-input-card">
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  rows={1}
                  placeholder="Ask a question or enter a research topic..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (prompt.trim()) handleStartResearch();
                    }
                  }}
                  autoFocus
                />

                {/* Attached Pills inside box */}
                {sources.length > 0 && (
                  <div className="pills-row">
                    {sources.map(s => (
                      <span key={s.id} className="source-pill">
                        <span className="pill-text">{s.name}</span>
                        <button type="button" className="pill-remove" onClick={() => setSources(sources.filter(x => x.id !== s.id))}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Optional Link Input */}
                {isLinkInputOpen && (
                  <form onSubmit={handleAddLink} className="link-input-inline">
                    <input
                      type="url"
                      placeholder="Paste URL (https://...)"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      className="link-field"
                      autoFocus
                    />
                    <button type="submit" className="link-submit-btn">Add</button>
                    <button type="button" className="link-cancel-btn" onClick={() => setIsLinkInputOpen(false)}>
                      <X size={14} />
                    </button>
                  </form>
                )}

                {/* Bottom Actions Bar */}
                <div className="chat-input-bottom">
                  <div className="bottom-left-tools">
                    <button
                      type="button"
                      className="tool-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach document (PDF, DOCX, Markdown, TXT)"
                    >
                      <Plus size={16} />
                      <span>Attach</span>
                    </button>
                    <button
                      type="button"
                      className="tool-btn"
                      onClick={() => setIsLinkInputOpen(!isLinkInputOpen)}
                      title="Add website link"
                    >
                      <span>Link</span>
                    </button>
                  </div>

                  <div className="bottom-right-tools">
                    <button
                      type="button"
                      className={`send-button ${prompt.trim() ? 'send-button-active' : ''}`}
                      onClick={handleStartResearch}
                      disabled={!prompt.trim()}
                    >
                      <ArrowUp size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <p className="disclaimer-text">
                Incite utilizes autonomous multi-agent swarms to synthesize comprehensive research dossiers and Obsidian vaults.
              </p>
            </div>
          ) : (
            /* Active / Completed Research View */
            <div className="conversation-view">
              {/* User Prompt Message */}
              <div className="user-message-row">
                <div className="user-bubble">
                  {prompt}
                  {sources.length > 0 && (
                    <div className="message-sources-tag">
                      {sources.length} document{sources.length > 1 ? 's' : ''} attached
                    </div>
                  )}
                </div>
              </div>

              {/* Assistant Stream Message */}
              <div className="assistant-message-row">
                {/* Thinking / Progress Collapsible */}
                <div className="thinking-collapsible">
                  <button
                    type="button"
                    className="thinking-toggle-header"
                    onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                  >
                    <span className="thinking-status-text">
                      {isRunning ? (
                        <>
                          <span className="thinking-spinner" />
                          <span>Researching and synthesizing...</span>
                        </>
                      ) : (
                        <span>Completed research · {logs.length} steps</span>
                      )}
                    </span>
                    {isThinkingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isThinkingOpen && (
                    <div className="thinking-steps-list">
                      {logs.map((log) => (
                        <div key={log.id} className="step-item">
                          <span className="step-agent">{log.researcherRole}:</span>
                          <span className="step-content">{log.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Obsidian Vault Actions Bar */}
                {status === 'completed' && knowledgeTree && (
                  <div className="obsidian-vault-banner">
                    <div className="vault-banner-left">
                      <span className="vault-banner-title">Obsidian Knowledge Vault</span>
                      <span className="vault-banner-meta">
                        {knowledgeTree.nodes.length} interconnected notes · {knowledgeTree.vaultFiles.length} files
                      </span>
                    </div>
                    <div className="vault-banner-right">
                      <button type="button" className="obsidian-btn" onClick={handleDownloadVaultZip} disabled={isExporting}>
                        <Download size={15} />
                        <span>{isExporting ? 'Packaging...' : 'Download Vault (.zip)'}</span>
                      </button>
                      <button type="button" className="copy-btn" onClick={handleCopyMarkdown}>
                        {copied ? <Check size={15} /> : <Copy size={15} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Markdown Content */}
                {reportMarkdown && (
                  <div className="report-markdown-body">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="table-wrapper">
                            <table>{children}</table>
                          </div>
                        )
                      }}
                    >
                      {reportMarkdown}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              <div ref={chatBottomRef} />
            </div>
          )}
        </main>
      </>
    )}
  </div>

  {/* Hidden File Input */}
  <input
    ref={fileInputRef}
    type="file"
    multiple
    accept=".pdf,.docx,.doc,.txt,.md,.markdown,.csv,.json"
    style={{ display: 'none' }}
    onChange={(e) => handleFiles(e.target.files)}
  />

      <style>{`
        .chatgpt-app-container {
          min-height: 100vh;
          display: flex;
          background-color: var(--bg-main);
          width: 100%;
        }

        /* SIDEBAR STYLES */
        .chatgpt-sidebar {
          width: 260px;
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          transition: width 200ms ease, transform 200ms ease;
          overflow: hidden;
          z-index: 100;
        }

        .sidebar-closed {
          width: 0;
          border-right: none;
          transform: translateX(-100%);
          position: absolute;
        }

        .sidebar-top {
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .new-chat-btn {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          transition: background-color 120ms ease;
        }

        .new-chat-btn:hover {
          background-color: var(--bg-surface);
        }

        .sidebar-toggle-btn {
          color: var(--text-secondary);
          padding: 8px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 120ms ease;
        }

        .sidebar-toggle-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface);
        }

        .sidebar-history-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 10px 10px;
          overflow-y: auto;
          gap: 6px;
        }

        .sidebar-section-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 6px 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-empty-state {
          font-size: 13px;
          color: var(--text-muted);
          padding: 12px 10px;
        }

        .sidebar-sessions-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-session-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          font-size: 13.5px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background-color 120ms ease;
          position: relative;
        }

        .sidebar-session-item:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface);
        }

        .session-active {
          background-color: var(--bg-surface);
          color: var(--text-primary);
          font-weight: 500;
        }

        .session-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .session-title {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .session-delete-btn {
          color: var(--text-muted);
          display: none;
          padding: 2px;
          border-radius: 4px;
        }

        .sidebar-session-item:hover .session-delete-btn {
          display: flex;
        }

        .session-delete-btn:hover {
          color: #ef4444;
        }

        .sidebar-bottom {
          padding: 12px 14px;
          border-top: 1px solid var(--border-subtle);
        }

        .sidebar-settings-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: background-color 120ms ease;
        }

        .sidebar-settings-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface);
        }

        .sidebar-settings-btn.sidebar-btn-active {
          color: #ffffff;
          background-color: var(--bg-surface);
        }

        /* MAIN WRAPPER */
        .chatgpt-main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .chatgpt-top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background-color: var(--bg-main);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-open-btn, .nav-icon-btn {
          color: var(--text-secondary);
          padding: 8px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 120ms ease;
        }

        .sidebar-open-btn:hover, .nav-icon-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chatgpt-content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 0 16px;
        }

        /* LANDING VIEW */
        .landing-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          width: 100%;
          max-width: 768px;
          gap: 20px;
          margin: auto 0;
          padding: 40px 0 60px 0;
        }

        .landing-logo-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.18) 0%, rgba(14, 20, 32, 0.95) 75%);
          border: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 4px 24px rgba(2, 132, 199, 0.25);
          margin-bottom: -2px;
        }

        .landing-title {
          font-size: 32px;
          font-weight: 600;
          color: var(--text-primary);
          text-align: center;
        }

        .chat-input-card {
          width: 100%;
          background-color: var(--bg-input);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-pill);
          padding: 16px 18px 12px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          transition: border-color 150ms ease;
        }

        .chat-input-card:focus-within {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .chat-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 16px;
          line-height: 1.5;
          resize: none;
          padding: 0 4px;
        }

        .chat-textarea::placeholder {
          color: var(--text-placeholder);
        }

        .pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 2px 4px;
        }

        .source-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 13px;
          max-width: 260px;
        }

        .pill-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pill-remove {
          display: flex;
          align-items: center;
          color: var(--text-muted);
        }

        .pill-remove:hover {
          color: var(--text-primary);
        }

        .link-input-inline {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #212121;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .link-field {
          flex: 1;
          font-size: 14px;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
        }

        .link-submit-btn {
          font-size: 13px;
          font-weight: 500;
          color: var(--accent);
          padding: 2px 8px;
        }

        .link-cancel-btn {
          color: var(--text-muted);
          display: flex;
        }

        .chat-input-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }

        .bottom-left-tools {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 5px 10px;
          border-radius: 16px;
          border: 1px solid var(--border-subtle);
          background-color: rgba(255, 255, 255, 0.04);
          transition: all 120ms ease;
        }

        .tool-btn:hover {
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.08);
        }

        .send-button {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background-color: #676767;
          color: #212121;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }

        .send-button-active {
          background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.45);
          cursor: pointer;
        }

        .send-button-active:hover {
          background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%) !important;
        }

        .disclaimer-text {
          font-size: 12.5px;
          color: var(--text-muted);
          text-align: center;
        }

        /* CONVERSATION VIEW */
        .conversation-view {
          width: 100%;
          max-width: 820px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 32px 0 80px 0;
        }

        .user-message-row {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }

        .user-bubble {
          max-width: 80%;
          background-color: var(--bg-surface);
          color: var(--text-primary);
          padding: 12px 18px;
          border-radius: 20px 20px 4px 20px;
          font-size: 16px;
          line-height: 1.5;
        }

        .message-sources-tag {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .assistant-message-row {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }

        .thinking-collapsible {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .thinking-toggle-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .thinking-toggle-header:hover {
          background-color: var(--bg-surface-hover);
        }

        .thinking-status-text {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .thinking-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(56, 189, 248, 0.2);
          border-top-color: #38bdf8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .thinking-steps-list {
          padding: 8px 16px 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid var(--border-subtle);
          max-height: 280px;
          overflow-y: auto;
        }

        .step-item {
          font-size: 13.5px;
          line-height: 1.45;
          color: var(--text-secondary);
        }

        .step-agent {
          font-weight: 600;
          color: #38bdf8;
          margin-right: 6px;
        }

        .obsidian-vault-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #0d1424;
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: var(--radius-md);
          gap: 16px;
          flex-wrap: wrap;
          box-shadow: 0 4px 20px rgba(2, 132, 199, 0.15);
        }

        .vault-banner-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vault-banner-title {
          font-size: 15px;
          font-weight: 600;
          color: #f0f6fc;
        }

        .vault-banner-meta {
          font-size: 13px;
          color: var(--text-muted);
        }

        .vault-banner-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .obsidian-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);
          color: #ffffff;
          font-size: 13.5px;
          font-weight: 500;
          border-radius: var(--radius-sm);
          box-shadow: 0 2px 10px rgba(2, 132, 199, 0.3);
        }

        .obsidian-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%);
        }

        .copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          font-size: 13.5px;
          font-weight: 500;
          border-radius: var(--radius-sm);
        }

        .copy-btn:hover {
          background-color: var(--bg-surface-hover);
        }

        /* Markdown Prose Styling */
        .report-markdown-body {
          color: var(--text-primary);
          font-size: 16px;
          line-height: 1.75;
          word-break: break-word;
        }

        .report-markdown-body h1 {
          font-size: 26px;
          font-weight: 700;
          margin: 24px 0 16px 0;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 10px;
        }

        .report-markdown-body h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 28px 0 12px 0;
        }

        .report-markdown-body h3 {
          font-size: 17px;
          font-weight: 600;
          margin: 20px 0 8px 0;
        }

        .report-markdown-body p {
          margin-bottom: 16px;
        }

        .report-markdown-body ul, .report-markdown-body ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }

        .report-markdown-body li {
          margin-bottom: 6px;
        }

        .report-markdown-body blockquote {
          border-left: 3px solid var(--accent);
          padding: 8px 14px;
          background-color: var(--bg-surface);
          margin: 16px 0;
          color: var(--text-secondary);
        }

        .table-wrapper {
          overflow-x: auto;
          margin: 18px 0;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .report-markdown-body table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14.5px;
        }

        .report-markdown-body th, .report-markdown-body td {
          padding: 10px 14px;
          border: 1px solid var(--border-subtle);
          text-align: left;
        }

        .report-markdown-body th {
          background-color: var(--bg-surface);
        }

        .report-markdown-body code {
          font-family: var(--font-mono);
          font-size: 14px;
          background-color: var(--bg-surface);
          padding: 2px 6px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .chatgpt-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
