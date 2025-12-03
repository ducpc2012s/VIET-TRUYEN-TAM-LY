import React from 'react';
import { GenerationStatus, AppMode, AiModel } from '../types';

interface InputSectionProps {
  value: string;
  onChange: (val: string) => void;
  language: string;
  onLanguageChange: (val: string) => void;
  onStart: () => void;
  onStop: () => void;
  status: GenerationStatus;
  mode: AppMode;
  imageCount?: number;
  onImageCountChange?: (val: number) => void;
  ideaCount?: number;
  onIdeaCountChange?: (val: number) => void;
  model: AiModel;
  onModelChange: (val: AiModel) => void;
}

const LANGUAGES = [
  { code: 'auto', label: '🌐 Auto' },
  { code: 'vi', label: '🇻🇳 VN' },
  { code: 'en-US', label: '🇺🇸 US' },
  { code: 'en-UK', label: '🇬🇧 UK' },
  { code: 'es', label: '🇪🇸 ES' },
  { code: 'pt', label: '🇵🇹 PT' },
  { code: 'fr', label: '🇫🇷 FR' },
  { code: 'ru', label: '🇷🇺 RU' },
  { code: 'ja', label: '🇯🇵 JP' },
  { code: 'ko', label: '🇰🇷 KR' },
];

const MODELS: { code: AiModel; label: string }[] = [
  { code: 'gemini-3-pro-preview', label: '⚡ 3.0 Pro' },
  { code: 'gemini-2.5-flash', label: '🚀 2.5 Flash' },
];

const InputSection: React.FC<InputSectionProps> = ({ 
  value, onChange, language, onLanguageChange, onStart, onStop, status, mode, 
  imageCount, onImageCountChange, ideaCount, onIdeaCountChange,
  model, onModelChange
}) => {
  const isGenerating = status === GenerationStatus.GENERATING;
  const isStopping = status === GenerationStatus.STOPPING;

  let labelText = "";
  let placeholderText = "";
  let buttonText = "";

  switch (mode) {
    case 'NARRATOR':
      labelText = "Kịch bản / Ý tưởng gốc (The Seed)";
      placeholderText = "Nhập ý tưởng thô sơ của bạn vào đây (Ví dụ: Một phi hành gia lạc trôi giữa hố đen và nhìn thấy quá khứ của nhân loại...)";
      buttonText = "Khởi tạo Sử Thi";
      break;
    case 'CURATOR':
      labelText = "Chủ đề / Từ khóa (The Topic)";
      placeholderText = "Nhập một chủ đề bạn muốn khám phá (Ví dụ: Burnout, Sự cô đơn của người trưởng thành, Tình yêu trong kỷ nguyên số...)";
      buttonText = "Kích hoạt Giám tuyển";
      break;
    case 'SEO':
      labelText = "Kịch bản hoàn chỉnh hoặc Tóm tắt nội dung";
      placeholderText = "Dán kịch bản voiceover vừa tạo vào đây để AI phân tích và tối ưu hóa SEO...";
      buttonText = "Phân tích & Tạo Tiêu đề";
      break;
    case 'VISUALIZER':
      labelText = "Kịch bản hoàn chỉnh";
      placeholderText = "Dán kịch bản voiceover vào đây. AI sẽ phân tích và biến đổi nó thành các Prompt ảnh chuẩn Jungian...";
      buttonText = "Tạo Image Prompts";
      break;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 animate-fade-in-up">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
        
        {/* Header Toolbar Area */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
           {/* Left: Main Label */}
           <label htmlFor="script-input" className="block text-amber-500 text-sm font-bold tracking-widest uppercase shrink-0">
             {labelText}
           </label>

           {/* Right: Controls Toolbar - Compact Single Row */}
           <div className="flex flex-row flex-nowrap items-center gap-2 justify-end overflow-x-auto">
             
             {/* Idea Count Input (Curator Mode) */}
             {mode === 'CURATOR' && onIdeaCountChange && (
               <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 shadow-inner" title="Số lượng ý tưởng">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                 </svg>
                 <input
                    type="number"
                    min={5}
                    max={100}
                    value={ideaCount}
                    onChange={(e) => onIdeaCountChange(parseInt(e.target.value) || 30)}
                    disabled={isGenerating || isStopping}
                    className="w-10 bg-transparent text-amber-500 text-center font-bold text-xs focus:outline-none"
                 />
               </div>
             )}

             {/* Image Count Input (Visualizer Mode) */}
             {mode === 'VISUALIZER' && onImageCountChange && (
               <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 shadow-inner" title="Số lượng ảnh">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 <input
                    type="number"
                    min={1}
                    max={200}
                    value={imageCount}
                    onChange={(e) => onImageCountChange(parseInt(e.target.value) || 30)}
                    disabled={isGenerating || isStopping}
                    className="w-10 bg-transparent text-amber-500 text-center font-bold text-xs focus:outline-none"
                 />
               </div>
             )}

             {/* Language Selector */}
             <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 shadow-inner" title="Ngôn ngữ đích">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012 2v1.065M16 19h6m-3-3l3 3" />
               </svg>
               <select
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  disabled={isGenerating || isStopping}
                  className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer border-none max-w-[80px] sm:max-w-none"
               >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-slate-800 text-slate-200">
                      {lang.label}
                    </option>
                  ))}
               </select>
             </div>

             {/* Model Selector */}
             <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 shadow-inner" title="Mô hình AI">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
               <select
                  value={model}
                  onChange={(e) => onModelChange(e.target.value as AiModel)}
                  disabled={isGenerating || isStopping}
                  className="bg-transparent text-amber-500 text-xs font-bold focus:outline-none cursor-pointer border-none max-w-[100px] sm:max-w-none"
               >
                  {MODELS.map((m) => (
                    <option key={m.code} value={m.code} className="bg-slate-800 text-slate-200">
                      {m.label}
                    </option>
                  ))}
               </select>
             </div>

           </div>
        </div>

        <textarea
          id="script-input"
          className={`w-full h-40 bg-slate-900/80 text-slate-200 border border-slate-700 rounded-lg p-4 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none font-sans text-lg placeholder-slate-600 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={placeholderText}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isGenerating || isStopping}
        />
        
        <div className="mt-4 flex justify-center">
          {status === GenerationStatus.IDLE || status === GenerationStatus.ERROR || status === GenerationStatus.PAUSED ? (
            <button
              onClick={onStart}
              disabled={!value.trim()}
              className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {buttonText}
            </button>
          ) : (
             <button
                onClick={onStop}
                disabled={isStopping}
                className={`bg-red-900/80 hover:bg-red-800 border border-red-500 text-red-100 font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center gap-2 uppercase tracking-wider ${isStopping ? 'opacity-70 cursor-wait' : ''}`}
             >
                {isStopping ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-red-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>ĐANG DỪNG...</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span>DỪNG VIẾT</span>
                  </>
                )}
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputSection;