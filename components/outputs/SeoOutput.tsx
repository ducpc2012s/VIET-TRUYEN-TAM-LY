
import React, { useState } from 'react';
import { ScriptSegment, GenerationStatus } from '../../types';

interface SeoOutputProps {
  segments: ScriptSegment[];
  status: GenerationStatus;
  selectedSeoTitle?: string | null;
  onSeoTitleSelect?: (title: string) => void;
}

const SeoOutput: React.FC<SeoOutputProps> = ({ segments, status, selectedSeoTitle, onSeoTitleSelect }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const fullContent = segments.map(s => s.content).join('');

  // CHECK IF WE ARE IN STAGE 2 (Details)
  if (selectedSeoTitle) {
     // PARSE DETAILS
     const descMatch = fullContent.match(/\[DESCRIPTION_START\]([\s\S]*?)\[DESCRIPTION_END\]/);
     const hashtagMatch = fullContent.match(/\[HASHTAGS_START\]([\s\S]*?)\[HASHTAGS_END\]/);
     const tagsMatch = fullContent.match(/\[TAGS_START\]([\s\S]*?)\[TAGS_END\]/);

     const description = descMatch ? descMatch[1].trim() : (status === GenerationStatus.GENERATING ? "Đang viết mô tả..." : "...");
     const hashtags = hashtagMatch ? hashtagMatch[1].trim() : "...";
     const tags = tagsMatch ? tagsMatch[1].trim() : "...";

     return (
        <div className="w-full max-w-4xl mx-auto pb-24 animate-fade-in-up space-y-6">
           {/* PERSISTENT SELECTED TITLE DISPLAY */}
           <div className="bg-amber-900/20 border-l-4 border-amber-600 p-4 rounded-r-lg shadow-md animate-fade-in-down backdrop-blur-sm">
              <div className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
                 Tiêu đề đã chọn
              </div>
              <h2 className="text-xl md:text-2xl font-epic text-white leading-tight shadow-black drop-shadow-md">{selectedSeoTitle}</h2>
           </div>

           <div className="bg-slate-800/80 p-6 rounded-lg border border-green-500/50 shadow-2xl backdrop-blur-md">
              <h3 className="text-xl font-bold text-green-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 Mô tả Video (Triple Keyword Optimized)
              </h3>
              <div className="bg-slate-900/50 p-4 rounded border border-slate-700 relative group min-h-[100px]">
                 <p className="whitespace-pre-wrap text-slate-300 font-sans">{description}</p>
                 {descMatch && (
                   <button onClick={() => handleCopy(description, 'seo-desc')} className="absolute top-2 right-2 text-slate-500 hover:text-green-400 p-2 bg-slate-800 rounded border border-slate-700">
                      {copiedId === 'seo-desc' ? 'COPIED' : 'COPY'}
                   </button>
                 )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/80 p-6 rounded-lg border border-slate-700 shadow-xl">
                  <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase">Hashtags</h3>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-700 relative group min-h-[60px]">
                     <p className="text-blue-300 font-mono text-sm">{hashtags}</p>
                     {hashtagMatch && (
                       <button onClick={() => handleCopy(hashtags, 'seo-hash')} className="absolute top-2 right-2 text-xs text-slate-500 hover:text-blue-400 p-1 bg-slate-800 rounded border border-slate-700">
                          {copiedId === 'seo-hash' ? 'COPIED' : 'COPY'}
                       </button>
                     )}
                  </div>
              </div>
              <div className="bg-slate-800/80 p-6 rounded-lg border border-slate-700 shadow-xl">
                  <h3 className="text-sm font-bold text-amber-400 mb-2 uppercase">Tags (Sao chép vào YouTube Studio)</h3>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-700 relative group min-h-[60px]">
                     <p className="text-slate-400 font-mono text-xs">{tags}</p>
                     {tagsMatch && (
                       <button onClick={() => handleCopy(tags, 'seo-tags')} className="absolute top-2 right-2 text-xs text-slate-500 hover:text-amber-400 p-1 bg-slate-800 rounded border border-slate-700">
                          {copiedId === 'seo-tags' ? 'COPIED' : 'COPY'}
                       </button>
                     )}
                  </div>
              </div>
           </div>
           
           {status === GenerationStatus.GENERATING && (
               <div className="text-center text-green-500/50 italic animate-pulse">
                  Đang tối ưu hóa thuật toán...
               </div>
           )}
        </div>
     );
  }

  // STAGE 1: TITLES LIST
  const titles = fullContent.split('\n').filter(line => /^\d+\./.test(line.trim()));

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 animate-fade-in-up">
       <div className="text-slate-400 text-center mb-6 italic">
          {titles.length > 0 ? "Chọn một tiêu đề để tạo mô tả chi tiết:" : "Đang phân tích nội dung..."}
       </div>

       <div className="grid gap-4">
          {titles.map((titleLine, idx) => {
             const cleanTitle = titleLine.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
             if (!cleanTitle) return null;
             
             return (
                <button
                   key={idx}
                   onClick={() => onSeoTitleSelect && onSeoTitleSelect(cleanTitle)}
                   disabled={status === GenerationStatus.GENERATING}
                   className="text-left w-full p-5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-500 rounded-lg transition-all group shadow-lg hover:shadow-amber-900/20"
                >
                   <div className="flex items-center gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-amber-500 font-bold flex items-center justify-center border border-slate-700 group-hover:border-amber-500">
                         {idx + 1}
                      </span>
                      <span className="text-lg md:text-xl font-epic text-slate-200 group-hover:text-amber-400 transition-colors">
                         {cleanTitle}
                      </span>
                   </div>
                </button>
             );
          })}
       </div>
        {status === GenerationStatus.GENERATING && (
           <div className="text-center text-amber-500/50 italic font-light animate-pulse mt-8">
              Đang brainstrom các tiêu đề triệu view...
           </div>
        )}
    </div>
  );
};

export default SeoOutput;
