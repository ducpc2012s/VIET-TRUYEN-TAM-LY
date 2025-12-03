
export interface ScriptSegment {
  id: string;
  content: string;
  isGenerating: boolean;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PAUSED = 'PAUSED', // Legacy
  STOPPING = 'STOPPING', // User requested stop
  ERROR = 'ERROR'
}

export interface ChatConfig {
  apiKey: string;
}

export type AppMode = 'NARRATOR' | 'CURATOR' | 'SEO' | 'VISUALIZER';

export type AiModel = 'gemini-2.5-flash' | 'gemini-3-pro-preview';

export interface TabState {
  userInput: string;
  language: string;
  segments: ScriptSegment[];
  status: GenerationStatus;
  errorMsg: string | null;
  selectedSeoTitle: string | null;
  imageCount: number;
  ideaCount: number;
  model: AiModel; // Added model selection
}
