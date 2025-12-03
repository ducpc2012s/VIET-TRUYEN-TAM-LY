
import React, { useState } from 'react';
import { ScriptSegment, GenerationStatus } from '../../types';
import { exportToDoc } from '../../utils';

interface NarratorOutputProps {
  segments: ScriptSegment[];
  status: GenerationStatus;
  onPushToSeo?: () => void;
  onPushToVisualizer?: () => void;
}

const NarratorOutput: React.FC<NarratorOutputProps> = ({ segments, status, onPushToSeo, onPushToVisualizer }) => {
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

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 animate-fade-in-up">
      
      {/* Action Bar */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-6 bg-slate-800/80 p-4 rounded-lg border border-slate-700 backdrop-blur-md sticky top-4 z-20 shadow-xl">
         <div className="text-slate-300 font-bold text-sm uppercase tracking-wider">
            {segments.length} Phân đoạn
         </div>
         <div className="flex items-center gap-2">
           {onPushToVisualizer && (
              <button
                onClick={onPushToVisualizer}
                className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition-all transform hover:scale-105"
                title="Tạo prompt ảnh Visualizer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                VISUALIZER
              </button>
           )}
           {onPushToSeo && (
              <button
                onClick={onPushToSeo}
                className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition-all transform hover:scale-105"
                title="Đẩy toàn bộ nội dung sang tab SEO Strategist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                SEO
              </button>
           )}
           <button
              onClick={() => exportToDoc(segments, "Voiceover_Script")}
              className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition-all transform hover:scale-105"
              title="Tải về file Word/Docs để chỉnh sửa"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              DOCS
           </button>
         </div>
      </div>

      <div className="relative border-l-2 border-amber-900/50 pl-8 ml-4 md:ml-0 space-y-8">
        {segments.map((segment) => (
          <div key={segment.id} className="relative group">
             {/* Timeline dot */}
            <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-slate-900 border-2 border-amber-600 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full bg-amber-500 ${segment.isGenerating ? 'animate-pulse' : ''}`}></div>
            </div>
            
            {/* Content Card */}
            <div className="bg-slate-800/30 rounded-lg p-6 border border-transparent hover:border-slate-700 transition-all relative">
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-body text-lg md:text-xl text-justify">
                  {segment.content}
                </div>
              </div>

              {/* Copy Button */}
              {!segment.isGenerating && segment.content && (
                <button
                  onClick={() => handleCopy(segment.content, segment.id)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-amber-500 transition-colors p-2 bg-slate-900/50 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Copy text"
                >
                  {copiedId === segment.id ? (
                    <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      COPIED
                    </span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {status === GenerationStatus.GENERATING && (
         <div className="text-center text-amber-500/50 italic font-light animate-pulse mt-4">
            Đang viết tiếp dòng chảy sử thi...
         </div>
      )}
    </div>
  );
};

export default NarratorOutput;
