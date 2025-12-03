
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
import { CONTINUE_COMMAND, CURATOR_SYSTEM_INSTRUCTION, SYSTEM_INSTRUCTION, SEO_SYSTEM_INSTRUCTION, VISUALIZER_SYSTEM_INSTRUCTION } from './constants';
import { GenerationStatus, ScriptSegment, AppMode, TabState, AiModel } from './types';
import { startNewEpicChat, streamEpicContent } from './services/geminiService';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import Header from './components/Header';
import Footer from './components/Footer';
import TabNavigation from './components/TabNavigation';
import GlobalSettings from './components/GlobalSettings';

const LOCAL_STORAGE_KEY = 'epic_narrator_tabs_data_v1';
const API_KEY_STORAGE_KEY = 'epic_narrator_api_key';

const DEFAULT_TAB_STATE: TabState = {
  userInput: '',
  language: 'auto',
  segments: [],
  status: GenerationStatus.IDLE,
  errorMsg: null,
  selectedSeoTitle: null,
  imageCount: 30,
  ideaCount: 30,
  model: 'gemini-3-pro-preview', // Default model
};

const App: React.FC = () => {
  // State for Custom API Key
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
       return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    } catch {
       return '';
    }
  });

  // State for all tabs
  const [tabsData, setTabsData] = useState<Record<AppMode, TabState>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sanitize loaded data
        const modes: AppMode[] = ['CURATOR', 'NARRATOR', 'VISUALIZER', 'SEO'];
        const sanitized: any = {};
        
        modes.forEach(mode => {
           // Ensure structure exists and merge with default defaults (handles new fields like ideaCount and model)
           const existingData = parsed[mode] || {};
           sanitized[mode] = { ...DEFAULT_TAB_STATE, ...existingData };

           // Reset stuck status
           if (sanitized[mode].status === GenerationStatus.GENERATING || sanitized[mode].status === GenerationStatus.STOPPING) {
             sanitized[mode].status = GenerationStatus.IDLE;
             if (sanitized[mode].segments) {
               sanitized[mode].segments = sanitized[mode].segments.map((s: any) => ({ ...s, isGenerating: false }));
             }
           }
        });
        return sanitized;
      }
    } catch (e) {
      console.error("Failed to load state from local storage", e);
    }
    return {
      CURATOR: { ...DEFAULT_TAB_STATE },
      NARRATOR: { ...DEFAULT_TAB_STATE },
      VISUALIZER: { ...DEFAULT_TAB_STATE },
      SEO: { ...DEFAULT_TAB_STATE },
    };
  });

  const [activeTab, setActiveTab] = useState<AppMode>('CURATOR');

  // Refs for concurrent management per tab
  const abortControllersRef = useRef<Record<AppMode, AbortController | null>>({
    CURATOR: null,
    NARRATOR: null,
    SEO: null,
    VISUALIZER: null,
  });

  const stopFlagsRef = useRef<Record<AppMode, boolean>>({
    CURATOR: false,
    NARRATOR: false,
    SEO: false,
    VISUALIZER: false,
  });

  const chatSessionsRef = useRef<Record<AppMode, Chat | null>>({
    CURATOR: null,
    NARRATOR: null,
    SEO: null,
    VISUALIZER: null,
  });

  // Persist custom API Key
  useEffect(() => {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, customApiKey);
    } catch (e) {
      console.error("Failed to save API Key to local storage", e);
    }
  }, [customApiKey]);

  // Persist to local storage whenever tabsData changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tabsData));
    } catch (e) {
      console.error("Failed to save state to local storage", e);
    }
  }, [tabsData]);

  // Helper to update specific tab state
  const updateTabState = (mode: AppMode, updates: Partial<TabState>) => {
    setTabsData((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], ...updates },
    }));
  };

  const handleTabChange = (mode: AppMode) => {
    setActiveTab(mode);
  };

  const handleStop = useCallback(() => {
    const mode = activeTab;
    if (tabsData[mode].status === GenerationStatus.GENERATING) {
      updateTabState(mode, { status: GenerationStatus.STOPPING });
      stopFlagsRef.current[mode] = true;
      if (abortControllersRef.current[mode]) {
        abortControllersRef.current[mode]?.abort();
      }
    }
  }, [activeTab, tabsData]);

  const handlePushToSeo = useCallback(() => {
    const currentMode = 'NARRATOR';
    const contentToPush = tabsData[currentMode].segments.map(s => s.content).join('\n');
    
    if (!contentToPush.trim()) return;

    // Switch to SEO and populate input
    updateTabState('SEO', { 
      userInput: contentToPush,
      segments: [],
      status: GenerationStatus.IDLE,
      errorMsg: null,
      selectedSeoTitle: null
    });
    setActiveTab('SEO');
  }, [tabsData]);

  const handlePushToVisualizer = useCallback(() => {
    const currentMode = 'NARRATOR';
    const contentToPush = tabsData[currentMode].segments.map(s => s.content).join('\n');

    if (!contentToPush.trim()) return;

    // Switch to Visualizer and populate input
    updateTabState('VISUALIZER', {
      userInput: contentToPush,
      segments: [],
      status: GenerationStatus.IDLE,
      errorMsg: null
    });
    setActiveTab('VISUALIZER');
  }, [tabsData]);

  const handleSeoTitleSelect = useCallback(async (title: string) => {
      const mode = 'SEO';
      const currentTabData = tabsData[mode];

      // Update UI: Selected title and prepare for generation
      updateTabState(mode, {
        selectedSeoTitle: title,
        status: GenerationStatus.GENERATING,
        errorMsg: null,
        segments: [], // Clear titles list to show details
      });

      stopFlagsRef.current[mode] = false;
      abortControllersRef.current[mode] = new AbortController();

      try {
        const prompt = `[LỆNH: CHUYỂN SANG CHẾ ĐỘ 2 - TỐI ƯU CHI TIẾT]
        TIÊU ĐỀ ĐÃ CHỌN: "${title}"
        
        Hãy tạo Mô tả, Hashtags và Tags cho tiêu đề này dựa trên nội dung gốc.
        Hãy nhớ tuân thủ chiến lược "Triple Keyword".
        Xuất ra định dạng với các thẻ [DESCRIPTION_START], [HASHTAGS_START], [TAGS_START] như đã hướng dẫn.
        Ngôn ngữ đầu ra: "${currentTabData.language !== 'auto' ? currentTabData.language : 'Tương ứng tiêu đề'}".`;

        const newSegmentId = Date.now().toString();
        const newSegment: ScriptSegment = {
            id: newSegmentId,
            content: '',
            isGenerating: true,
            timestamp: Date.now(),
        };

        updateTabState(mode, { segments: [newSegment] });

        const chatSession = chatSessionsRef.current[mode];

        await streamEpicContent(
            prompt,
            (textChunk) => {
              setTabsData((prev) => {
                const currentSegments = prev[mode].segments;
                const index = currentSegments.findIndex(s => s.id === newSegmentId);
                if (index !== -1) {
                   const updatedSegments = [...currentSegments];
                   updatedSegments[index] = { ...updatedSegments[index], content: updatedSegments[index].content + textChunk };
                   return { ...prev, [mode]: { ...prev[mode], segments: updatedSegments } };
                }
                return prev;
              });
            },
            abortControllersRef.current[mode]?.signal,
            chatSession
          );

        setTabsData(prev => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            status: GenerationStatus.IDLE,
            segments: prev[mode].segments.map(s => ({ ...s, isGenerating: false }))
          }
        }));

      } catch (err: any) {
         if (err.name === 'AbortError' || err.message?.includes('aborted')) {
            // Clean exit on stop
            setTabsData(prev => ({
              ...prev,
              [mode]: {
                ...prev[mode],
                status: GenerationStatus.IDLE,
                errorMsg: null,
                segments: prev[mode].segments.map(s => ({ ...s, isGenerating: false }))
              }
            }));
            return;
         }
         console.error(err);
         updateTabState(mode, { 
           errorMsg: err.message || "Failed to generate SEO details.",
           status: GenerationStatus.ERROR 
         });
      }
  }, [tabsData]);


  const handleStart = useCallback(async () => {
    const mode = activeTab;
    const currentTabData = tabsData[mode];

    if (!currentTabData.userInput.trim()) return;

    try {
      // 1. Reset State for this tab
      updateTabState(mode, {
        status: GenerationStatus.GENERATING,
        errorMsg: null,
        segments: [],
        selectedSeoTitle: null, // Reset SEO selection on new run
      });
      
      stopFlagsRef.current[mode] = false;
      abortControllersRef.current[mode] = new AbortController();

      // DECIDE WHICH INSTRUCTION TO USE BASED ON TAB
      let instructionToUse = SYSTEM_INSTRUCTION;
      if (mode === 'CURATOR') {
        instructionToUse = CURATOR_SYSTEM_INSTRUCTION.replace(/{{IDEA_COUNT}}/g, (currentTabData.ideaCount || 30).toString());
      }
      if (mode === 'SEO') instructionToUse = SEO_SYSTEM_INSTRUCTION;
      if (mode === 'VISUALIZER') {
        instructionToUse = VISUALIZER_SYSTEM_INSTRUCTION.replace(/{{IMAGE_COUNT}}/g, (currentTabData.imageCount || 30).toString());
      }

      // Start new session for this tab and store it
      // Pass the custom API key and the selected Model for this tab
      const newSession = startNewEpicChat(instructionToUse, customApiKey, currentTabData.model);
      chatSessionsRef.current[mode] = newSession;

      // Construct Initial Prompt with Language Requirement
      let initialPrompt = currentTabData.userInput;
      if (currentTabData.language !== 'auto' && mode !== 'VISUALIZER') {
         initialPrompt = `[YÊU CẦU NGÔN NGỮ QUAN TRỌNG: Hãy viết toàn bộ kết quả bằng ngôn ngữ mã: "${currentTabData.language}". Đảm bảo văn phong chuẩn văn hóa bản địa của ngôn ngữ này.]\n\nINPUT CỦA NGƯỜI DÙNG: ${currentTabData.userInput}`;
      }

      if (mode === 'SEO') {
          initialPrompt = `[LỆNH: CHẾ ĐỘ 1 - TẠO TIÊU ĐỀ]
          NỘI DUNG KỊCH BẢN / CHỦ ĐỀ:
          "${currentTabData.userInput}"
          
          Hãy tạo danh sách 5 tiêu đề YouTube chuẩn SEO và CTR cao.`;
      }

      // --- CURATOR, SEO & VISUALIZER MODE LOGIC (ONE SHOT) ---
      if (mode === 'CURATOR' || mode === 'SEO' || mode === 'VISUALIZER') {
          const newSegmentId = Date.now().toString();
          const newSegment: ScriptSegment = {
            id: newSegmentId,
            content: '',
            isGenerating: true,
            timestamp: Date.now(),
          };
          updateTabState(mode, { segments: [newSegment] });

          await streamEpicContent(
            initialPrompt,
            (textChunk) => {
              setTabsData((prev) => {
                const currentSegments = prev[mode].segments;
                const index = currentSegments.findIndex(s => s.id === newSegmentId);
                if (index !== -1) {
                  const updatedSegments = [...currentSegments];
                  updatedSegments[index] = { ...updatedSegments[index], content: updatedSegments[index].content + textChunk };
                  return { ...prev, [mode]: { ...prev[mode], segments: updatedSegments } };
                }
                return prev;
              });
            },
            abortControllersRef.current[mode]?.signal,
            newSession
          );
           
           setTabsData(prev => ({
             ...prev,
             [mode]: {
               ...prev[mode],
               status: GenerationStatus.IDLE,
               segments: prev[mode].segments.map(s => ({ ...s, isGenerating: false }))
             }
           }));
           return;
      }

      // --- NARRATOR MODE LOGIC (INFINITE LOOP) ---
      let currentPrompt = initialPrompt;
      let keepGoing = true;
      let loopCount = 0;

      while (keepGoing) {
        if (stopFlagsRef.current[mode]) break;

        const newSegmentId = Date.now().toString();
        const newSegment: ScriptSegment = {
          id: newSegmentId,
          content: '',
          isGenerating: true,
          timestamp: Date.now(),
        };

        // Add new segment
        setTabsData(prev => ({
            ...prev,
            [mode]: { ...prev[mode], segments: [...prev[mode].segments, newSegment] }
        }));

        let segmentFullText = "";

        await streamEpicContent(
          currentPrompt, 
          (textChunk) => {
            segmentFullText += textChunk;
            setTabsData((prev) => {
                const currentSegments = prev[mode].segments;
                const index = currentSegments.findIndex(s => s.id === newSegmentId);
                if (index !== -1) {
                  const updatedSegments = [...currentSegments];
                  updatedSegments[index] = { ...updatedSegments[index], content: updatedSegments[index].content + textChunk };
                  return { ...prev, [mode]: { ...prev[mode], segments: updatedSegments } };
                }
                return prev;
            });
          },
          abortControllersRef.current[mode]?.signal,
          chatSessionsRef.current[mode]
        );

        // Mark segment as done and clean up
        setTabsData(prev => {
             const currentSegments = prev[mode].segments;
             const index = currentSegments.findIndex(s => s.id === newSegmentId);
             if (index !== -1) {
               const updatedSegments = [...currentSegments];
               const cleanedContent = updatedSegments[index].content.replace('[THE_END]', '').trim();
               updatedSegments[index] = { ...updatedSegments[index], content: cleanedContent, isGenerating: false };
               return { ...prev, [mode]: { ...prev[mode], segments: updatedSegments } };
             }
             return prev;
        });

        if (stopFlagsRef.current[mode]) {
          keepGoing = false;
          break;
        }

        if (segmentFullText.includes("[THE_END]")) {
          keepGoing = false;
          break;
        } else {
          currentPrompt = CONTINUE_COMMAND;
          loopCount++;
          if (loopCount > 20) { 
             console.warn("Max loops reached.");
             keepGoing = false;
          }
        }
      }
      
      updateTabState(mode, { status: GenerationStatus.IDLE });
      
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        // Clean exit on stop
        setTabsData(prev => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            status: GenerationStatus.IDLE,
            errorMsg: null,
            segments: prev[mode].segments.map(s => ({ ...s, isGenerating: false }))
          }
        }));
        return;
      }
      console.error(err);
      updateTabState(mode, { 
        errorMsg: err.message || "An unknown error occurred.",
        status: GenerationStatus.ERROR,
        segments: tabsData[mode].segments.map(s => ({...s, isGenerating: false}))
      });
    }
  }, [activeTab, tabsData, customApiKey]); 

  const currentTabState = tabsData[activeTab];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-200 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-950 opacity-90 pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        
        {/* Global Settings (Top Right) */}
        <GlobalSettings apiKey={customApiKey} onApiKeyChange={setCustomApiKey} />

        <Header activeTab={activeTab} />
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {currentTabState.errorMsg && (
           <div className="w-full max-w-4xl bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative mb-6 text-center" role="alert">
            <span className="block sm:inline">{currentTabState.errorMsg}</span>
          </div>
        )}

        <InputSection 
          value={currentTabState.userInput} 
          onChange={(val) => updateTabState(activeTab, { userInput: val })} 
          language={currentTabState.language}
          onLanguageChange={(val) => updateTabState(activeTab, { language: val })}
          imageCount={currentTabState.imageCount}
          onImageCountChange={(val) => updateTabState(activeTab, { imageCount: val })}
          ideaCount={currentTabState.ideaCount}
          onIdeaCountChange={(val) => updateTabState(activeTab, { ideaCount: val })}
          model={currentTabState.model}
          onModelChange={(val) => updateTabState(activeTab, { model: val })}
          onStart={handleStart} 
          onStop={handleStop}
          status={currentTabState.status}
          mode={activeTab}
        />

        <OutputSection 
          segments={currentTabState.segments} 
          status={currentTabState.status}
          mode={activeTab}
          onSeoTitleSelect={handleSeoTitleSelect}
          onPushToSeo={handlePushToSeo}
          onPushToVisualizer={handlePushToVisualizer}
          selectedSeoTitle={currentTabState.selectedSeoTitle}
        />

        <Footer />
      </div>
    </div>
  );
};

export default App;
