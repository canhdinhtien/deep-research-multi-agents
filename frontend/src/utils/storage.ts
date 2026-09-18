import type { AppSettings, ResearchSession } from '../types';

const SETTINGS_KEY = 'deep_research_settings_v1';
const SESSIONS_KEY = 'deep_research_sessions_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  openaiApiKey: '',
  customBaseUrl: '',
  isSimulationMode: true // Enabled by default for zero-cost immediate out-of-the-box exploration!
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
};

export const loadSessions = (): ResearchSession[] => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveSession = (session: ResearchSession): void => {
  try {
    const existing = loadSessions();
    const updated = [session, ...existing.filter(s => s.id !== session.id)].slice(0, 30);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save session to localStorage:', e);
  }
};

export const deleteSession = (sessionId: string): ResearchSession[] => {
  try {
    const existing = loadSessions();
    const filtered = existing.filter(s => s.id !== sessionId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const generateId = (prefix = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
};
